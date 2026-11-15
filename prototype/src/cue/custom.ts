import type { BuiltinProfileId, ElType, PaperId, ProfileId } from './model';
import { PROFILES, type ElStyle, type Profile } from './profiles';

/**
 * Imported formats (D-040). A format is a built-in format plus its own page margins and element layouts;
 * the built-in it is "based on" supplies the element list and the Enter and Tab flow. Formats live on this
 * device, and travel as a small `.openact-format.json` file.
 */
export interface CustomFormat {
  kind: 'openact-format';
  version: 1;
  /** Local key, lower-case letters, digits and hyphens. The profile id is `custom:<base>:<slug>`. */
  slug: string;
  name: string;
  blurb: string;
  base: BuiltinProfileId;
  paper?: PaperId;
  marginLeft: number;
  marginRight: number;
  styles: Partial<Record<ElType, ElStyle>>;
  /** For the writer's own reference: the file the layout was read from. */
  source?: string;
}

export const EL_TYPES: ElType[] = ['act', 'scene', 'action', 'character', 'paren', 'dialogue', 'transition', 'shot', 'lyrics', 'song', 'centered', 'endAct', 'sound', 'page', 'panel', 'caption', 'sfx', 'choice', 'bark', 'cond', 'goto', 'beat', 'lore'];
const BUILTIN: BuiltinProfileId[] = ['screenplay', 'tv-drama', 'tv-single', 'tv-multi', 'uk-sitcom', 'vertical', 'stage-uk', 'stage-us', 'musical', 'musical-us', 'panto', 'radio-uk', 'audio-us', 'comic', 'treatment', 'game'];
const KEY = 'openact-formats';
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FORMAT_BYTES = 64 * 1024;
const MAX_FORMATS = 40;

const num = (v: unknown, min: number, max: number, what: string): number => {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${what} should be a number.`);
  return Math.min(max, Math.max(min, v));
};
const text = (v: unknown, max: number, what: string, required = false): string => {
  if (v === undefined || v === null || v === '') {
    if (required) throw new Error(`${what} is missing.`);
    return '';
  }
  if (typeof v !== 'string') throw new Error(`${what} should be text.`);
  return v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
};

export function cleanStyle(raw: unknown, label: string): ElStyle {
  if (!raw || typeof raw !== 'object') throw new Error(`${label} should be a set of layout values.`);
  const r = raw as Record<string, unknown>;
  const s: ElStyle = {
    left: Math.round(num(r.left, 0, 6, `${label}: left`) * 100) / 100,
    width: Math.round(num(r.width, 10, 100, `${label}: width`)),
    before: Math.round(num(r.before ?? 0, 0, 6, `${label}: space before`)),
  };
  if (r.upper === true) s.upper = true;
  if (r.bold === true) s.bold = true;
  if (r.italic === true) s.italic = true;
  if (r.underline === true) s.underline = true;
  if (r.align === 'center' || r.align === 'right') s.align = r.align;
  if (r.hang === true) s.hang = true;
  if (r.pageBreakBefore === true) s.pageBreakBefore = true;
  if (r.lineSpacing === 2) s.lineSpacing = 2;
  return s;
}

const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'format';

/** Check an untrusted object (a format file, or a saved format) and return a clean format, or throw a plain-language error. */
export function validateFormat(raw: unknown): CustomFormat {
  if (!raw || typeof raw !== 'object') throw new Error('This isn’t an OpenAct format file.');
  const r = raw as Record<string, unknown>;
  if (r.kind !== 'openact-format') throw new Error('This isn’t an OpenAct format file.');
  if (r.version !== 1) throw new Error('This format file is from a newer version of OpenAct. Update OpenAct to read it.');
  const base = r.base as BuiltinProfileId;
  if (!BUILTIN.includes(base)) throw new Error('The format file names a built-in format OpenAct doesn’t have.');
  const stylesIn = (r.styles ?? {}) as Record<string, unknown>;
  if (typeof stylesIn !== 'object') throw new Error('The layout values are missing.');
  const styles: Partial<Record<ElType, ElStyle>> = {};
  for (const [k, v] of Object.entries(stylesIn)) {
    if (!EL_TYPES.includes(k as ElType)) continue; // unknown elements are ignored, not an error
    styles[k as ElType] = cleanStyle(v, k);
  }
  const name = text(r.name, 60, 'The name', true);
  const paper = r.paper === 'a4' || r.paper === 'letter' ? r.paper : undefined;
  const out: CustomFormat = {
    kind: 'openact-format',
    version: 1,
    slug: slugify(text(r.slug, 40, 'The key') || name),
    name,
    blurb: text(r.blurb, 160, 'The description'),
    base,
    marginLeft: Math.round(num(r.marginLeft ?? PROFILES[base].marginLeft, 0.25, 3, 'The left margin') * 100) / 100,
    marginRight: Math.round(num(r.marginRight ?? PROFILES[base].marginRight, 0.25, 3, 'The right margin') * 100) / 100,
    styles,
  };
  if (paper) out.paper = paper;
  const source = text(r.source, 120, 'The source');
  if (source) out.source = source;
  return out;
}

export function parseFormatFile(raw: string): CustomFormat {
  if (raw.length > MAX_FORMAT_BYTES) throw new Error('This file is too large to be an OpenAct format file.');
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error('This file can’t be read as an OpenAct format file.');
  }
  return validateFormat(json);
}

export const formatFileText = (d: CustomFormat): string => `${JSON.stringify(d, null, 2)}\n`;
export const formatFileName = (d: CustomFormat): string => `${d.slug}.openact-format.json`;

// ---------- the registry ----------
let list: CustomFormat[] = [];
const listeners = new Set<() => void>();

export const idOf = (d: Pick<CustomFormat, 'base' | 'slug'>): ProfileId => `custom:${d.base}:${d.slug}`;
export const customFormats = (): readonly CustomFormat[] => list;
export const customOf = (id: ProfileId): CustomFormat | undefined => list.find((d) => idOf(d) === id);
export const onCustomChange = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function buildProfile(d: CustomFormat): Profile {
  const b = PROFILES[d.base];
  return {
    ...b,
    id: idOf(d),
    name: d.name,
    blurb: d.blurb || `Based on ${b.name}.`,
    paper: d.paper ?? b.paper,
    marginLeft: d.marginLeft,
    marginRight: d.marginRight,
    styles: { ...b.styles, ...d.styles },
  };
}

const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* this device can't keep it; the format still works until the page closes */
  }
};

export function loadCustom() {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem('actone-formats');
    const arr = raw ? (JSON.parse(raw) as unknown[]) : [];
    list = [];
    for (const item of Array.isArray(arr) ? arr.slice(0, MAX_FORMATS) : []) {
      try {
        const d = validateFormat(item);
        list.push(d);
        PROFILES[idOf(d)] = buildProfile(d);
      } catch {
        /* skip a damaged entry */
      }
    }
  } catch {
    list = [];
  }
}

/** Add a format, or replace the one with the same key and base (an edit). Returns what was stored. */
export function saveFormat(d: CustomFormat, editing = false): CustomFormat {
  const clean = validateFormat(d);
  if (!editing) {
    if (list.length >= MAX_FORMATS) throw new Error(`You can keep up to ${MAX_FORMATS} formats. Delete one first.`);
    let slug = clean.slug;
    for (let i = 2; list.some((x) => x.slug === slug && x.base === clean.base); i++) slug = `${clean.slug}-${i}`;
    clean.slug = slug;
  }
  const at = list.findIndex((x) => x.slug === clean.slug && x.base === clean.base);
  if (at >= 0) list[at] = clean;
  else list.push(clean);
  PROFILES[idOf(clean)] = buildProfile(clean);
  persist();
  listeners.forEach((f) => f());
  return clean;
}

export function removeFormat(d: CustomFormat) {
  list = list.filter((x) => !(x.slug === d.slug && x.base === d.base));
  delete PROFILES[idOf(d)];
  persist();
  listeners.forEach((f) => f());
}
