const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const logs = [];
  const requests = [];
  const responses = [];

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

  page.on('request', (req) => {
    try {
      requests.push({
        id: req._requestId || null,
        url: req.url(),
        method: req.method(),
        resourceType: req.resourceType(),
        headers: req.headers(),
        postData: req.postData ? req.postData() : null,
        timestamp: Date.now(),
      });
    } catch (e) {
      logs.push({ type: 'request.error', message: String(e) });
    }
  });

  page.on('response', async (res) => {
    try {
      const req = res.request();
      const ct = res.headers()['content-type'] || '';
      let body = null;
      if (/application\/json|text\//.test(ct) || ct === '') {
        try {
          const txt = await res.text();
          body = txt.length > 10000 ? txt.slice(0, 10000) + '... (truncated)' : txt;
        } catch (e) {
          body = null;
        }
      }
      responses.push({
        url: res.url(),
        status: res.status(),
        headers: res.headers(),
        request: {
          url: req.url(),
          method: req.method(),
          resourceType: req.resourceType(),
        },
        body,
        timestamp: Date.now(),
      });
    } catch (e) {
      logs.push({ type: 'response.error', message: String(e) });
    }
  });

  try {
    const resp = await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('NAV_STATUS', resp && resp.status());
  } catch (e) {
    console.error('NAV_ERROR', e.message);
  }

  // wait a bit longer to capture background requests and XHR/fetch activity
  await new Promise((resolve) => setTimeout(resolve, 4000));

  const out = {
    timestamp: new Date().toISOString(),
    logs,
    requests,
    responses,
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
