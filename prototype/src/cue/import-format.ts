import { unzipSync } from 'fflate';
import { cleanStyle, EL_TYPES, MAX_FILE_BYTES, parseFormatFile, type CustomFormat } from './custom';
import type { BuiltinProfileId, ElType, PaperId } from './model';
import { PAPERS, PROFILES, type ElStyle } from './profiles';

/**
 * Reads the page setup and element layouts from a file the writer already has: an OpenAct format file,
 * a Final Draft file or template (.fdx, .fdxt), or a Word document or template (.docx, .dotx).
 * Nothing in the file is run; only its layout numbers are read (D-040). Every read is a best effort,
 * so the result always goes through a preview the writer can correct.
 */
export interface WordStyle {
  id: string;
  name: string;
  used: number;
  /** Layout values in inches and lines, as Word states them. */
  indLeft: number;
  indRight: number;
  beforeLines: number;
  doubled: boolean;
  align?: 'center' | 'right';
  upper: boolean;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  pageBreak: boolean;
}

export interface Candidate {
  kind: 'openact' | 'fdx' | 'docx';
  fileName: string;
  name: string;
  base: BuiltinProfileId;
  paper: PaperId;
  marginLeft: number;
  marginRight: number;
  pageWidth: number;
  styles: Partial<Record<ElType, ElStyle>>;
  /** Where each element's layout came from: a Final Draft element or a Word style name. */
  from: Partial<Record<ElType, string>>;
  /** Plain-language notes shown above the preview. */
  notes: string[];
  /** Word files: every paragraph style, and which one the writer has matched to each element. */
  word?: { styles: WordStyle[]; chosen: Partial<Record<ElType, string>> };
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const r2 = (n: number) => Math.round(n * 100) / 100;

function choosePaper(w: number, h: number): { paper: PaperId; note?: string } {
  const near = (a: number, b: number) => Math.abs(a - b) < 0.12;
  if (near(w, PAPERS.a4.width) && near(h, PAPERS.a4.height)) return { paper: 'a4' };
  if (near(w, PAPERS.letter.width) && near(h, PAPERS.letter.height)) return { paper: 'letter' };
  const paper: PaperId = Math.abs(w - PAPERS.a4.width) < Math.abs(w - PAPERS.letter.width) ? 'a4' : 'letter';
  return { paper, note: `The page is ${r2(w)} by ${r2(h)} inches. OpenAct has A4 and US Letter for now, so it uses ${PAPERS[paper].name}.` };
}

function parseXml(source: string, what: string): Document {
  if (/<!ENTITY/i.test(source)) throw new Error(`This ${what} uses features OpenAct won’t read.`);
  const doc = new DOMParser().parseFromString(source, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error(`This ${what} can’t be read. It may be damaged.`);
  return doc;
}

const attr = (el: Element | null | undefined, ...names: string[]): string | null => {
  if (!el) return null;
  for (const n of names) {
    const v = el.getAttribute(n);
    if (v !== null && v !== '') return v;
  }
  return null;
};
const attrNum = (el: Element | null | undefined, ...names: string[]): number | null => {
  const v = attr(el, ...names);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const firstEl = (doc: Document | Element, ...tags: string[]): Element | null => {
  for (const t of tags) {
    const e = doc.getElementsByTagName(t)[0];
    if (e) return e;
  }
  return null;
};

// ---------- OpenAct format file ----------
function fromOpenAct(fileName: string, raw: string): Candidate {
  const d = parseFormatFile(raw);
  return {
    kind: 'openact',
    fileName,
    name: d.name,
    base: d.base,
    paper: d.paper ?? PROFILES[d.base].paper ?? 'a4',
    marginLeft: d.marginLeft,
    marginRight: d.marginRight,
    pageWidth: PAPERS[d.paper ?? PROFILES[d.base].paper ?? 'a4'].width,
    styles: d.styles,
    from: Object.fromEntries(Object.keys(d.styles).map((k) => [k, 'format file'])) as Candidate['from'],
    notes: [],
  };
}

// ---------- Final Draft (.fdx, .fdxt) ----------
const FDX_TYPES: Record<string, ElType> = {
  'scene heading': 'scene',
  action: 'action',
  character: 'character',
  parenthetical: 'paren',
  dialogue: 'dialogue',
  transition: 'transition',
  shot: 'shot',
  'new act': 'act',
  'end of act': 'endAct',
  lyric: 'lyrics',
  lyrics: 'lyrics',
};

function fromFdx(fileName: string, raw: string): Candidate {
  const doc = parseXml(raw, 'Final Draft file');
  const notes: string[] = [];
  const size = firstEl(doc, 'PageSize');
  const layout = firstEl(doc, 'PageLayout');
  const margins = firstEl(doc, 'PageMargins');
  const w = attrNum(size, 'Width') ?? attrNum(layout, 'PageWidth') ?? 8.5;
  const h = attrNum(size, 'Height') ?? attrNum(layout, 'PageHeight') ?? 11;
  const ml = attrNum(margins, 'Left') ?? attrNum(layout, 'LeftMargin') ?? 1.5;
  const mr = attrNum(margins, 'Right') ?? attrNum(layout, 'RightMargin') ?? 1;
  const paper = choosePaper(w, h);
  if (paper.note) notes.push(paper.note);
  if (!size && !layout) notes.push('The file doesn’t say its page size, so OpenAct assumed US Letter with a 1.5 inch left margin.');

  const styles: Candidate['styles'] = {};
  const from: Candidate['from'] = {};
  for (const el of Array.from(doc.getElementsByTagName('ElementSettings'))) {
    const typeName = (el.getAttribute('Type') ?? '').trim();
    const t = FDX_TYPES[typeName.toLowerCase()];
    if (!t || styles[t]) continue;
    const para = firstEl(el, 'ParagraphSpec');
    const font = firstEl(el, 'FontSpec');
    if (!para) continue;
    const left = attrNum(para, 'LeftIndent') ?? ml;
    const right = attrNum(para, 'RightIndent');
    // Final Draft states RightIndent as the position of the right edge, measured from the left of the page.
    // A value that isn't beyond the left indent is read as a gap from the right margin instead.
    const rightEdge = right !== null && right > left && right <= w + 0.01 ? right : w - mr - (right ?? 0);
    const fontStyle = (attr(font, 'Style') ?? '').toLowerCase().split('+');
    const s: ElStyle = {
      left: r2(clamp(left, 0, 6)),
      width: clamp(Math.round((rightEdge - left) * 10), 10, 100),
      before: clamp(Math.round((attrNum(para, 'SpaceBefore') ?? 0) / 12), 0, 6),
    };
    if (fontStyle.includes('allcaps')) s.upper = true;
    if (fontStyle.includes('bold')) s.bold = true;
    if (fontStyle.includes('italic')) s.italic = true;
    if (fontStyle.includes('underline')) s.underline = true;
    const al = (attr(para, 'Alignment') ?? '').toLowerCase();
    if (al === 'center') s.align = 'center';
    else if (al === 'right') s.align = 'right';
    if ((attrNum(para, 'Spacing') ?? 1) >= 2) s.lineSpacing = 2;
    if ((attr(para, 'StartsNewPage') ?? '').toLowerCase() === 'yes') s.pageBreakBefore = true;
    styles[t] = s;
    from[t] = typeName;
  }
  if (!Object.keys(styles).length) throw new Error('No element layouts were found in this file. Is it a Final Draft file or template?');
  notes.push('Final Draft measures indents from the left edge of the page. Check the preview against a page you know.');
  const hasAct = 'act' in styles || 'endAct' in styles;
  return {
    kind: 'fdx',
    fileName,
    name: fileName.replace(/\.[^.]+$/, '').slice(0, 60) || 'Imported format',
    base: hasAct ? 'tv-drama' : 'screenplay',
    paper: paper.paper,
    marginLeft: r2(clamp(ml, 0.25, 3)),
    marginRight: r2(clamp(mr, 0.25, 3)),
    pageWidth: w,
    styles,
    from,
    notes,
  };
}

// ---------- Word (.docx, .dotx) ----------
const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const wattr = (el: Element | null | undefined, name: string): string | null => {
  if (!el) return null;
  return el.getAttributeNS(W, name) ?? el.getAttribute(`w:${name}`);
};
const wnum = (el: Element | null | undefined, name: string): number | null => {
  const v = wattr(el, name);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const child = (el: Element | null | undefined, name: string): Element | null => {
  if (!el) return null;
  for (const c of Array.from(el.children)) if (c.localName === name && c.namespaceURI === W) return c;
  return null;
};
const on = (el: Element | null): boolean => !!el && !['0', 'false', 'off', 'none'].includes((wattr(el, 'val') ?? '').toLowerCase());

interface Props {
  left?: number;
  right?: number;
  before?: number;
  line?: number;
  lineRule?: string;
  jc?: string;
  pageBreak?: boolean;
  caps?: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}
function propsOf(pPr: Element | null, rPr: Element | null): Props {
  const p: Props = {};
  const ind = child(pPr, 'ind');
  if (ind) {
    p.left = wnum(ind, 'left') ?? wnum(ind, 'start') ?? undefined;
    p.right = wnum(ind, 'right') ?? wnum(ind, 'end') ?? undefined;
  }
  const sp = child(pPr, 'spacing');
  if (sp) {
    p.before = wnum(sp, 'before') ?? undefined;
    p.line = wnum(sp, 'line') ?? undefined;
    p.lineRule = wattr(sp, 'lineRule') ?? undefined;
  }
  const jc = child(pPr, 'jc');
  if (jc) p.jc = wattr(jc, 'val') ?? undefined;
  const pb = child(pPr, 'pageBreakBefore');
  if (pb) p.pageBreak = on(pb) || wattr(pb, 'val') === null;
  const caps = child(rPr, 'caps');
  if (caps) p.caps = on(caps) || wattr(caps, 'val') === null;
  const b = child(rPr, 'b');
  if (b) p.bold = on(b) || wattr(b, 'val') === null;
  const i = child(rPr, 'i');
  if (i) p.italic = on(i) || wattr(i, 'val') === null;
  const u = child(rPr, 'u');
  if (u) p.underline = on(u);
  return p;
}

const NAME_RULES: [ElType, RegExp][] = [
  ['scene', /scene\s*head|slug|^scene$|^heading\s*1$|scene\s*number/i],
  ['act', /^act\b|act\s*(head|title)|^new act/i],
  ['character', /character|speaker|^cue$|^name$/i],
  ['paren', /parenthetical|^aside|direction in speech|wryly/i],
  ['dialogue', /dialog|^speech$|^spoken|^lines?$/i],
  ['transition', /transition/i],
  ['shot', /^shot|camera/i],
  ['lyrics', /lyric|^song/i],
  ['action', /^action|stage direction|^direction|^description|^narrative|^business/i],
  ['centered', /^title$|centred|centered/i],
];

function fromDocx(fileName: string, buf: Uint8Array): Candidate {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(buf, { filter: (f) => (f.name === 'word/document.xml' || f.name === 'word/styles.xml') && f.originalSize <= 8 * 1024 * 1024 });
  } catch {
    throw new Error('This file can’t be opened as a Word document.');
  }
  const stylesRaw = files['word/styles.xml'];
  if (!stylesRaw) throw new Error('This Word file has no paragraph styles to read.');
  const dec = new TextDecoder('utf-8');
  const stylesDoc = parseXml(dec.decode(stylesRaw), 'Word file');
  const body = files['word/document.xml'] ? parseXml(dec.decode(files['word/document.xml']), 'Word file') : null;
  const notes: string[] = [];

  // Page setup comes from the last section of the document.
  let pgW = 8.5;
  let pgH = 11;
  let ml = 1;
  let mr = 1;
  let gotPage = false;
  if (body) {
    const sects = body.getElementsByTagNameNS(W, 'sectPr');
    const sect = sects[sects.length - 1] ?? null;
    const size = child(sect, 'pgSz');
    const mar = child(sect, 'pgMar');
    if (size && wnum(size, 'w') && wnum(size, 'h')) {
      pgW = wnum(size, 'w')! / 1440;
      pgH = wnum(size, 'h')! / 1440;
      gotPage = true;
    }
    if (mar) {
      ml = (wnum(mar, 'left') ?? 1440) / 1440;
      mr = (wnum(mar, 'right') ?? 1440) / 1440;
    }
  }
  if (!gotPage) notes.push('This file doesn’t state its page size (templates often don’t). OpenAct assumed US Letter with 1 inch margins; set them below.');
  const paper = choosePaper(pgW, pgH);
  if (paper.note && gotPage) notes.push(paper.note);

  // Paragraph styles, with inheritance.
  const raw = new Map<string, { id: string; name: string; basedOn?: string; isDefault: boolean; props: Props }>();
  let defaultId = '';
  const docDefaults = stylesDoc.getElementsByTagNameNS(W, 'docDefaults')[0] ?? null;
  const baseProps = propsOf(child(child(docDefaults, 'pPrDefault'), 'pPr'), child(child(docDefaults, 'rPrDefault'), 'rPr'));
  for (const st of Array.from(stylesDoc.getElementsByTagNameNS(W, 'style'))) {
    if (wattr(st, 'type') !== 'paragraph') continue;
    const id = wattr(st, 'styleId');
    if (!id) continue;
    const isDefault = wattr(st, 'default') === '1';
    if (isDefault) defaultId = id;
    raw.set(id, { id, name: wattr(child(st, 'name'), 'val') ?? id, basedOn: wattr(child(st, 'basedOn'), 'val') ?? undefined, isDefault, props: propsOf(child(st, 'pPr'), child(st, 'rPr')) });
  }
  const resolve = (id: string, depth = 0): Props => {
    const s = raw.get(id);
    if (!s) return { ...baseProps };
    const parent = s.basedOn && depth < 8 ? resolve(s.basedOn, depth + 1) : { ...baseProps };
    return { ...parent, ...Object.fromEntries(Object.entries(s.props).filter(([, v]) => v !== undefined)) };
  };
  const used = new Map<string, number>();
  if (body) {
    for (const p of Array.from(body.getElementsByTagNameNS(W, 'p'))) {
      const id = wattr(child(child(p, 'pPr'), 'pStyle'), 'val') ?? defaultId;
      used.set(id, (used.get(id) ?? 0) + 1);
    }
  }
  const styles: WordStyle[] = [];
  for (const s of raw.values()) {
    const p = resolve(s.id);
    styles.push({
      id: s.id,
      name: s.name,
      used: used.get(s.id) ?? 0,
      indLeft: r2((p.left ?? 0) / 1440),
      indRight: r2((p.right ?? 0) / 1440),
      beforeLines: clamp(Math.round((p.before ?? 0) / 20 / 12), 0, 6),
      doubled: p.lineRule === 'auto' && (p.line ?? 240) >= 420,
      align: p.jc === 'center' ? 'center' : p.jc === 'right' || p.jc === 'end' ? 'right' : undefined,
      upper: !!p.caps,
      bold: !!p.bold,
      italic: !!p.italic,
      underline: !!p.underline,
      pageBreak: !!p.pageBreak,
    });
  }
  // Show styles the document uses first, then the rest alphabetically.
  styles.sort((a, b) => b.used - a.used || a.name.localeCompare(b.name));
  if (!styles.length) throw new Error('This Word file has no paragraph styles to read.');

  const chosen: Record<string, string> = {};
  for (const [t, rx] of NAME_RULES) {
    const hit = styles.find((s) => rx.test(s.name.trim()));
    if (hit) chosen[t] = hit.id;
  }
  const names = styles.map((s) => s.name).join(' ');
  const base: BuiltinProfileId = /scene\s*head|slug/i.test(names) ? 'screenplay' : /stage|speaker|^act/im.test(names) ? 'stage-uk' : 'screenplay';

  const cand: Candidate = {
    kind: 'docx',
    fileName,
    name: fileName.replace(/\.[^.]+$/, '').slice(0, 60) || 'Imported format',
    base,
    paper: paper.paper,
    marginLeft: r2(clamp(ml, 0.25, 3)),
    marginRight: r2(clamp(mr, 0.25, 3)),
    pageWidth: pgW,
    styles: {},
    from: {},
    notes,
    word: { styles, chosen },
  };
  return applyWord(cand);
}

/** Recompute the element layouts of a Word candidate from the styles the writer has matched. */
export function applyWord(c: Candidate): Candidate {
  if (!c.word) return c;
  const out: Candidate = { ...c, styles: {}, from: {} };
  for (const t of EL_TYPES) {
    const id = c.word.chosen[t];
    const ws = id ? c.word.styles.find((s) => s.id === id) : undefined;
    if (!ws) continue;
    const left = c.marginLeft + ws.indLeft;
    const rightEdge = c.pageWidth - c.marginRight - ws.indRight;
    const s: ElStyle = { left: r2(clamp(left, 0, 6)), width: clamp(Math.round((rightEdge - left) * 10), 10, 100), before: ws.beforeLines };
    if (ws.upper) s.upper = true;
    if (ws.bold) s.bold = true;
    if (ws.italic) s.italic = true;
    if (ws.underline) s.underline = true;
    if (ws.align) s.align = ws.align;
    if (ws.doubled) s.lineSpacing = 2;
    if (ws.pageBreak) s.pageBreakBefore = true;
    out.styles[t] = s;
    out.from[t] = ws.name;
  }
  return out;
}

// ---------- entry point ----------
export async function readFormatFile(file: File): Promise<Candidate> {
  if (file.size > MAX_FILE_BYTES) throw new Error('This file is larger than 5 MB, which is too big for a format file.');
  const name = file.name;
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (ext === 'json' || name.toLowerCase().endsWith('.openact-format')) return fromOpenAct(name, await file.text());
  if (ext === 'fdx' || ext === 'fdxt') return fromFdx(name, await file.text());
  if (ext === 'docx' || ext === 'dotx') return fromDocx(name, new Uint8Array(await file.arrayBuffer()));
  if (ext === 'doc' || ext === 'dot') throw new Error('Older Word files (.doc, .dot) can’t be read. In Word, choose Save As and pick .docx or .dotx.');
  throw new Error('OpenAct can read OpenAct format files (.json), Final Draft files (.fdx, .fdxt) and Word files (.docx, .dotx).');
}

/** Pasted format-file text (an OpenAct format file). */
export const readFormatText = (text: string): Candidate => fromOpenAct('pasted text', text);

/** Turn a reviewed candidate into a format to store. */
export function toFormat(c: Candidate, slug = ''): CustomFormat {
  const styles: CustomFormat['styles'] = {};
  for (const [k, v] of Object.entries(c.styles)) styles[k as ElType] = cleanStyle(v, k);
  return {
    kind: 'openact-format',
    version: 1,
    slug,
    name: c.name.trim() || 'Imported format',
    blurb: `Based on ${PROFILES[c.base].name}${c.kind === 'openact' ? '' : `, from ${c.fileName}`}.`.slice(0, 160),
    base: c.base,
    paper: c.paper,
    marginLeft: c.marginLeft,
    marginRight: c.marginRight,
    styles,
    source: c.kind === 'openact' ? undefined : c.fileName,
  };
}
