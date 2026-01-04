(async () => {
  try {
    // Debugging launcher: import dependencies step-by-step to localize errors
    // Use stderr (console.error) for early messages so they are not lost if stdout is buffered
    console.error('Launcher: testing imports (stderr)...');
    try {
      await import('express');
      console.error('Launcher: express imported OK');
    } catch (e) {
      console.error('Launcher: express import failed', e);
    }
    try {
      await import('cors');
      console.error('Launcher: cors imported OK');
    } catch (e) {
      console.error('Launcher: cors import failed', e);
    }
    console.error('Launcher: importing application...');
    await import('./dist/index.js');
  } catch (err) {
    console.error('Launcher failed to start application:', err);
    process.exit(1);
  }
})();
