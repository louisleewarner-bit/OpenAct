const { chromium } = require('playwright');
const fs = require('fs');
const A = '/home/user/script-app-kit/prototype/offline/app';
(async () => {
  const browser = await chromium.launch();
  for (const [svg, out, size] of [['icon.svg', 'icon-192.png', 192], ['icon.svg', 'icon-512.png', 512], ['icon-maskable.svg', 'icon-maskable-512.png', 512]]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const data = fs.readFileSync(`${A}/${svg}`, 'utf8');
    await page.setContent(`<html><body style="margin:0;background:transparent">${data.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
    await page.screenshot({ path: `${A}/${out}`, omitBackground: true });
    await page.close();
  }
  await browser.close();
})();
