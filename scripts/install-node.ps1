param(
  [switch]$Force
)

function Check-Node {
  try {
    $v = & node -v 2>$null
    return $v
  } catch {
    return $null
  }
}

if ((Check-Node) -and -not $Force) {
  Write-Host "Node already installed: $(node -v)"
  exit 0
}

# Try winget
if (Get-Command winget -ErrorAction SilentlyContinue) {
  Write-Host "Installing Node LTS via winget..."
  winget install --id OpenJS.NodeJS.LTS -e --silent
  if (Check-Node) { Write-Host "Node installed: $(node -v)"; exit 0 }
}

# Try choco
if (Get-Command choco -ErrorAction SilentlyContinue) {
  Write-Host "Installing Node LTS via choco..."
  choco install nodejs-lts -y
  if (Check-Node) { Write-Host "Node installed: $(node -v)"; exit 0 }
}

# Download MSI from Node.js (best-effort)
$arch = if([Environment]::Is64BitOperatingSystem) {'x64'} else {'x86'}
$base = "https://nodejs.org/dist/latest-v20.x"
$msiUrl = ""
Write-Host "Attempting to discover latest LTS MSI in $base"
try {
  $index = Invoke-WebRequest $base -UseBasicParsing -ErrorAction SilentlyContinue
  if ($index -and $index.Content -match "node-v(?<ver>[\d\.]+)-win-$arch\.msi") {
    $ver = $matches['ver']
    $msiUrl = "$base/node-v$ver-win-$arch.msi"
  }
} catch {
  # ignore
}

if (-not $msiUrl) {
  # Fallback to a generic path (may fail on some nodes)
  $msiUrl = "$base/node-v20.0.0-win-$arch.msi"
}

$temp = "$env:TEMP\node-installer.msi"
Write-Host "Downloading $msiUrl to $temp"
try {
  Invoke-WebRequest -Uri $msiUrl -OutFile $temp -UseBasicParsing -ErrorAction Stop
  Write-Host "Running MSI installer (will prompt for elevation)..."
  Start-Process msiexec.exe -ArgumentList "/i `"$temp`" /qn /norestart" -Verb RunAs -Wait
  if (Check-Node) { Write-Host "Node installed: $(node -v)"; exit 0 }
} catch {
  Write-Error "Failed to download or run installer: $_"
}

Write-Error "Node installation failed. Please run the script with admin privileges or install Node manually from https://nodejs.org/" 
exit 1
