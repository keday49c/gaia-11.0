<#
Start Gaia stack after boot
- Builds server TypeScript, rebuilds docker images and starts the compose stack
- Waits for backend health endpoint and writes a few status files into `./logs`
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $repoRoot 'logs'
if (!(Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir | Out-Null }

Write-Host "[start] Repo root: $repoRoot"

Push-Location (Join-Path $repoRoot 'server')
Write-Host "[start] Installing server dependencies (if needed) and building TypeScript..."
if (Test-Path package.json) {
    npm install --no-audit --no-fund
    npm run build
} else {
    Write-Host "[start] server/package.json not found — skipping build"
}
Pop-Location

Write-Host "[start] Rebuilding Docker images and starting compose stack"
Push-Location $repoRoot
docker compose build --pull 2>&1 | Tee-Object -FilePath (Join-Path $logsDir 'docker_compose_build.log')
docker compose up -d --remove-orphans 2>&1 | Tee-Object -FilePath (Join-Path $logsDir 'docker_compose_up.log')

Write-Host "[start] Waiting for backend health endpoint..."
$healthy = $false
for ($i=0; $i -lt 40; $i++) {
    try {
        $resp = Invoke-RestMethod -Method Get -Uri http://localhost:3001/health -TimeoutSec 5
        if ($resp.success -eq $true) { $healthy = $true; break }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if ($healthy) { Write-Host "[start] Backend is healthy" } else { Write-Host "[start] Backend did not respond healthy within timeout" }

docker compose ps > (Join-Path $logsDir 'docker_compose_ps.log')
Write-Host "[start] Wrote logs to $logsDir"
Pop-Location

Write-Host "[start] Done. Open http://localhost:3000 in your browser"
