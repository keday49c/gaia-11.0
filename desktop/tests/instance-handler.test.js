const { handleSecondInstance } = require('../lib/instance-handler');

describe('handleSecondInstance', () => {
  test('focuses window and sends args', () => {
    const send = jest.fn();
    const win = { webContents: { send }, isMinimized: () => false };
    const getWindows = () => [win];
    const logger = { info: jest.fn(), warn: jest.fn() };

    handleSecondInstance(['--foo','bar'], getWindows, logger);

    expect(send).toHaveBeenCalledWith('second-instance-args', ['--foo','bar']);
  });
});
