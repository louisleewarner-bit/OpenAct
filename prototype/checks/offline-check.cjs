// Same smoke test in four modes: hosted (online), installed app online, installed app offline, downloaded file offline.
const { chromium } = require('playwright');
const { openReview } = require('./lib.cjs');
const { spawn } = require('child_process');
const P = '/home/user/script-app-kit/prototype';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function serve(dir, port) {
  const p = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', dir], { stdio: 'ignore' });
  return p;
}
async function smoke(page, label, { typeText = true } = {}) {
  const t0 = Date.now();
  await page.waitForSelector('.topbar', { timeout: 15000 });
  if (await page.getByRole('dialog').count()) {
    await page.getByRole('dialog').getByRole('button', { name: /^Screenplay/ }).first().click();
    await sleep(400);
  }
  await page.evaluate(() => document.fonts.ready);
  const ready = Date.now() - t0;
  const info = await page.evaluate(() => ({
    title: document.querySelector('.script-title')?.textContent,
    pages: document.querySelectorAll('.desk .sheet:not(.title-sheet)').length,
    courierPrime: [...document.fonts].filter((f) => f.family.replace(/"/g, '') === 'Courier Prime' && f.status === 'loaded').length,
    atkinson: [...document.fonts].filter((f) => f.family.replace(/"/g, '').startsWith('Atkinson Hyperlegible Next') && f.status === 'loaded').length,
    scriptFontRendered: getComputedStyle(document.querySelector('.desk .frag')).fontFamily,
  }));
  let typed = null;
  if (typeText) {
    const last = page.locator('.desk .frag').last();
    await last.click();
    await page.keyboard.press('Control+End');
    await page.keyboard.press('Enter');
    await page.keyboard.type(`Offline test line (${label})`);
    await sleep(900); // autosave runs 600 ms after the last change
    typed = await page.evaluate(() => { const f = [...document.querySelectorAll('.desk .frag')].pop(); return { type: f.dataset.type, text: f.textContent }; });
  }
  await openReview(page);
  await sleep(250);
  const review = await page.locator('.rv-summary').textContent();
  await openReview(page);
  return { ready_ms: ready, ...info, typed, review };
}
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } : undefined;
  const browser = await chromium.launch({ proxy });
  const results = {};

  // A. Hosted edition (as published: fonts from Google Fonts), online.
  const sa = serve(`${P}/artifact`, 8761);
  await sleep(800);
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const external = new Set();
    page.on('request', (r) => { const u = new URL(r.url()); if (!['127.0.0.1', 'localhost'].includes(u.hostname) && u.protocol.startsWith('http')) external.add(u.hostname); });
    await page.goto('http://127.0.0.1:8761/harness.html', { waitUntil: 'load' });
    results.A_hosted_online = { ...(await smoke(page, 'hosted')), externalHosts: [...external] };
    await ctx.close();
  }
  sa.kill();

  // B and C. Installed edition: first visit online, then the server goes away and the network is cut.
  let server = serve(`${P}/offline/dist/pwa`, 8765);
  await sleep(800);
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const external = new Set();
    page.on('request', (r) => { const u = new URL(r.url()); if (!['127.0.0.1', 'localhost'].includes(u.hostname) && u.protocol.startsWith('http')) external.add(u.hostname); });
    await page.goto('http://127.0.0.1:8765/', { waitUntil: 'load' });
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload(); // the worker now controls the page
    const cdp = await ctx.newCDPSession(page);
    const inst = await cdp.send('Page.getInstallabilityErrors').catch((e) => ({ error: e.message }));
    const manifest = await cdp.send('Page.getAppManifest').catch((e) => ({ error: e.message }));
    const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller));
    const cached = await page.evaluate(async () => (await (await caches.open((await caches.keys())[0])).keys()).map((r) => new URL(r.url).pathname));
    results.B_installed_online = { ...(await smoke(page, 'installed online')), controlledByServiceWorker: controlled, installabilityErrors: inst.installabilityErrors ?? inst, manifestErrors: manifest.errors ?? manifest, cached, externalHosts: [...external], errors };

    // C. Offline: stop the server and cut the network, then reload and open a fresh tab.
    server.kill();
    await sleep(300);
    await ctx.setOffline(true);
    await page.reload();
    const persisted = await page.evaluate(() => [...document.querySelectorAll('.desk .frag')].some((f) => f.textContent.includes('Offline test line (installed online)')));
    const c = await smoke(page, 'installed offline');
    const tab = await ctx.newPage();
    await tab.goto('http://127.0.0.1:8765/', { waitUntil: 'load' }).catch((e) => e.message);
    const tabOk = await tab.locator('.topbar').count();
    await tab.reload();
    const persisted2 = await tab.evaluate(() => [...document.querySelectorAll('.desk .frag')].some((f) => f.textContent.includes('Offline test line (installed offline)')));
    results.C_installed_offline = { ...c, earlierEditKeptAfterReload: persisted, newTabOpensOffline: tabOk > 0, offlineEditKeptAfterReload: persisted2, errors };
    await ctx.close();
  }

  // D. Downloaded single file, opened from disk with every network request blocked.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const blocked = [];
    await ctx.route('**/*', (route) => (route.request().url().startsWith('file:') || route.request().url().startsWith('data:') ? route.continue() : (blocked.push(route.request().url()), route.abort())));
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`file://${P}/offline/dist/openact-offline.html`);
    const d = await smoke(page, 'file');
    await page.reload();
    await sleep(500);
    const kept = await page.evaluate(() => [...document.querySelectorAll('.desk .frag')].some((f) => f.textContent.includes('Offline test line (file)')));
    results.D_downloaded_file_offline = { ...d, editKeptAfterReload: kept, blockedRequests: blocked, errors };
    await page.screenshot({ path: process.env.SP + '/offline-file.png' });
    await ctx.close();
  }
  console.log(JSON.stringify(results, null, 1));
  await browser.close();
})().catch((e) => { console.error('FAILED', e.stack); process.exit(1); });
