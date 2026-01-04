const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const logs = [];

  page.on('console', (msg) => {
    try {
      logs.push({ type: 'console.' + msg.type(), text: msg.text() });
    } catch (e) {
      logs.push({ type: 'console', text: String(msg) });
    }
  });

  page.on('pageerror', (err) => {
    logs.push({ type: 'pageerror', message: err.message, stack: err.stack });
  });

  page.on('requestfailed', (req) => {
    const failure = req.failure ? req.failure() : undefined;
    logs.push({ type: 'requestfailed', url: req.url(), error: failure ? failure.errorText : null });
  });

  try {
    const resp = await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 20000 });
    console.log('NAV_STATUS', resp && resp.status());
  } catch (e) {
    console.error('NAV_ERROR', e.message);
  }

  // wait a short while to capture background logs
  await page.waitForTimeout(1500);

  const out = {
    timestamp: new Date().toISOString(),
    logs,
  };

  const outPath = 'headless-console.json';
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log('Saved console logs to', outPath);

  try {
    await page.screenshot({ path: 'headless_home.png', fullPage: true });
    console.log('Saved screenshot headless_home.png');
  } catch (e) {
    console.error('SCREENSHOT_ERROR', e.message);
  }

  await browser.close();
})();
