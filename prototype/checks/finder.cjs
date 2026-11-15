// The format finder (D-040): searches the built-in catalogue, sends nothing, links open only on a click.
const { chromium, devices } = require('playwright');
const fs = require('fs');
const SP = process.env.SP;
const axe = fs.readFileSync(SP + '/axe/node_modules/axe-core/axe.min.js', 'utf8');
const url = 'file:///home/user/script-app-kit/prototype/artifact/harness.html';
const ax = async (p) => { await p.addScriptTag({ content: axe }); return p.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id + ':' + v.nodes.length)); };
(async () => {
  const b = await chromium.launch(); const out = {}; const errs = [];
  for (const mode of ['desktop', 'phone']) {
    const ctx = await b.newContext(mode === 'phone' ? { ...devices['iPhone 13'] } : { viewport: { width: 1360, height: 900 } });
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(`${mode}: ${e.message}`));
    const reqs = []; p.on('request', (r) => { if (/^https?:/.test(r.url()) && !/fonts\.(googleapis|gstatic)\.com/.test(r.url())) reqs.push(r.url()); });
    await p.goto(url); await p.waitForTimeout(800);
    const before = reqs.length;
    const r = (out[mode] = {});
    await p.getByRole('button', { name: 'Find a format…' }).click();
    await p.getByRole('heading', { name: 'Find a format' }).waitFor();
    r.all = (await p.locator('.fmt-count').textContent()).trim();
    r.groups = await p.locator('.gallery-head').allTextContents();
    await p.screenshot({ path: `${SP}/finder-${mode}.png` });
    r.axeAll = await ax(p);
    await p.fill('#fmt-q', 'radio'); await p.waitForTimeout(200);
    r.radio = await p.locator('.fmt-find-head strong').allTextContents();
    await p.fill('#fmt-q', 'teleplay'); await p.waitForTimeout(200);
    r.teleplay = await p.locator('.fmt-find-head strong').allTextContents();
    await p.fill('#fmt-q', 'two column documentary'); await p.waitForTimeout(200);
    r.av = { names: await p.locator('.fmt-find-head strong').allTextContents(), status: await p.locator('.fmt-status').allTextContents() };
    await p.fill('#fmt-q', 'zzzz'); await p.waitForTimeout(200);
    r.none = { count: (await p.locator('.fmt-count').textContent()).trim(), message: (await p.locator('.fmt-none p').textContent()).slice(0, 50) };
    r.axeNone = await ax(p);
    await p.fill('#fmt-q', 'royal court'); await p.waitForTimeout(200);
    const link = p.locator('.fmt-find-row a').first();
    r.link = { text: (await link.textContent()).trim(), target: await link.getAttribute('target'), rel: await link.getAttribute('rel'), href: (await link.getAttribute('href')).slice(0, 40) };
    r.requestsDuringSearch = reqs.length - before;
    await p.getByRole('button', { name: /^Start with Stage play \(UK\)/ }).click(); await p.waitForTimeout(1500);
    r.started = await p.evaluate(() => JSON.parse(localStorage.getItem('openact-prototype-v1')).profile);
    // import from the "nothing matches" route
    await (mode === 'phone' ? p.getByRole('navigation', { name: 'Sections' }).getByRole('button', { name: 'New' }) : p.getByRole('button', { name: 'New script' })).click();
    await p.getByRole('button', { name: 'Find a format…' }).click();
    await p.fill('#fmt-q', 'qqqq');
    await p.getByRole('button', { name: 'Import a format file' }).click();
    r.importOpened = await p.getByRole('heading', { name: 'Import a format' }).isVisible();
    r.overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await ctx.close();
  }
  console.log(JSON.stringify({ out, errs }, null, 1)); await b.close();
})().catch((e) => { console.error('FAILED', e.stack); process.exit(1); });
