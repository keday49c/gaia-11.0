const EventEmitter = require('events');
const { setupAutoUpdater } = require('../lib/auto-updater-wiring');

describe('setupAutoUpdater', () => {
  test('forwards events to windows', () => {
    const autoUpdater = new EventEmitter();
    const mockWin = { webContents: { send: jest.fn() } };
    const sendToWindows = () => [mockWin];
    const logger = { info: jest.fn() };

    setupAutoUpdater(autoUpdater, sendToWindows, logger);

    autoUpdater.emit('update-available', { version: '1.2.3' });
    expect(mockWin.webContents.send).toHaveBeenCalledWith('update-available', { version: '1.2.3' });

    autoUpdater.emit('download-progress', { percent: 50 });
    expect(mockWin.webContents.send).toHaveBeenCalledWith('update-download-progress', { percent: 50 });

    autoUpdater.emit('update-downloaded', { version: '1.2.3' });
    expect(mockWin.webContents.send).toHaveBeenCalledWith('update-downloaded', { version: '1.2.3' });
  });
});
