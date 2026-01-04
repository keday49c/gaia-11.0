<#
.SYNOPSIS
  Start Gaia development environment (Postgres, backend, frontend).

.DESCRIPTION
  This script will:
    - start the Postgres service via docker-compose
    - wait until Postgres is ready
    - optionally apply DB fixes (extensions, missing columns)
    - ensure `npm install` was run for server and client
    - open two PowerShell windows: one running the backend (dev) and one running the frontend (Vite)

.PARAMETER ApplyDbFix
  If present, the script will run SQL commands inside the Postgres container to create the
  `pgcrypto` extension and add missing `users` columns (idempotent).

.EXAMPLE
  # From repo root
  .\scripts\start-dev.ps1 -ApplyDbFix
#>

param(
  [switch]$ApplyDbFix
)

Set-StrictMode -Version Latest

# Resolve repository root (assumes script is in scripts/)
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $scriptRoot "..")

Write-Host "Repository root: $root"

Push-Location $root

Write-Host "Starting Postgres container (docker-compose)..."
docker-compose up -d postgres

# Wait for postgres readiness
$timeout = 120
$start = Get-Date
Write-Host "Waiting for Postgres to accept connections (timeout ${timeout}s)..."
while (((Get-Date) - $start).TotalSeconds -lt $timeout) {
  docker exec gaia-postgres pg_isready -U gaia_user -d gaia_db > $null 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Postgres is ready."
    break
  }
  Start-Sleep -Seconds 2
}

if (((Get-Date) - $start).TotalSeconds -ge $timeout) {
  Write-Error "Timed out waiting for Postgres to become ready. Check 'docker ps' and logs."
  Pop-Location
  exit 1
}

if ($ApplyDbFix) {
  Write-Host "Applying DB fixes (pgcrypto, missing columns)..."
  docker exec -i gaia-postgres psql -U gaia_user -d gaia_db -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
  docker exec -i gaia-postgres psql -U gaia_user -d gaia_db -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS nome VARCHAR(255);"
  docker exec -i gaia-postgres psql -U gaia_user -d gaia_db -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_ads_key VARCHAR(500);"
  docker exec -i gaia-postgres psql -U gaia_user -d gaia_db -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_ads_customer_id VARCHAR(100);"
  docker exec -i gaia-postgres psql -U gaia_user -d gaia_db -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram_token VARCHAR(500);"
  docker exec -i gaia-postgres psql -U gaia_user -d gaia_db -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_token VARCHAR(500);"
}

# Ensure dependencies installed
if (-not (Test-Path (Join-Path $root 'server' 'node_modules'))) {
  Write-Host "Installing server dependencies..."
  Push-Location (Join-Path $root 'server')
  npm install
  Pop-Location
}

if (-not (Test-Path (Join-Path $root 'client' 'node_modules'))) {
  Write-Host "Installing client dependencies... (this may take a while)"
  Push-Location (Join-Path $root 'client')
  npm install
  Pop-Location
}

# Start backend in a new PowerShell window
$backendCmd = @"
Set-Location '$($root)\server'
$env:DATABASE_URL='postgresql://gaia_user:gaia_password@localhost:5432/gaia_db'
$env:DB_SSL='false'
$env:CORS_ORIGIN='http://localhost:3000'
$env:NODE_ENV='development'
npm run dev
"@

Write-Host "Starting backend in a new terminal..."
Start-Process -FilePath pwsh -ArgumentList ('-NoExit','-Command', $backendCmd)

# Start frontend in a new PowerShell window
$frontendCmd = @"
Set-Location '$($root)\client'
npm run dev -- --port 3000
"@

Write-Host "Starting frontend in a new terminal..."
Start-Process -FilePath pwsh -ArgumentList ('-NoExit','-Command', $frontendCmd)

Write-Host "All done. Backend should be available at http://localhost:3001 and frontend at http://localhost:3000"

Pop-Location
