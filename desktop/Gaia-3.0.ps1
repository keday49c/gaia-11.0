<#
Convenience runner: tenta executar o app empacotado em dist/win-unpacked/*.exe; se não encontrado, inicia servidor local e abre o browser.
Uso: pwsh -ExecutionPolicy Bypass -File .\Gaia-3.0.ps1
#>
$repoRoot = Resolve-Path ".."
$dist = Join-Path $repoRoot 'dist/win-unpacked'
$exe = Get-ChildItem -Path $dist -Filter *.exe -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

if ($exe) {
  Write-Output "Executando app empacotado: $($exe.FullName)"
  Start-Process -FilePath $exe.FullName
  exit 0
}

Write-Output "App empacotado não encontrado. Iniciando modo portátil (server + browser)."
Push-Location $repoRoot
# Ensure server dependencies installed
if (-not (Test-Path 'server/node_modules')) { Write-Output 'Instalando dependências server...'; npm --prefix server install }
if (-not (Test-Path 'client/node_modules')) { Write-Output 'Instalando dependências client...'; npm --prefix client install }

Start-Process -FilePath pwsh -ArgumentList '-NoExit','-Command','npm --prefix server run start' -WindowStyle Normal
Start-Sleep -Seconds 3
Start-Process "http://localhost:3001"
Pop-Location
