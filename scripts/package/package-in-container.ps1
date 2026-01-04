# Empacota o backend em um .exe Windows usando um contêiner Debian/Node
param(
  [string]$NodeImage = 'node:18-bullseye-slim',
  [string]$WorkDir = (Get-Location).Path
)

Write-Host "Usando imagem: $NodeImage";

$cmd = "apt-get update -y && apt-get install -y build-essential python3 curl ca-certificates && cd /work/server && npm ci --no-fund --no-audit --silent && npm run build && mkdir -p /work/build/release && npx --yes pkg launcher.cjs --targets node18-win-x64 --output /work/build/release/gaia-server.exe && ls -la /work/build/release"
Write-Host "Rodando container e empacotando (isso pode demorar)..."

docker run --rm -v "${WorkDir}:/work" -w /work $NodeImage bash -lc $cmd

if ($LASTEXITCODE -ne 0) { Write-Error "Empacotamento falhou. Verifique logs acima." ; exit 1 }

Write-Host "Empacotamento concluído. Verifique build/release/gaia-server.exe";
