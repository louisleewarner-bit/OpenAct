import { baseName, type El, type Script } from './model';

/** Recording line IDs (D-044): SPEAKER_001. Locked IDs (el.lineId) never change; the rest count on from the highest locked one. */
export const idKey = (name: string): string => baseName(name).replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 16) || 'LINE';

/** A bark is written "NAME: the line". */
export function splitBark(text: string): { speaker: string; line: string } {
  const m = text.match(/^\s*([^:]{1,30}?)\s*:\s*([\s\S]*)$/);
  return m ? { speaker: baseName(m[1]), line: m[2].trim() } : { speaker: '', line: text.trim() };
}

/** The speaker an element's recording line belongs to, or null when it is not a recorded line. */
export function recordedSpeaker(el: El): string | null {
  if (el.type === 'character') return baseName(el.text) || null;
  if (el.type === 'bark') return splitBark(el.text).speaker || 'BARK';
  return null;
}

export function lineIds(script: Script): Map<string, string> {
  const out = new Map<string, string>();
  const top = new Map<string, number>();
  for (const el of script.elements) {
    const sp = recordedSpeaker(el);
    const m = sp && el.lineId?.match(/_(\d+)$/);
    if (sp && m) top.set(idKey(sp), Math.max(top.get(idKey(sp)) ?? 0, Number(m[1])));
  }
  for (const el of script.elements) {
    const sp = recordedSpeaker(el);
    if (!sp) continue;
    if (el.lineId) {
      out.set(el.id, el.lineId);
      continue;
    }
    const k = idKey(sp);
    const n = (top.get(k) ?? 0) + 1;
    top.set(k, n);
    out.set(el.id, `${k}_${String(n).padStart(3, '0')}`);
  }
  return out;
}
