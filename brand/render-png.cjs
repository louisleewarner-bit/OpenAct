// Renders the logo SVGs to PNG and a multi-size favicon.ico. Usage: node brand/render-png.cjs [out dir]   (needs playwright)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const dir = __dirname; const out = process.argv[2] || dir; fs.mkdirSync(out, { recursive: true });
const jobs = [
  ['app-icon.svg', 'icon-512.png', 512, 512], ['app-icon.svg', 'icon-192.png', 192, 192],
  ['app-icon-maskable.svg', 'icon-maskable-512.png', 512, 512], ['app-icon-maskable.svg', 'apple-touch-icon.png', 180, 180],
  ['favicon.svg', 'favicon-16.png', 16, 16], ['favicon.svg', 'favicon-32.png', 32, 32], ['favicon.svg', 'favicon-48.png', 48, 48],
  ['social-card.svg', 'social-card.png', 1200, 630], ['logo.svg', 'logo.png', null, 240], ['logo-dark.svg', 'logo-dark.png', null, 240], ['logo-stacked.svg', 'logo-stacked.png', null, 480], ['mark.svg', 'mark.png', 256, 256],
];
(async () => {
  const b = await chromium.launch();
  for (const [src, name, w, h] of jobs) {
    const svg = fs.readFileSync(path.join(dir, src), 'utf8'); const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); const ar = vb[1] / vb[2];
    const W = w ?? Math.round(h * ar), H = h;
    const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
    await p.setContent(`<body style="margin:0;background:transparent"><img style="display:block;width:${W}px;height:${H}px" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body>`);
    await p.waitForTimeout(80); await p.screenshot({ path: path.join(out, name), omitBackground: true }); await p.close();
  }
  await b.close();
  // favicon.ico: PNG images inside an ICO container (16, 32, 48)
  const sizes = [16, 32, 48]; const imgs = sizes.map((s) => fs.readFileSync(path.join(out, `favicon-${s}.png`)));
  const head = Buffer.alloc(6 + 16 * sizes.length); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
  let off = head.length; sizes.forEach((s, i) => { const e = 6 + i * 16; head[e] = s; head[e + 1] = s; head[e + 2] = 0; head[e + 3] = 0; head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6); head.writeUInt32LE(imgs[i].length, e + 8); head.writeUInt32LE(off, e + 12); off += imgs[i].length; });
  fs.writeFileSync(path.join(out, 'favicon.ico'), Buffer.concat([head, ...imgs]));
  console.log('rendered', jobs.length, 'PNGs and favicon.ico');
})();
