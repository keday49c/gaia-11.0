<#
run-diagnostics.ps1

Automated diagnostics for Gaia stack.
Run this locally in PowerShell from the repository root.
It will: build & start the stack, wait for health, collect logs,
run a few API checks, and save outputs in `./logs/`.
#>
param(
    [int]$WaitForHealthySeconds = 180
)

Set-Location -LiteralPath (Split-Path -Parent $MyInvocation.MyCommand.Definition)
$projectRoot = Resolve-Path '..' | Select-Object -ExpandProperty Path
Set-Location $projectRoot

Write-Host "[diag] Project root: $projectRoot"

if (-not (Test-Path .\logs)) { New-Item -Path .\logs -ItemType Directory -Force | Out-Null }

function Run-ComposeUp {
    Write-Host "[diag] Building and starting services (this may take several minutes)..."
    docker compose up -d --build 2>&1 | Tee-Object -FilePath .\logs\docker_compose_up.log
}

function Wait-ForServiceHealthy {
    param($serviceName, $timeoutSec = 120)
    $deadline = (Get-Date).AddSeconds($timeoutSec)
    while ((Get-Date) -lt $deadline) {
        $cid = docker compose ps -q $serviceName 2>$null
        if (-not $cid) { Start-Sleep -Seconds 1; continue }
        $health = docker inspect --format '{{json .State.Health}}' $cid 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($health -and $health.Status -eq 'healthy') { Write-Host "[diag] $serviceName healthy"; return $true }
        Write-Host -NoNewline '.'; Start-Sleep -Seconds 2
    }
    Write-Host "`n[diag] Timeout waiting for $serviceName to become healthy"
    return $false
}

function Save-Logs {
    Write-Host "[diag] Collecting logs..."
    docker compose ps | Out-File .\logs\compose_ps.txt -Force
    docker compose logs --tail 1000 backend > .\logs\backend_full.log
    docker compose logs --tail 1000 postgres > .\logs\postgres_full.log
    docker compose logs --tail 1000 frontend > .\logs\frontend_full.log
}

function Api-Checks {
    Write-Host "[diag] Running API checks..."
    try {
        Invoke-RestMethod -Method Get -Uri http://localhost:3001/health -TimeoutSec 10 | ConvertTo-Json -Depth 5 | Out-File .\logs\health_response.json -Force
        Write-Host "[diag] Health OK -> .\logs\health_response.json"
    } catch {
        Write-Host "[diag] Health check failed: $_"
    }

    try {
        Invoke-RestMethod -Method Post -Uri http://localhost:3001/auth/guest -TimeoutSec 10 | ConvertTo-Json -Depth 5 | Out-File .\logs\guest_response.json -Force
        Write-Host "[diag] Guest token saved -> .\logs\guest_response.json"
    } catch {
        Write-Host "[diag] Guest request failed: $_"
    }

    # try login with default admin (seed user)
    $body = @{ email='admin@gaia.local'; senha='senha123' } | ConvertTo-Json
    try {
        Invoke-RestMethod -Method Post -Uri http://localhost:3001/auth/login -Body $body -ContentType 'application/json' -TimeoutSec 10 | ConvertTo-Json -Depth 5 | Out-File .\logs\login_response.json -Force
        Write-Host "[diag] Login response saved -> .\logs\login_response.json"
    } catch {
        Write-Host "[diag] Login request failed: $_"
    }
}

function Db-QuickChecks {
    Write-Host "[diag] Running quick DB checks (requires postgres container)..."
    $pg = docker compose ps -q postgres 2>$null
    if (-not $pg) { Write-Host "[diag] postgres container not found"; return }
    try {
        docker compose exec -T postgres psql -U gaia_user -d gaia_db -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('campaigns','users');" > .\logs\db_columns.txt
        Write-Host "[diag] DB schema snippet saved -> .\logs\db_columns.txt"
    } catch {
        Write-Host "[diag] DB quick checks failed: $_"
    }
}

# Run
Run-ComposeUp

Write-Host "[diag] Waiting for services to be healthy..."
Wait-ForServiceHealthy -serviceName postgres -timeoutSec $WaitForHealthySeconds | Out-Null
Wait-ForServiceHealthy -serviceName backend -timeoutSec $WaitForHealthySeconds | Out-Null
Wait-ForServiceHealthy -serviceName frontend -timeoutSec $WaitForHealthySeconds | Out-Null

Save-Logs
Api-Checks
Db-QuickChecks

Write-Host "[diag] Done. Logs saved to .\logs\"
