const fs = require('fs');
const path = require('path');
const os = require('os');

async function createBackupSnapshot({ app, fs: fsDep = fs, path: pathDep = path } = {}) {
  const ud = (app && typeof app.getPath === 'function') ? app.getPath('userData') : pathDep.join(os.tmpdir(), 'gaia-desktop-test');
  const updatesDir = pathDep.join(ud, 'updates');
  if (!fsDep.existsSync(updatesDir)) fsDep.mkdirSync(updatesDir, { recursive: true });
  const ver = (app && app.getVersion) ? app.getVersion() : 'unknown';
  const timestamp = Date.now();
  const dest = pathDep.join(updatesDir, `backup-${ver}-${timestamp}`);
  const src = (app && app.getAppPath) ? app.getAppPath() : pathDep.join(__dirname);

  // Use fs.cp if available
  if (fsDep.cp) {
    await fsDep.promises.cp(src, dest, { recursive: true });
  } else {
    // naive copy
    await copyRecursive(src, dest, { fs: fsDep, path: pathDep });
  }

  return { success: true, path: dest };
}

async function copyRecursive(src, dest, { fs: fsDep = fs, path: pathDep = path } = {}) {
  if (!fsDep.existsSync(src)) throw new Error('Source not found: ' + src);
  fsDep.mkdirSync(dest, { recursive: true });
  const entries = fsDep.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = pathDep.join(src, e.name);
    const d = pathDep.join(dest, e.name);
    if (e.isDirectory()) {
      await copyRecursive(s, d, { fs: fsDep, path: pathDep });
    } else {
      fsDep.copyFileSync(s, d);
    }
  }
}

async function handleCreateBackup({ app, fs: fsDep = fs, path: pathDep = path } = {}) {
  try {
    const res = await createBackupSnapshot({ app, fs: fsDep, path: pathDep });
    return { success: true, path: res.path };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

async function handleOpenBackupFolder({ app, fs: fsDep = fs, path: pathDep = path, electronShell = require('electron').shell } = {}) {
  try {
    const ud = app.getPath('userData');
    const updatesDir = pathDep.join(ud, 'updates');
    if (!fsDep.existsSync(updatesDir)) return { success: false, message: 'No backups found' };
    await electronShell.openPath(updatesDir);
    return { success: true, path: updatesDir };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

async function handleRollback({ app, fs: fsDep = fs, path: pathDep = path, electronShell = require('electron').shell } = {}) {
  try {
    const ud = app.getPath('userData');
    const updatesDir = pathDep.join(ud, 'updates');
    if (!fsDep.existsSync(updatesDir)) return { success: false, message: 'No backups available' };
    const items = fsDep.readdirSync(updatesDir).filter(n => n.startsWith('backup-')).sort().reverse();
    if (items.length === 0) return { success: false, message: 'No backups available' };
    const latest = pathDep.join(updatesDir, items[0]);

    await electronShell.openPath(latest);
    return { success: true, path: latest, message: 'Backup located. Manual restore required: copy files from backup to application install folder and restart.' };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

async function handleQuit({ app } = {}) {
  try {
    app.quit();
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

function registerIpcHandlers(ipcMain, deps = {}) {
  const { app } = deps;
  ipcMain.handle('app-create-backup', async () => handleCreateBackup(deps));
  ipcMain.handle('app-open-backup-folder', async () => handleOpenBackupFolder(deps));
  ipcMain.handle('app-rollback', async () => handleRollback(deps));
  ipcMain.handle('app-quit', async () => handleQuit(deps));
}

module.exports = {
  createBackupSnapshot,
  handleCreateBackup,
  handleOpenBackupFolder,
  handleRollback,
  handleQuit,
  registerIpcHandlers,
};