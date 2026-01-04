const { bringToFront } = require('../lib/window-utils');

describe('bringToFront', () => {
  test('calls show/focus and toggles alwaysOnTop', (done) => {
    const calls = [];
    const win = {
      show: () => calls.push('show'),
      focus: () => calls.push('focus'),
      setAlwaysOnTop: (v) => calls.push('alwaysOnTop:' + v)
    };

    bringToFront(win);

    // after a short delay the retries should have run
    setTimeout(() => {
      expect(calls).toContain('show');
      expect(calls).toContain('focus');
      // should set true and later set false
      expect(calls).toEqual(expect.arrayContaining(['alwaysOnTop:true','alwaysOnTop:false']));
      done();
    }, 1000);
  });
});
