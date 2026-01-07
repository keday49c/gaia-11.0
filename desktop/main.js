const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({ width: 1024, height: 768 });
  // Load a small placeholder file if present, or show a blank page
  const index = path.join(__dirname, 'index.html');
  win.loadFile(index).catch(() => win.loadURL('about:blank'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});