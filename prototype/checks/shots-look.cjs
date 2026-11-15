// Look-and-feel screenshots (D-039). Usage: SP=<dir> node checks/shots-look.cjs <tag>   writes <dir>/look-<tag>-*.png
const { chromium, devices } = require('playwright');
const { openReview } = require('./lib.cjs');
const SP = process.env.SP, tag = process.argv[2] || 'now';
const url = 'file:///home/user/script-app-kit/prototype/artifact/harness.html';
(async () => {
  const b = await chromium.launch();
  const shot = async (p, n) => p.screenshot({ path: `${SP}/look-${tag}-${n}.png` });
  for (const scheme of ['light', 'dark']) {
    const c = await b.newContext({ viewport: { width: 1360, height: 860 }, colorScheme: scheme });
    const d = await c.newPage(); await d.goto(url); await d.waitForTimeout(900);
    if (scheme === 'light') await shot(d, 'start');
    await d.getByRole('dialog').getByRole('button', { name: /^Pantomime Jack/ }).click(); await d.waitForTimeout(600);
    await d.locator('.frag').nth(12).click(); await d.waitForTimeout(300);
    await shot(d, `desk-${scheme}`);
    if (scheme === 'light') {
      await openReview(d);
      await d.waitForTimeout(500); await shot(d, 'review');
    }
    await c.close();
  }
  for (const scheme of ['light', 'dark']) {
    const c = await b.newContext({ ...devices['iPhone 13'], colorScheme: scheme });
    const p = await c.newPage(); await p.goto(url); await p.waitForTimeout(900);
    if (scheme === 'light') await shot(p, 'phone-start');
    await p.getByRole('dialog').getByRole('button', { name: /^Pantomime Jack/ }).click(); await p.waitForTimeout(600);
    await shot(p, `phone-typing-${scheme}`);
    if (scheme === 'light') {
      await p.getByRole('button', { name: 'Done', exact: true }).click(); await p.waitForTimeout(300);
      await p.getByRole('navigation', { name: 'Sections' }).getByRole('button', { name: 'Review' }).click(); await p.waitForTimeout(500);
      await shot(p, 'phone-review');
    }
    await c.close();
  }
  await b.close();
})();
