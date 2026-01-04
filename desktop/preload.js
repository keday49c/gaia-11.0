const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gaia', {
  checkForUpdates: () => ipcRenderer.invoke('app-check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('app-install-update'),
  onUpdateAvailable: (cb) => ipcRenderer.on('update-available', (e, info) => cb(info)),
  onUpdateNotAvailable: (cb) => ipcRenderer.on('update-not-available', () => cb()),
  onDownloadProgress: (cb) => ipcRenderer.on('update-download-progress', (e, progress) => cb(progress)),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', (e, info) => cb(info)),
  storeCredential: (service, account, secret) => ipcRenderer.invoke('store-credential', service, account, secret),
  getCredential: (service, account) => ipcRenderer.invoke('get-credential', service, account),
  createBackup: () => ipcRenderer.invoke('app-create-backup'),
  rollback: () => ipcRenderer.invoke('app-rollback'),
  openBackupFolder: () => ipcRenderer.invoke('app-open-backup-folder'),
  quit: () => ipcRenderer.invoke('app-quit'),
});