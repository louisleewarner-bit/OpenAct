const { chromium } = require('playwright');
const fs = require('fs');
const axeSrc = fs.readFileSync(process.env.SP + '/axe/node_modules/axe-core/axe.min.js', 'utf8');
const formats = ['Screenplay','TV drama (one hour)','TV comedy (single camera)','TV sitcom (multi-camera)','UK studio sitcom','Vertical micro-drama','Stage play (UK)','Stage play (US)','Musical (UK)','Musical (US)','Pantomime','Radio drama (UK)','Audio drama and podcast','Comic or graphic novel','Treatment or outline'];
(async () => {
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-GB' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('file:///home/user/script-app-kit/prototype/artifact/harness.html');
  await page.waitForTimeout(1200);
  const out = {};
  for (const [i, f] of formats.entries()) {
    if (i > 0) {
      await page.getByRole('button', { name: 'More' }).click();
      await page.getByRole('menuitem', { name: /Start a script/ }).click();
      await page.waitForTimeout(200);
    }
    await page.getByRole('dialog').locator('section').getByRole('button', { name: new RegExp('^' + f.replace(/[()]/g, '\\$&')) }).click();
    await page.waitForTimeout(500);
    const info = await page.evaluate(() => ({
      pages: document.querySelectorAll('.sheet:not(.title-sheet)').length,
      frags: document.querySelectorAll('.frag').length,
      decos: [...document.querySelectorAll('.deco')].map((d) => d.textContent).slice(0, 4),
      cues: document.querySelectorAll('.cue-num').length,
      prefixes: [...document.querySelectorAll('.frag[data-prefix]')].map((d) => d.dataset.prefix + (d.dataset.suffix || '')).slice(0, 4),
      format: document.querySelector('[aria-label="Format"]')?.textContent,
    }));
    out[f] = info;
    const slug = f.replace(/[^a-z]+/gi, '-').toLowerCase();
    if (['TV sitcom (multi-camera)', 'Radio drama (UK)', 'Comic or graphic novel', 'TV drama (one hour)', 'Audio drama and podcast', 'UK studio sitcom'].includes(f)) {
      const sheet = page.locator('.sheet:not(.title-sheet)').first();
      await sheet.scrollIntoViewIfNeeded();
      await sheet.screenshot({ path: `${process.env.SP}/fmt-${slug}.png` });
    }
  }
  await page.addScriptTag({ content: axeSrc });
  const axe = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}:${v.nodes.length}`));
  console.log(JSON.stringify({ out, axe, errors }, null, 1));
  await browser.close();
})().catch((e) => { console.error('FAILED', e.message); process.exit(1); });
