// Import a format (D-040): reads OpenAct, Final Draft and Word files, preview and adjust, save, use, reload,
// export, edit, delete, error messages, the finder, and the fallback when a format is missing. Phone and desktop, with axe.
// Needs the sample files: python3 prototype/checks/make-format-fixtures.py
const { chromium, devices } = require('playwright');
const fs = require('fs');
const SP = process.env.SP;
const axe = fs.readFileSync(SP + '/axe/node_modules/axe-core/axe.min.js', 'utf8');
const url = 'file:///home/user/script-app-kit/prototype/artifact/harness.html';
const F = (n) => `/home/user/script-app-kit/docs/samples/formats/${n}`;
const ax = async (p) => { await p.addScriptTag({ content: axe }); return p.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id + ':' + v.nodes.length)); };
const sum = (p, label) => p.locator('.fmt-el', { has: p.locator('.fmt-el-name', { hasText: new RegExp(`^${label}$`) }) }).locator('.fmt-el-sum').textContent();
const dialogText = async (p) => (await p.getByRole('dialog').last().textContent()) ?? '';

async function run(b, mode) {
  const res = {}, errs = [];
  const ctx = await b.newContext(mode === 'phone' ? { ...devices['iPhone 13'] } : { viewport: { width: 1360, height: 900 } });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(`${mode}: ${e.message}`));
  await p.goto(url); await p.waitForTimeout(800);
  const openImport = async () => {
    if (!(await p.getByRole('dialog').count())) {
      if (mode === 'phone') { await p.getByRole('button', { name: 'More' }).click(); } else await p.getByRole('button', { name: 'More' }).click();
      await p.getByRole('menuitem', { name: 'Import a format file…' }).click();
    } else await p.getByRole('button', { name: 'Import a format file…' }).click();
    await p.getByRole('heading', { name: /Import a format|Edit /i }).waitFor();
  };
  const pick = async (n) => { await p.setInputFiles('#fmt-file', F(n)); await p.waitForTimeout(500); };

  // 1. Final Draft template
  await openImport(); await pick('example-screenplay.fdxt');
  res.fdx = { title: await p.getByRole('heading', { level: 2 }).last().textContent(), name: await p.inputValue('#fmt-name'), base: await p.inputValue('#fmt-base'), paper: await p.inputValue('#fmt-paper'), ml: await p.inputValue('#fmt-ml'), mr: await p.inputValue('#fmt-mr'),
    found: (await p.locator('.fmt-found').textContent()).slice(0, 60), scene: await sum(p, 'Scene heading'), character: await sum(p, 'Character'), dialogue: await sum(p, 'Dialogue'), transition: await sum(p, 'Transition') };
  await p.screenshot({ path: `${SP}/fmt-${mode}-review.png` });
  res.fdx.axe = await ax(p);
  res.fdx.overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  // adjust: open Character, widen to 30
  await p.locator('.fmt-el', { has: p.locator('.fmt-el-name', { hasText: /^Character$/ }) }).locator('summary').click();
  await p.fill('#fe-character-width', '30');
  res.fdx.afterEdit = await sum(p, 'Character');
  await p.getByRole('button', { name: 'Save and use for this script' }).click(); await p.waitForTimeout(700);
  res.fdx.selectShows = await p.getByRole('combobox', { name: 'Format' }).count() ? await p.getByRole('combobox', { name: 'Format' }).textContent() : '(phone: in Details)';
  // layout really changed (desktop pages): character margin vs dialogue margin
  if (mode === 'desktop') {
    res.fdx.layout = await p.evaluate(() => {
      const m = (t) => { const f = document.querySelector(`.desk .frag[data-type="${t}"]`); return f ? parseFloat(getComputedStyle(f).marginLeft) : null; };
      const cw = document.querySelector('.desk .frag[data-type="character"]'); 
      return { character: m('character'), dialogue: m('dialogue'), characterWidthCh: cw ? cw.style.width : null };
    });
  }
  // reload: format survives
  await p.reload(); await p.waitForTimeout(900);
  if (await p.getByRole('dialog').count()) await p.getByRole('button', { name: 'Close' }).click();
  res.afterReload = mode === 'desktop' ? await p.getByRole('combobox', { name: 'Format' }).textContent() : await p.evaluate(() => JSON.parse(localStorage.getItem('openact-formats')).map((d) => d.name));

  // 2. Word document
  await openImport(); await pick('example-stage.docx');
  res.docx = { name: await p.inputValue('#fmt-name'), base: await p.inputValue('#fmt-base'), paper: await p.inputValue('#fmt-paper'), ml: await p.inputValue('#fmt-ml'),
    matches: await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('.fmt-word select')].map((s) => [s.id.replace('ws-', ''), s.selectedOptions[0].textContent]))),
    scene: await sum(p, 'Scene heading'), action: await sum(p, 'Action'), character: await sum(p, 'Character'), dialogue: await sum(p, 'Dialogue') };
  await p.selectOption('#ws-action', await p.locator('#ws-action option', { hasText: /^Speech/ }).first().getAttribute('value'));
  res.docx.actionAfterRemap = await sum(p, 'Action');
  await p.selectOption('#fmt-base', 'stage-uk');
  res.docx.stageTypes = await p.evaluate(() => [...document.querySelectorAll('.fmt-el-name')].map((n) => n.textContent));
  res.docx.axe = await ax(p);
  await p.getByRole('button', { name: 'Save', exact: true }).click(); await p.waitForTimeout(500);

  // 3. Word template (no page setup)
  await openImport(); await pick('example-stage.dotx');
  res.dotx = { notes: await p.locator('.fmt-notes').textContent(), scene: await sum(p, 'Scene heading') };
  await p.getByRole('button', { name: 'Save', exact: true }).click(); await p.waitForTimeout(400);

  // 4. OpenAct format file; then your formats list, export, edit, delete
  await openImport(); await pick('fringe-house.openact-format.json');
  res.json = { name: await p.inputValue('#fmt-name'), base: await p.inputValue('#fmt-base'), action: await sum(p, 'Stage direction').catch(() => sum(p, 'Action')) };
  await p.getByRole('button', { name: 'Save', exact: true }).click(); await p.waitForTimeout(400);
  // open the Start screen
  await (mode === 'phone' ? p.getByRole('navigation', { name: 'Sections' }).getByRole('button', { name: 'New' }) : p.getByRole('button', { name: 'New script' })).click();
  await p.getByRole('heading', { name: 'Start a script' }).waitFor();
  res.mine = await p.locator('.fmt-mine-row strong').allTextContents();
  await p.screenshot({ path: `${SP}/fmt-${mode}-start.png` });
  res.startAxe = await ax(p);
  await p.getByRole('button', { name: 'Export Fringe house style' }).click();
  await p.getByRole('heading', { name: 'Format file' }).waitFor();
  const out = await p.inputValue('#fmt-out');
  res.export = { hasKind: out.includes('"kind": "openact-format"'), hasName: out.includes('Fringe house style'), noScriptText: !out.includes('Silly Billy') };
  await p.waitForTimeout(500);
  res.exportAxe = await ax(p);
  await p.keyboard.press('Escape');
  await (mode === 'phone' ? p.getByRole('navigation', { name: 'Sections' }).getByRole('button', { name: 'New' }) : p.getByRole('button', { name: 'New script' })).click();
  await p.getByRole('button', { name: 'Edit Fringe house style' }).click();
  await p.getByRole('heading', { name: 'Edit Fringe house style' }).waitFor();
  res.edit = { baseDisabled: await p.locator('#fmt-base').isDisabled() };
  await p.fill('#fmt-name', 'Fringe house style v2');
  await p.getByRole('button', { name: 'Save changes' }).click(); await p.waitForTimeout(400);
  await (mode === 'phone' ? p.getByRole('navigation', { name: 'Sections' }).getByRole('button', { name: 'New' }) : p.getByRole('button', { name: 'New script' })).click();
  res.afterEdit = await p.locator('.fmt-mine-row strong').allTextContents();
  await p.getByRole('button', { name: 'Delete Fringe house style v2' }).click();
  await p.getByRole('button', { name: /Confirm: delete/ }).click();
  res.afterDelete = await p.locator('.fmt-mine-row strong').allTextContents();
  // start a new script in an imported format
  await p.locator('.fmt-mine-row .choice').first().click(); await p.waitForTimeout(500);
  res.startWith = await p.evaluate(() => JSON.parse(localStorage.getItem('openact-prototype-v1')).profile);

  // 5. errors
  const errors = {};
  for (const n of ['not-a-template.fdx', 'old-word.doc', 'newer-version.openact-format.json']) {
    await openImport(); await pick(n); errors[n] = (await p.locator('.fmt-error').textContent().catch(() => null)); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  }
  res.errors = errors;

  // 6. missing format falls back
  await p.evaluate(() => localStorage.removeItem('openact-formats'));
  await p.reload(); await p.waitForTimeout(900);
  res.fallback = await p.evaluate(() => JSON.parse(localStorage.getItem('openact-prototype-v1')).profile);
  res.fallbackLoads = await p.locator('.desk .frag').count() > 0 || (await p.getByRole('dialog').count()) > 0;
  if (await p.getByRole('dialog').count()) await p.getByRole('button', { name: 'Close' }).click();
  if (mode === 'desktop') { res.fallbackSelect = await p.getByRole('combobox', { name: 'Format' }).textContent(); res.fallbackFrags = await p.locator('.desk .frag').count(); }
  await ctx.close();
  return { res, errs };
}

(async () => {
  const b = await chromium.launch(); const all = {}, errs = [];
  for (const mode of ['desktop', 'phone']) { const r = await run(b, mode); all[mode] = r.res; errs.push(...r.errs); }
  console.log(JSON.stringify({ all, errs }, null, 1)); await b.close();
})().catch((e) => { console.error('FAILED', e.stack); process.exit(1); });
