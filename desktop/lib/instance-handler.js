function handleSecondInstance(argv, getWindows, logger) {
  logger = logger || console;
  logger.info('second-instance invoked with argv:', argv);
  const [win] = (getWindows() || []);
  if (win) {
    try {
      // bring to front using existing utility
      require('./window-utils').bringToFront(win);
      // forward args to renderer for potential handling
      try { win.webContents.send('second-instance-args', argv); } catch (e) { }
    } catch (e) {
      logger.warn('Error handling second-instance', e);
    }
  }
}

module.exports = { handleSecondInstance };
