<#
Diagnose common causes of file locks that break electron-builder on Windows.
Usage: pwsh -File diagnose-build-locks.ps1 [-StopInterfering]

If -StopInterfering is used, the script will try to stop a small set of common interfering processes (OneDrive, SearchIndexer) - use with caution.
#>
param(
  [switch]$StopInterfering
)

Write-Output "Checking common interfering processes..."
$procs = @("OneDrive","SearchIndexer","MsMpEng","explorer")
foreach ($pname in $procs) {
  $p = Get-Process -Name $pname -ErrorAction SilentlyContinue
  if ($p) { Write-Output "Process running: $pname (Count: $($p.Count))" } else { Write-Output "Not running: $pname" }
}

# Check that dist path exists and attempt to remove
$dist = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) '..\dist\win-unpacked'
$dist = (Resolve-Path $dist -ErrorAction SilentlyContinue)
if ($dist) {
  $dist = $dist.Path
  Write-Output "Found dist at: $dist"
  try {
    Remove-Item -Force -Recurse -Path $dist -ErrorAction Stop
    Write-Output "Successfully removed: $dist"
  } catch {
    Write-Warning "Could not remove $dist. It may be locked by another process."
  }
} else {
  Write-Output "No dist/win-unpacked found; nothing to remove."
}

Write-Output "\nIf files remain locked, try the following steps:\n";
Write-Output "  1) Close Explorer windows open on the project folder."
Write-Output "  2) Temporarily pause or quit OneDrive and antivirus (Windows Defender)."
Write-Output "  3) Reboot the machine to clear stuck handles."
Write-Output "  4) Install SysInternals 'handle.exe' and run: handle.exe app.asar to find the owning process."
Write-Output "  5) Run the build in CI on a clean runner (we have a workflow that builds on tag v3.*)."

if ($StopInterfering) {
  Write-Output "\nStopping common interfering processes..."
  foreach ($pname in @("OneDrive","SearchIndexer")) {
    try { Get-Process -Name $pname -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; Write-Output "Stopped: $pname" } catch { Write-Warning "Could not stop: $pname" }
  }
}

exit 0
