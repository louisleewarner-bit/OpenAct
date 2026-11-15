// Script files (D-046): Save, Save a copy, Open, Close with a "save first?" guard, New and Open guards, Ctrl+S / Ctrl+O,
// bad files (not JSON, wrong format, newer version, damaged elements), plain text through the paste preview,
// the download fallback, the status bar, phone and desktop, axe.
const { chromium, devices } = require('playwright');
const fs = require('fs');
const SP = process.env.SP;
const axe = fs.readFileSync(SP + '/axe/node_modules/axe-core/axe.min.js', 'utf8');
const url = 'file:///home/user/script-app-kit/prototype/artifact/harness.html';
const OUT = `${SP}/files`; fs.mkdirSync(OUT, { recursive: true });
const ax = async (p) => { await p.addScriptTag({ content: axe }); return p.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id + ':' + v.nodes.length)); };
const problems = []; const ok = (c, m) => { if (!c) problems.push(m); };

async function run(b, mode) {
  const res = {};
  const ctx = await b.newContext(mode === 'phone' ? { ...devices['iPhone 13'], acceptDownloads: true } : { viewport: { width: 1360, height: 900 }, acceptDownloads: true });
  // A stand-in for the browser's save picker: remembers what was written and to which "file".
  await ctx.addInitScript(() => {
    window.__writes = []; window.__picks = 0;
    window.showSaveFilePicker = async (o) => { window.__picks++; const name = o.suggestedName; return { name, createWritable: async () => ({ write: async (d) => { window.__writes.push({ name, text: typeof d === 'string' ? d : await d.text() }); }, close: async () => {} }) }; };
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(`${mode}: ${e.message}`));
  await p.goto(url); await p.waitForTimeout(800);
  const menu = async (name) => { await p.getByRole('button', { name: 'More' }).click(); await p.getByRole('menuitem', { name: new RegExp(name) }).click(); await p.waitForTimeout(250); };
  const writes = () => p.evaluate(() => window.__writes.length);
  const lastWrite = () => p.evaluate(() => window.__writes[window.__writes.length - 1]);
  const dialogTitle = async () => ((await p.getByRole('dialog').last().getByRole('heading').first().textContent().catch(() => '')) ?? '');
  const startGame = async () => {
    if (!(await p.getByRole('heading', { name: 'Start a script' }).count())) await p.getByRole('button', { name: 'New script' }).click();
    await p.getByRole('heading', { name: 'Start a script' }).waitFor(); await p.waitForTimeout(500);
    await p.locator('section[aria-label="Games"] .choice', { hasText: 'Video game' }).first().click(); await p.waitForTimeout(400);
    await p.keyboard.press('Escape'); await p.evaluate(() => document.activeElement?.blur()); await p.waitForTimeout(200);
  };
  const statusFile = async () => (await p.locator('.file-note').textContent().catch(() => null));
  const edit = async () => { await p.locator('.frag[data-type]').first().click(); await p.keyboard.press('End'); await p.keyboard.type(' (edited)'); await p.waitForTimeout(1200); };

  await startGame();
  if (mode === 'desktop') ok((await statusFile()) === 'Not saved to a file', `status before saving: ${await statusFile()}`);

  // Unchanged script: Close and New need no question.
  if (mode === 'desktop') {
    await p.getByRole('button', { name: 'Close', exact: true }).click(); await p.waitForTimeout(300);
    ok((await dialogTitle()) === 'Start a script', `closing an unchanged script should go straight to the start screen, saw "${await dialogTitle()}"`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    await startGame();
  }

  // Save with Ctrl+S on desktop, the menu on phone.
  await edit();
  if (mode === 'desktop') await p.keyboard.press('Control+s'); else await menu('Save to a file');
  await p.waitForTimeout(500);
  res.afterSave = { picks: await p.evaluate(() => window.__picks), writes: await writes(), status: await statusFile() };
  ok(res.afterSave.picks === 1 && res.afterSave.writes === 1, `first save should ask once and write once: ${JSON.stringify(res.afterSave)}`);
  const w1 = await lastWrite();
  ok(w1.name === 'Salt Road.openact', `file name ${w1.name}`);
  const parsed = JSON.parse(w1.text);
  ok(parsed.format === 'openact-script' && parsed.version === 1 && parsed.script.profile === 'game' && parsed.script.elements.length > 40, 'file shape');
  ok(parsed.script.elements.some((e) => /\(edited\)$/.test(e.text)), 'the edit is in the file');
  if (mode === 'desktop') ok(res.afterSave.status === 'Saved to Salt Road.openact', `status after save: ${res.afterSave.status}`);

  // A second save goes to the same place without asking.
  await edit();
  if (mode === 'desktop') { ok(/^Changed since saved/.test(await statusFile()), `status after a change: ${await statusFile()}`); await p.keyboard.press('Control+s'); } else await menu('Save to a file');
  await p.waitForTimeout(400);
  ok((await p.evaluate(() => window.__picks)) === 1 && (await writes()) === 2, 'second save should reuse the file');
  // Save a copy asks again.
  await menu('Save a copy'); await p.waitForTimeout(400);
  ok((await p.evaluate(() => window.__picks)) === 2, 'save a copy should ask for a place');
  const saved = (await lastWrite()).text;
  fs.writeFileSync(`${OUT}/salt-road-${mode}.openact`, saved);

  // Guards: changed, then Close / New / Open each ask first.
  await edit();
  for (const [label, act] of [['close', async () => (mode === 'desktop' ? p.getByRole('button', { name: 'Close', exact: true }).click() : menu('Close this script'))], ['new', async () => p.getByRole('button', { name: 'New script' }).click()], ['open', async () => menu('Open a script file')]]) {
    await act(); await p.waitForTimeout(300);
    ok(/^Save .*first\?$/.test(await dialogTitle()), `${label}: should ask to save first, saw "${await dialogTitle()}"`);
    if (label === 'close') res.axeLeave = await ax(p);
    await p.locator('#leave-cancel').click(); await p.waitForTimeout(200);
  }
  ok((await p.locator('.frag').count()) > 10, 'Keep writing leaves the script alone');
  // Save a file, then close.
  await p.getByRole('button', { name: mode === 'desktop' ? 'Close' : 'More', exact: true }).click(); if (mode === 'phone') await p.getByRole('menuitem', { name: /Close this script/ }).click(); await p.waitForTimeout(300);
  const wBefore = await writes();
  await p.locator('#leave-save').click(); await p.waitForTimeout(600);
  ok((await writes()) === wBefore + 1, 'Save then close writes the file');
  ok((await dialogTitle()) === 'Start a script', `after save-and-close the start screen shows, saw "${await dialogTitle()}"`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok((await p.locator('.frag[data-type="scene"]').count()) <= 1, 'the closed script is gone from the page');

  // Open the saved file back.
  await p.setInputFiles('#open-script-file', `${OUT}/salt-road-${mode}.openact`); await p.waitForTimeout(600);
  res.reopened = { frags: await p.locator('.frag').count(), title: await p.locator('.script-title').first().textContent().catch(() => ''), status: await statusFile() };
  ok(res.reopened.frags > 40 && /Salt Road/.test(res.reopened.title), `reopened script ${JSON.stringify(res.reopened)}`);
  const text2 = await p.evaluate(() => [...document.querySelectorAll('.frag')].map((f) => f.textContent).join('\n'));
  ok(/\(edited\)/.test(text2) && /Harbour gate/i.test(text2), 'reopened text matches');
  if (mode === 'desktop') ok(res.reopened.status === 'Saved to salt-road-desktop.openact', `status after open: ${res.reopened.status}`);
  // Opened and unchanged: Close asks nothing.
  if (mode === 'desktop') { await p.getByRole('button', { name: 'Close', exact: true }).click(); await p.waitForTimeout(300); ok((await dialogTitle()) === 'Start a script', 'closing an unchanged opened file asks nothing'); await p.keyboard.press('Escape'); }

  // Bad files.
  const bad = {
    'not-json.openact': 'hello this is plain',
    'wrong.openact': JSON.stringify({ format: 'something', version: 1, script: {} }),
    'newer.openact': JSON.stringify({ format: 'openact-script', version: 99, script: { elements: [] } }),
    'noscript.openact': JSON.stringify({ format: 'openact-script', version: 1 }),
  };
  res.bad = {};
  for (const [name, body] of Object.entries(bad)) {
    fs.writeFileSync(`${OUT}/${name}`, body);
    await p.setInputFiles('#open-script-file', `${OUT}/${name}`); await p.waitForTimeout(400);
    const t = (await p.locator('#notice-text').textContent().catch(() => '')) ?? '';
    res.bad[name] = t; ok(t.length > 10, `${name}: should explain, said "${t}"`);
    await p.getByRole('button', { name: 'OK' }).click().catch(() => {}); await p.waitForTimeout(150);
  }
  ok(/newer OpenAct/.test(res.bad['newer.openact']), 'newer file message');
  ok(/plain text/.test(res.bad['not-json.openact']), 'plain text hint');
  // Damaged elements are dropped, not trusted.
  fs.writeFileSync(`${OUT}/damaged.openact`, JSON.stringify({ format: 'openact-script', version: 1, script: { title: { title: 'Damaged one' }, profile: 'nope', paper: 'weird', elements: [{ id: 'a', type: 'scene', text: 'KEPT' }, { id: 'a', type: 'action', text: 'duplicate id kept' }, { id: 'b', type: 'hacker', text: '<script>x</script>' }, null, 5, { type: 'action', text: 12 }] } }));
  await p.setInputFiles('#open-script-file', `${OUT}/damaged.openact`); await p.waitForTimeout(500);
  const dm = await p.evaluate(() => [...document.querySelectorAll('.frag')].map((f) => f.textContent));
  res.damaged = dm;
  ok(dm.some((t) => /KEPT/.test(t)) && !dm.some((t) => /hacker|script>/.test(t)), `damaged file: ${JSON.stringify(dm)}`);
  // Plain text goes to the paste preview.
  fs.writeFileSync(`${OUT}/plain.fountain`, 'INT. KITCHEN - NIGHT\n\nNELL\nWhere is it?\n');
  await p.setInputFiles('#open-script-file', `${OUT}/plain.fountain`); await p.waitForTimeout(500);
  ok(/Paste a script/.test(await dialogTitle()), `a .fountain file should open the paste preview, saw "${await dialogTitle()}"`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);

  // Typing and closing in the same breath still asks first.
  if (mode === 'desktop') {
    await p.locator('.frag[data-type]').first().click(); await p.keyboard.press('End'); await p.keyboard.type('Z');
    await p.getByRole('button', { name: 'Close', exact: true }).click(); await p.waitForTimeout(300);
    ok(/^Save .*first\?$/.test(await dialogTitle()), `closing straight after typing should ask, saw "${await dialogTitle()}"`);
    await p.locator('#leave-cancel').click(); await p.waitForTimeout(200);
  }
  // Download fallback (Firefox, Safari, hosted): no picker.
  await p.evaluate(() => { delete window.showSaveFilePicker; });
  await edit();
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), mode === 'desktop' ? p.keyboard.press('Control+s') : menu('Save to a file')]);
  res.download = dl.suggestedFilename(); ok(/\.openact$/.test(res.download), `download name ${res.download}`);
  await dl.saveAs(`${OUT}/dl-${mode}.openact`); JSON.parse(fs.readFileSync(`${OUT}/dl-${mode}.openact`, 'utf8'));
  // (axe is not run with the menu open: Radix hides the page behind any open menu, which axe reports for every menu in the app.)
  ok(res.axeLeave.length === 0, `axe on the save-first dialog: ${res.axeLeave}`);
  ok(errs.length === 0, `page errors ${errs}`);
  return res;
}
(async () => {
  const b = await chromium.launch();
  const out = { desktop: await run(b, 'desktop'), phone: await run(b, 'phone') };
  await b.close();
  console.log(JSON.stringify({ ...out, problems }, null, 1));
  process.exit(problems.length ? 1 : 0);
})();
