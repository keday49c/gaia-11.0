<#
Secure release helper script: creates & pushes a tag, optionally creates a GitHub Release and sets PFX secrets via gh.
Usage examples:
  # Basic: create and push tag v2.0.0
  pwsh -ExecutionPolicy Bypass -File .\scripts\release_with_secrets.ps1 -Repo owner/repo -TagName v2.0.0 -Push -CreateRelease

  # Create release and set PFX secrets (requires gh authenticated)
  pwsh -ExecutionPolicy Bypass -File .\scripts\release_with_secrets.ps1 -Repo owner/repo -TagName v2.0.0 -Push -CreateRelease -SetSecrets -PfxPath 'C:\path\cert.pfx' -PfxPassword 'senha'

Notes:
- This script DOES NOT contain any token literals. Use `gh auth login` or set $env:GITHUB_TOKEN locally before running.
- The script aborts safely if prerequisites are missing.
#>
param(
  [Parameter(Mandatory=$true)][string]$Repo,            # owner/repo
  [string]$TagName = 'v2.0.0',
  [switch]$Push = $false,
  [switch]$CreateRelease = $false,
  [switch]$SetSecrets = $false,
  [string]$PfxPath = '',
  [string]$PfxPassword = ''
)

function Fail([string]$msg) {
  Write-Error $msg
  exit 1
}

Write-Host "Release helper: repo=$Repo tag=$TagName"

# Check for git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Fail 'git not found in PATH. Install Git and retry.' }

# Use gh if available, otherwise rely on GITHUB_TOKEN env var for REST calls
$hasGh = (Get-Command gh -ErrorAction SilentlyContinue) -ne $null
if (-not $hasGh -and -not $env:GITHUB_TOKEN) {
  Fail 'Neither gh CLI is available nor GITHUB_TOKEN env var set. Authenticate via `gh auth login` or set $env:GITHUB_TOKEN.'
}

# Ensure we're in repo root
$root = (& git rev-parse --show-toplevel) -replace "`r?`n", ''
if (-not $root) { Fail 'Not in a git repository.' }
Set-Location $root

# Ensure working tree clean
$st = (& git status --porcelain) -join "`n"
if ($st) {
  Write-Host "Working tree has changes:" -ForegroundColor Yellow
  Write-Host $st
  Fail "Please commit or stash changes before running this script, or run the script from a clean working tree."
}

# Ensure branch is pushed if Push requested
$branch = (& git rev-parse --abbrev-ref HEAD) -replace "`r?`n", ''
Write-Host "Current branch: $branch"
if ($Push) {
  Write-Host "Pushing branch $branch to origin..."
  & git push origin $branch || Fail 'git push branch failed'
}

# Create tag locally if not exists
$tagList = (& git tag -l "$TagName") -join "`n"
if ([string]::IsNullOrEmpty($tagList)) {
  Write-Host "Creating tag $TagName"
  & git tag $TagName -m "Release $TagName" || Fail "Failed to create tag $TagName"
} else {
  Write-Host "Tag $TagName already exists locally." -ForegroundColor Yellow
}

# Push tag if requested
if ($Push) {
  Write-Host "Pushing tag to origin..."
  & git push origin $TagName || Fail "Failed to push tag $TagName"
}

# Optionally create a release using gh or REST API
if ($CreateRelease) {
  if ($hasGh) {
    Write-Host "Creating release via gh..."
    gh release create $TagName --repo $Repo --title "Release $TagName" --notes "Automated release $TagName" || Fail "gh release create failed"
    Write-Host "Release created via gh."
  } else {
    if (-not $env:GITHUB_TOKEN) { Fail 'GITHUB_TOKEN not set for REST API call.' }
    $apiUrl = "https://api.github.com/repos/$Repo/releases"
    $body = @{ tag_name = $TagName; name = "Release $TagName"; body = "Automated release $TagName" } | ConvertTo-Json
    $hdr = @{ Authorization = "token $env:GITHUB_TOKEN"; Accept = 'application/vnd.github+json' }
    try {
      $resp = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $hdr -Body $body -ContentType 'application/json' -ErrorAction Stop
      Write-Host "Release created via REST API: $($resp.html_url)"
    } catch {
      Fail "Release creation via REST API failed: $_"
    }
  }
}

# Optionally set secrets (PFX base64 + password) via gh (recommended)
if ($SetSecrets) {
  if (-not $hasGh) { Fail 'To set secrets automatically please install and authenticate gh CLI (`gh auth login`) first.' }
  if (-not (Test-Path $PfxPath)) { Fail "PFX path not found: $PfxPath" }
  try {
    $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($PfxPath))
    $tmp = New-TemporaryFile
    Set-Content -Path $tmp -Value $b64 -NoNewline -Encoding ASCII
    gh secret set WINDOWS_SIGNING_P12 --body (Get-Content -Raw $tmp) --repo $Repo
    gh secret set WINDOWS_SIGNING_PASSWORD --body $PfxPassword --repo $Repo
    Remove-Item $tmp -Force
    Write-Host "Secrets set via gh."
  } catch {
    Remove-Item $tmp -ErrorAction SilentlyContinue
    Fail "Failed to set secrets via gh: $_"
  }
}

Write-Host "Done. Check Actions on GitHub for the workflow run and Release page for artifacts."