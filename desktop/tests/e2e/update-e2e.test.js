const { describe, test } = require('@jest/globals');

describe('E2E: update flow (placeholder)', () => {
  test.skip('auto-update E2E requires signed release and feed; run manually with E2E=1', () => {
    // This is a placeholder for an end-to-end test that will:
    // - install an older release in a Windows VM
    // - set UPDATE_FEED_URL to a test feed hosting a newer release
    // - start app and verify update flow & rollback
    // Implementation requires VM infra / secrets and is intentionally skipped by default
  });
});
