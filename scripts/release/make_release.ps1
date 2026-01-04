param(
  [string]$ReleaseDir = "build/release"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir '..\..')
Set-Location $repoRoot

Write-Host "Preparing release dir: $ReleaseDir"

if (-not (Test-Path $ReleaseDir)) { New-Item -ItemType Directory -Path $ReleaseDir -Force | Out-Null }

# Copy server dist
Write-Host "Copying server/dist -> $ReleaseDir/dist"
Remove-Item -Recurse -Force "$ReleaseDir\dist" -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force (Join-Path $repoRoot 'server\dist') "$ReleaseDir\dist"

# Copy client static
Write-Host "Copying client/dist -> $ReleaseDir/static"
Remove-Item -Recurse -Force "$ReleaseDir\static" -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force (Join-Path $repoRoot 'client\dist') "$ReleaseDir\static"

# Create run scripts
$bat = @"
@echo off
SETLOCAL
echo Iniciando Gaia backend (Node requerido no PATH ou gaia-server.exe presente)
if exist "%~dp0\gaia-server.exe" (
  "%~dp0\gaia-server.exe" %*
) else (
  if exist "%~dp0\node.exe" (
    "%~dp0\node.exe" "%~dp0\dist\index.js" %*
  ) else (
    node "%~dp0\dist\index.js" %*
  )
)
ENDLOCAL
"@

$ps1 = @"
param([int]
$Port = 3001)

Write-Host "Iniciando Gaia backend na porta $Port (Node requerido)"
$exePath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) 'gaia-server.exe'
if (Test-Path $exePath) {
  & $exePath
} else {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) {
    Push-Location (Split-Path -Parent $MyInvocation.MyCommand.Definition)
    & node .\dist\index.js
    Pop-Location
  } else {
    Write-Error "Node não encontrado. Instale Node.js (>=18) ou coloque node.exe na pasta de release."
    exit 1
  }
}
"@

Set-Content -Path "$ReleaseDir\run-server.bat" -Value $bat -Encoding ASCII
Set-Content -Path "$ReleaseDir\run-server.ps1" -Value $ps1 -Encoding UTF8

# Add a simple README
$readme = @"
Gaia - Release (local)

Como executar:
- Instale Node.js (>=18) e execute `run-server.bat` ou `run-server.ps1`.
- Se você já tiver o `gaia-server.exe` (gerado por `pkg`), ele será executado automaticamente.

A pasta 'static' contém os arquivos do frontend (Vite build).
A pasta 'dist' contém o backend compilado (TypeScript -> JS).
"@
Set-Content -Path "$ReleaseDir\README_RELEASE.md" -Value $readme -Encoding UTF8

Write-Host "Release prepared: $ReleaseDir"
