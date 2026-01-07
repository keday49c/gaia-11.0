# CI: Windows portable build (GitHub Actions)

This document explains how the `windows-portable-build` workflow works and how to run it to obtain a clean portable build of Gaia (avoids local locks).

## What the workflow does

- runs on `windows-latest` (workflow manual trigger via `workflow_dispatch` and on `push` to `master`) 
- installs dependencies (root + `desktop`), runs optional tests
- runs `./desktop/scripts/make_portable_gaia3.ps1 -Force` to download FFmpeg and produce an un-packed build
- verifies that `desktop/dist/win-unpacked/resources/app.asar.unpacked/server/dist/index.js` exists
- uploads `desktop/Gaia-3.0-portable.zip` and `desktop/dist/win-unpacked` as artifacts
- uses `npm ci` in the `desktop` folder to ensure devDependencies (like Electron) are installed so `electron-builder` can detect the Electron version and produce the executable properly (this fixes a CI failure where the installer was not generated)

## Why use CI

Local Windows machines can have file locks from AV, indexers, Explorer or third-party apps that prevent `electron-builder --dir` from producing a clean `dist`. Running the build on a fresh runner ensures deterministic artifacts.

## Secrets & Code signing

If you want signed releases on Windows, provide a certificate and password via repository Secrets (recommended names):

- `CODESIGN_PFX` — base64-encoded PFX file content
- `CODESIGN_PASSWORD` — PFX password

You will need to add steps to import the certificate and run `signtool` on the generated `.exe`. The current workflow includes a placeholder note.

## Manual run

1. Go to Actions -> "Windows Portable Build" -> Run workflow.
2. Wait for the job to finish and download the `Gaia-portable-artifacts` artifact.
3. Inspect the artifact for `Gaia-3.0-portable.zip` and ensure `resources/app.asar.unpacked/server/dist/index.js` exists (the workflow performs this check).

## Troubleshooting

- If verification fails (missing `index.js`), open the workflow logs. The `make_portable_gaia3.ps1` step prints the pre-build attempts and any errors.
- If you need automatic signing, add certificate import + `signtool` steps and ensure secrets are present.

---
