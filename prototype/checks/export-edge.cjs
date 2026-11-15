// Export edge cases (D-042): a blank script, a very long speech, characters the font lacks, an imported format,
// anonymous Final Draft, timing, and the hosted preview's save prompt (stood in for by a fake `claude` host).
// Writes files to $SP/edge; checks/export-edge.py reads them.
const { chromium } = require('playwright');
const fs = require('fs');
const SP = process.env.SP, OUT = `${SP}/edge`;
fs.mkdirSync(OUT, { recursive: true });
const url = 'file:///home/user/script-app-kit/prototype/artifact/harness.html';
const F = (n) => `/home/user/script-app-kit/docs/samples/formats/${n}`;
const res = {}; const errs = [];

async function session(host) {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message));
  if (host) await p.addInitScript(host);
  await p.goto(url); await p.waitForTimeout(900);
  return { b, p };
}
const start = async (p, re) => { if (!(await p.getByRole('heading', { name: 'Start a script' }).count())) await p.getByRole('button', { name: 'New script' }).click(); await p.getByRole('dialog').getByRole('button', { name: re }).click(); await p.waitForTimeout(500); await p.keyboard.press('Escape'); await p.waitForTimeout(150); };
async function exportAs(p, fmt, name, opts = {}) {
  await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.getByRole('heading', { name: 'Export' }).waitFor();
  await p.locator(`#fmt-${fmt}`).check();
  if (fmt === 'docx') { const c = p.locator('#export-fixed'); if ((await c.isChecked()) !== !!opts.fixed) await c.click(); }
  if (opts.anonymous !== undefined) { const c = p.locator('#export-anon'); if ((await c.isChecked()) !== opts.anonymous) await c.click(); }
  const t0 = Date.now();
  const dl = opts.noDownload ? null : p.waitForEvent('download', { timeout: 30000 });
  await p.getByRole('button', { name: /^Export (PDF|Word|Fountain|Final Draft)/ }).click();
  let file = null, suggested = null;
  if (dl) { const d = await dl; suggested = d.suggestedFilename(); file = `${OUT}/${name}.${suggested.split('.').pop()}`; await d.saveAs(file); } else await p.waitForTimeout(1500);
  const ms = Date.now() - t0; await p.waitForTimeout(150);
  const status = (await p.locator('.export-status').textContent()) ?? ''; const tone = await p.locator('.export-status').getAttribute('class');
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  return { file, suggested, ms, status, tone };
}

(async () => {
  // 1. blank script
  let { b, p } = await session();
  await start(p, /^Blank screenplay/);
  res.blank = {}; for (const f of ['pdf', 'docx', 'fountain', 'fdx']) res.blank[f] = await exportAs(p, f, `blank-${f}`);
  // 2. a very long speech
  await start(p, /^Blank screenplay/);
  await p.locator('.desk .frag').first().click(); await p.keyboard.type('INT. LONG ROOM - DAY'); await p.keyboard.press('Enter');
  const words = []; for (let i = 0; i < 2600; i++) words.push(['rain', 'hammers', 'the', 'shuttered', 'shops', 'and', 'Nell', 'counts', 'socks', 'again'][i % 10] + (i % 17 === 16 ? '.' : ''));
  await p.keyboard.insertText(words.join(' ')); await p.waitForTimeout(900);
  res.longPages = await p.evaluate(() => document.querySelectorAll('.desk .sheet:not(.title-sheet)').length);
  res.long = {}; for (const [k, o] of [['pdf', {}], ['docxFlow', { fixed: false }], ['docxFixed', { fixed: true }]]) res.long[k] = await exportAs(p, k === 'pdf' ? 'pdf' : 'docx', `long-${k}`, o);
  res.longWords = words.length;
  // a long speech with no full stops at all
  await start(p, /^Blank screenplay/);
  await p.locator('.desk .frag').first().click(); await p.keyboard.type('INT. LONG ROOM - DAY'); await p.keyboard.press('Enter');
  await p.keyboard.insertText(words.map((w) => w.replace('.', '')).join(' ')); await p.waitForTimeout(900);
  res.noStopsPages = await p.evaluate(() => document.querySelectorAll('.desk .sheet:not(.title-sheet)').length);
  res.noStops = { pdf: await exportAs(p, 'pdf', 'nostops-pdf'), docx: await exportAs(p, 'docx', 'nostops-docx', { fixed: true }) };
  // 3. unicode
  await start(p, /^Blank screenplay/);
  await p.locator('.desk .frag').first().click(); await p.keyboard.type('INT. CAFÉ - NIGHT'); await p.keyboard.press('Enter');
  await p.keyboard.insertText('Zoë orders at the Łódź café. ♪ La la la ♪ Привет → 😀 “quoted” — dash…');
  res.uni = {}; for (const f of ['pdf', 'docx']) res.uni[f] = await exportAs(p, f, `uni-${f}`);
  // 4. an imported format
  await p.getByRole('button', { name: 'More' }).click(); await p.getByRole('menuitem', { name: 'Import a format file…' }).click();
  await p.setInputFiles('#fmt-file', F('example-screenplay.fdxt')); await p.waitForTimeout(500);
  await p.getByRole('button', { name: 'Save and use for this script' }).click(); await p.waitForTimeout(700);
  res.custom = {}; for (const f of ['pdf', 'docx']) res.custom[f] = await exportAs(p, f, `custom-${f}`, f === 'docx' ? { fixed: true } : {});
  // 5. anonymous Final Draft with a named title page
  await start(p, /^Screenplay Last Wash/);
  await p.getByRole('button', { name: /edit the title page/ }).click(); await p.fill('#tp-authors', 'Sam Writer'); await p.fill('#tp-contact', 'sam@example.com'); await p.getByRole('button', { name: 'Save title page' }).click(); await p.waitForTimeout(300);
  res.fdx = { named: await exportAs(p, 'fdx', 'fdx-named', { anonymous: false }), anon: await exportAs(p, 'fdx', 'fdx-anon', { anonymous: true }) };
  await b.close();

  // 6. hosted preview stand-in
  const host = () => {
    window.__saved = []; window.__mode = 'ok';
    window.claude = { use: async (n) => n === 'downloads' ? { save: async ({ filename, data }) => {
      if (window.__mode === 'decline') throw { code: 'declined', message: 'no' };
      if (window.__mode === 'toobig') throw { code: 'too_large', message: 'big' };
      const buf = new Uint8Array(await new Response(data).arrayBuffer()); let s = ''; buf.forEach((c) => (s += String.fromCharCode(c)));
      window.__saved.push({ filename, b64: btoa(s) }); return { status: 'saved' }; } } : null };
  };
  ({ b, p } = await session(host));
  await start(p, /^Screenplay Last Wash/);
  res.hosted = {};
  for (const f of ['pdf', 'docx', 'fountain', 'fdx']) res.hosted[f] = await exportAs(p, f, `hosted-${f}`, { noDownload: true });
  await p.evaluate(() => (window.__mode = 'decline')); res.hosted.declined = await exportAs(p, 'pdf', 'x', { noDownload: true });
  await p.evaluate(() => (window.__mode = 'toobig')); res.hosted.blocked = await exportAs(p, 'pdf', 'x', { noDownload: true });
  const saved = await p.evaluate(() => window.__saved);
  for (const s of saved) fs.writeFileSync(`${OUT}/hosted-saved-${s.filename}`, Buffer.from(s.b64, 'base64'));
  res.hostedNames = saved.map((s) => s.filename);
  await b.close();
  fs.writeFileSync(`${OUT}/edge.json`, JSON.stringify({ res, errs }, null, 1));
  console.log(JSON.stringify({ errs, names: res.hostedNames }));
})().catch((e) => { console.error('FAILED', e.stack); process.exit(1); });
