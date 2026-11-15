import { baseName, type El, type Script } from './model';
import { wrapLines, type Layout } from './layout';
import { baseId, PROFILES, profileOf, styleOf, type Profile } from './profiles';
import { castInfo, outline, sceneWarnings } from './derive';
import { analyze } from './game';
import { defaultTarget, TARGETS, type Target, type TargetId } from './review-data';

/**
 * "Ready to submit?": checks for the things that drift while a script is developed and that the
 * formatting engine can't guarantee, such as length, the title page, anonymity, leftovers, character
 * names and spec conventions. Pure functions over the script and its layout, so the real app can lift
 * this file into packages/review unchanged.
 */

export type Status = 'fix' | 'consider' | 'pass' | 'info';
export type Section = 'Length' | 'Title page' | 'Anonymity' | 'Left over from drafting' | 'Characters' | 'Spec conventions' | 'Structure' | 'Comics' | 'Game' | 'File' | 'Language';

export interface Place {
  id: string;
  page: number;
  text: string;
}

export type FixAction = 'remove-date' | 'anonymous-on' | 'add-to-cast';

export interface Fix {
  label: string;
  action: FixAction;
  arg?: string;
}

export interface Result {
  id: string;
  section: Section;
  status: Status;
  title: string;
  detail?: string;
  places?: Place[];
  fixes?: Fix[];
  why: string;
  sources: string[];
}

export interface Report {
  target: Target;
  /** False when the target is meant for another kind of script. */
  suits: boolean;
  results: Result[];
  dismissed: Result[];
  counts: { fix: number; consider: number; pass: number };
}

interface Ctx {
  script: Script;
  lay: Layout;
  prof: Profile;
  target: Target;
  anonymous: boolean;
}

const MAX_PLACES = 12;
const GROUP_CUES = new Set(['ALL', 'BOTH', 'CHORUS', 'EVERYONE', 'CROWD', 'OTHERS', 'TOGETHER', 'KIDS', 'COMPANY', 'AUDIENCE', 'VOICES', 'ENSEMBLE']);

const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const snippet = (s: string, at = 0, len = 64) => {
  const start = Math.max(0, at - 18);
  const out = s.slice(start, start + len).trim();
  return (start > 0 ? '…' : '') + out + (start + len < s.length ? '…' : '');
};

function place(c: Ctx, el: El, at = 0): Place {
  return { id: el.id, page: (c.lay.pageOfEl.get(el.id) ?? 0) + 1, text: snippet(el.text, at) || `(empty ${el.type})` };
}

/** Lower-case a format name but keep TV, UK and US in capitals. */
const lower = (s: string) => s.toLowerCase().replace(/\b(tv|uk|us)\b/g, (m) => m.toUpperCase());
const isScreen = (p: Profile) => p.group === 'Film' || p.group === 'Television';
const suits = (t: Target, p: Profile) => t.suits.includes(p.group) || t.suits.includes(p.id);

function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// ---------- Length ----------

interface LengthRule {
  unit: 'pages' | 'minutes';
  min?: number;
  max?: number;
  hard: boolean;
  label: string;
  sources: string[];
}

/** Austin Film Festival 2026: approximate page ranges by category. */
const AFF_PAGES: Partial<Record<string, [number, number]>> = { screenplay: [90, 120], 'tv-single': [22, 40], 'tv-drama': [45, 70], 'tv-multi': [52, 58] };

const SPEC_PAGES: Partial<Record<string, [number, number, string[]]>> = {
  screenplay: [90, 120, ['fd-length', 'sb-length']],
  'tv-drama': [45, 65, ['sb-tv']],
  'tv-single': [28, 35, ['sb-tv']],
  'tv-multi': [40, 55, ['sb-tv', 'scriptmag-pilots']],
};

function lengthRule(c: Ctx): LengthRule | null {
  const { target: t, prof: p } = c;
  if (t.id === 'nicholl' && p.id === 'screenplay') return { unit: 'pages', min: 80, max: 125, hard: true, label: 'The 2026–27 Nicholl rules require 80 to 125 pages, not counting the title page.', sources: ['nicholl-2026', 'nicholl-faq-2024'] };
  if (t.id === 'aff') {
    const r = AFF_PAGES[p.id];
    if (r) return { unit: 'pages', min: r[0], max: r[1], hard: false, label: `AFF’s 2026 rules suggest about ${r[0]} to ${r[1]} pages for this kind of script, and don’t disqualify on length alone.`, sources: ['aff-rules-2026', 'aff-faq-2026'] };
  }
  if (t.id === 'bbc' && p.group !== 'Comics' && p.group !== 'Documents') return { unit: 'pages', min: 30, hard: true, label: 'BBC open calls ask for at least 30 pages, not counting the title and character pages.', sources: ['bbc-scriptie-2025', 'bbc-celtx', 'bbc-nawe-2025'] };
  if (t.id === 'bruntwood') return { unit: 'minutes', min: 60, hard: false, label: 'The 2025 prize took plays of more than an hour of playing time, written for the stage.', sources: ['bruntwood-enter'] };
  if (t.id === 'uk-theatre') return { unit: 'pages', min: 50, hard: false, label: 'The Royal Court suggests about 50 pages for a full-length play (25 to 30 for a monologue).', sources: ['royal-court-submit'] };
  if (t.id === 'comics') return { unit: 'pages', min: 20, max: 24, hard: false, label: 'A US single issue usually has 20 to 24 story pages (22 is the classic count).', sources: ['comixtribe-pages'] };
  if (t.id === 'radio') return { unit: 'minutes', min: 44, max: 45, hard: false, label: 'Radio 4’s afternoon slot takes plays of about 45 minutes.', sources: ['radio4-slot'] };
  if (t.spec) {
    const r = SPEC_PAGES[p.id];
    if (r) return { unit: 'pages', min: r[0], max: r[1], hard: false, label: `Most ${lower(p.name)} specs run ${r[0]} to ${r[1]} pages.`, sources: r[2] };
  }
  return null;
}

/** Comic pages are PAGE elements, not printed sheets. */
const countPages = (c: Ctx) => (c.prof.comic ? c.script.elements.filter((e) => e.type === 'page').length : c.lay.pages.length);

/** Radio: spoken words at 150 to 180 a minute. Elsewhere: the rough one-page-a-minute guide. */
function minutesRange(c: Ctx): [number, number] {
  if (c.prof.group === 'Audio') {
    const spoken = c.script.elements.filter((e) => e.type === 'dialogue' || e.type === 'lyrics').reduce((n, e) => n + words(e.text), 0);
    return [Math.round(spoken / 180), Math.round(spoken / 150)];
  }
  const pages = c.lay.pages.length;
  return [pages, pages];
}

function checkLength(c: Ctx): Result[] {
  const rule = lengthRule(c);
  const pages = countPages(c);
  const [lo, hi] = minutesRange(c);
  const about = lo === hi ? `about ${lo} minutes` : `about ${lo} to ${hi} minutes`;
  const pageText = `${pages} ${c.prof.comic ? 'story page' : 'page'}${pages === 1 ? '' : 's'}`;
  if (!rule) {
    return [{ id: 'length', section: 'Length', status: 'info', title: c.prof.group === 'Audio' || c.prof.stage ? `${pageText}, ${about}` : pageText, detail: c.prof.group === 'Audio' ? 'Estimated from the spoken words at 150 to 180 words a minute. Time a read-aloud to be sure.' : c.prof.stage ? 'A rough guide only: a page of a play runs about a minute, but pace varies.' : undefined, why: 'There is no single length rule for this kind of submission, so OpenAct only reports the count.', sources: c.prof.group === 'Audio' ? ['wpm', 'bcg-timing'] : ['ja-minute'] }];
  }
  const value = rule.unit === 'pages' ? pages : null;
  let status: Status = 'pass';
  let title: string;
  if (value !== null) {
    if ((rule.min && value < rule.min) || (rule.max && value > rule.max)) status = rule.hard ? 'fix' : 'consider';
    title = status === 'pass' ? `${pageText}: inside the range` : `${pageText}: ${rule.min && value < rule.min ? 'shorter' : 'longer'} than ${rule.hard ? 'allowed' : 'usual'}`;
  } else {
    const short = rule.min !== undefined && hi < rule.min;
    const long = rule.max !== undefined && lo > rule.max;
    if (short || long) status = 'consider';
    title = status === 'pass' ? `Running time ${about}: about right` : `Running time ${about}: probably too ${short ? 'short' : 'long'}`;
  }
  return [{ id: 'length', section: 'Length', status, title, detail: rule.unit === 'minutes' ? `${rule.label} This is an estimate: ${c.prof.group === 'Audio' ? 'spoken words at 150 to 180 a minute' : 'about a page a minute'}.` : rule.label, why: rule.hard ? 'Entries outside the limits can be turned away unread.' : 'Readers judge length before they read a word; a script far outside the usual range looks unfinished or overwritten.', sources: rule.unit === 'minutes' && c.prof.group === 'Audio' ? [...rule.sources, 'wpm', 'bcg-timing'] : rule.sources }];
}

// ---------- Title page ----------

function checkTitlePage(c: Ctx): Result[] {
  const t = c.script.title;
  const out: Result[] = [];
  out.push(t.title.trim()
    ? { id: 'title', section: 'Title page', status: 'pass', title: 'The title page has a title', why: 'Every submission is filed by its title.', sources: ['celtx-title'] }
    : { id: 'title', section: 'Title page', status: 'fix', title: 'The title page has no title', detail: 'Add one in the title page details.', why: 'Every submission is filed by its title.', sources: ['celtx-title'] });

  if (!c.target.blind) {
    out.push(t.authors.trim()
      ? { id: 'writer', section: 'Title page', status: 'pass', title: 'Your name is on the title page', why: 'Readers need to know whose script it is.', sources: ['celtx-title', 'srp-title'] }
      : { id: 'writer', section: 'Title page', status: 'fix', title: 'Your name isn’t on the title page', why: 'Readers need to know whose script it is.', sources: ['celtx-title', 'srp-title'] });
    const needContact = c.target.id === 'spec';
    out.push(t.contact.trim()
      ? { id: 'contact', section: 'Title page', status: 'pass', title: 'Contact details are on the title page', why: 'An agent or producer who likes the script needs to reach you, or your representative.', sources: ['srp-title', 'celtx-title'] }
      : { id: 'contact', section: 'Title page', status: needContact ? 'fix' : 'consider', title: 'No contact details on the title page', detail: 'Put an email address (or your agent’s details) at the bottom left.', why: 'An agent or producer who likes the script needs to reach you, or your representative.', sources: ['srp-title', 'celtx-title'] });
  }

  if (c.target.spec && (isScreen(c.prof) || c.prof.group === 'Audio')) {
    if (t.draftDate.trim())
      out.push({ id: 'date', section: 'Title page', status: 'consider', title: 'The title page shows a draft date', detail: `“${snippet(t.draftDate, 0, 40)}”`, fixes: [{ label: 'Remove the date', action: 'remove-date' }], why: 'A spec script can sit with readers for months, and a date makes it look old. Draft dates belong to scripts written on commission.', sources: ['fd-title'] });
    else out.push({ id: 'date', section: 'Title page', status: 'pass', title: 'No draft date on the title page', why: 'Draft dates belong to scripts written on commission.', sources: ['fd-title'] });
  }

  // Screen specs only; the date check above already covers the draft-date field.
  const fields = c.target.spec ? [t.title, t.credit, t.source].join('\n') : '';
  const draftWord = fields.match(/\b(first|second|third|final|shooting|revised|polish)\s+draft\b|\bdraft\s*(no\.?\s*)?\d+\b|\brevis(ed|ion)\b|\bv\d+(\.\d+)?\b/i);
  if (draftWord) out.push({ id: 'draft-label', section: 'Title page', status: 'consider', title: `The title page says “${draftWord[0]}”`, detail: 'Leave draft labels off a script you are sending out.', why: 'Labels such as “First Draft” or a draft number tell a reader the script is unfinished, or has been passed on before.', sources: ['srp-title', 'celtx-title'] });

  const reg = [t.credit, t.contact, t.source, t.draftDate].join('\n').match(/\bWGA\b|writers guild|\bregistered\b|\bregistration\b|copyright|©|\(c\)/i);
  if (reg) {
    const ok = c.target.id === 'nicholl';
    out.push({ id: 'registration', section: 'Title page', status: ok ? 'pass' : 'consider', title: ok ? 'A registration notice is allowed here' : `The title page carries a registration or copyright notice (“${reg[0]}”)`, detail: ok ? 'The Nicholl allows a WGA or US Copyright Office number but doesn’t require one.' : 'Readers expect it off the page; keep your registration records instead.', why: 'A registration number has no legal effect on the title page and can read as nervousness about theft. Sources differ: Final Draft’s own guides disagree, and the Nicholl allows one.', sources: ok ? ['nicholl-2026'] : ['fd-title', 'fd-title-format', 'nicholl-2026'] });
  }
  return out;
}

// ---------- Anonymity (blind reads) ----------

function writerNames(c: Ctx): string[] {
  return c.script.title.authors.split(/,|&|\band\b|\n/i).map((s) => s.trim()).filter((s) => s.length >= 3);
}

function contactBits(c: Ctx): string[] {
  const s = c.script.title.contact;
  const email = s.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? [];
  const phone = s.match(/\+?\d[\d\s()-]{7,}\d/g) ?? [];
  return [...email, ...phone.map((p) => p.trim())];
}

function checkAnonymity(c: Ctx): Result[] {
  if (!c.target.blind) return [];
  const t = c.script.title;
  const out: Result[] = [];
  const named = Boolean(t.authors.trim() || t.contact.trim());
  const sources = c.target.id === 'nicholl' ? ['nicholl-2026'] : c.target.id === 'aff' ? ['aff-rules-2026', 'aff-faq-2026'] : c.target.id === 'bruntwood' ? ['bruntwood-anon', 'bruntwood-layout'] : ['bbc-scriptie-2025', 'bbc-pss'];
  if (c.anonymous || !named)
    out.push({ id: 'anon-title', section: 'Anonymity', status: 'pass', title: c.anonymous ? 'Exports will be anonymous: the title page shows the title only' : 'The title page carries no name or contact details', why: 'This competition reads scripts blind. Your name and contact details go on the entry form, not the script.', sources });
  else
    out.push({ id: 'anon-title', section: 'Anonymity', status: 'fix', title: 'Your name or contact details are on the title page', detail: 'Turn on the anonymous copy: exports then show the title only, and your own copy keeps your details.', fixes: [{ label: 'Make exports anonymous', action: 'anonymous-on' }], why: 'This competition reads scripts blind. Your name and contact details go on the entry form, not the script.', sources });

  const needles = [...writerNames(c), ...contactBits(c)];
  const hits: Place[] = [];
  if (needles.length) {
    const re = new RegExp(needles.map(esc).join('|'), 'i');
    for (const el of c.script.elements) {
      const m = re.exec(el.text);
      if (m) hits.push(place(c, el, m.index));
    }
  }
  out.push(hits.length
    ? { id: 'anon-body', section: 'Anonymity', status: 'fix', title: `Your name or contact details appear in the script (${hits.length})`, detail: 'Readers see every page, not just the title page.', places: hits.slice(0, MAX_PLACES), why: 'A name anywhere in the file breaks a blind read, and some competitions disqualify for it.', sources }
    : { id: 'anon-body', section: 'Anonymity', status: 'pass', title: needles.length ? 'Your name doesn’t appear in the script’s pages' : 'No writer name to look for (none on the title page)', why: 'A name anywhere in the file breaks a blind read.', sources });

  out.push(c.anonymous || !named
    ? { id: 'anon-file', section: 'Anonymity', status: 'pass', title: 'The file name and PDF properties won’t name you', detail: 'OpenAct names the file after the title and leaves the PDF’s author field empty.', why: 'PDF files carry an author field that readers can see in their viewer’s document properties.', sources: ['blind-metadata'] }
    : { id: 'anon-file', section: 'Anonymity', status: 'fix', title: 'The PDF’s author field would carry your name', detail: 'An anonymous copy leaves it empty.', fixes: [{ label: 'Make exports anonymous', action: 'anonymous-on' }], why: 'PDF files carry an author field that readers can see in their viewer’s document properties.', sources: ['blind-metadata'] });
  return out;
}

// ---------- Left over from drafting ----------

const PLACEHOLDER = /\bTK(TK)*\b|\bTBD\b|\bTBC\b|\bTODO\b|\bFIXME\b|\bX{3,}\b|\?{3,}|\[[^\]\n]{0,40}\]|<<[^>\n]{0,40}>>|\blorem ipsum\b/;

function checkLeftovers(c: Ctx): Result[] {
  const out: Result[] = [];
  const els = c.script.elements;

  const ph: Place[] = [];
  for (const el of els) {
    const m = PLACEHOLDER.exec(el.text);
    if (m) ph.push(place(c, el, m.index));
  }
  out.push(ph.length
    ? { id: 'placeholders', section: 'Left over from drafting', status: 'fix', title: `Placeholders left in the text (${ph.length})`, detail: 'TK, TBD, XXX, ??? or text in [brackets].', places: ph.slice(0, MAX_PLACES), why: 'Writers mark gaps with TK (“to come”) and similar tags so they stand out. Any that remain show the script isn’t finished.', sources: ['tk'] }
    : { id: 'placeholders', section: 'Left over from drafting', status: 'pass', title: 'No placeholders such as TK, TBD or XXX', why: 'Gaps marked to fill later must all be filled.', sources: ['tk'] });

  const notes = els.filter((e) => e.note?.trim());
  out.push(notes.length
    ? { id: 'notes', section: 'Left over from drafting', status: 'consider', title: `${notes.length} note${notes.length === 1 ? '' : 's'} still open`, detail: 'Notes never print, but each may mark unfinished work.', places: notes.slice(0, MAX_PLACES).map((e) => ({ ...place(c, e), text: `Note: ${snippet(e.note!, 0, 56)}` })), why: 'A last pass over your own notes catches the fixes you meant to make.', sources: ['house'] }
    : { id: 'notes', section: 'Left over from drafting', status: 'pass', title: 'No open notes', why: 'A last pass over your own notes catches the fixes you meant to make.', sources: ['house'] });

  const empty: Place[] = [];
  els.forEach((el, i) => {
    const last = i === els.length - 1;
    const next = els[i + 1];
    const blank = !el.text.trim();
    if (blank && !last && ['scene', 'character', 'dialogue', 'paren', 'transition', 'act', 'song', 'panel', 'lyrics', 'caption'].includes(el.type)) empty.push(place(c, el));
    else if (el.type === 'character' && !blank && (!next || !['dialogue', 'paren', 'lyrics'].includes(next.type))) empty.push({ ...place(c, el), text: `${el.text}: a cue with no speech` });
  });
  out.push(empty.length
    ? { id: 'empty', section: 'Left over from drafting', status: 'fix', title: `Empty or unfinished elements (${empty.length})`, places: empty.slice(0, MAX_PLACES), why: 'Moving and cutting scenes leaves stray cues and empty headings that print as gaps.', sources: ['house'] }
    : { id: 'empty', section: 'Left over from drafting', status: 'pass', title: 'No empty headings, cues or speeches', why: 'Moving and cutting scenes leaves stray cues and empty headings.', sources: ['house'] });

  if (c.target.spec && isScreen(c.prof)) {
    const omitted = els.filter((e) => e.type === 'scene' && /\bOMITTED\b/i.test(e.text));
    if (omitted.length) out.push({ id: 'omitted', section: 'Left over from drafting', status: 'fix', title: `“OMITTED” scenes left in (${omitted.length})`, places: omitted.map((e) => place(c, e)), why: 'OMITTED marks and locked scene numbers belong to production drafts, not spec scripts.', sources: ['celtx-shooting', 'sb-shooting'] });
  }
  return out;
}

// ---------- Characters ----------

function checkCharacters(c: Ctx): Result[] {
  const out: Result[] = [];
  const info = castInfo(c.script);
  const els = c.script.elements;
  const speaking = info.filter((i) => i.speeches > 0 && !GROUP_CUES.has(i.name));

  // Name variants: "DR. JONES" and "DR JONES", "JON" and "JOHN", "NELL" and "NELL HARPER".
  const names = [...new Set(info.map((i) => i.name).filter((n) => n && !GROUP_CUES.has(n)))];
  const pairs: string[] = [];
  for (let i = 0; i < names.length; i++)
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i];
      const b = names[j];
      const na = a.replace(/[^A-Z0-9]/g, '');
      const nb = b.replace(/[^A-Z0-9]/g, '');
      const firstWord = a.split(/\s+/)[0] === b || b.split(/\s+/)[0] === a;
      const close = Math.min(na.length, nb.length) >= 3 && Math.max(na.length, nb.length) >= 4 && editDistance(na, nb) === 1;
      if (na === nb || firstWord || close) pairs.push(`${a} / ${b}`);
    }
  const firstCue = (n: string) => els.find((e) => e.type === 'character' && baseName(e.text) === n);
  out.push(pairs.length
    ? { id: 'variants', section: 'Characters', status: 'consider', title: `Names that may be the same character (${pairs.length})`, detail: pairs.slice(0, 8).join(' · '), places: pairs.slice(0, 8).flatMap((p) => p.split(' / ').map(firstCue).filter((e): e is El => Boolean(e)).map((e) => place(c, e))), why: 'Renaming a character mid-draft often leaves the old name in a few cues. One name per character keeps readers (and the cast list) straight.', sources: ['writersstore-cues', 'scriptmag-names'] }
    : { id: 'variants', section: 'Characters', status: 'pass', title: 'Each character has one name', why: 'One name per character keeps readers straight.', sources: ['writersstore-cues'] });

  // First appearance in capitals (screen formats).
  if (isScreen(c.prof)) {
    const issues: Place[] = [];
    for (const ch of speaking) {
      const ci = els.findIndex((e) => e.type === 'character' && baseName(e.text) === ch.name);
      if (ci < 0) continue;
      const re = new RegExp(`\\b${esc(ch.name)}\\b`, 'i');
      let found = false;
      for (let i = 0; i < ci && !found; i++) {
        const el = els[i];
        if (el.type !== 'action') continue;
        const m = re.exec(el.text);
        if (!m) continue;
        found = true;
        if (m[0] !== m[0].toUpperCase()) issues.push({ ...place(c, el, m.index), text: `${ch.name}: first mentioned as “${m[0]}”, not in capitals` });
      }
      if (!found) issues.push({ ...place(c, els[ci]), text: `${ch.name}: speaks before being introduced in the action` });
    }
    out.push(issues.length
      ? { id: 'intros', section: 'Characters', status: 'consider', title: `Introductions to check (${issues.length})`, detail: 'Write a character’s name in capitals the first time they appear, usually with an age.', places: issues.slice(0, MAX_PLACES), why: 'Reordering scenes moves first appearances. The capitalised introduction tells readers (and casting) who matters, and must sit at the new first appearance.', sources: ['fd-caps', 'sb-intros'] }
      : { id: 'intros', section: 'Characters', status: 'pass', title: 'Speaking characters are introduced in capitals', why: 'The capitalised introduction must sit at the first appearance.', sources: ['fd-caps', 'sb-intros'] });
  }

  // Cast list (stage formats).
  if (c.prof.group === 'Theatre') {
    const missing = info.filter((i) => !i.listed && i.speeches > 0 && !GROUP_CUES.has(i.name));
    const silent = info.filter((i) => i.listed && i.speeches === 0);
    out.push(missing.length
      ? { id: 'cast-list', section: 'Characters', status: 'fix', title: `Speaking characters missing from the cast list (${missing.length})`, detail: missing.map((m) => m.name).join(', '), places: missing.slice(0, MAX_PLACES).map((m) => firstCue(m.name)).filter((e): e is El => Boolean(e)).map((e) => place(c, e)), fixes: missing.slice(0, 4).map((m) => ({ label: `Add ${m.name}`, action: 'add-to-cast' as const, arg: m.name })), why: 'Theatres ask for the complete cast of characters, and a casting director reads the list first.', sources: ['writers-theatre', 'walnut-street'] }
      : { id: 'cast-list', section: 'Characters', status: 'pass', title: 'Everyone who speaks is in the cast list', why: 'Theatres ask for the complete cast of characters.', sources: ['writers-theatre'] });
    if (silent.length) out.push({ id: 'cast-silent', section: 'Characters', status: 'consider', title: `In the cast list but never speak (${silent.length})`, detail: `${silent.map((s) => s.name).join(', ')}. Fine for silent roles; otherwise, a cut character left behind.`, why: 'Cutting a character from the scenes often leaves them in the list.', sources: ['house'] });
    if (!c.target.blind) {
      const bare = c.script.cast.filter((e) => !e.description.trim());
      out.push(bare.length
        ? { id: 'breakdown', section: 'Characters', status: 'consider', title: `Cast list entries without a description (${bare.length})`, detail: `${bare.map((b) => b.name.toUpperCase()).join(', ')}. Add an age and a line about each.`, why: 'Theatres plan casting from the breakdown, and some ask how many roles are female, male or any gender.', sources: ['writers-theatre'] }
        : { id: 'breakdown', section: 'Characters', status: 'pass', title: 'Every cast list entry has a description', why: 'Theatres plan casting from the breakdown.', sources: ['writers-theatre'] });
    }
  }

  // Audio: names that sound alike.
  if (c.prof.group === 'Audio') {
    const leads = speaking.filter((s) => s.speeches >= 2).map((s) => s.name);
    const alike: string[] = [];
    for (let i = 0; i < leads.length; i++)
      for (let j = i + 1; j < leads.length; j++) {
        const a = leads[i];
        const b = leads[j];
        if (a[0] === b[0] || (a.length >= 4 && b.length >= 4 && (editDistance(a, b) <= 2 || a.slice(-3) === b.slice(-3)))) alike.push(`${a} / ${b}`);
      }
    out.push(alike.length
      ? { id: 'sound-alike', section: 'Characters', status: 'consider', title: `Names a listener might confuse (${alike.length})`, detail: `${alike.slice(0, 8).join(' · ')}. Shared first letters and rhymes blur on the radio.`, why: 'Listeners can’t see who is speaking. Names that start or end alike are easy to mix up by ear.', sources: ['scriptmag-names'] }
      : { id: 'sound-alike', section: 'Characters', status: 'pass', title: 'Main characters’ names sound distinct', why: 'Listeners can’t see who is speaking.', sources: ['scriptmag-names'] });
  }
  return out;
}

// ---------- Spec conventions (screen) ----------

const CAMERA = /\b(CLOSE ON|CLOSE[- ]UP|EXTREME CLOSE|ANGLE ON|WIDE SHOT|WIDE ON|MEDIUM SHOT|TWO SHOT|TRACKING SHOT|DOLLY|CRANE (UP|DOWN|SHOT)|ZOOM( IN| OUT)?|PUSH IN|PULL BACK|PAN (TO|ACROSS|UP|DOWN)|POV)\b|\b(the )?camera\b/i;
const WE_SEE = /\bwe (see|hear|watch|follow|find|notice|reveal|move|pan|track|push|pull|cut)\b/i;

function checkSpecStyle(c: Ctx): Result[] {
  if (!c.target.spec || !isScreen(c.prof)) return [];
  const out: Result[] = [];
  const els = c.script.elements;

  const cam: Place[] = [];
  for (const el of els) {
    if (el.type === 'shot') cam.push(place(c, el));
    else if (el.type === 'action') {
      const m = CAMERA.exec(el.text);
      if (m) cam.push(place(c, el, m.index));
    }
  }
  out.push(cam.length
    ? { id: 'camera', section: 'Spec conventions', status: 'consider', title: `Camera directions (${cam.length})`, detail: 'Keep only the ones the story can’t do without.', places: cam.slice(0, MAX_PLACES), why: 'Readers frown on camera directions in a spec: shots are the director’s job, and the action lines can imply them. Some writers disagree when a shot is essential.', sources: ['scriptmag-camera', 'filmthreat-avoid'] }
    : { id: 'camera', section: 'Spec conventions', status: 'pass', title: 'No camera directions', why: 'Shots are the director’s job.', sources: ['scriptmag-camera'] });

  const see: Place[] = [];
  for (const el of els) {
    if (el.type !== 'action') continue;
    const m = WE_SEE.exec(el.text);
    if (m) see.push(place(c, el, m.index));
  }
  out.push(see.length
    ? { id: 'we-see', section: 'Spec conventions', status: 'consider', title: `“We see” and “we hear” (${see.length})`, detail: 'Describe what happens instead.', places: see.slice(0, MAX_PLACES), why: 'Everything in the action is what the audience sees and hears, so “we see” is padding. A few writers use it on purpose in the opening pages.', sources: ['cs-wesee'] }
    : { id: 'we-see', section: 'Spec conventions', status: 'pass', title: 'No “we see” or “we hear”', why: '“We see” is padding.', sources: ['cs-wesee'] });

  const scenes = els.filter((e) => e.type === 'scene').length;
  const cuts = els.filter((e) => e.type === 'transition' && /^CUT TO/i.test(e.text.trim()));
  out.push(cuts.length >= 3 && cuts.length > scenes / 3
    ? { id: 'cut-to', section: 'Spec conventions', status: 'consider', title: `CUT TO: before ${cuts.length} of ${scenes} scenes`, detail: 'A new scene heading already implies the cut.', places: cuts.slice(0, MAX_PLACES).map((e) => place(c, e)), why: 'Putting CUT TO: between every scene is the commonest transition mistake; keep transitions for moments that need them.', sources: ['fd-transitions', 'scriptmag-drformat'] }
    : { id: 'cut-to', section: 'Spec conventions', status: 'pass', title: 'Transitions used sparingly', why: 'Keep transitions for moments that need them.', sources: ['fd-transitions'] });

  const width = styleOf(c.prof, 'action')?.width ?? 60;
  const long = els.filter((e) => e.type === 'action' && wrapLines(e.text, width) > 4);
  out.push(long.length
    ? { id: 'long-action', section: 'Spec conventions', status: 'consider', title: `Action paragraphs over four lines (${long.length})`, detail: 'Break them into one beat per paragraph.', places: long.slice(0, MAX_PLACES).map((e) => place(c, e)), why: 'White space keeps a script fast to read. Guides put the ceiling at three or four lines.', sources: ['filmdaft-action', 'scriptmag-action'] }
    : { id: 'long-action', section: 'Spec conventions', status: 'pass', title: 'Action paragraphs are four lines or fewer', why: 'White space keeps a script fast to read.', sources: ['filmdaft-action'] });

  const speeches = els.filter((e) => e.type === 'character').length;
  const parens = els.filter((e) => e.type === 'paren');
  const wordy = parens.filter((e) => words(e.text) > 8);
  const heavy = speeches >= 8 && parens.length / speeches > 0.25;
  out.push(heavy || wordy.length
    ? { id: 'parens', section: 'Spec conventions', status: 'consider', title: heavy ? `Parentheticals in ${Math.round((parens.length / speeches) * 100)}% of speeches` : `Long parentheticals (${wordy.length})`, detail: 'Keep them for delivery that the line can’t carry; put actions in the action.', places: (wordy.length ? wordy : parens).slice(0, MAX_PLACES).map((e) => place(c, e)), why: 'Readers flag overused parentheticals, and action written inside them.', sources: ['scribophile-mistakes', 'scriptmag-drformat'] }
    : { id: 'parens', section: 'Spec conventions', status: 'pass', title: 'Parentheticals used lightly', why: 'Readers flag overused parentheticals.', sources: ['scribophile-mistakes'] });

  if (baseId(c.prof.id) !== 'vertical') {
    const bad = els.filter((e) => e.type === 'scene' && e.text.trim() && (!/^(INT|EXT|EST|I\/E|INT\.?\/EXT|EXT\.?\/INT)[.\s]/i.test(e.text.trim()) || !/\s[-–—]\s*\S/.test(e.text)));
    out.push(bad.length
      ? { id: 'sluglines', section: 'Spec conventions', status: 'consider', title: `Scene headings without INT./EXT. or a time of day (${bad.length})`, places: bad.slice(0, MAX_PLACES).map((e) => place(c, e)), why: 'Each heading says inside or outside, where, and when, so the reader (and later the schedule) can follow.', sources: ['celtx-shooting'] }
      : { id: 'sluglines', section: 'Spec conventions', status: 'pass', title: 'Scene headings say INT./EXT., where and when', why: 'Each heading says inside or outside, where, and when.', sources: ['celtx-shooting'] });
  }
  return out;
}

// ---------- Structure ----------

const NUM_WORDS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];
const actNumber = (s: string) => {
  const m = s.toUpperCase().match(/\bACT\s+([A-Z]+|\d+)\b/);
  if (!m) return null;
  const n = NUM_WORDS.indexOf(m[1]);
  return n >= 0 ? n : Number.isFinite(Number(m[1])) ? Number(m[1]) : null;
};

function checkStructure(c: Ctx): Result[] {
  const out: Result[] = [];
  const els = c.script.elements;

  if (c.prof.types.includes('endAct')) {
    const problems: Place[] = [];
    let open: El | null = null;
    let expect = 1;
    for (const el of els) {
      if (el.type === 'act') {
        if (open) problems.push({ ...place(c, open), text: `${open.text || 'An act'} has no END OF line before the next act` });
        const n = actNumber(el.text);
        if (n !== null) {
          if (n !== expect) problems.push({ ...place(c, el), text: `${el.text}: expected ACT ${NUM_WORDS[expect] ?? expect}` });
          expect = n + 1;
        }
        open = el;
      } else if (el.type === 'endAct') {
        if (!open) problems.push({ ...place(c, el), text: `${el.text || 'END OF ACT'} with no act open` });
        else if (!/\bEND OF (THE )?(EPISODE|SHOW|PILOT)\b|\bTHE END\b/i.test(el.text)) {
          const a = open.text.toUpperCase().replace(/^ACT\s+/, '').trim();
          if (a && !el.text.toUpperCase().includes(a)) problems.push({ ...place(c, el), text: `“${el.text}” closes “${open.text}”` });
        }
        open = null;
      }
    }
    if (open) problems.push({ ...place(c, open), text: `${open.text || 'The last act'} has no END OF line` });
    if (els.some((e) => e.type === 'act'))
      out.push(problems.length
        ? { id: 'acts', section: 'Structure', status: 'fix', title: `Act headings out of step (${problems.length})`, detail: 'Each act needs its heading in order and a matching END OF line.', places: problems.slice(0, MAX_PLACES), why: 'Moving scenes between acts leaves numbering gaps and END OF ACT lines that no longer match. Readers use the act breaks to judge structure.', sources: ['fd-tv-structure'] }
        : { id: 'acts', section: 'Structure', status: 'pass', title: 'Acts are in order and each one ends', why: 'Readers use the act breaks to judge structure.', sources: ['fd-tv-structure'] });
  }

  if (c.prof.songs) {
    const songs = els.map((e, i) => ({ e, i })).filter(({ e }) => e.type === 'song');
    const issues: Place[] = [];
    for (const { e, i } of songs) {
      const end = els.findIndex((x, k) => k > i && (x.type === 'song' || x.type === 'scene' || x.type === 'act'));
      const body = els.slice(i + 1, end < 0 ? undefined : end);
      if (!body.some((x) => x.type === 'lyrics' && x.text.trim())) issues.push({ ...place(c, e), text: `${e.text || 'Untitled song'}: no lyrics yet` });
      if (!e.song?.singers.trim()) issues.push({ ...place(c, e), text: `${e.text || 'Untitled song'}: singers not named` });
      if (c.target.id === 'musical-dev' && !e.song?.func.trim()) issues.push({ ...place(c, e), text: `${e.text || 'Untitled song'}: what the song does isn’t noted` });
    }
    if (songs.length)
      out.push(issues.length
        ? { id: 'songs', section: 'Structure', status: issues.some((p) => p.text.endsWith('no lyrics yet')) ? 'fix' : 'consider', title: `Songs to finish (${issues.length})`, places: issues.slice(0, MAX_PLACES), why: 'Programmes read the song list with each song’s place and function, and a song with no lyrics reads as a gap.', sources: ['village-musicals'] }
        : { id: 'songs', section: 'Structure', status: 'pass', title: 'Every song has lyrics and singers', why: 'Programmes read the song list with each song’s place and function.', sources: ['village-musicals'] });
  }

  if (c.prof.sceneTypes) {
    const warn = sceneWarnings(c.script, outline(c.script, c.lay));
    out.push(warn.length
      ? { id: 'scene-types', section: 'Structure', status: 'consider', title: `Full-stage scenes back to back (${warn.length})`, detail: 'A front-cloth scene between them covers the set change.', places: warn.map((w) => ({ ...place(c, c.script.elements.find((e) => e.id === w.afterId)!) })), why: 'Pantomime alternates full-stage and front-cloth scenes so sets can change behind the cloth.', sources: ['skill-stage'] }
      : { id: 'scene-types', section: 'Structure', status: 'pass', title: 'Full-stage and front-cloth scenes alternate', why: 'Sets change behind the cloth.', sources: ['skill-stage'] });
  }
  return out;
}

// ---------- Comics ----------

function checkComics(c: Ctx): Result[] {
  if (!c.prof.comic) return [];
  const out: Result[] = [];
  const els = c.script.elements;
  const crowded: Place[] = [];
  const wordyBalloon: Place[] = [];
  const wordyPanel: Place[] = [];
  let pageEl: El | null = null;
  let panels = 0;
  let panelEl: El | null = null;
  let panelWords = 0;
  const closePanel = () => {
    if (panelEl && panelWords > 50) wordyPanel.push({ ...place(c, panelEl), text: `${panelWords} words in one panel` });
    panelEl = null;
    panelWords = 0;
  };
  const closePage = () => {
    closePanel();
    if (pageEl && panels > 6) crowded.push({ ...place(c, pageEl), text: `${panels} panels on one page` });
    panels = 0;
  };
  for (const el of els) {
    if (el.type === 'page') {
      closePage();
      pageEl = el;
    } else if (el.type === 'panel') {
      closePanel();
      panelEl = el;
      panels++;
    } else if (el.type === 'dialogue' || el.type === 'caption') {
      const n = words(el.text);
      panelWords += n;
      if (n > 25) wordyBalloon.push({ ...place(c, el), text: `${n} words: ${snippet(el.text, 0, 40)}` });
    }
  }
  closePage();
  out.push(wordyBalloon.length
    ? { id: 'balloon-words', section: 'Comics', status: 'consider', title: `Balloons or captions over 25 words (${wordyBalloon.length})`, places: wordyBalloon.slice(0, MAX_PLACES), why: 'Dark Horse’s script guide limits captions and dialogue to about 25 words a balloon, so the art has room.', sources: ['dh-guide'] }
    : { id: 'balloon-words', section: 'Comics', status: 'pass', title: 'Balloons and captions are 25 words or fewer', why: 'Dark Horse’s guide limits balloons to about 25 words.', sources: ['dh-guide'] });
  out.push(wordyPanel.length
    ? { id: 'panel-words', section: 'Comics', status: 'consider', title: `Panels with over 50 words (${wordyPanel.length})`, places: wordyPanel.slice(0, MAX_PLACES), why: 'The same guide caps a panel at about 50 words in all.', sources: ['dh-guide'] }
    : { id: 'panel-words', section: 'Comics', status: 'pass', title: 'Panels carry 50 words or fewer', why: 'The guide caps a panel at about 50 words.', sources: ['dh-guide'] });
  out.push(crowded.length
    ? { id: 'panels', section: 'Comics', status: 'consider', title: `Pages with more than six panels (${crowded.length})`, detail: 'The guide suggests three or four panels a page for action; quieter pages can hold more.', places: crowded, why: 'Crowded pages shrink the art and slow the read.', sources: ['dh-guide'] }
    : { id: 'panels', section: 'Comics', status: 'pass', title: 'No page has more than six panels', why: 'Crowded pages shrink the art.', sources: ['dh-guide'] });
  return out;
}

// ---------- Video game ----------

function checkGame(c: Ctx): Result[] {
  if (!c.prof.game) return [];
  const g = analyze(c.script);
  const out: Result[] = [];
  const els = c.script.elements;
  const at = (id: string, text: string): Place => {
    const el = els.find((e) => e.id === id);
    return el ? { ...place(c, el), text } : { id, page: 1, text };
  };
  const fix = g.issues.filter((i) => i.level === 'fix');
  const consider = g.issues.filter((i) => i.level === 'consider');
  out.push(fix.length
    ? { id: 'game-joins', section: 'Game', status: 'fix', title: `Broken jumps or duplicate names (${fix.length})`, places: fix.slice(0, MAX_PLACES).map((i) => at(i.id, i.text)), why: 'A jump to a node that does not exist stops the story in the engine, and two nodes with one name cannot both be reached.', sources: ['house'] }
    : { id: 'game-joins', section: 'Game', status: 'pass', title: g.nodes.length ? `Every jump lands on a node (${g.nodes.length} nodes)` : 'No nodes yet', why: 'A jump to a node that does not exist stops the story in the engine.', sources: ['house'] });
  out.push(consider.length
    ? { id: 'game-flow', section: 'Game', status: 'consider', title: `Dead ends, unreached nodes or unset flags (${consider.length})`, places: consider.slice(0, MAX_PLACES).map((i) => at(i.id, i.text)), detail: 'The Branches tab lists each one.', why: 'These are usually mistakes, though a node that is meant to end the game is fine. End it with GO TO END.', sources: ['house'] }
    : { id: 'game-flow', section: 'Game', status: 'pass', title: 'Every node has a way out, can be reached, and every flag checked is set', why: 'Dead ends and unreachable nodes are the usual branching mistakes.', sources: ['house'] });
  const long: Place[] = [];
  let spoken = 0;
  let lines = 0;
  for (const el of els) {
    if (el.type === 'dialogue' || el.type === 'bark' || el.type === 'choice') {
      const n = words(el.type === 'bark' ? el.text.replace(/^[^:]*:/, '') : el.text);
      spoken += n;
      if (el.type !== 'choice') lines++;
      if (n > 40 && el.type !== 'choice') long.push({ ...place(c, el), text: `${n} words: ${snippet(el.text, 0, 40)}` });
    }
  }
  out.push(long.length
    ? { id: 'game-long', section: 'Game', status: 'consider', title: `Lines over 40 words (${long.length})`, places: long.slice(0, MAX_PLACES), detail: 'Long lines are costly to record, hard to subtitle and easy to talk over in play. Splitting them gives the player a pause.', why: 'A common studio rule of thumb, not a standard: shorter lines are cheaper to record and easier to localise.', sources: ['house'] }
    : { id: 'game-long', section: 'Game', status: 'pass', title: 'No spoken line runs over 40 words', why: 'Short lines are cheaper to record and easier to localise (a rule of thumb, not a standard).', sources: ['house'] });
  const unlocked = els.filter((e) => (e.type === 'character' || e.type === 'bark') && !e.lineId).length;
  out.push(unlocked
    ? { id: 'game-ids', section: 'Game', status: 'consider', title: `${unlocked} line ID${unlocked === 1 ? ' is' : 's are'} not locked yet`, detail: 'Lock them in the Branches tab before the first recording session, so a recorded file never loses its name when lines move.', why: 'Until they are locked, IDs follow script order and change when you insert or reorder lines.', sources: ['house'] }
    : { id: 'game-ids', section: 'Game', status: 'pass', title: 'Every recording line ID is locked', why: 'Locked IDs never change, so recorded files keep their names.', sources: ['house'] });
  out.push({ id: 'game-size', section: 'Game', status: 'info', title: `${lines} spoken line${lines === 1 ? '' : 's'} and barks, about ${spoken} words`, detail: 'A voice actor records roughly 150 to 180 words a minute of finished speech; studio sessions need retakes on top.', why: 'A quick size for a recording quote.', sources: ['wpm'] });
  return out;
}

// ---------- File and language ----------

function checkFile(c: Ctx): Result[] {
  const out: Result[] = [];
  if (['nicholl', 'aff', 'bbc', 'bruntwood'].includes(c.target.id))
    out.push({ id: 'pdf', section: 'File', status: 'pass', title: 'OpenAct exports one PDF in 12-point Courier Prime, fonts embedded, pages numbered top right', detail: 'Export it from the Export button.', why: 'These calls take a single file in standard format; the Nicholl and Austin name 12-point Courier.', sources: c.target.id === 'nicholl' ? ['nicholl-2026'] : c.target.id === 'bbc' ? ['bbc-open-call', 'bbc-nawe-drama'] : c.target.id === 'bruntwood' ? ['bruntwood-layout'] : ['aff-rules-2026'] });
  out.push({ id: 'spelling', section: 'Language', status: 'info', title: 'Spelling and grammar: not checked yet (coming in version 3)', detail: 'Until then, read it aloud, or turn on your browser’s spell check. Its basic mode keeps your text on your device; Chrome’s enhanced mode sends it to Google.', why: 'Readers stop trusting a script after a few typos.', sources: ['chrome-spell'] });
  return out;
}

// ---------- Report ----------

export function review(script: Script, lay: Layout, targetId?: string, anonymous?: boolean): Report {
  const prof = profileOf(script.profile);
  const target = TARGETS[(targetId as TargetId) in TARGETS ? (targetId as TargetId) : defaultTarget(script.profile)];
  const c: Ctx = { script, lay, prof, target, anonymous: Boolean(anonymous) };
  const all: Result[] = [];
  const fits = suits(target, prof);
  if (!fits) {
    const hard = target.id === 'nicholl' || target.id === 'bruntwood';
    all.push({ id: 'target-format', section: 'Length', status: hard ? 'fix' : 'consider', title: `${target.name} is for ${target.suits.map((s) => (s in PROFILES ? PROFILES[s as keyof typeof PROFILES].name.toLowerCase() + 's' : String(s).toLowerCase())).join(', ')}`, detail: `This script is a ${lower(prof.name)}.`, why: 'Entries in the wrong format are turned away.', sources: target.id === 'nicholl' ? ['nicholl-2026'] : target.id === 'bruntwood' ? ['bruntwood-anon'] : ['house'] });
  }
  if (target.id === 'bruntwood' && (baseId(prof.id) === 'musical' || baseId(prof.id) === 'musical-us' || baseId(prof.id) === 'panto'))
    all.push({ id: 'bruntwood-musical', section: 'Length', status: 'fix', title: `Bruntwood doesn’t take ${baseId(prof.id) === 'panto' ? 'pantomimes' : 'musicals'}`, detail: 'The prize takes original plays; musicals, pantomimes, translations and adaptations are excluded.', why: 'Entries outside the rules are turned away.', sources: ['bruntwood-anon'] });
  all.push(...checkLength(c), ...checkTitlePage(c), ...checkAnonymity(c), ...checkLeftovers(c), ...checkCharacters(c), ...checkSpecStyle(c), ...checkStructure(c), ...checkComics(c), ...checkGame(c), ...checkFile(c));

  const isDismissed = (r: Result) => r.status === 'consider' && script.dismissed.includes(`review:${r.id}`);
  const results = all.filter((r) => !isDismissed(r));
  const dismissed = all.filter(isDismissed);
  const count = (s: Status) => results.filter((r) => r.status === s).length;
  return { target, suits: fits, results, dismissed, counts: { fix: count('fix'), consider: count('consider'), pass: count('pass') } };
}
