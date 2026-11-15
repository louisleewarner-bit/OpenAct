// Every target on the panto and screenplay templates: Bruntwood must refuse panto; AFF must apply its page ranges.
const { chromium } = require('playwright');
const { openReview } = require('./lib.cjs');
const fs = require('fs');
const axeSrc = fs.readFileSync(process.env.SP + '/axe/node_modules/axe-core/axe.min.js', 'utf8');
(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('file:///home/user/script-app-kit/prototype/artifact/harness.html');
  await page.waitForTimeout(800);
  const out = {};
  for (const [fmt, targets] of [['Pantomime', ['Bruntwood Prize for Playwriting', 'UK new-writing theatre']], ['TV comedy (single camera)', ['Austin Film Festival Script Competition', 'Academy Nicholl Fellowships']]]) {
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'More' }).click();
    await page.getByRole('menuitem', { name: /Start a script/ }).click(); await require('./lib.cjs').discardIfAsked(page);
    await page.waitForTimeout(200);
    await page.getByRole('dialog').locator('section').getByRole('button', { name: new RegExp('^' + fmt.replace(/[()]/g, '\\$&')) }).click();
    await page.waitForTimeout(300);
    if (!(await page.locator('.review').count())) await openReview(page);
    for (const t of targets) {
      await page.locator('#rv-target').click();
      await page.getByRole('option', { name: t }).click();
      await page.waitForTimeout(250);
      out[`${fmt} → ${t}`] = await page.evaluate(() => ({
        fix: [...document.querySelectorAll('.review .rv-row.fix')].map((r) => r.querySelector('.rv-title').childNodes[1]?.textContent),
        length: (() => { const r = document.querySelector('.review [data-check="length"]'); if (!r) return null; r.open = true; return r.querySelector('.rv-title').childNodes[1]?.textContent + ' | ' + (r.querySelector('.rv-body > p')?.textContent ?? ''); })(),
        manual: [...document.querySelectorAll('.rv-manual li label span')].map((x) => x.textContent.slice(0, 70)),
        dated: document.querySelector('.rv-dated')?.textContent,
      }));
    }
  }
  await page.evaluate(() => document.querySelectorAll('.review details').forEach((d) => (d.open = true)));
  await page.addScriptTag({ content: axeSrc });
  const axe = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}:${v.nodes.length}`));
  console.log(JSON.stringify({ out, axe, errors }, null, 1));
  await browser.close();
})().catch((e) => { console.error('FAILED', e.stack); process.exit(1); });
