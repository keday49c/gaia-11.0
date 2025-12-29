# Run this after Node is installed
function FailIfLast { if ($LASTEXITCODE -ne 0) { throw "Command failed with exit code $LASTEXITCODE" } }

# Verify node
try {
  $node = & node -v 2>$null
} catch {
  Write-Error "Node not found. Run scripts\install-node.ps1 first."; exit 1
}
Write-Host "Node present: $node"

# Install dependencies
Write-Host "Running npm ci at repo root..."
npm ci
FailIfLast

# Run type checks in client and server
Write-Host "Running type-check in client workspace..."
npm run type-check --workspace=client
FailIfLast

Write-Host "Running type-check in server workspace..."
npm run type-check --workspace=server
FailIfLast

# Run server tests
Write-Host "Running server tests..."
npm --prefix server test
FailIfLast

Write-Host "CI steps completed successfully."