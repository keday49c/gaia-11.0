<#
Shutdown Gaia stack and save container logs to `./logs`.
Usage: .\shutdown-and-save-logs.ps1 [-RemoveVolumes]
#>
param(
  [switch]$RemoveVolumes
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'

$repoRoot = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $repoRoot 'logs'
if (!(Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir | Out-Null }

Write-Host "[shutdown] Collecting logs to $logsDir"

$services = @(
  'gaia-server','backend','server',
  'gaia-core','frontend','client',
  'postgres','postgresql','db',
  'redis','gaia-redis',
  'worker','gaia-worker','gaia-media','media'
)
foreach ($s in $services) {
  try {
    docker compose logs --no-color $s 2>&1 | Out-File -FilePath (Join-Path $logsDir "$($s)_full.log") -Encoding utf8 -Force
    Write-Host "[shutdown] Saved logs for $s"
  } catch {
    $err = $_
    $msg = if ($err -and $err.Exception) { $err.Exception.Message } else { $err.ToString() }
    Write-Host "[shutdown] Failed to collect logs for ${s}: $msg"
  }
}

try {
  docker compose ps > (Join-Path $logsDir 'docker_compose_ps.log')
  docker compose config 2>&1 | Out-File (Join-Path $logsDir 'docker_compose_config.log') -Force
} catch {
  $err = $_
  $msg = if ($err -and $err.Exception) { $err.Exception.Message } else { $err.ToString() }
  Write-Host "[shutdown] Failed to dump docker compose ps/config: $msg"
}

if ($RemoveVolumes) {
  Write-Host "[shutdown] Stopping and removing containers + volumes"
  docker compose down --volumes --remove-orphans 2>&1 | Tee-Object -FilePath (Join-Path $logsDir 'docker_compose_down.log')
} else {
  Write-Host "[shutdown] Stopping containers (volumes preserved)"
  docker compose down --remove-orphans 2>&1 | Tee-Object -FilePath (Join-Path $logsDir 'docker_compose_down.log')
}

Write-Host "[shutdown] Done. Logs available at $logsDir"
