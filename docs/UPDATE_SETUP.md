# Update & Release Setup for Gaia Desktop (Windows)

This document explains how to build, publish and test the Windows installer and auto-update flow.

## Quick summary
- We added a local update server script: `desktop/scripts/serve-updates.js` (serves `desktop/dist/`
  contents at `http://localhost:5500/` by default).
- Desktop `main.js` accepts `UPDATE_FEED_URL` env var to test updates against a local feed.
- CI workflow `/.github/workflows/publish-windows.yml` builds the Windows installer when you push a tag `v*` and uploads artifacts to a GitHub Release.

## Secrets required for publishing & signing
To publish signed builds automatically from CI you must set the following secrets in GitHub repository settings:
- `GITHUB_TOKEN` (Actions provided token or personal token with repo scope). Used to create releases.
- (Optional) `WINDOWS_SIGNING_P12` — base64-encoded PFX certificate for signing the Windows installer.
- (Optional) `WINDOWS_SIGNING_PASSWORD` — password for the PFX certificate.

## Local test (no signing required)
1. Build the current desktop package locally (on Windows):
   - Run: `cd desktop && npm run build:win` (may require admin privileges depending on system and electron-builder behavior).
   - If packaging fails due to permissions when extracting tools, run your terminal as Administrator or use CI runner to build.
2. Start the local update server:
   - `cd desktop && npm run serve-updates` (default serves `http://localhost:5500/`)
3. Set the app to check that feed URL (for testing):
   - Start the installed (older) version of Gaia and set environment `UPDATE_FEED_URL=http://localhost:5500/` before launching. The app will use that feed.

## Using GitHub Actions for full publish + signing (recommended)
1. Create a tag: `git tag v2.0.0 && git push origin v2.0.0` (or create release from UI)
2. CI will build and create a release with the artifacts.
3. Once published, installed apps will detect new release and auto-update via GitHub releases.

## Notes / Limitations
- Building on local Windows may require admin to extract sign tool caches; using the CI `windows-latest` runner avoids this local privilege problem.
- To fully support signed auto-update for production, provide the PFX and password as secrets and configure `WINDOWS_SIGNING_P12` / `WINDOWS_SIGNING_PASSWORD` in repo secrets.

---
If you want, I can: 
- Push a branch/PR with these changes, or
- Create the release (when you provide the GH_TOKEN & signing secrets), or
- Attempt a local build again while running the terminal as Administrator.
