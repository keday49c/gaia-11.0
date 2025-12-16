# Changes (automated)

- Infra: switched `gaia-core` build context to repository root so Dockerfile can build both `core` and `client` artifacts.
- Infra: added `gaia-worker` service to run the local worker (`npm run worker`).
- Core: updated `gaia-core/Dockerfile` to include a `client` build stage and overlay `client/dist` into nginx, using production client when available, falling back to core dist.
- Scripts: added `scripts/run-smoke-tests.ps1` to automate an integration smoke test (register, create campaign, disparar, wait for worker metrics).\n- Fix: improved smoke test registration to use a valid email format and added retries for robustness; smoke test passes locally with the current setup.
- Compose: added healthchecks and minor improvements for robustness.
- Desktop: added an Electron scaffold (`desktop/`) that packages the server+client as a macOS app named **Gaia One**; see `desktop/package.json` and root script `npm run desktop:build` for build steps.

Notes:
- The smoke test will register a temporary user; ensure ports 3000/3001/redis are available.
- To build the desktop app locally on a Mac: `npm run desktop:build` (this runs `server` and `client` builds and then `electron-builder` inside `desktop/` — outputs go to `dist/` by default).
- To run smoke tests locally: `powershell -File .\scripts\run-smoke-tests.ps1`
