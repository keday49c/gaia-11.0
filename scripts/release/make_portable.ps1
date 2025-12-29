param(
  [string]$NodeVersion = '18.20.8',
  [string]$OutputRelative = 'build/release/gaia-server-portable-win'
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition | Split-Path -Parent | Split-Path -Parent
Set-Location $root

Write-Host "Generating portable Windows package for Gaia (Node $NodeVersion)"

$temp = Join-Path $env:TEMP ("gaia-portable-$NodeVersion")
if (Test-Path $temp) { Remove-Item -Recurse -Force $temp }
New-Item -ItemType Directory -Path $temp | Out-Null

$nodeZip = Join-Path $temp 'node-win.zip'
$nodeUrl = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-x64.zip"
Write-Host "Downloading Node from $nodeUrl"
Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeZip -UseBasicParsing

Write-Host "Extracting Node..."
Expand-Archive -Path $nodeZip -DestinationPath $temp -Force
$nodeDir = Get-ChildItem -Path $temp -Directory | Where-Object { $_.Name -like "node-v*win*" } | Select-Object -First 1
if (-not $nodeDir) { Write-Error "Node archive extraction failed"; exit 1 }

$out = Join-Path $root $OutputRelative
if (Test-Path $out) { Remove-Item -Recurse -Force $out }
New-Item -ItemType Directory -Path $out | Out-Null

# Copy minimal node runtime
New-Item -ItemType Directory -Path (Join-Path $out 'node') | Out-Null
Copy-Item -Path (Join-Path $nodeDir.FullName '*') -Destination (Join-Path $out 'node') -Recurse -Force

# Copy server code (compiled dist) and package.json
New-Item -ItemType Directory -Path (Join-Path $out 'app') | Out-Null
Copy-Item -Path server\dist -Destination (Join-Path $out 'app') -Recurse -Force
Copy-Item -Path server\package.json -Destination (Join-Path $out 'app') -Force
Copy-Item -Path server\package-lock.json -Destination (Join-Path $out 'app') -Force
Copy-Item -Path server\README_RELEASE.md -Destination (Join-Path $out 'app') -Force -ErrorAction SilentlyContinue

# Create helper scripts
$runBat = @'
@echo off
setlocal
REM If node_modules not installed, run 'install-deps' argument to install on Windows
if "%1"=="install" (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "& {cd "%~dp0\app"; npm ci --production}"
  exit /b %ERRORLEVEL%
)
set NODE="%~dp0\node\node.exe"
%NODE% "%~dp0\app\dist\index.js" %*
'@
Set-Content -Path (Join-Path $out 'run-server.bat') -Value $runBat -Encoding ASCII

$runPs = @'
param([string[]]$args)
$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
# Default to SQLite for portable package when DATABASE is not set (makes it plug-and-play)
if (-not $env:DATABASE) { $env:DATABASE = 'sqlite' }
$node = Join-Path $here 'node\node.exe'
& $node (Join-Path $here 'app\dist\index.js') @args
'@
Set-Content -Path (Join-Path $out 'run-server.ps1') -Value $runPs -Encoding UTF8

$installPs = "Write-Host 'Installing production dependencies...'; Push-Location (Join-Path `$PSScriptRoot 'app'); npm ci --production; Pop-Location"
Set-Content -Path (Join-Path $out 'install-deps.ps1') -Value $installPs -Encoding UTF8

# Add README
$readme = @"
Gaia - Pacote portátil Windows

Instruções rápidas:
1) Extraia este arquivo em uma pasta no Windows.
2) Opcional: execute `install-deps.ps1` (PowerShell) para instalar dependências nativas do Windows:
   powershell -NoProfile -ExecutionPolicy Bypass -File .\install-deps.ps1
3) Inicie o servidor com:
   - `run-server.bat` (prompt) ou
   - `powershell -File .\run-server.ps1`

Configurações de ambiente:
- Por padrão este pacote **usa SQLite** (modo portátil) quando `DATABASE` não estiver definido. Para usar Postgres, defina `DATABASE_URL` ou `DB_HOST` e garanta que o serviço esteja acessível.
- Configure outras variáveis como `PORT` e `JWT_SECRET` antes de iniciar o servidor se necessário.

Observação: este pacote inclui o runtime Node (v$NodeVersion). O passo `install-deps.ps1` é recomendado para garantir que módulos nativos sejam compilados corretamente para Windows.
"@
Set-Content -Path (Join-Path $out 'README_PORTABLE.txt') -Value $readme -Encoding UTF8

# Create zip
$zipFile = Join-Path $root 'build\release\gaia-server-portable-win.zip'
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
Write-Host "Compressing to $zipFile"
Compress-Archive -Path (Join-Path $out '*') -DestinationPath $zipFile -Force

Write-Host "Portable package generated: $zipFile"
Write-Host "Size: " (Get-Item $zipFile).Length / 1MB "MB"

# Clean temp
Remove-Item -Recurse -Force $temp

Write-Host "Done."