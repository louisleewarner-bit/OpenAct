const { chromium } = require('playwright');
const { openReview } = require('./lib.cjs');
const fs = require('fs');
const SP = process.env.SP;
const axeSrc = fs.readFileSync(SP + '/axe/node_modules/axe-core/axe.min.js', 'utf8');
const url = 'file:///home/user/script-app-kit/prototype/artifact/harness.html';
const summary = (page) => page.evaluate(() => ({
  chips: [...document.querySelectorAll('.rv-chip')].map((c) => c.textContent),
  rows: [...document.querySelectorAll('.review .rv-row')].map((r) => `${r.classList[1]}|${r.dataset.check}|${r.querySelector('.rv-title').childNodes[1]?.textContent ?? ''}`),
}));
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-GB', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(url);
  await page.waitForTimeout(1000);
  // Pick the screenplay sample from the welcome dialog.
  await page.getByRole('dialog').getByRole('button', { name: /^Screenplay/ }).first().click();
  await page.waitForTimeout(500);
  await openReview(page);
  await page.waitForTimeout(300);
  const spec = await summary(page);
  // Switch to the Nicholl.
  await page.locator('#rv-target').click();
  await page.getByRole('option', { name: 'Academy Nicholl Fellowships' }).click();
  await page.waitForTimeout(300);
  const nicholl = await summary(page);
  // Press the anonymous fix if present.
  const anonBtn = page.getByRole('button', { name: 'Make exports anonymous' }).first();
  let anonFixed = null;
  if (await page.locator('[data-check="anon-title"] summary').count()) {
    await page.locator('[data-check="anon-title"] summary').click();
    if (await anonBtn.count()) { await anonBtn.click(); await page.waitForTimeout(200); }
    anonFixed = await summary(page);
  }
  // Open a row with places and jump.
  let jumped = null;
  const withPlaces = page.locator('.rv-row:has(.rv-places)').first();
  if (await withPlaces.count()) {
    const open = await withPlaces.evaluate((d) => d.open);
    if (!open) await withPlaces.locator('summary').click();
    await withPlaces.locator('.rv-places button').first().click();
    await page.waitForTimeout(300);
    jumped = await page.evaluate(() => ({ inDesk: !!document.activeElement?.closest('.desk'), panelStillOpen: !!document.querySelector('.review-side') }));
  }
  // Dismiss a consider row.
  let dismissed = null;
  const cons = page.locator('.rv-row.consider').first();
  if (await cons.count()) {
    const id = await cons.getAttribute('data-check');
    if (!(await cons.evaluate((d) => d.open))) await cons.locator('summary').click();
    await cons.getByRole('button', { name: 'Not relevant to this script' }).click();
    await page.waitForTimeout(200);
    dismissed = { id, setAside: await page.locator('.rv-group summary', { hasText: 'Set aside' }).count() };
  }
  // Export dialog shows the anonymous note.
  await page.locator('.rv-foot button').click();
  await page.waitForTimeout(300);
  const [pdf] = await Promise.all([page.waitForEvent('download'), page.getByRole('dialog').getByRole('button', { name: /^Export PDF/ }).click()]);
  await page.waitForTimeout(200);
  const exportNote = `${pdf.suggestedFilename()}: ${await page.locator('.export-status').textContent()}`;
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await page.screenshot({ path: SP + '/review-desktop.png' });
  // Expand the first fix row and screenshot the panel.
  await page.addScriptTag({ content: axeSrc });
  const axe = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}:${v.impact}:${v.nodes.length}`));

  // Every format: open the gallery, load each template, read the review.
  const formats = await page.evaluate(() => [...document.querySelectorAll('[aria-label="Format"]')].length);
  const perFormat = {};
  const names = ['Screenplay','TV drama (one hour)','TV comedy (single camera)','TV sitcom (multi-camera)','UK studio sitcom','Vertical micro-drama','Stage play (UK)','Stage play (US)','Musical (UK)','Musical (US)','Pantomime','Radio drama (UK)','Audio drama and podcast','Comic or graphic novel','Treatment or outline'];
  for (const f of names) {
    await page.getByRole('button', { name: 'More' }).click();
    await page.getByRole('menuitem', { name: /Start a script/ }).click();
    await page.waitForTimeout(200);
    await page.getByRole('dialog').locator('section').getByRole('button', { name: new RegExp('^' + f.replace(/[()]/g, '\\$&')) }).click();
    await page.waitForTimeout(400);
    if (!(await page.locator('.review').count())) { await openReview(page); await page.waitForTimeout(200); }
    const s = await summary(page);
    perFormat[f] = { target: await page.locator('#rv-target').textContent(), chips: s.chips.join(', '), fix: s.rows.filter((r) => r.startsWith('fix')).map((r) => r.split('|')[1]), consider: s.rows.filter((r) => r.startsWith('consider')).map((r) => r.split('|')[1]) };
  }
  console.log(JSON.stringify({ spec, nicholl, anonFixed, jumped, dismissed, exportNote, axe, perFormat, errors }, null, 1));
  await browser.close();
})().catch((e) => { console.error('FAILED', e.stack); process.exit(1); });
