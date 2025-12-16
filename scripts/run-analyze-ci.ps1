param(
  [string]$ApiBase = "http://localhost:3001",
  [int]$TimeoutSec = 120
)

$timestamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
$logFile = "./logs/analyze_test_$timestamp.log"
New-Item -ItemType Directory -Path ./logs -Force | Out-Null

function Log { param($m) Add-Content -Path $logFile -Value ("$(Get-Date -Format o) `t $m"); Write-Host $m }

Log "Starting analyze CI test against $ApiBase"

# Register user
$body = @{ email = "test+analyze+$timestamp@example.local"; senha = "password123" } | ConvertTo-Json
try {
  $reg = Invoke-RestMethod -Method Post -Uri ($ApiBase + '/auth/register') -Body $body -ContentType 'application/json' -TimeoutSec 10
  Log "register response: $(ConvertTo-Json $reg -Depth 5)"
} catch {
  Log "ERROR: registration failed: $_"
  exit 2
}

$token = $reg.data.token
$headers = @{ Authorization = "Bearer $token" }

# Create campaign
$campBody = @{ nome = "ANALYZE CI Campaign $timestamp"; descricao = "Automated analyze test"; tipo = "promocao"; plataforma = "instagram"; orcamento = 1000 } | ConvertTo-Json
try {
  $create = Invoke-RestMethod -Method Post -Uri ($ApiBase + '/campaigns/criar') -Headers $headers -Body $campBody -ContentType 'application/json' -TimeoutSec 10
  Log "create response: $(ConvertTo-Json $create -Depth 5)"
} catch {
  Log "ERROR: create campaign failed: $_"
  exit 3
}

$campaignId = $create.data.id

# Call analyze endpoint
try {
  $an = Invoke-RestMethod -Method Post -Uri ($ApiBase + "/campaigns/$campaignId/analisar") -Headers $headers -TimeoutSec 30
  Log "analysis response: $(ConvertTo-Json $an -Depth 5)"
  if ($an.success -ne $true) { Log "ERROR: analyze returned success=false"; exit 4 }
  if (-not $an.data.parsed) { Log "WARN: analyze returned no parsed recommendations" }
} catch {
  Log "ERROR: analyze request failed: $_"
  exit 5
}

Log "ANALYZE CI TEST PASSED"
exit 0