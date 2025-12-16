const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let serverProcess = null;

function startServer() {
  // server/dist should exist (run npm run server:build before packaging)
  const serverPath = path.resolve(__dirname, '..', 'server', 'dist', 'index.js');
  serverProcess = spawn(process.execPath, [serverPath], {
    env: { ...process.env, DATABASE: 'sqlite', SQLITE_FILE: path.resolve(app.getPath('userData'), 'gaia.sqlite') },
    stdio: 'inherit'
  });

  serverProcess.on('exit', (code) => {
    console.log('Server process exited', code);
    serverProcess = null;
  });
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill();
});
