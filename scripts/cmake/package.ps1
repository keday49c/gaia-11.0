param(
  [string]$BuildDir = "build",
  [string]$Generator = "Ninja"
)

$source = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $source

if (-not (Get-Command cmake -ErrorAction SilentlyContinue)) {
  Write-Error "cmake not found in PATH. Please install CMake and add to PATH."
  exit 1
}

# Create build dir
if (-not (Test-Path $BuildDir)) { New-Item -ItemType Directory -Path $BuildDir | Out-Null }

# Configure
Write-Host "Configuring CMake (generator=$Generator) in $BuildDir..."
cmake -S "${PWD}" -B $BuildDir -G $Generator
if ($LASTEXITCODE -ne 0) { throw "CMake configure failed" }

# Build default target (gaia_pkg)
Write-Host "Building gaia_pkg target..."
cmake --build $BuildDir --target gaia_pkg --config Release
if ($LASTEXITCODE -ne 0) { throw "CMake build failed" }

# Run CPack
Write-Host "Packaging with CPack..."
cpack --config $BuildDir/CPackConfig.cmake -C Release -G ZIP
if ($LASTEXITCODE -ne 0) { Write-Warning "CPack packaging failed or NSIS not available; check CPack output" }

Write-Host "Package output available in: $BuildDir"
Write-Host "Done."