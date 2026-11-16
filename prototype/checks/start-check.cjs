// The start page (D-047): headline, primary action focused, resume card only when there is a script, Back and Escape
// return to the script, Open a file works from it, every format is reachable, no sideways scroll, axe in light and dark,
// desktop and phone.
const { chromium, devices } = require('playwright');
const fs = require('fs');
const SP = process.env.SP;
const axe = fs.readFileSync(SP + '/axe/node_modules/axe-core/axe.min.js', 'utf8');
const url = 'file:///home/user/script-app-kit/prototype/artifact/harness.html';
const problems = []; const ok = (c, m) => { if (!c) problems.push(m); };
const ax = async (p) => { await p.addScriptTag({ content: axe }); return p.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id + ':' + v.nodes.length)); };

async function run(b, label, opts, phone) {
  const res = {};
  const ctx = await b.newContext(opts); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(900);
  // First run shows the page over the sample script.
  res.title = await p.getByRole('heading', { name: 'Start a script' }).count();
  ok(res.title === 1, `${label}: one Start a script heading`);
  ok(await p.evaluate(() => document.activeElement?.id === 'start-blank'), `${label}: the primary button has focus`);
  res.groups = await p.locator('.start-card').count(); ok(res.groups === 9, `${label}: 9 cards (blank, samples, 7 groups), saw ${res.groups}`);
  res.formats = await p.locator('section.start-card .choice').count(); ok(res.formats === 16, `${label}: 16 formats, saw ${res.formats}`);
  ok((await p.locator('.resume').count()) === 1, `${label}: resume card shows for the script on screen`);
  res.overflow = await p.evaluate(() => { const e = document.querySelector('.start-page'); return e.scrollWidth > e.clientWidth + 1; }); ok(!res.overflow, `${label}: no sideways scroll`);
  res.axe = await ax(p); ok(res.axe.length === 0, `${label}: axe ${res.axe}`);
  // Back and Escape.
  await p.getByRole('button', { name: 'Continue writing' }).click(); await p.waitForTimeout(300);
  ok((await p.getByRole('heading', { name: 'Start a script' }).count()) === 0, `${label}: Continue writing closes the page`);
  await (phone ? p.getByRole('navigation', { name: 'Sections' }).getByRole('button', { name: 'New' }) : p.getByRole('button', { name: 'New script' })).click(); await p.waitForTimeout(400);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok((await p.getByRole('heading', { name: 'Start a script' }).count()) === 0, `${label}: Escape closes the page`);
  // Open a file from the page.
  await (phone ? p.getByRole('navigation', { name: 'Sections' }).getByRole('button', { name: 'New' }) : p.getByRole('button', { name: 'New script' })).click(); await p.waitForTimeout(400);
  const [chooser] = await Promise.all([p.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null), p.locator('#start-open').click()]);
  ok(!!chooser, `${label}: Open a file opens the file chooser`);
  // A blank script has no resume card.
  await p.goto(url); await p.waitForTimeout(700);
  await p.locator('#start-blank').click(); await p.waitForTimeout(400);
  await (phone ? p.getByRole('navigation', { name: 'Sections' }).getByRole('button', { name: 'New' }) : p.getByRole('button', { name: 'New script' })).click(); await p.waitForTimeout(400);
  ok((await p.locator('.resume').count()) === 0, `${label}: an empty script has no resume card`);
  ok(errs.length === 0, `${label}: page errors ${errs}`);
  await ctx.close();
  return res;
}
(async () => {
  const b = await chromium.launch();
  const out = {
    desktop: await run(b, 'desktop', { viewport: { width: 1360, height: 900 } }, false),
    dark: await run(b, 'dark', { viewport: { width: 1360, height: 900 }, colorScheme: 'dark' }, false),
    phone: await run(b, 'phone', { ...devices['iPhone 13'] }, true),
    narrow: await run(b, 'narrow', { viewport: { width: 820, height: 1000 } }, false),
  };
  await b.close();
  console.log(JSON.stringify({ ...out, problems }, null, 1));
  process.exit(problems.length ? 1 : 0);
})();
