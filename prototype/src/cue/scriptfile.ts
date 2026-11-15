import { EL_TYPES } from './custom';
import type { El, Script } from './model';
import { PROFILES } from './profiles';
import { safeName } from './save';

/**
 * OpenAct script files (D-046): `.openact`, a JSON file with a version number around the script, so a script can be
 * saved, moved, backed up and opened again. Reading is strict about shape and generous about missing parts, and
 * refuses a file from a newer OpenAct rather than guessing.
 */
export const FILE_FORMAT = 'openact-script';
export const FILE_VERSION = 1;
export const MAX_SCRIPT_BYTES = 20 * 1024 * 1024;
const MAX_ELEMENTS = 100000;

export const fileNameFor = (script: Script) => `${safeName(script.title.title)}.openact`;

export function toScriptFile(script: Script): string {
  return `${JSON.stringify({ format: FILE_FORMAT, version: FILE_VERSION, saved: new Date().toISOString(), script }, null, 1)}\n`;
}

export class ScriptFileError extends Error {}

const str = (v: unknown, max = 2_000_000) => (typeof v === 'string' ? v.slice(0, max) : '');

/** Read a script file's text. Throws a ScriptFileError with a plain message when it can't be used. */
export function parseScriptFile(text: string): Script {
  if (text.length > MAX_SCRIPT_BYTES) throw new ScriptFileError('This file is too large to be a script (over 20 MB).');
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new ScriptFileError('This isn’t an OpenAct script file. It may be plain text: use “Paste a script” to bring it in.');
  }
  const r = raw as { format?: unknown; version?: unknown; script?: unknown };
  if (!r || typeof r !== 'object' || r.format !== FILE_FORMAT) throw new ScriptFileError('This isn’t an OpenAct script file.');
  if (typeof r.version !== 'number' || r.version > FILE_VERSION) throw new ScriptFileError('This file was saved by a newer OpenAct. Update OpenAct to open it.');
  const s = r.script as Partial<Script> | undefined;
  if (!s || typeof s !== 'object' || !Array.isArray(s.elements)) throw new ScriptFileError('This script file is damaged: it has no script in it.');
  if (s.elements.length > MAX_ELEMENTS) throw new ScriptFileError('This script has too many elements to open.');
  const profile = typeof s.profile === 'string' && (s.profile in PROFILES || s.profile.startsWith('custom:')) ? s.profile : 'screenplay';
  const ids = new Set<string>();
  const elements: El[] = [];
  s.elements.forEach((e, i) => {
    const x = e as Partial<El> | null;
    if (!x || typeof x !== 'object' || !EL_TYPES.includes(x.type as El['type'])) return;
    let id = str(x.id, 64) || `f${i}`;
    if (ids.has(id)) id = `${id}-${i}`;
    ids.add(id);
    const el: El = { id, type: x.type as El['type'], text: str(x.text) };
    if (x.song && typeof x.song === 'object') el.song = { singers: str(x.song.singers, 500), func: str(x.song.func, 500), staging: str(x.song.staging, 2000), feel: str(x.song.feel, 500), ...(x.song.reprise ? { reprise: true } : {}) };
    if (x.sceneType === 'full' || x.sceneType === 'cloth') el.sceneType = x.sceneType;
    if (typeof x.note === 'string' && x.note) el.note = x.note.slice(0, 20000);
    if (typeof x.lineId === 'string' && x.lineId) el.lineId = x.lineId.slice(0, 64);
    elements.push(el);
  });
  const t = (s.title ?? {}) as Record<string, unknown>;
  const out: Script = {
    title: { title: str(t.title, 500), credit: str(t.credit, 500), authors: str(t.authors, 1000), source: str(t.source, 1000), draftDate: str(t.draftDate, 200), contact: str(t.contact, 2000) },
    profile: profile as Script['profile'],
    paper: s.paper === 'letter' ? 'letter' : 'a4',
    elements,
    cast: Array.isArray(s.cast) ? s.cast.filter((c) => c && typeof c.name === 'string').slice(0, 500).map((c) => ({ name: str(c.name, 200), description: str(c.description, 2000) })) : [],
    dismissed: Array.isArray(s.dismissed) ? s.dismissed.filter((d) => typeof d === 'string').slice(0, 2000).map((d) => String(d).slice(0, 200)) : [],
  };
  if (s.review && typeof s.review === 'object') {
    const v = s.review;
    out.review = { ...(typeof v.target === 'string' ? { target: v.target.slice(0, 40) } : {}), ...(v.anonymous ? { anonymous: true } : {}), ...(Array.isArray(v.ticked) ? { ticked: v.ticked.filter((x) => typeof x === 'string').slice(0, 500).map((x) => String(x).slice(0, 100)) } : {}) };
  }
  if (!out.elements.length) out.elements.push({ id: 'f0', type: 'action', text: '' });
  return out;
}

// ---- saving to a chosen place (Chrome and Edge) or as a download (everywhere else) ----
type FileHandle = { name: string; createWritable(): Promise<{ write(d: Blob | string): Promise<void>; close(): Promise<void> }> };
type Picker = { showSaveFilePicker?: (o: unknown) => Promise<FileHandle> };

export const canPickFile = () => typeof window !== 'undefined' && typeof (window as unknown as Picker).showSaveFilePicker === 'function';

/** Ask where to save and write it. Returns the handle (to save again to the same place), or null if the writer cancelled. */
export async function saveToPicked(suggested: string, text: string): Promise<FileHandle | null> {
  const w = window as unknown as Picker;
  try {
    const handle = await w.showSaveFilePicker!({ suggestedName: suggested, types: [{ description: 'OpenAct script', accept: { 'application/json': ['.openact'] } }] });
    await writeTo(handle, text);
    return handle;
  } catch (e) {
    if ((e as { name?: string })?.name === 'AbortError') return null;
    throw e;
  }
}

export async function writeTo(handle: FileHandle, text: string) {
  const w = await handle.createWritable();
  await w.write(new Blob([text], { type: 'application/json' }));
  await w.close();
}
