// Video game writing (D-044): the Video game format, the Branches tab (map, list, checks, line IDs), the
// four game exports (recording sheet, Ink, Yarn Spinner, JSON) checked as files, the review target, phone and
// desktop, with axe. The Ink file is compiled and played with inkjs (MIT; a check-only tool, not shipped):
//   npm i inkjs   in a scratch folder, then  NODE_PATH=<that>/node_modules SP=<scratch> node prototype/checks/game-check.cjs
const { chromium, devices } = require('playwright');
const fs = require('fs');
const SP = process.env.SP;
const axe = fs.readFileSync(SP + '/axe/node_modules/axe-core/axe.min.js', 'utf8');
const url = 'file:///home/user/script-app-kit/prototype/artifact/harness.html';
const OUT = `${SP}/game`;
fs.mkdirSync(OUT, { recursive: true });
const ax = async (p) => { await p.addScriptTag({ content: axe }); return p.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id + ':' + v.nodes.length)); };
const problems = [];
const ok = (cond, msg) => { if (!cond) problems.push(msg); };

function csvRows(text) {
  const rows = []; let row = [], cur = '', q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

async function run(b, mode) {
  const res = {};
  const ctx = await b.newContext(mode === 'phone' ? { ...devices['iPhone 13'], acceptDownloads: true } : { viewport: { width: 1360, height: 900 }, acceptDownloads: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(`${mode}: ${e.message}`));
  await p.goto(url); await p.waitForTimeout(800);
  // Start a Video game script.
  if (!(await p.getByRole('heading', { name: 'Start a script' }).count())) await p.getByRole('button', { name: 'New script' }).click();
  await p.getByRole('heading', { name: 'Start a script' }).waitFor();
  await p.locator('section[aria-label="Games"] .choice', { hasText: 'Video game' }).first().click(); await p.waitForTimeout(500);
  await p.keyboard.press('Escape'); await p.evaluate(() => document.activeElement?.blur()); await p.waitForTimeout(200);

  const openBranches = async () => {
    if (mode === 'phone') {
      const nav = p.getByRole('navigation', { name: 'Sections' });
      if (await nav.count()) await nav.getByRole('button', { name: /Details|Side panel|More/ }).first().click().catch(() => {});
      else await p.getByRole('button', { name: 'Side panel' }).click();
    }
    const tab = p.getByRole('tab', { name: 'Branches' });
    if (!(await tab.isVisible().catch(() => false))) { await p.getByRole('button', { name: 'Side panel' }).click().catch(() => {}); }
    await p.getByRole('tab', { name: 'Branches' }).click();
    await p.locator('.branches').first().waitFor();
  };
  await openBranches();
  res.map = { svg: await p.locator('svg.bmap').count(), nodes: await p.locator('.bnode').count(), boxes: await p.locator('svg.bmap .bm-node').count(), edges: await p.locator('svg.bmap .bm-edge').count(), heading: (await p.locator('.b-h').first().textContent()) };
  ok(res.map.nodes === 3 && res.map.boxes === 3, `${mode}: sample should show 3 nodes, saw ${res.map.nodes}/${res.map.boxes}`);
  ok(res.map.edges >= 6, `${mode}: sample map should draw its jumps, saw ${res.map.edges}`);
  ok(/No problems found/.test(res.map.heading), `${mode}: sample should be clean, heading "${res.map.heading}"`);
  res.axeBranches = await ax(p);
  ok(res.axeBranches.length === 0, `${mode}: axe on Branches: ${res.axeBranches}`);
  const panel = async () => { if (mode === 'phone') await openBranches(); };
  const close = async () => { if (mode === 'phone') { await p.keyboard.press('Escape'); await p.waitForTimeout(250); } };
  // Jump to a node.
  await p.locator('.bnode').nth(1).click(); await p.waitForTimeout(300);
  res.jumpedTo = await p.evaluate(() => document.activeElement?.textContent ?? '');
  ok(/net loft/i.test(res.jumpedTo), `${mode}: jumping to the second node landed on "${res.jumpedTo}"`);

  // Break a jump: add a letter to the last GO TO, and the map must say so.
  await p.locator('.frag[data-type="goto"]').last().click();
  await p.keyboard.press('End'); await p.keyboard.type('x'); await p.waitForTimeout(400);
  await panel();
  res.broken = await p.locator('.b-issues li.fix').allTextContents();
  ok(res.broken.length === 1 && /doesn.t exist/.test(res.broken[0]), `${mode}: a broken jump should be flagged, saw ${JSON.stringify(res.broken)}`);
  ok((await p.locator('.b-chip.bad').count()) === 1, `${mode}: broken jump chip`);
  await close();
  await p.locator('.frag[data-type="goto"]').last().click();
  await p.keyboard.press('End'); await p.keyboard.press('Backspace'); await p.waitForTimeout(300);
  await panel();
  await p.waitForFunction(() => !document.querySelector('.b-issues li.fix'), null, { timeout: 3000 }).catch(() => {});
  res.afterFix = await p.locator('.b-issues li').allTextContents();
  ok((await p.locator('.b-issues li.fix').count()) === 0, `${mode}: fixing the jump should clear the flag: ${res.afterFix}`);

  // Lock line IDs.
  const before = await p.locator('section[aria-label="Line IDs"] .hint').textContent();
  await p.getByRole('button', { name: /^Lock \d+ line IDs?$/ }).click(); await p.waitForTimeout(300);
  const after = await p.locator('section[aria-label="Line IDs"] .hint').textContent();
  res.lock = { before, after };
  ok(/0 locked/.test(before) && /\b\d+ not yet/.test(before) && /^\d+ locked, 0 not yet/.test(after.trim()), `${mode}: locking line IDs: ${before} -> ${after}`);

  // Exports.
  await close();
  const exp = {};
  for (const fmt of ['csv', 'ink', 'yarn', 'json']) {
    await p.getByRole('button', { name: 'Export', exact: true }).click();
    await p.getByRole('heading', { name: 'Export' }).waitFor();
    if (fmt === 'csv') {
      ok((await p.locator('#fmt-fdx').count()) === 0, `${mode}: Final Draft should not be offered for a game`);
      for (const id of ['csv', 'ink', 'yarn', 'json', 'pdf', 'docx', 'fountain']) ok((await p.locator(`#fmt-${id}`).count()) === 1, `${mode}: export option ${id}`);
    }
    await p.locator(`#fmt-${fmt}`).check();
    ok((await p.locator('#paper-a4').count()) === 0, `${mode}: paper choice should hide for ${fmt}`);
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.getByRole('button', { name: /^Export / }).last().click()]);
    const file = `${OUT}/salt-road.${fmt}`;
    await dl.saveAs(file);
    exp[fmt] = { suggested: dl.suggestedFilename(), status: (await p.locator('.export-status').textContent()) ?? '' };
    ok(dl.suggestedFilename() === `Salt Road.${fmt}`, `${mode}: ${fmt} file name ${dl.suggestedFilename()}`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  }
  res.exports = exp;

  if (mode === 'desktop') {
    // CSV: one row per spoken line, bark and choice; IDs unique; locked IDs.
    const rows = csvRows(fs.readFileSync(`${OUT}/salt-road.csv`, 'utf8'));
    const [head, ...body] = rows.filter((r) => r.length > 1);
    ok(head.join() === 'line_id,type,node,speaker,text,delivery,context,condition,recorded,notes', 'CSV header');
    const ids = body.map((r) => r[0]);
    ok(new Set(ids).size === ids.length, 'CSV line IDs must be unique');
    const kinds = body.reduce((a, r) => ((a[r[1]] = (a[r[1]] ?? 0) + 1), a), {});
    res.csv = { rows: body.length, kinds, first: body[0] };
    ok(kinds.line === 7 && kinds.bark === 3 && kinds.choice === 8, `CSV counts ${JSON.stringify(kinds)}`);
    ok(body.every((r) => r.length === 10), 'CSV has 10 columns on every row');
    ok(body[0][0] === 'MARGOT_001' && body[0][5] === 'wary' && /Dawn/.test(body[0][6]), `CSV first row ${JSON.stringify(body[0])}`);
    ok(body.some((r) => r[7] === 'IF knows_boats_lost'), 'CSV carries the condition on the gated choice');
    // Ink: compile and play.
    let Compiler;
    try { ({ Compiler } = require('inkjs/compiler/Compiler')); } catch { problems.push('inkjs not found: see the note at the top of this file'); }
    if (Compiler) {
      const msgs = [];
      const story = new Compiler(fs.readFileSync(`${OUT}/salt-road.ink`, 'utf8'), { errorHandler: (m, t) => msgs.push(`${t}:${m}`) }).Compile();
      ok(msgs.length === 0, `Ink compile messages: ${msgs}`);
      // Play every path to the end (depth-first over the choices), and note which nodes were seen.
      const seen = new Set(); let ends = 0, deadEnds = 0;
      const walk = (state, depth) => {
        story.state.LoadJson(state);
        while (story.canContinue) { const t = story.Continue(); const m = t.match(/^(MARGOT|TAM):/); if (m) seen.add(t.slice(0, 20)); }
        if (!story.currentChoices.length) { ends++; return; }
        if (depth > 6) return;
        const n = story.currentChoices.length; const snap = story.state.ToJson();
        for (let i = 0; i < n; i++) { story.state.LoadJson(snap); story.ChooseChoiceIndex(i); walk(story.state.ToJson(), depth + 1); }
      };
      story.ResetState();
      walk(story.state.ToJson(), 0);
      res.ink = { ends, seen: seen.size };
      ok(ends > 0, 'Ink story should reach an end');
      ok([...seen].some((s) => s.startsWith('TAM: I will hold')), 'Ink: the gated line should play on the path that sets its flag');
    }
    // Yarn: structure.
    const yarn = fs.readFileSync(`${OUT}/salt-road.yarn`, 'utf8');
    const nodes = [...yarn.matchAll(/^title: (\w+)\n---\n([\s\S]*?)\n===$/gm)];
    const titles = new Set(nodes.map((m) => m[1]));
    const jumps = [...yarn.matchAll(/<<jump (\w+)>>/g)].map((m) => m[1]);
    res.yarn = { nodes: nodes.length, jumps: jumps.length };
    ok(nodes.length === 3 && jumps.every((j) => titles.has(j)), `Yarn: ${nodes.length} nodes, jumps ${jumps}`);
    ok(/<<declare \$knows_about_key = false>>/.test(yarn) && /#line:MARGOT_001/.test(yarn) && /-> The boats never came back either\. I know\. <<if \$knows_boats_lost>>/.test(yarn), 'Yarn declarations, line tags and conditional choice');
    ok(/^ {4}<<jump lighthouse_door>>$/m.test(yarn) && /<<stop>>/.test(yarn), 'Yarn choice bodies are indented and END stops');
    // JSON.
    const j = JSON.parse(fs.readFileSync(`${OUT}/salt-road.json`, 'utf8'));
    res.json = { nodes: j.nodes.length, flags: j.flags, start: j.start };
    ok(j.format === 'openact-game' && j.nodes.length === 3 && j.start === 'harbour_gate' && j.flags.length === 3, 'JSON shape');
  }

  // Review: the game target, results in the Game section.
  const rv = mode === 'phone' ? null : p.getByRole('tab', { name: 'Review' });
  if (rv) {
    await rv.click(); await p.waitForTimeout(500);
    const text = (await p.locator('.review-side').textContent()) ?? '';
    res.review = { target: /Game studio hand-off/.test(text), ids: /line IDs? (is|are) not locked|Every recording line ID is locked/.test(text), joins: /Every jump lands/.test(text) };
    ok(res.review.target && res.review.joins && res.review.ids, `review: ${JSON.stringify(res.review)}`);
    res.axeReview = await ax(p);
    ok(res.axeReview.length === 0, `${mode}: axe on review ${res.axeReview}`);
  }
  // Export dialog accessibility.
  await p.getByRole('button', { name: 'Export', exact: true }).first().click(); await p.getByRole('heading', { name: 'Export' }).waitFor();
  await p.locator('#fmt-ink').check();
  res.axeExport = await ax(p);
  ok(res.axeExport.length === 0, `${mode}: axe on export ${res.axeExport}`);
  await p.keyboard.press('Escape');
  ok(errs.length === 0, `page errors: ${errs}`);
  return res;
}

(async () => {
  const b = await chromium.launch();
  const out = { desktop: await run(b, 'desktop'), phone: await run(b, 'phone') };
  await b.close();
  console.log(JSON.stringify({ ...out, problems }, null, 1));
  process.exit(problems.length ? 1 : 0);
})();
