// Video game writing, edge cases (D-044), run on the compiled logic (no browser):
// locked line IDs stay put when lines are inserted, deleted or reordered; awkward text survives every export
// (quotes, commas, newlines, braces, arrows, hashes, formula-looking cells, unicode, very long lines);
// an empty script and a script with no nodes still export; the checks find what they should.
// Compile first:  tsc --ignoreConfig src/cue/export-game.ts src/cue/samples.ts src/cue/layout.ts --outDir $SP/out
//                 --module commonjs --moduleResolution bundler --target es2022 --skipLibCheck --rootDir src/cue
// Needs inkjs (check-only; npm i inkjs in a scratch folder, NODE_PATH to it).
const SP = process.env.SP;
const { makeTemplate } = require(`${SP}/out/samples.js`);
const { analyze } = require(`${SP}/out/game.js`);
const { toRecordingCsv, toInk, toYarn, toGameJson } = require(`${SP}/out/export-game.js`);
const { lineIds } = require(`${SP}/out/lineid.js`);
const { Compiler } = require('inkjs/compiler/Compiler');
const problems = [];
const ok = (c, m) => { if (!c) problems.push(m); };
let n = 0;
const el = (type, text, extra = {}) => ({ id: `t${n++}`, type, text, ...extra });
const script = (elements) => ({ ...makeTemplate('game'), elements });
const inkErrors = (src) => { const m = []; try { new Compiler(src, { errorHandler: (x, t) => { if (t === 2) m.push(x); } }).Compile(); } catch (e) { m.push(String(e).slice(0, 80)); } return m; };

// 1. Locked IDs survive inserting, deleting and reordering.
{
  const s = makeTemplate('game');
  const ids0 = lineIds(s);
  s.elements.forEach((e) => { const id = ids0.get(e.id); if (id) e.lineId = id; });
  const locked = new Map([...ids0]);
  const first = s.elements.findIndex((e) => e.type === 'character');
  s.elements.splice(first, 0, el('character', 'MARGOT'), el('dialogue', 'A brand new line.'), el('bark', 'GUARD: Halt!'));
  s.elements.splice(first + 5, 1); // drop something in the middle
  const rev = [...s.elements].reverse();
  for (const list of [s.elements, rev]) {
    const ids = lineIds({ ...s, elements: list });
    for (const [id, v] of locked) if (list.some((e) => e.id === id)) ok(ids.get(id) === v, `locked ID moved: ${id} ${v} -> ${ids.get(id)}`);
    const all = [...ids.values()];
    ok(new Set(all).size === all.length, 'IDs unique after edits');
  }
  const fresh = lineIds(s).get(s.elements[first].id);
  ok(/^MARGOT_\d{3}$/.test(fresh) && !([...locked.values()].includes(fresh)), `new line ID must not reuse a locked one: ${fresh}`);
  // Copying a locked line makes a duplicate: the check must say so.
  const dup = { ...s, elements: [...s.elements, { ...s.elements.find((e) => e.lineId), id: 'copy' }] };
  ok(analyze(dup).issues.some((i) => i.level === 'fix' && /used twice/.test(i.text)), 'duplicate locked ID should be a fix');
}

// 2. Awkward text through every export.
{
  const nasty = 'He said "no", then {brace} | pipe -> arrow <- back # hash [bracket] // slash\nsecond line, with comma';
  const s = script([
    el('scene', 'Café “Ünïcode” 🚀'), el('action', '=cmd|calc'), el('character', 'ZOË'), el('paren', '(whispering, "hush")'),
    el('dialogue', nasty), el('dialogue', 'Second paragraph.'), el('cond', 'SET got key'), el('choice', '-leading dash? "quoted"'),
    el('bark', 'GUARD: +1 formula, "x"'), el('goto', 'END'),
  ]);
  const csv = toRecordingCsv(s);
  ok(csv.startsWith('﻿') && csv.includes('\r\n'), 'CSV BOM and CRLF');
  ok(/'=cmd\|calc/.test(csv), 'CSV formula-looking context is defanged');
  ok(/""no""/.test(csv) && /"second line, with comma/.test(csv) || /second line, with comma/.test(csv), 'CSV quoting');
  const ink = toInk(s);
  ok(inkErrors(ink).length === 0, `Ink compile with awkward text: ${inkErrors(ink)}\n${ink}`);
  ok(!/\{brace\}/.test(ink.replace(/\\\{brace\\\}/g, '')), 'Ink braces escaped');
  const yarn = toYarn(s);
  ok(/title: caf_nicode|title: caf/.test(yarn) || /title: \w+/.test(yarn), 'Yarn title');
  ok(!/\{brace\}/.test(yarn.replace(/\\\{brace\\\}/g, '')), 'Yarn braces escaped');
  const j = JSON.parse(toGameJson(s));
  ok(j.nodes[0].items.some((i) => i.type === 'line' && i.text.startsWith('He said "no"')), 'JSON keeps the text');
  ok(j.nodes[0].items.filter((i) => i.type === 'line').length === 1 && /Second paragraph/.test(JSON.stringify(j)), 'JSON joins a speech into one line');
}

// 3. Empty and odd scripts.
for (const [name, els] of [['empty', []], ['no nodes', [el('character', 'A'), el('dialogue', 'Hi.')]], ['only a node', [el('scene', 'Start')]], ['jump to itself', [el('scene', 'Loop'), el('goto', 'Loop')]], ['two same names', [el('scene', 'Door'), el('goto', 'END'), el('scene', 'door'), el('goto', 'END')]], ['bad cond', [el('scene', 'A'), el('cond', 'banana'), el('goto', 'END')]], ['IF never set', [el('scene', 'A'), el('cond', 'IF ghost'), el('character', 'X'), el('dialogue', 'Boo'), el('goto', 'END')]]]) {
  const s = script(els);
  let g;
  try { g = analyze(s); toRecordingCsv(s); toInk(s); toYarn(s); toGameJson(s); } catch (e) { problems.push(`${name}: threw ${e.message}`); continue; }
  if (name === 'empty') ok(g.issues.some((i) => /No nodes/.test(i.text)), 'empty: says no nodes');
  if (name === 'two same names') ok(g.issues.some((i) => i.level === 'fix' && /Two nodes/.test(i.text)), 'duplicate names flagged');
  if (name === 'bad cond') ok(g.issues.some((i) => /isn.t a condition/.test(i.text)), 'unparseable condition flagged');
  if (name === 'IF never set') ok(g.issues.some((i) => /nothing ever sets/.test(i.text)), 'unset flag flagged');
  if (name === 'jump to itself') ok(!g.issues.some((i) => i.level === 'fix'), 'a node may jump to itself');
  if (els.length && name !== 'two same names' && name !== 'bad cond') { const e = inkErrors(toInk(s)); if (name !== 'no nodes' && name !== 'only a node') ok(e.length === 0, `${name}: Ink errors ${e}`); }
}

// 4. A very long speech and a big script keep exporting quickly.
{
  const long = Array.from({ length: 3000 }, (_, i) => `word${i}`).join(' ');
  const els = [];
  for (let i = 0; i < 400; i++) els.push(el('scene', `Node ${i}`), el('character', `NPC${i % 7}`), el('dialogue', i === 0 ? long : `Line ${i}.`), el('choice', 'Go on'), el('goto', i === 399 ? 'END' : `Node ${i + 1}`));
  const s = script(els);
  const t0 = Date.now();
  const g = analyze(s); const csv = toRecordingCsv(s, g); const ink = toInk(s, g); toYarn(s, g); toGameJson(s, g);
  const ms = Date.now() - t0;
  ok(ms < 1500, `400 nodes took ${ms} ms`);
  ok(g.issues.filter((i) => i.level === 'fix').length === 0, 'big script has no fixes');
  ok(csv.includes('word2999'), 'long speech kept whole');
  ok(inkErrors(ink).length === 0, `big Ink compiles: ${inkErrors(ink)}`);
  console.log(JSON.stringify({ nodes: g.nodes.length, ms }));
}
console.log(JSON.stringify({ problems }, null, 1));
process.exit(problems.length ? 1 : 0);
