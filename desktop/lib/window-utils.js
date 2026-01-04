function bringToFront(win, options = {}) {
  try {
    if (!win) return;
    // Best-effort: try immediate show & focus, then a few retries with increasing delay
    const doFocus = () => {
      try {
        win.show && win.show();
        win.focus && win.focus();
        // briefly enforce top-most to gain focus, then release
        if (win.setAlwaysOnTop) {
          win.setAlwaysOnTop(true);
          setTimeout(() => {
            try { win.setAlwaysOnTop(false); } catch (e) {}
          }, 800);
        }
      } catch (e) {
        // swallow
      }
    };

    doFocus();
    setTimeout(doFocus, 50);
    setTimeout(doFocus, 150);
    setTimeout(doFocus, 400);
  } catch (e) {
    // ignore
  }
}

module.exports = { bringToFront };
