const fs = require('fs');
const path = require('path');
const os = require('os');
const { handleQuit, handleRollback, createBackupSnapshot } = require('../ipc-handlers');

describe('desktop ipc handlers', () => {
  test('handleQuit calls app.quit and returns success', async () => {
    const mockApp = { quit: jest.fn() };
    const res = await handleQuit({ app: mockApp });
    expect(res.success).toBe(true);
    expect(mockApp.quit).toHaveBeenCalled();
  });

  test('handleRollback returns no backups if none exist', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gaia-test-'));
    const mockApp = { getPath: () => tmp };
    const res = await handleRollback({ app: mockApp, fs, path });
    expect(res.success).toBe(false);
    expect(res.message || res.error).toBeDefined();
    // cleanup
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('createBackupSnapshot creates a backup folder', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gaia-src-'));
    // create a small folder structure to copy
    const src = path.join(tmp, 'app');
    fs.mkdirSync(src, { recursive: true });
    fs.writeFileSync(path.join(src, 'hello.txt'), 'hi');

    const mockApp = { getPath: () => tmp, getVersion: () => 'vtest', getAppPath: () => src };
    const res = await createBackupSnapshot({ app: mockApp, fs, path });
    expect(res.success).toBe(true);
    expect(fs.existsSync(res.path)).toBe(true);
    expect(fs.existsSync(path.join(res.path, 'hello.txt'))).toBe(true);

    // cleanup
    fs.rmSync(tmp, { recursive: true, force: true });
  }, 20000);

  test('handleRollback opens latest backup when present', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gaia-test-'));
    const updatesDir = path.join(tmp, 'updates');
    fs.mkdirSync(updatesDir, { recursive: true });
    const b = path.join(updatesDir, 'backup-v1-1');
    fs.mkdirSync(b, { recursive: true });
    fs.writeFileSync(path.join(b, 'a.txt'), 'x');

    const mockShell = { openPath: jest.fn().mockResolvedValue('') };
    const mockApp = { getPath: () => tmp };
    const res = await handleRollback({ app: mockApp, fs, path, electronShell: mockShell });
    expect(res.success).toBe(true);
    expect(res.path).toContain('updates');
    expect(mockShell.openPath).toHaveBeenCalled();

    fs.rmSync(tmp, { recursive: true, force: true });
  });
});