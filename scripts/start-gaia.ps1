<#
Start-Gaia: Start Gaia services (Docker Compose) idempotently.

This script attempts to ensure Docker is running and then runs
`docker-compose up -d --build` from the repository root.

It is safe to run multiple times. Use the register-startup-task.ps1
script to register it to run on login/startup.
#>
function Find-RepoRoot {
    # Walk up until we find docker-compose.yml or reach filesystem root
    $p = Split-Path -Parent $MyInvocation.MyCommand.Definition
    if (-not $p) { $p = (Get-Location).Path }
    while ($p -and (Test-Path (Join-Path $p 'docker-compose.yml') -PathType Leaf) -eq $false) {
        $parent = Split-Path -Parent $p
        if ([string]::IsNullOrEmpty($parent) -or $parent -eq $p) { break }
        $p = $parent
    }
    if (Test-Path (Join-Path $p 'docker-compose.yml')) { return (Resolve-Path $p).Path }
    # fallback to repository parent of script
    try { return (Resolve-Path (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) '..')).Path } catch { return (Get-Location).Path }
}

$projectRoot = Find-RepoRoot
Set-Location -LiteralPath $projectRoot
Write-Output "[Gaia] Project root: $projectRoot"

function Start-DockerIfNeeded {
    Write-Output "[Gaia] Checking Docker..."
    try {
        $svc = Get-Service -Name com.docker.service -ErrorAction Stop
        if ($svc.Status -ne 'Running') {
            Write-Output "[Gaia] Starting Docker service..."
            Start-Service -Name com.docker.service -ErrorAction Stop
            $svc.WaitForStatus('Running', (New-TimeSpan -Seconds 60))
        } else {
            Write-Output "[Gaia] Docker service already running."
        }
    } catch {
        Write-Output "[Gaia] Docker service not available or could not be controlled via service API. Trying to start Docker Desktop executable..."
        $possiblePaths = @("C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe", "C:\\Program Files (x86)\\Docker\\Docker\\Docker Desktop.exe")
        $started = $false
        foreach ($p in $possiblePaths) {
            if (Test-Path $p) {
                Write-Output "[Gaia] Starting Docker Desktop from $p"
                Start-Process -FilePath $p -WindowStyle Hidden
                Start-Sleep -Seconds 8
                $started = $true
                break
            }
        }
        if (-not $started) {
            Write-Output "[Gaia] Could not find Docker Desktop executable. Ensure Docker Desktop is installed and set to start on login."
        }
    }
}

Start-DockerIfNeeded

# wait for docker to respond
$maxTries = 30
$i = 0
while ($i -lt $maxTries) {
    try {
        docker version > $null 2>&1
        break
    } catch {
        Start-Sleep -Seconds 2
        $i++
    }
}

if ($i -ge $maxTries) {
    Write-Output "[Gaia] Docker did not become available within expected time. Exiting with code 1."
    exit 1
}

# Ensure logs directory exists
$logsDir = Join-Path $projectRoot 'logs'
if (-not (Test-Path $logsDir)) { New-Item -Path $logsDir -ItemType Directory -Force | Out-Null }

Write-Output "[Gaia] Running docker compose up -d --build"
try {
    # Prefer using the compose file located at project root if present
    if (Test-Path (Join-Path $projectRoot 'docker-compose.yml')) {
        docker compose -f (Join-Path $projectRoot 'docker-compose.yml') up -d --build 2>&1 | Tee-Object -FilePath (Join-Path $logsDir 'docker_compose_up.log')
    } else {
        docker compose up -d --build 2>&1 | Tee-Object -FilePath (Join-Path $logsDir 'docker_compose_up.log')
    }
    Write-Output "[Gaia] Services started. Logs: $($logsDir)\docker_compose_up.log"
} catch {
    Write-Output "[Gaia] Failed to run docker compose: $_"
    exit 1
}
