function setupAutoUpdater(autoUpdater, sendToWindows, logger) {
  logger = logger || console;
  autoUpdater.on('checking-for-update', () => logger.info('Checking for update...'));
  autoUpdater.on('update-available', (info) => {
    logger.info('Update available', info);
    (sendToWindows() || []).forEach(w => w.webContents.send('update-available', info));
  });
  autoUpdater.on('update-not-available', () => {
    logger.info('No update available');
    (sendToWindows() || []).forEach(w => w.webContents.send('update-not-available'));
  });
  autoUpdater.on('download-progress', (progress) => {
    logger.info('Download progress', progress);
    (sendToWindows() || []).forEach(w => w.webContents.send('update-download-progress', progress));
  });
  autoUpdater.on('update-downloaded', (info) => {
    logger.info('Update downloaded', info);
    (sendToWindows() || []).forEach(w => w.webContents.send('update-downloaded', info));
  });
}

module.exports = { setupAutoUpdater };
