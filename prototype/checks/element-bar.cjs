// Element bar (D-038): always on screen; smart order; empty line retypes, a line with text gets a new line;
// the current-type key retypes in place; cast names on an empty character line; resume after Done; shortcuts.
const { chromium, devices } = require('playwright');
const fs = require('fs');
const SP = process.env.SP;
const axe = fs.readFileSync(SP + '/axe/node_modules/axe-core/axe.min.js', 'utf8');
const url = 'file:///home/user/script-app-kit/prototype/artifact/harness.html';
const lines = (p) => p.evaluate(() => {
  const seen = new Set(); const out = [];
  for (const f of document.querySelectorAll('.desk .frag')) { if (seen.has(f.dataset.id)) continue; seen.add(f.dataset.id); out.push([f.dataset.type, f.textContent]); }
  return out;
});
const bar = (p) => p.evaluate(() => ({
  current: document.querySelector('.eb-current-label')?.textContent,
  keys: [...document.querySelectorAll('.eb-keys button')].map((b) => b.textContent.replace(/(Alt\+|⌃)\d$/, '')),
  pressed: document.querySelector('.eb-key[aria-pressed="true"]')?.textContent,
  nav: !!document.querySelector('.bottom-nav'),
}));
(async () => {
  const b = await chromium.launch(); const res = {}; const errs = [];
  for (const mode of ['phone', 'desktop']) {
    const ctx = await b.newContext(mode === 'phone' ? { ...devices['iPhone 13'] } : { viewport: { width: 1280, height: 860 } });
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(mode + ': ' + e.message));
    await p.goto(url); await p.waitForTimeout(900);
    const r = (res[mode] = {}); console.error('mode', mode);
    r.barBeforeStart = await p.locator('.element-bar').isVisible();
    await p.getByRole('dialog').getByRole('button', { name: /^Blank screenplay/ }).click(); await p.waitForTimeout(500);
    r.start = await bar(p);
    await p.keyboard.type('INT. KITCHEN - NIGHT');
    await p.waitForTimeout(500);
    r.afterSceneText = await bar(p);
    // Line with text: tapping Action adds a new action line.
    await p.locator('.eb-keys button', { hasText: /^Action/ }).click(); await p.waitForTimeout(300);
    await p.keyboard.type('Nell fills the kettle.');
    // New Character line, type a name, Enter to dialogue.
    await p.locator('.eb-keys button', { hasText: /^Character/ }).click(); await p.waitForTimeout(300);
    r.onEmptyCharacter = await bar(p);
    await p.keyboard.type('NELL'); await p.keyboard.press('Enter'); await p.keyboard.type('Where is it?');
    await p.waitForTimeout(500);
    r.afterDialogue = await bar(p);
    // New character line: names offered; tap NELL -> fills name and moves to dialogue.
    await p.locator('.eb-keys button', { hasText: /^Character/ }).click(); await p.waitForTimeout(300);
    r.namesShown = await bar(p);
    await p.locator('.eb-keys button.eb-name', { hasText: 'NELL' }).click(); await p.waitForTimeout(300);
    await p.keyboard.type('Found it.');
    // Retype in place via the current-type key: dialogue -> parenthetical... use Action.
    await p.locator('.eb-current').click(); await p.waitForTimeout(200);
    r.menuItems = await p.getByRole('menuitemradio').count(); if (!r.menuItems) await p.screenshot({ path: SP + '/eb-fail.png' });
    await p.getByRole('menuitemradio', { name: /^Action/ }).click(); await p.waitForTimeout(400);
    r.afterRetype = await lines(p);
    // Leave the script, then tap Transition: resumes after the last line edited.
    if (mode === 'phone') { await p.getByRole('button', { name: 'Done', exact: true }).click(); }
    else { await p.locator('.wordmark').click(); await p.evaluate(() => document.activeElement.blur()); }
    await p.waitForTimeout(300);
    r.afterLeave = await bar(p);
    await p.locator('.eb-keys button', { hasText: /^Transition/ }).click(); await p.waitForTimeout(400);
    r.resumeFocused = await p.evaluate(() => document.activeElement?.dataset?.type);
    await p.keyboard.type('CUT TO:');
    if (mode === 'desktop') {
      // Shortcut for the first type in the format's order (Scene heading).
      await p.keyboard.press(process.platform === 'darwin' ? 'Control+Digit1' : 'Alt+Digit1'); await p.waitForTimeout(400);
      await p.keyboard.type('EXT. GARDEN - DAY');
    }
    await p.waitForTimeout(500);
    r.final = await lines(p);
    await p.screenshot({ path: `${SP}/eb-${mode}.png` });
    await p.addScriptTag({ content: axe });
    r.axe = await p.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id + ':' + v.nodes.length));
    r.overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    // Dark mode screenshot
    await p.emulateMedia({ colorScheme: 'dark' }); await p.waitForTimeout(200);
    await p.screenshot({ path: `${SP}/eb-${mode}-dark.png` });
    await ctx.close();
  }
  // Musical: names and the bar on a stage format
  const ctx = await b.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push('musical: ' + e.message));
  await p.goto(url); await p.waitForTimeout(900);
  await p.getByRole('dialog').getByRole('button', { name: /^Musical The Lighthouse/ }).click(); await p.waitForTimeout(600);
  res.musical = await bar(p);
  await p.screenshot({ path: `${SP}/eb-musical.png` });
  await ctx.close();
  console.log(JSON.stringify({ res, errs }, null, 1)); await b.close();
})().catch((e) => { console.error('FAILED', e.stack); process.exit(1); });
