// Checks an unpacked release as a stranger would use it (D-043): the one-file app with all network blocked, the installable app offline
// after first load, the manifest and icons, and the website (links, no outside requests, accessibility, phone width).
// Usage: SP=<dir with axe> node release/check-release.cjs <unpacked OpenAct-preview-1.0 dir> <site dir>
const { chromium, devices } = require('playwright'); const fs = require('fs'); const path = require('path'); const http = require('http'); const { execSync } = require('child_process');
const [pkgDir, siteDir] = process.argv.slice(2); const SP = process.env.SP;
const axeSrc = fs.readFileSync(SP + '/axe/node_modules/axe-core/axe.min.js', 'utf8');
const ax = async (p) => { await p.addScriptTag({ content: axeSrc }); return p.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id + ':' + v.nodes.length)); };
function serve(dir, port) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.zip': 'application/zip', '.jpg': 'image/jpeg', '.txt': 'text/plain' };
  return new Promise((res) => { const s = http.createServer((q, r) => { let f = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); if (!fs.existsSync(f)) { r.writeHead(404); return r.end('no'); } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(port, () => res(s)); });
}
(async () => {
  const out = {}, errs = []; const b = await chromium.launch();
  // A. the single file, no network at all
  {
    const ctx = await b.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true }); const attempts = [];
    await ctx.route(/^https?:/, (r) => { attempts.push(r.request().url()); r.abort(); });
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push('file: ' + e.message));
    await p.goto('file://' + path.resolve(pkgDir, 'OpenAct.html')); await p.waitForTimeout(1200);
    out.file = { title: await p.title(), startScreen: await p.getByRole('heading', { name: 'Start a script' }).isVisible(), fonts: await p.evaluate(async () => { await document.fonts.ready; return [document.fonts.check('16px "Courier Prime"'), document.fonts.check('16px "Atkinson Hyperlegible Next"')]; }) };
    await p.getByRole('dialog').getByRole('button', { name: /^Pantomime Jack/ }).click(); await p.waitForTimeout(500); await p.keyboard.press('Escape');
    await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.locator('#fmt-pdf').check();
    const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: /^Export PDF/ }).click()]);
    const f = '/tmp/rel-test/out.pdf'; await dl.saveAs(f); out.file.pdf = { name: dl.suggestedFilename(), bytes: fs.statSync(f).size, header: fs.readFileSync(f).slice(0, 5).toString() };
    out.file.axe = await ax(p); out.file.networkAttempts = attempts; await ctx.close();
  }
  // B. the installable app, over http, offline after the first visit
  {
    const srv = await serve(path.join(pkgDir, 'app'), 8731); const ctx = await b.newContext({ viewport: { width: 1360, height: 900 } }); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push('app: ' + e.message));
    await p.goto('http://localhost:8731/'); await p.waitForTimeout(800);
    const sw = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return { scope: r.scope, active: !!r.active }; });
    await p.reload(); await p.waitForTimeout(800); await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(1200);
    const manifest = await (await ctx.request.get('http://localhost:8731/manifest.webmanifest')).json();
    const icons = []; for (const i of manifest.icons) { const r = await ctx.request.get('http://localhost:8731/' + i.src); icons.push([i.src, r.status(), r.headers()['content-type']]); }
    const head = await p.evaluate(() => [...document.querySelectorAll('link[rel~=icon],link[rel=apple-touch-icon],link[rel=manifest],meta[name=theme-color]')].map((e) => e.getAttribute('rel') || e.name));
    out.app = { sw, offlineReload: await p.getByRole('heading', { name: 'Start a script' }).isVisible().catch(() => false), manifest: { name: manifest.name, display: manifest.display, theme: manifest.theme_color }, icons, head };
    await ctx.close(); srv.close();
  }
  // C. the website
  {
    const srv = await serve(siteDir, 8732); const outside = [];
    for (const [mode, o] of [['desktop', { viewport: { width: 1280, height: 900 } }], ['phone', { ...devices['iPhone 13'] }], ['dark', { viewport: { width: 1280, height: 900 }, colorScheme: 'dark' }], ['narrow', { viewport: { width: 360, height: 700 } }]]) {
      const ctx = await b.newContext(o); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push('site: ' + e.message));
      p.on('request', (r) => { if (!r.url().startsWith('http://localhost:8732') && !r.url().startsWith('data:')) outside.push(r.url()); });
      await p.goto('http://localhost:8732/'); await p.waitForTimeout(700);
      out['site-' + mode] = { axe: await ax(p), overflow: await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), h1: await p.locator('h1').textContent() };
      await p.screenshot({ path: `${SP}/site-${mode}.png`, fullPage: mode !== 'narrow' }); await ctx.close();
    }
    const ctx = await b.newContext(); const links = {};
    for (const u of ['/', '/app/', '/privacy.html', '/OpenAct-preview-1.0.zip', '/img/desktop.jpg', '/img/phone.jpg', '/img/social-card.png', '/fonts/courier-prime-latin-700-normal.woff2']) { const r = await ctx.request.get('http://localhost:8732' + u); links[u] = r.status(); }
    const pg = await ctx.newPage(); await pg.goto('http://localhost:8732/privacy.html'); links.privacyAxe = await ax(pg);
    out.siteLinks = links; out.outsideRequests = outside; await ctx.close(); srv.close();
  }
  console.log(JSON.stringify({ out, errs }, null, 1)); await b.close();
})().catch((e) => { console.error('FAILED', e.stack); process.exit(1); });
