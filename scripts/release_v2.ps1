<#
Safely prepare and push a release tag v2.0.0 for Gaia desktop.
Usage examples (run from repo root):
  PowerShell -ExecutionPolicy Bypass -File .\scripts\release_v2.ps1 -CommitIfNeeded -Push -CreateTag -TagName v2.0.0
  # Optionally set PFX secrets via gh:
  PowerShell -ExecutionPolicy Bypass -File .\scripts\release_v2.ps1 -CommitIfNeeded -Push -CreateTag -TagName v2.0.0 -PfxPath 'C:\path\cert.pfx' -PfxPassword 'senha'

Notes:
- The script will abort safely if `git` or necessary tools are not available.
- It will NOT echo secret contents to STDOUT.
- Requires `gh` CLI to set GitHub secrets automatically. If `gh` is not available, the script will print instructions.
#>
param(
  [switch]$CommitIfNeeded = $false,
  [switch]$Push = $false,
  [switch]$CreateTag = $false,
  [string]$TagName = 'v2.0.0',
  [string]$PfxPath = '',
  [string]$PfxPassword = ''
)

function Fail([string]$msg, [int]$code=1) {
  Write-Error $msg
  exit $code
}

Write-Host "-> Release helper starting (Tag: $TagName)"

# Check prerequisites
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Fail 'git CLI is not available in PATH. Please install Git or run this script from an environment with git.' 2
}

$gitRoot = (& git rev-parse --show-toplevel) -replace "`r`n",""
if (-not $gitRoot) { Fail 'Not inside a Git repository.' }
Write-Host "Repository root: $gitRoot"
Set-Location $gitRoot

# Show current branch
$branch = (& git rev-parse --abbrev-ref HEAD) -replace "`r`n",""
Write-Host "Current branch: $branch"

# Check status
$status = (& git status --porcelain) -join "`n"
if ($status) {
  Write-Host "Working tree has changes:" -ForegroundColor Yellow
  Write-Host $status
  if ($CommitIfNeeded) {
    Write-Host "Committing changes..."
    & git add -A
    & git commit -m "chore(desktop): prepare Gaia 2.0 release and CI publish" || Fail 'git commit failed'
  } else {
    Write-Host "No commit performed. Use -CommitIfNeeded to automatically commit changes." -ForegroundColor Yellow
  }
} else {
  Write-Host "Working tree clean." -ForegroundColor Green
}

if ($Push) {
  Write-Host "Pushing branch $branch to origin..."
  & git push origin $branch || Fail 'git push failed'
}

if ($CreateTag) {
  $exists = (& git tag -l $TagName) -join "`n"
  if ($exists) {
    Write-Host "Tag $TagName already exists locally. Skipping tag creation." -ForegroundColor Yellow
  } else {
    Write-Host "Creating tag $TagName"
    & git tag $TagName -m "Release $TagName" || Fail 'git tag creation failed'
    if ($Push) {
      Write-Host "Pushing tag $TagName"
      & git push origin $TagName || Fail 'git push tag failed'
    } else {
      Write-Host "Tag created locally. Use -Push to push tag to origin." -ForegroundColor Yellow
    }
  }
}

# Optionally set PFX secrets using gh
if ($PfxPath -and $PfxPassword) {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "gh CLI not found. Install GitHub CLI (https://cli.github.com/) to set secrets automatically." -ForegroundColor Yellow
    Write-Host "Alternatively, add secrets manually in GitHub repo Settings -> Secrets -> Actions." -ForegroundColor Yellow
  } else {
    # Read and base64 encode PFX
    Write-Host "Encoding PFX (path hidden) and setting secrets via gh..."
    try {
      $bytes = [System.IO.File]::ReadAllBytes($PfxPath)
      $b64 = [Convert]::ToBase64String($bytes)
      # Use gh secret set (will prompt for auth if needed)
      gh secret set WINDOWS_SIGNING_P12 --body $b64 --repo "$(git config --get remote.origin.url | % { $_ -replace '\.git$','' } )" | Out-Null
      gh secret set WINDOWS_SIGNING_PASSWORD --body $PfxPassword --repo "$(git config --get remote.origin.url | % { $_ -replace '\.git$','' } )" | Out-Null
      Write-Host "Secrets WINDOWS_SIGNING_P12 and WINDOWS_SIGNING_PASSWORD set (via gh)." -ForegroundColor Green
    } catch {
      Write-Host "Failed to set secrets via gh: $_" -ForegroundColor Red
    }
  }
} elseif ($PfxPath -or $PfxPassword) {
  Write-Host "Both -PfxPath and -PfxPassword are required to set PFX secrets via gh. Skipping." -ForegroundColor Yellow
}

Write-Host "Done. Please check GitHub Actions page to monitor the build & publish workflow."
