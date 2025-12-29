<#
Run this script on Windows to perform a quick smoke test of the packaged app.
Usage:
  PowerShell -ExecutionPolicy Bypass -File .\scripts\release\smoke_test_windows.ps1
  -AutoInstall -InstallerPath 'build\artifacts\Gaia One Setup 1.0.0.exe' -InstallDir 'C:\temp\gaia_portable'

Parameters / Env vars:
  -InstallerPath  : path to NSIS installer (default: build\artifacts\Gaia One Setup 1.0.0.exe)
  -UnpackedExePath: path to unpacked exe (default: build\artifacts\win-unpacked\Gaia One.exe)
  -AutoInstall    : switch. If present, runs the installer silently and targets -InstallDir.
  -InstallDir     : where to install when -AutoInstall is used (default: $env:TEMP\gaia_portable)
  -CleanupInstall : switch. If present, attempts to run uninstall (Uninstall.exe /S) after test.
  -HealthPort     : backend health port (default: 3001)
  -TimeoutSeconds : health timeout in seconds (default: 30)

Notes:
  - NSIS supports silent install with `/S` and ` /D=PATH` (no spaces in /D value). The script will try to set a short install path.
  - The script logs to `build\artifacts\smoke_test_logs\smoke_<timestamp>.log` for CI/inspection.
#>

param(
  [string]$InstallerPath = "build\artifacts\Gaia One Setup 1.0.0.exe",
  [string]$UnpackedExePath = "build\artifacts\win-unpacked\Gaia One.exe",
  [switch]$AutoInstall,
  [string]$InstallDir = "$env:TEMP\gaia_portable",
  [switch]$CleanupInstall,
  [int]$HealthPort = 3001,
  [int]$TimeoutSeconds = 30
)

# Logging setup
$logDir = "build\artifacts\smoke_test_logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
$timestamp = (Get-Date).ToString('yyyyMMdd_HHmmss')
$logFile = Join-Path $logDir "smoke_$timestamp.log"
function Log($msg) { $msg | Tee-Object -FilePath $logFile -Append }

function Wait-ForHealth([int]$port, [int]$timeout) {
  $url = "http://localhost:$port/health"
  $started = Get-Date
  while ((Get-Date) - $started -lt (New-TimeSpan -Seconds $timeout)) {
    try {
      $res = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop -TimeoutSec 5
      if ($null -ne $res) { return $res }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }
  throw "Timeout waiting for $url"
}

Log "=== Gaia smoke test started at $(Get-Date) ==="
Log "InstallerPath=$InstallerPath"
Log "UnpackedExePath=$UnpackedExePath"
Log "AutoInstall=$AutoInstall; InstallDir=$InstallDir; CleanupInstall=$CleanupInstall"

# If AutoInstall is requested, run installer silently to $InstallDir
if ($AutoInstall) {
  if (-not (Test-Path $InstallerPath)) {
    Log "ERROR: Installer not found at $InstallerPath"
    Write-Error "Installer not found at $InstallerPath"; exit 2
  }

  # Ensure install dir exists and has a short path (no spaces recommended for NSIS /D)
  try { Remove-Item -Recurse -Force $InstallDir -ErrorAction SilentlyContinue } catch { }
  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  $dArg = "/D=$InstallDir"
  Log "Running installer silently: `"$InstallerPath`" $('/S ' + $dArg)"

  # Attempt silent install without elevation first
  $startInfo = @(
    '-NoNewWindow', '-Wait'
  )
  try {
    $proc = Start-Process -FilePath $InstallerPath -ArgumentList @('/S', $dArg) -NoNewWindow -Wait -PassThru -ErrorAction Stop
    Log "Installer exited with code: $($proc.ExitCode)"
  } catch {
    Log "Installer non-elevated attempt failed: $_. Trying elevated.."
    try {
      Start-Process -FilePath $InstallerPath -ArgumentList @('/S', $dArg) -Verb RunAs -Wait -ErrorAction Stop
      Log "Elevated installer run completed"
    } catch {
      Log "ERROR: Elevated installer run failed: $_"; Write-Error "Installer failed to run (elevated or not)"; exit 2
    }
  }

  # After install, prefer the exe in the install dir
  $candidate = Join-Path $InstallDir 'Gaia One.exe'
  if (Test-Path $candidate) {
    $UnpackedExePath = $candidate
    Log "Found installed exe at $UnpackedExePath"
  } else {
    # fallback: search common Program Files locations
    $possible = @(
      "$env:ProgramFiles\Gaia One\Gaia One.exe",
      "$env:ProgramFiles(x86)\Gaia One\Gaia One.exe"
    )
    foreach ($p in $possible) { if (Test-Path $p) { $UnpackedExePath = $p; Log "Found exe at $p"; break } }
  }
}

Log "Final UnpackedExePath = $UnpackedExePath"

if (-not (Test-Path $UnpackedExePath)) {
  Log "ERROR: Unpacked executable not found at $UnpackedExePath and AutoInstall did not produce it."
  Write-Error "Unpacked executable not found at $UnpackedExePath"; exit 2
}

# Start the app and run the health check
Log "Starting app: $UnpackedExePath"
$proc = Start-Process -FilePath $UnpackedExePath -PassThru
Log "Launched process id=$($proc.Id)"

try {
  Log "Waiting for backend /health on port $HealthPort (timeout ${TimeoutSeconds}s)..."
  $health = Wait-ForHealth -port $HealthPort -timeout $TimeoutSeconds
  Log "Health OK: $(ConvertTo-Json $health -Depth 4)"
  Write-Host "Smoke test passed ✔" -ForegroundColor Green
  Log "Smoke test passed ✔"
  $exitCode = 0
} catch {
  Log "Smoke test FAILED: $_"
  Write-Error "Smoke test failed: $_"
  $exitCode = 3
} finally {
  # Attempt to close the process
  if ($proc -and -not $proc.HasExited) {
    Log "Stopping app process id=$($proc.Id)..."
    try { Stop-Process -Id $proc.Id -Force } catch { Log "Warning while stopping process: $_" }
  }

  if ($CleanupInstall -and $AutoInstall) {
    $uninstaller = Join-Path $InstallDir 'Uninstall.exe'
    if (Test-Path $uninstaller) {
      Log "Running uninstaller: $uninstaller /S"
      try { Start-Process -FilePath $uninstaller -ArgumentList '/S' -NoNewWindow -Wait; Log "Uninstalled" } catch { Log "Uninstall failed: $_" }
    } else { Log "No uninstaller found at $uninstaller" }
  }

  Log "=== Gaia smoke test finished at $(Get-Date) with exit $exitCode ==="
  Write-Host "Log written to: $logFile"
  exit $exitCode
}
