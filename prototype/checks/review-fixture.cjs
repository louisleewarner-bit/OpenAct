const { chromium, devices } = require('playwright');
const { openReview } = require('./lib.cjs');
const fs = require('fs');
const SP = process.env.SP;
const axeSrc = fs.readFileSync(SP + '/axe/node_modules/axe-core/axe.min.js', 'utf8');
let n = 0;
const e = (type, text, extra = {}) => ({ id: 'f' + n++, type, text, ...extra });
const long = 'Rain hammers the window while NELL scrubs at a stain that will not lift, and the radio murmurs about floods upriver, and the cat watches from the top of the fridge, and the clock ticks louder than it has any right to, and somewhere a dog barks twice and stops.';
const script = {
  title: { title: 'Kettle', credit: 'Written by', authors: 'Jane Doe', source: '', draftDate: 'Revised draft, 3 March 2026 WGA registered', contact: 'jane@example.com' },
  profile: 'screenplay', paper: 'a4', cast: [], dismissed: [],
  elements: [
    e('scene', 'INT. KITCHEN - NIGHT'),
    e('action', 'We see the kitchen. CLOSE ON a kettle. Nell (40s) wipes the counter.'),
    e('character', 'NELL'),
    e('dialogue', 'TK better line here.', { note: 'Fix this joke' }),
    e('transition', 'CUT TO:'),
    e('scene', 'KITCHEN'),
    e('action', long),
    e('character', 'NEL'),
    e('paren', '(she turns slowly towards the window and sighs deeply)'),
    e('dialogue', 'Written by Jane Doe, obviously.'),
    e('transition', 'CUT TO:'),
    e('scene', 'EXT. GARDEN - DAY'),
    e('character', 'BOB'),
    e('transition', 'CUT TO:'),
    e('scene', 'OMITTED'),
    e('action', 'Bob [WHO IS BOB?] stares.'),
  ],
};
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-GB' });
  await ctx.addInitScript((s) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('openact-prototype-v1', s); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(script));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (er) => errors.push(er.message));
  await page.goto('file:///home/user/script-app-kit/prototype/artifact/harness.html');
  await page.waitForTimeout(800);
  await openReview(page);
  await page.waitForTimeout(300);
  const read = () => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.review .rv-row')].map((d) => [d.dataset.check, d.classList[1]])));
  const spec = await read();
  await page.locator('#rv-target').click();
  await page.getByRole('option', { name: 'Academy Nicholl Fellowships' }).click();
  await page.waitForTimeout(300);
  const nicholl = await read();
  // Jump from the anon-body places.
  const row = page.locator('[data-check="anon-body"]');
  await row.locator('summary').click();
  await row.locator('.rv-places button').first().click();
  await page.waitForTimeout(400);
  const jumped = await page.evaluate(() => ({ active: document.activeElement?.closest('[data-id]')?.getAttribute('data-id') ?? document.activeElement?.className, panel: !!document.querySelector('.review-side') }));
  // Fixes: remove the date, make anonymous.
  await page.locator('#rv-target').click();
  await page.getByRole('option', { name: 'Agent, manager or producer' }).click();
  await page.waitForTimeout(200);
  await page.locator('[data-check="date"] summary').click();
  await page.getByRole('button', { name: 'Remove the date' }).click();
  await page.waitForTimeout(200);
  const afterDate = await read();
  // Expand all and run axe; screenshot.
  await page.evaluate(() => document.querySelectorAll('.review details').forEach((d) => (d.open = true)));
  await page.addScriptTag({ content: axeSrc });
  const axe = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}:${v.impact}:${v.nodes.length}`));
  await page.evaluate(() => document.querySelectorAll('.review details').forEach((d) => (d.open = false)));
  await page.locator('[data-check="variants"] summary').click().catch(() => {});
  await page.locator('[data-check="placeholders"] summary').click().catch(() => {});
  await page.waitForTimeout(200);
  await page.screenshot({ path: SP + '/review-fixture-desktop.png' });
  // Persisted after reload?
  await page.reload();
  await page.waitForTimeout(800);
  const persisted = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('openact-prototype-v1')); return { review: s.review, date: s.title.draftDate }; });
  // Dark theme screenshot of the panel
  await page.emulateMedia({ colorScheme: 'dark' });
  await openReview(page);
  await page.waitForTimeout(300);
  await page.locator('[data-check="placeholders"] summary').click().catch(() => {});
  await page.screenshot({ path: SP + '/review-fixture-dark.png' });
  await page.addScriptTag({ content: axeSrc });
  const axeDark = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}:${v.impact}:${v.nodes.length}`));
  // Phone
  const phone = await browser.newContext({ ...devices['iPhone 13'] });
  await phone.addInitScript((s) => { localStorage.setItem('openact-prototype-v1', s); }, JSON.stringify(script));
  const pp = await phone.newPage();
  pp.on('pageerror', (er) => errors.push('phone: ' + er.message));
  await pp.goto('file:///home/user/script-app-kit/prototype/artifact/harness.html');
  await pp.waitForTimeout(800);
  await openReview(pp);
  await pp.waitForTimeout(400);
  await pp.locator('[data-check="placeholders"] summary').click();
  await pp.waitForTimeout(200);
  await pp.screenshot({ path: SP + '/review-fixture-phone.png' });
  await pp.locator('[data-check="placeholders"] .rv-places button').first().click();
  await pp.waitForTimeout(500);
  const phoneJump = await pp.evaluate(() => ({ sheetOpen: !!document.querySelector('[role="dialog"]'), active: document.activeElement?.closest('.desk') ? 'in script' : document.activeElement?.tagName }));
  console.log(JSON.stringify({ spec, nicholl, jumped, afterDate, persisted, axe, axeDark, phoneJump, errors }, null, 1));
  await browser.close();
})().catch((er) => { console.error('FAILED', er.stack); process.exit(1); });
