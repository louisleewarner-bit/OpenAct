// Writes THIRD-PARTY-NOTICES.txt for the preview: every runtime dependency of prototype/ and its own dependencies, with licence and
// licence text. Usage: node release/notices.cjs <out file>
const fs = require('fs'), path = require('path');
const proto = path.join(__dirname, '..', 'prototype');
const root = JSON.parse(fs.readFileSync(path.join(proto, 'package.json'), 'utf8'));
const skip = new Set(Object.keys(root.alias || {})); // aliased away in the build (jsPDF's optional extras)
const seen = new Map();
function find(name, from) {
  for (let dir = from; ; dir = path.dirname(dir)) {
    const p = path.join(dir, 'node_modules', name, 'package.json');
    if (fs.existsSync(p)) return fs.realpathSync(path.dirname(p));
    if (dir === path.dirname(dir)) return null;
  }
}
function visit(name, from) {
  if (skip.has(name)) return;
  const dir = find(name, from); if (!dir) return;
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  const key = `${pkg.name}@${pkg.version}`; if (seen.has(key)) return;
  const file = fs.readdirSync(dir).find((f) => /^(licen[cs]e|copying)(\.|$)/i.test(f));
  seen.set(key, { name: pkg.name, version: pkg.version, license: typeof pkg.license === 'string' ? pkg.license : pkg.license?.type ?? (pkg.licenses || []).map((l) => l.type).join(' OR '), repo: typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url ?? pkg.homepage ?? '', text: file ? fs.readFileSync(path.join(dir, file), 'utf8').trim() : '' });
  for (const dep of Object.keys({ ...pkg.dependencies, ...pkg.optionalDependencies })) visit(dep, dir);
}
for (const dep of Object.keys(root.dependencies)) visit(dep, proto);
const list = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
let out = `OpenAct: third-party notices\n\nOpenAct is free software under the GNU General Public License, version 3 or later (see LICENSE). It includes the open-source software and fonts below,\neach under its own licence. The list is generated from the packages the app is built from; ${list.length} packages.\n\n`;
out += 'FONTS\n=====\nCourier Prime (SIL Open Font License 1.1): the script page, and embedded in exported PDF and Word files. Copyright 2015 The Courier Prime Project Authors.\nAtkinson Hyperlegible Next (SIL Open Font License 1.1): the app interface. Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors.\nThe licence texts are in the licenses folder (OFL-Courier-Prime.txt, OFL-Atkinson-Hyperlegible-Next.txt).\n\n';
out += 'SOFTWARE\n========\n';
for (const p of list) out += `\n${p.name} ${p.version}  [${p.license || 'licence not stated'}]${p.repo ? `\n${p.repo.replace(/^git\+/, '')}` : ''}\n${p.text ? '\n' + p.text + '\n' : '(No licence file in the package; the licence named above applies.)\n'}\n${'-'.repeat(72)}\n`;
fs.writeFileSync(process.argv[2], out);
const counts = {}; list.forEach((p) => (counts[p.license] = (counts[p.license] || 0) + 1));
console.log(list.length, 'packages', JSON.stringify(counts));
