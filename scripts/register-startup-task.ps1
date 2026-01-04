<#
Register-GaiaStartupTask: Register a Scheduled Task to start Gaia at user logon.

Run this script once (PowerShell) to register the task for the current user.
It registers a task that runs `start-gaia.ps1` at logon with a hidden PowerShell.
If you prefer to register for all users or run with different privileges, run
this script as Administrator and adjust the principal as needed.
#>
$taskName = 'GaiaAutoStart'
try {
    $scriptPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'start-gaia.ps1'
} catch {
    $scriptPath = Join-Path (Get-Location) 'start-gaia.ps1'
}

if (-not (Test-Path $scriptPath)) {
    Write-Error "start-gaia.ps1 not found at $scriptPath. Ensure you run this from the repository's scripts folder."
    exit 1
}

Write-Output "Registering scheduled task '$taskName' to run '$scriptPath' at user logon..."

try {
    $action = New-ScheduledTaskAction -Execute 'PowerShell.exe' -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""
    $trigger = New-ScheduledTaskTrigger -AtLogOn
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive

    # Try to register (will overwrite existing)
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Force
    Write-Output "Scheduled task '$taskName' created for user $env:USERNAME. It will run at logon."
} catch {
    Write-Error "Failed to create scheduled task: $($_.Exception.Message)"
    Write-Output "You can create it manually in Task Scheduler by pointing to: PowerShell.exe -NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
}
