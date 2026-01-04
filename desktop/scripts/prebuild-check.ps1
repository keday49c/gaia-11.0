param(
  [int]$Retries = 5,
  [int]$DelayMs = 1000
)

$dist = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) '..\dist\win-unpacked'
$dist = (Resolve-Path $dist -ErrorAction SilentlyContinue)
if (-not $dist) { Write-Output "No dist/win-unpacked found; nothing to clean."; exit 0 }
$dist = $dist.Path

Write-Output "Pre-build check: attempting to remove $dist"

for ($i = 1; $i -le $Retries; $i++) {
  try {
    Remove-Item -Force -Recurse -Path $dist -ErrorAction Stop
    Write-Output "Successfully removed: $dist"
    exit 0
  } catch {
    Write-Warning "Attempt $i/$($Retries): Could not remove $dist. It may be locked by another process."
    Write-Output "If you are on Windows, try: Close Explorer windows, pause OneDrive, temporarily disable real-time antivirus, or reboot."
    Write-Output "Tip: Install Sysinternals 'handle.exe' and run: handle.exe app.asar to find owning process."
    Start-Sleep -Milliseconds $DelayMs
  }
}

Write-Error "Pre-build check failed after $($Retries) attempts. Build may fail due to locked files. See suggestions above.";
exit 1
