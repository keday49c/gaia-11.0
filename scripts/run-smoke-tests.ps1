param(
    [string]$ApiBase = "http://localhost:3001",
    [int]$TimeoutSec = 120
)

$timestamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
$logFile = "./logs/smoke_test_$timestamp.log"
New-Item -ItemType Directory -Path ./logs -Force | Out-Null

function Log { param($m) Add-Content -Path $logFile -Value ("$(Get-Date -Format o) `t $m"); Write-Host $m }

Log "Starting smoke test against $ApiBase"

# Register user
$body = @{ email = "test+ci+$timestamp@local"; senha = "password123" } | ConvertTo-Json
try {
    $reg = Invoke-RestMethod -Method Post -Uri ($ApiBase + '/auth/register') -Body $body -ContentType 'application/json' -TimeoutSec 10
    Log "register response: $(ConvertTo-Json $reg -Depth 5)"
} catch {
    Log "ERROR: registration failed: $_"
    exit 2
}

$token = $reg.data.token
if (-not $token) { Log "ERROR: no token returned"; exit 3 }

$headers = @{ Authorization = "Bearer $token" }

# Create campaign
$campBody = @{ nome = "CI Campaign $timestamp"; descricao = "Automated smoke test"; tipo = "promocao"; plataforma = "instagram"; orcamento = 1000 } | ConvertTo-Json
try {
    $create = Invoke-RestMethod -Method Post -Uri ($ApiBase + '/campaigns/criar') -Headers $headers -Body $campBody -ContentType 'application/json' -TimeoutSec 10
    Log "create response: $(ConvertTo-Json $create -Depth 5)"
} catch {
    Log "ERROR: create campaign failed: $_"
    exit 4
}

$campaignId = $create.data.id
if (-not $campaignId) { Log "ERROR: no campaign id"; exit 5 }

# Trigger disparar
$disBody = @{ campaignId = $campaignId } | ConvertTo-Json
try {
    $disp = Invoke-RestMethod -Method Post -Uri ($ApiBase + '/campaigns/disparar') -Headers $headers -Body $disBody -ContentType 'application/json' -TimeoutSec 10
    Log "disparar response: $(ConvertTo-Json $disp -Depth 5)"
} catch {
    Log "ERROR: disparar failed: $_"
    exit 6
}

# Wait for worker to process and for metrics to appear
$deadline = (Get-Date).AddSeconds($TimeoutSec)
$success = $false
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 3
    try {
        $metrics = Invoke-RestMethod -Method Get -Uri ($ApiBase + "/campaigns/$campaignId/metricas") -Headers $headers -TimeoutSec 5
        Log "metrics response: $(ConvertTo-Json $metrics -Depth 5)"
        if ($metrics.data.metricas -and $metrics.data.metricas.Count -gt 0) { $success = $true; break }
    } catch {
        Log "metrics fetch failed (retrying): $_"
    }
}

if ($success) {
    Log "SMOKE TEST PASSED: metrics generated for campaign $campaignId"
    exit 0
} else {
    Log "SMOKE TEST FAILED: no metrics within timeout"
    exit 7
}
