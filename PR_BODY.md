Title: ci: integrate client build + smoke tests

Summary:
- Integrates the real `client` build into `gaia-core` Dockerfile so the production client is served when available.
- Adds `gaia-worker` service to the compose setup and ensures local Postgres initialization with necessary extensions.
- Adds `scripts/run-smoke-tests.ps1` to run an end-to-end smoke test: register -> create campaign -> disparar -> wait for worker metrics.
- Adds a GitHub Actions workflow (`.github/workflows/smoke-tests.yml`) to run the smoke test on PRs and upload logs.

Files changed (high level):
- `infra/gaia-compose.yml` (compose improvements, add postgres, worker)
- `gaia-core/Dockerfile` (client build stage + overlay)
- `server/db.ts` (ensure extensions / uuid compatibility)
- `scripts/run-smoke-tests.ps1` (smoke test + retries)
- `CHANGES.md` (changelog entry)
- `.github/workflows/smoke-tests.yml` (CI job)

Checklist for reviewers:
- [ ] Confirm the compose services start on a clean environment
- [ ] Verify smoke test runs successfully on the runner and locally
- [ ] Confirm no unintended changes to production configs
- [ ] Optional: review CI job resource usage and adjust timeouts if needed

How to create the PR locally (if GH CLI not authenticated here):
1. Authenticate locally: `gh auth login` or set `GH_TOKEN`/`GITHUB_TOKEN` environment variable.
2. From this branch: `gh pr create --fill --title "ci: integrate client build + smoke tests" --body-file PR_BODY.md`

Notes:
- CI workflow spins up services with `docker compose` and runs `pwsh ./scripts/run-smoke-tests.ps1`. The runner must have Docker available (the default ubuntu runners do).
- I could not create the PR here because the GitHub CLI is not authenticated in this environment.

Additional changes in this branch:
- Add a macOS desktop build workflow at `.github/workflows/desktop-build.yml` that runs on `macos-latest` and uploads the `dist/` artifacts (unsigned by default).
- Update `CHANGES.md` to document the `Gaia One` desktop scaffold and include local build instructions.
