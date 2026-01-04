param(
    [string]$ApiBase = "http://localhost:3001",
    [string]$Token
)

if (-not $Token) { Write-Host "Usage: .\test-analyze.ps1 -Token <JWT token>"; exit 1 }

$headers = @{ Authorization = "Bearer $Token" }

# Pick a campaign from list
$list = Invoke-RestMethod -Method Get -Uri ($ApiBase + '/campaigns/lista') -Headers $headers
if (-not $list.data -or $list.data.Count -eq 0) { Write-Host "No campaigns found for the user"; exit 2 }
$campaignId = $list.data[0].id
Write-Host "Analyzing campaign $campaignId"

try {
    $an = Invoke-RestMethod -Method Post -Uri ($ApiBase + "/campaigns/$campaignId/analisar") -Headers $headers -TimeoutSec 30
    Write-Host "Analysis result:`n" (ConvertTo-Json $an -Depth 5)
} catch {
    Write-Host "Analyze call failed: $_"
    exit 3
}
