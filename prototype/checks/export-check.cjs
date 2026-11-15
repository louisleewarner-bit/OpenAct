// Real exports (D-042): PDF, Word, Fountain and Final Draft files saved through the Export dialog, for every
// built-in format and the samples. Writes the files and what the page view shows (expected.json) to $SP/exports;
// checks/export-verify.py then reads the files and compares.
const { chromium } = require('playwright');
const fs = require('fs');
const SP = process.env.SP;
const OUT = `${SP}/exports`;
fs.mkdirSync(OUT, { recursive: true });
const url = 'file:///home/user/script-app-kit/prototype/artifact/harness.html';
const FORMATS = [
  ['Film', 'Screenplay'], ['Television', 'TV drama (one hour)'], ['Television', 'TV comedy (single camera)'], ['Television', 'TV sitcom (multi-camera)'], ['Television', 'UK studio sitcom'], ['Television', 'Vertical micro-drama'],
  ['Theatre', 'Stage play (UK)'], ['Theatre', 'Stage play (US)'], ['Theatre', 'Musical (UK)'], ['Theatre', 'Musical (US)'], ['Theatre', 'Pantomime'],
  ['Audio', 'Radio drama (UK)'], ['Audio', 'Audio drama and podcast'], ['Games', 'Video game'], ['Comics', 'Comic or graphic novel'], ['Documents', 'Treatment or outline'],
];
const SAMPLES = ['Pantomime Jack', 'Musical The Lighthouse', 'Screenplay Last Wash'];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(900);
  const expected = {};
  const pageView = () => p.evaluate(() => {
    document.querySelectorAll('.pages').forEach((x) => x.style.setProperty('--zoom', '1'));
    const sheets = [...document.querySelectorAll('.desk .sheet:not(.title-sheet)')];
    const norm = (f) => ((f.dataset.prefix ?? '') + f.textContent + (f.dataset.suffix ?? '')).replace(/\s+/g, ' ').trim();
    return {
      title: !!document.querySelector('.desk .title-sheet'),
      pages: sheets.map((s) => [...s.querySelectorAll('.frag, .deco')].map(norm).filter(Boolean)),
      // Where each line of text sits on its page, in inches from the page's top-left corner (zoom 1).
      geom: sheets.map((s) => { const r = s.getBoundingClientRect(); return [...s.querySelectorAll('.frag, .deco')].filter((f) => norm(f)).map((f) => { const rg = document.createRange(); rg.selectNodeContents(f); const b = rg.getClientRects()[0] ?? f.getBoundingClientRect(); return { text: norm(f).slice(0, 14), x: (b.left - r.left) / 96 - (f.textContent.trim() ? (f.dataset.prefix ?? '').length * 0.1 : 0), y: (b.top - r.top) / 96, cls: f.className, full: norm(f).length <= 14 }; }); }),
    };
  });
  const exportAs = async (fmt, name, opts = {}) => {
    await p.getByRole('button', { name: 'Export', exact: true }).click();
    await p.getByRole('heading', { name: 'Export' }).waitFor();
    await p.locator(`#fmt-${fmt}`).check();
    if (opts.paper) await p.locator(`#paper-${opts.paper}`).check();
    if (fmt === 'docx') { const c = p.locator('#export-fixed'); if ((await c.isChecked()) !== !!opts.fixed) await c.click(); }
    if (opts.anonymous !== undefined) { const c = p.locator('#export-anon'); if ((await c.isChecked()) !== opts.anonymous) await c.click(); }
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 20000 }), p.getByRole('button', { name: /^Export (PDF|Word|Fountain|Final Draft)/ }).click()]);
    const file = `${OUT}/${name}-${fmt}${opts.tag ? '-' + opts.tag : ''}.${{ pdf: 'pdf', docx: 'docx', fountain: 'fountain', fdx: 'fdx' }[fmt]}`;
    await dl.saveAs(file);
    const status = (await p.locator('.export-status').textContent()) ?? '';
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    return { file, suggested: dl.suggestedFilename(), status };
  };
  const startWith = async (locator) => {
    if (!(await p.getByRole('heading', { name: 'Start a script' }).count())) await p.getByRole('button', { name: 'New script' }).click();
    await p.getByRole('heading', { name: 'Start a script' }).waitFor();
    await locator().click(); await p.waitForTimeout(500);
    await p.keyboard.press('Escape'); await p.evaluate(() => document.activeElement?.blur()); await p.waitForTimeout(200);
  };
  const jobs = [
    ...FORMATS.map(([g, n]) => ({ name: slug(n), go: () => p.locator(`section[aria-label="${g}"] .choice`, { hasText: n }).first() })),
    ...SAMPLES.map((n) => ({ name: 'sample-' + slug(n), go: () => p.getByRole('dialog').getByRole('button', { name: new RegExp('^' + n) }) })),
  ];
  for (const j of jobs) {
    await startWith(j.go);
    const view = await pageView();
    const res = { view, files: {} };
    for (const fmt of ['pdf', 'docx', 'fountain', 'fdx']) {
      if (fmt === 'fdx') {
        await p.getByRole('button', { name: 'Export', exact: true }).click();
        const enabled = (await p.locator('#fmt-fdx').count()) > 0 && (await p.locator('#fmt-fdx').isEnabled());
        await p.keyboard.press('Escape'); await p.waitForTimeout(150);
        if (!enabled) continue;
      }
      res.files[fmt] = await exportAs(fmt, j.name);
      if (fmt === 'docx') res.files.docxFixed = await exportAs('docx', j.name, { fixed: true, tag: 'fixed' });
    }
    expected[j.name] = res;
  }
  // Paper and anonymity, on the panto sample (it has an author and contact details).
  await startWith(() => p.getByRole('dialog').getByRole('button', { name: /^Pantomime Jack/ }));
  await p.getByRole('button', { name: /edit the title page/ }).click();
  await p.fill('#tp-authors', 'Sam Writer'); await p.fill('#tp-contact', 'sam@example.com');
  await p.getByRole('button', { name: 'Save title page' }).click();
  await p.waitForTimeout(300);
  if (await p.getByRole('dialog').count()) await p.keyboard.press('Escape');
  expected.anon = { view: await pageView(), files: {
    pdfNamed: await exportAs('pdf', 'panto', { anonymous: false, paper: 'a4', tag: 'named-a4' }),
    pdfAnon: await exportAs('pdf', 'panto', { anonymous: true, paper: 'letter', tag: 'anon-letter' }),
    docxAnon: await exportAs('docx', 'panto', { anonymous: true, tag: 'anon' }),
    fountainAnon: await exportAs('fountain', 'panto', { anonymous: true, tag: 'anon' }),
  } };
  fs.writeFileSync(`${OUT}/expected.json`, JSON.stringify(expected, null, 1));
  console.log(JSON.stringify({ jobs: Object.keys(expected).length, files: Object.values(expected).reduce((n, r) => n + Object.keys(r.files).length, 0), errs }));
  await b.close();
})().catch((e) => { console.error('FAILED', e.stack); process.exit(1); });
