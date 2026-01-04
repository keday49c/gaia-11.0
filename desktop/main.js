const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const keytar = require('keytar');
const crypto = require('crypto');

log.transports.file.level = 'info';
log.info('Starting Gaia Desktop');

let serverProcess = null;
const DEFAULT_PORT = process.env.PORT || '3001';

// Single instance lock to prevent multiple windows
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  log.warn('Another instance is running — exiting');
  app.quit();
}

const { handleSecondInstance } = require('./lib/instance-handler');
app.on('second-instance', (event, argv, workingDirectory) => {
  // Focus existing window and forward args if second instance attempted
  handleSecondInstance(argv, () => BrowserWindow.getAllWindows(), log);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(port, timeoutMs = 20000) {
  const url = `http://localhost:${port}/health`;
  const started = Date.now();
  // Prefer global fetch if available, else use http fallback
  while (Date.now() - started < timeoutMs) {
    try {
      if (typeof fetch === 'function') {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (!data || data.success === undefined || data.success === true) return true;
        }
      } else {
        // simple http GET
        const http = require('http');
        await new Promise((resolve, reject) => {
          const req = http.get(url, (res) => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(true);
            } else {
              reject(new Error('bad status ' + res.statusCode));
            }
          });
          req.on('error', reject);
        }).catch(() => {});
      }
    } catch (e) {
      // ignore; keep polling
    }
    await sleep(500);
  }
  throw new Error('Timeout waiting for /health');
}

async function startServer() {
  // server/dist should exist (run npm run server:build before packaging)
  // When packaged with ASAR, the server files must be unpacked and executed
  // from the `app.asar.unpacked` folder. In development we use the relative path.
  let serverPath;
  if (app.isPackaged) {
    serverPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'server', 'dist', 'index.js');
  } else {
    serverPath = path.resolve(__dirname, '..', 'server', 'dist', 'index.js');
  }
  if (!fs.existsSync(serverPath)) {
    log.error('Server build not found at', serverPath);
    return;
  }

  const port = process.env.PORT || DEFAULT_PORT;
  const sqliteFile = path.resolve(app.getPath('userData'), 'gaia.sqlite');

  // Ensure encryption key in keychain and pass to server process
  const SERVICE = 'gaia';
  const ACCOUNT = 'encryption_key';
  let encKey = await keytar.getPassword(SERVICE, ACCOUNT);
  if (!encKey) {
    encKey = crypto.randomBytes(32).toString('hex');
    await keytar.setPassword(SERVICE, ACCOUNT, encKey);
    log.info('Encryption key generated and stored in keychain');
  } else {
    log.info('Found encryption key in keychain');
  }

  // Prevent starting server twice
  if (serverProcess) {
    log.warn('Server already running');
    return;
  }

  serverProcess = spawn(process.execPath, [serverPath], {
    env: { ...process.env, FORCE_SQLITE: '1', SQLITE_FILE: sqliteFile, PORT: port, ENCRYPTION_KEY: encKey },
    stdio: 'inherit'
  });

  serverProcess.on('exit', (code) => {
    log.warn('Server process exited', code);
    serverProcess = null;
  });

  try {
    await waitForHealth(port, 20000);
    log.info('✅ Backend respondeu /health');
  } catch (err) {
    log.error('⚠️ Backend não respondeu em tempo:', err?.message ?? err);
  }
}

// IPC handlers for credential storage
ipcMain.handle('store-credential', async (_, service, account, secret) => {
  try {
    await keytar.setPassword(service, account, secret);
    return { success: true };
  } catch (e) {
    log.error('Error storing credential:', e);
    return { success: false, error: String(e) };
  }
});

ipcMain.handle('get-credential', async (_, service, account) => {
  try {
    const s = await keytar.getPassword(service, account);
    return { success: true, secret: s };
  } catch (e) {
    log.error('Error getting credential:', e);
    return { success: false, error: String(e) };
  }
});

// Auto-update setup
const { setupAutoUpdater } = require('./lib/auto-updater-wiring');
autoUpdater.logger = log;
autoUpdater.autoDownload = true;

// Allow override of feed URL for local testing (set UPDATE_FEED_URL env var)
const UPDATE_FEED_URL = process.env.UPDATE_FEED_URL;
if (UPDATE_FEED_URL) {
  try {
    // Set generic provider to a local server or custom feed
    autoUpdater.setFeedURL({ url: UPDATE_FEED_URL });
    log.info('Auto-updater feed set to', UPDATE_FEED_URL);
  } catch (e) {
    log.warn('Failed to set update feed URL', e);
  }
}

setupAutoUpdater(autoUpdater, () => BrowserWindow.getAllWindows(), log);

ipcMain.handle('app-check-for-updates', async () => {
  try {
    const res = await autoUpdater.checkForUpdates();
    return { success: true, res };
  } catch (e) {
    log.error('Update check failed', e);
    return { success: false, error: String(e) };
  }
});

ipcMain.handle('app-install-update', async () => {
  try {
    // create a local backup snapshot before installing, to enable possible rollback
    try {
      const backupRes = await createBackupSnapshot();
      log.info('Backup created at', backupRes.path);
    } catch (bErr) {
      log.warn('Could not create backup before install:', bErr?.message ?? bErr);
    }

    autoUpdater.quitAndInstall();
    return { success: true };
  } catch (e) {
    log.error('Install update failed', e);
    return { success: false, error: String(e) };
  }
});

// Create a backup snapshot of the current app files (simple copy to userData/updates)
async function createBackupSnapshot() {
  const ud = app.getPath('userData');
  const updatesDir = path.join(ud, 'updates');
  if (!fs.existsSync(updatesDir)) fs.mkdirSync(updatesDir, { recursive: true });
  const ver = app.getVersion ? app.getVersion() : 'unknown';
  const timestamp = Date.now();
  const dest = path.join(updatesDir, `backup-${ver}-${timestamp}`);
  const src = app.getAppPath();

  // Use fs.cp if available (Node 16+)
  if (fs.cp) {
    await fs.promises.cp(src, dest, { recursive: true });
  } else {
    // fallback: naive copy (may fail on packaged apps but attempt)
    await copyRecursive(src, dest);
  }

  return { success: true, path: dest };
}

async function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) throw new Error('Source not found: ' + src);
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) {
      await copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// Register desktop IPC handlers from testable module
try {
  const ipcHandlers = require('./ipc-handlers');
  ipcHandlers.registerIpcHandlers(ipcMain, { app, fs, path, log, autoUpdater });
} catch (e) {
  log.warn('Could not register external ipc handlers:', e);
}

const { bringToFront: _bringToFront } = require('./lib/window-utils');
function bringToFront(win) {
  _bringToFront(win);
}

function createWindow () {
  const port = process.env.PORT || DEFAULT_PORT;
  const indexFile = path.resolve(__dirname, '..', 'client', 'dist', 'index.html');

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Prefer loading the client dev server (vite) on port 3000 when running in development
  const devClientUrl = 'http://localhost:3000';
  try {
    // quick health check
    const http = require('http');
    const req = http.get(devClientUrl, (res) => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
        win.loadURL(devClientUrl);
      } else if (fs.existsSync(indexFile)) {
        win.loadFile(indexFile);
      } else {
        win.loadURL(`http://localhost:${port}`);
      }
    });
    req.on('error', () => {
      if (fs.existsSync(indexFile)) {
        win.loadFile(indexFile);
      } else {
        win.loadURL(`http://localhost:${port}`);
      }
    });
  } catch (e) {
    if (fs.existsSync(indexFile)) {
      win.loadFile(indexFile);
    } else {
      win.loadURL(`http://localhost:${port}`);
    }
  }
}

// Check that FFmpeg binary is available (either in PATH or via ffmpeg-static)
function checkFfmpeg() {
  const { execFileSync } = require('child_process');
  // Try running `ffmpeg -version`
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch (e) {
    // Try ffmpeg-static if installed in node_modules
    try {
      const ffmpegStatic = require('ffmpeg-static');
      if (ffmpegStatic && require('fs').existsSync(ffmpegStatic)) return true;
    } catch (err) {
      // ignore
    }
    return false;
  }
}

app.whenReady().then(async () => {
  // Warn user if FFmpeg is missing (it is required for media processing features)
  if (!checkFfmpeg()) {
    const choice = dialog.showMessageBoxSync({
      type: 'error',
      title: 'FFmpeg não encontrado',
      message: 'O aplicativo não encontrou FFmpeg (ffmpeg.exe / ffmpeg.dll). Alguns recursos de mídia não funcionarão. Deseja abrir a página de download do FFmpeg agora?',
      buttons: ['Abrir site', 'Continuar sem FFmpeg', 'Sair']
    });
    if (choice === 0) require('electron').shell.openExternal('https://www.gyan.dev/ffmpeg/builds/');
    if (choice === 2) {
      app.quit();
      return;
    }
  }

  await startServer();
  createWindow();

  // Verificar atualizações automaticamente no início (non-blocking)
  try {
    autoUpdater.checkForUpdatesAndNotify();
    log.info('Auto-updater: check initiated');
  } catch (e) {
    log.warn('Auto-updater startup check failed', e);
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (e) {
      // ignore
    }
  }
});
