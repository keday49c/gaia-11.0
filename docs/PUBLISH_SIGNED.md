# Publishing signed Windows releases (Gaia 3.0)

This document describes the steps and secrets needed to publish a signed Windows release and validate the auto-update end-to-end.

## Required secrets
- `GH_TOKEN` - GitHub Personal Access Token with `repo` and `workflow` scopes for creating releases and uploading artifacts.
- `WINDOWS_SIGNING_P12` - Base64-encoded PKCS#12 certificate containing the code signing certificate.
- `WINDOWS_SIGNING_PASSWORD` - Password for the P12 certificate.

## High-level steps
1. Add the secrets to GitHub repository settings → Secrets → Actions.
2. Configure `package.json` `build.publish` section (already present) to point to the repo owner/name.
3. Create a release tag (e.g., `v3.0.1-rc`). The CI workflow `publish-windows.yml` will pick it up and create artifacts.
4. Confirm artifacts include `latest.yml` and the signed installer/exe.
5. Test update flow: install an older release locally, then run the installed app and verify it detects an update, downloads, and installs. Verify rollback by intentionally failing post-install steps.

## Notes
- Windows SmartScreen may still flag newly-signed binaries until the certificate has reputation.
- For E2E auto-update tests, you need test machines with the older release installed and internet access to the release feed (or configure `UPDATE_FEED_URL` to a local server hosting the artifacts).

