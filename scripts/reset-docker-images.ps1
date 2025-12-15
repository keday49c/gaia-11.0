<#
Reset Docker images for GAIA infra and force rebuild.
Usage: run from repo root in pwsh
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "[docker-reset] Stopping compose stack (preserve volumes)"
docker compose -f infra/gaia-compose.yml down --remove-orphans | Write-Host

Write-Host "[docker-reset] Removing local images built by compose"
# Remove images that match our local tags if present
docker image rm gaia-core:local gaia-server:local gaia-media:local -f 2>$null | Write-Host

Write-Host "[docker-reset] Pruning dangling images"
docker image prune -f | Write-Host

Write-Host "[docker-reset] Rebuilding and starting (no cache)"
docker compose -f infra/gaia-compose.yml build --no-cache --pull 2>&1 | Tee-Object -FilePath .\logs\docker_compose_build.log
docker compose -f infra/gaia-compose.yml up -d --remove-orphans 2>&1 | Tee-Object -FilePath .\logs\docker_compose_up.log

Write-Host "[docker-reset] Waiting for server health (http://localhost:3001/health)"
for ($i=0; $i -lt 40; $i++) {
    try {
        $r = Invoke-RestMethod -Method Get -Uri http://localhost:3001/health -TimeoutSec 5
        if ($r.success -eq $true) { Write-Host "[docker-reset] backend healthy"; break }
    } catch { Start-Sleep -Seconds 2 }
}

Write-Host "[docker-reset] Done. Logs: .\logs\docker_compose_up.log"
