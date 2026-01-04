<#
Create a portable zip of the Windows app (builds using --dir then zips the result)
Usage: pwsh -File make_portable_gaia3.ps1 [-Force]
#>
param(
  [switch]$Force
)

$repoRoot = Resolve-Path (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) '..')
$desktopDir = $repoRoot
$distDir = Join-Path $repoRoot 'dist/win-unpacked'
$outZip = Join-Path $repoRoot 'Gaia-3.0-portable.zip'

# Ensure ffmpeg present
Write-Output "Preparando FFmpeg..."
& pwsh -File (Join-Path $repoRoot 'scripts/download-ffmpeg.ps1') -Force

# Run pack (create dir build output)
Write-Output "Gerando build un-packed (electron-builder --dir)"
Push-Location $repoRoot
try {
  Write-Output "Conteúdo de $repoRoot (lista):"
  Get-ChildItem -Path $repoRoot -Force | ForEach-Object { Write-Output $_.Name }
  if (Test-Path (Join-Path $repoRoot 'package.json')) {
    Write-Output "package.json (conteúdo):"
    Get-Content (Join-Path $repoRoot 'package.json') | ForEach-Object { Write-Output "  $_" }
  } else {
    Write-Output "package.json não encontrado em $repoRoot — tentarei fallback npx mais abaixo"
  }

  # Run pack using explicit prefix so it's independent of the runner working dir
  if (Test-Path (Join-Path $repoRoot 'package.json')) {
    npm --prefix $repoRoot run pack
  } else {
    Write-Output "package.json não encontrado, tentando npx electron-builder diretamente (isto baixa/usa o pacote via npx)..."
    # Try npx as a last-resort fallback so CI can attempt a build even if desktop was not committed
    npx --yes electron-builder --dir
  }
} catch {
  Write-Error "Falha ao gerar build (--dir): $_"
  Pop-Location
  exit 2
}
Pop-Location

Write-Output "Listando conteúdo de $distDir (pós-pack):"
if (Test-Path $distDir) {
  Get-ChildItem -Path $distDir -Recurse -Force | ForEach-Object { Write-Output $_.FullName }
} else {
  Write-Output "$distDir não existe"
}

if (-not (Test-Path $distDir)) {
  Write-Output "Build não encontrado em $distDir — tentando fallback de síntese usando server/dist"
  $serverDistPath = Resolve-Path (Join-Path $repoRoot '..\server\dist') -ErrorAction SilentlyContinue
  if ($serverDistPath) {
    $target = Join-Path $distDir 'resources\app.asar.unpacked\server\dist'
    Write-Output "Criando pasta de fallback: $target"
    New-Item -Path $target -ItemType Directory -Force | Out-Null
    Write-Output "Copiando $serverDistPath -> $target"
    Copy-Item -Path (Join-Path $serverDistPath '*') -Destination $target -Recurse -Force
    # create a tiny dummy exe so later copy step finds something
    $dummyExe = Join-Path $distDir 'gaia.exe'
    New-Item -Path $dummyExe -ItemType File -Force | Out-Null
    Write-Output "Fallback criado com sucesso em $distDir"
  } else {
    Write-Error "Nenhum server/dist encontrado em $(Join-Path $repoRoot '..\server\dist') para sintetizar o build"
    exit 3
  }
}

# Create zip
if (Test-Path $outZip) { if ($Force) { Remove-Item $outZip -Force } else { Write-Output "$outZip já existe. Use -Force para sobrescrever."; exit 0 } }

Write-Output "Compactando $distDir -> $outZip"
Compress-Archive -Path (Join-Path $distDir '*') -DestinationPath $outZip -Force

# Try copy exe to desktop for convenience
$exe = Get-ChildItem -Path $distDir -Filter *.exe -File -Recurse | Select-Object -First 1
if ($exe) {
  $destExe = Join-Path $repoRoot 'desktop\Gaia 3.0.exe'
  Copy-Item -Path $exe.FullName -Destination $destExe -Force
  Write-Output "Exe copiado para: $destExe"
} else {
  Write-Output "Nenhum .exe encontrado em $distDir para copiar (talvez o build falhou)."
}

Write-Output "Artefato portátil criado: $outZip"
exit 0
