<#
Downloads a Windows FFmpeg build and places the bin/ contents into desktop/vendor/ffmpeg/win64
Usage: pwsh -File download-ffmpeg.ps1 [-Force] [-Url <url>] 
#>
param(
  [switch]$Force,
  [string]$Url = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip'
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
$dest = Join-Path $repoRoot 'vendor/ffmpeg/win64'
$tmp = Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString() + '.zip')
$extractDir = Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString())

if ((Test-Path $dest -PathType Container) -and (-not $Force)) {
  Write-Output "FFmpeg already present at $dest (use -Force to re-download)."
  exit 0
}

if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }

Write-Output "Baixando FFmpeg de: $Url"

try {
  Invoke-WebRequest -Uri $Url -OutFile $tmp -UseBasicParsing -TimeoutSec 120
} catch {
  Write-Error "Falha ao baixar FFmpeg: $_"
  exit 2
}

try {
  Expand-Archive -Path $tmp -DestinationPath $extractDir -Force
} catch {
  Write-Error "Falha ao descompactar: $_"
  Remove-Item -Force $tmp -ErrorAction SilentlyContinue
  exit 3
}

# Find 'bin' directory inside extracted tree
$binDirs = Get-ChildItem -Path $extractDir -Directory -Recurse | Where-Object { $_.Name -ieq 'bin' }
if ($binDirs.Count -eq 0) {
  Write-Error "Bin directory not found inside archive"
  Remove-Item -Recurse -Force $extractDir, $tmp -ErrorAction SilentlyContinue
  exit 4
}

# Copy contents of first bin dir
$srcBin = $binDirs[0].FullName
Write-Output "Copiando arquivos de $srcBin para $dest"
Copy-Item -Path (Join-Path $srcBin '*') -Destination $dest -Recurse -Force

# Cleanup
Remove-Item -Force $tmp -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $extractDir -ErrorAction SilentlyContinue

Write-Output "FFmpeg instalado em: $dest"
exit 0
