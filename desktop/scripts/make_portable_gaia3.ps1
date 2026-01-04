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
  npm run pack --silent
} catch {
  Write-Error "Falha ao gerar build (--dir): $_"
  Pop-Location
  exit 2
}
Pop-Location

if (-not (Test-Path $distDir)) {
  Write-Error "Build não encontrado em $distDir"
  exit 3
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
