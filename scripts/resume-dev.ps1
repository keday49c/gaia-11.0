# Resume Dev Environment for Gaia
# Usage: open VS Code terminal (PowerShell) in repo root and run:
#  .\scripts\resume-dev.ps1

Write-Host "Iniciando script resume-dev.ps1" -ForegroundColor Cyan

# Determina raiz do repositório mesmo quando o script é executado a partir de 'scripts'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
Set-Location $repoRoot

# Garante que o .env na raiz está configurado para desenvolvimento
$envFile = Join-Path $repoRoot '.env'
if (Test-Path $envFile) {
  $envText = Get-Content -Raw $envFile
  if ($envText -match 'NODE_ENV\s*=\s*production') {
    Write-Host "Ajustando NODE_ENV para 'development' no arquivo .env" -ForegroundColor Yellow
    $envText = $envText -replace 'NODE_ENV\s*=\s*production','NODE_ENV=development'
    $envText | Out-File -Encoding UTF8NoBOM $envFile
  }

  if ($envText -notmatch 'VITE_API_URL') {
    Write-Host "Adicionando VITE_API_URL=http://localhost:3001 no .env" -ForegroundColor Yellow
    Add-Content -Path $envFile -Value "`nVITE_API_URL=http://localhost:3001"
  }
} else {
  Write-Host "Arquivo .env não encontrado na raiz. Criando .env com valores mínimos." -ForegroundColor Yellow
  @"
NODE_ENV=development
VITE_API_URL=http://localhost:3001
"@ | Out-File -Encoding UTF8NoBOM $envFile
}

# Verifica Docker
Write-Host "Verificando Docker..." -ForegroundColor Cyan
docker version > $null 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker não responde. Inicie o Docker Desktop e rode o script novamente." -ForegroundColor Yellow
  exit 1
}

# 3) Aguardar Docker responder (timeout 120s)
Write-Host "Aguardando Docker Engine ficar disponível (até 120s)..." -ForegroundColor Cyan
$ok = $false
$timeout = (Get-Date).AddSeconds(120)
while ((Get-Date) -lt $timeout) {
  docker version > $null 2>&1
  if ($LASTEXITCODE -eq 0) { $ok = $true; break }
  Start-Sleep -Seconds 2
}
if (-not $ok) {
  Write-Host "Docker não respondeu dentro do tempo. Abra o Docker Desktop e tente novamente." -ForegroundColor Red
  exit 1
}
Write-Host "Docker pronto." -ForegroundColor Green

# 1) Recria backend + postgres (não remove volumes, não perde dados)
Write-Host "Subindo Postgres e Backend (rebuild)..." -ForegroundColor Cyan
docker-compose up -d --build postgres backend

# 2) Espera rápida para o backend estabilizar
Start-Sleep -Seconds 5

# 3) Mostrar status (resumo)
Write-Host "Status dos containers:" -ForegroundColor Cyan
docker-compose ps

# 4) Parar container frontend (se existir) para liberar a porta 3000
Write-Host "Parando container frontend (se existir) para liberar a porta 3000..." -ForegroundColor Cyan
docker stop gaia-frontend 2>$null; docker rm gaia-frontend 2>$null

# 5) Caminho absoluto para a pasta client
$clientDir = Resolve-Path (Join-Path $repoRoot 'client')
Set-Location $clientDir

# 6) Instalar dependências se necessário
if (-Not (Test-Path node_modules)) {
  Write-Host "Instalando dependências do frontend (pode demorar)..." -ForegroundColor Cyan
  npm install
}

# 7) Iniciar o dev server do frontend em 3000 em uma nova janela do PowerShell (mantém o terminal atual livre)
Write-Host "Iniciando dev server do frontend na porta 3000 (em nova janela)..." -ForegroundColor Cyan
$devCmd = "cd `"$clientDir`"; npm run dev -- --port 3000"
Start-Process -FilePath pwsh -ArgumentList "-NoExit","-Command",$devCmd -WorkingDirectory $clientDir -WindowStyle Normal

# 8) Abrir automaticamente o navegador no frontend
Start-Sleep -Seconds 2
Write-Host "Abrindo http://localhost:3000 no navegador..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

# 9) Mostrar logs do backend aqui no terminal atual
Write-Host "Seguindo logs do backend (CTRL+C para parar)..." -ForegroundColor Cyan
docker logs gaia-backend --tail 200 --follow
