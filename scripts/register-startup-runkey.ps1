<#
Register-GaiaRunKey: Add an entry to HKCU Run so Gaia start script runs at user login.
This approach does not require Administrator privileges and will run for the current user.
#>
try {
    $scriptPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'start-gaia.ps1'
} catch {
    $scriptPath = Join-Path (Get-Location) 'start-gaia.ps1'
}

if (-not (Test-Path $scriptPath)) {
    Write-Error "start-gaia.ps1 not found at $scriptPath. Ensure you run this from the repository's scripts folder."
    exit 1
}

$exe = '"' + (Get-Command powershell.exe).Source + '"'
$args = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""
$value = "$exe $args"

New-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'GaiaAutoStart' -Value $value -Force | Out-Null
Write-Output "Added Run registry key for current user. Gaia will start at next login."
