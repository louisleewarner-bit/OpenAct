import { baseName, type El, type Script } from './model';
import type { Profile } from './profiles';

export interface Suggestion {
  label: string;
  replace: string;
  /** Keep the list open after accepting (for example a scene prefix, before the location). */
  chain?: boolean;
}

const PREFIXES = ['INT.', 'EXT.', 'INT./EXT.', 'EST.', 'I/E.'];
const TIMES = ['DAY', 'NIGHT', 'MORNING', 'EVENING', 'CONTINUOUS', 'LATER', 'MOMENTS LATER'];
const SCREEN_TRANSITIONS = ['CUT TO:', 'DISSOLVE TO:', 'SMASH CUT TO:', 'MATCH CUT TO:', 'FADE OUT.', 'FADE TO BLACK.'];
const STAGE_TRANSITIONS = ['BLACKOUT.', 'CURTAIN.', 'LIGHTS FADE.', 'TABS IN.', 'TABS OUT.'];
const EXTENSIONS = ['V.O.', 'O.S.', 'O.C.', "CONT'D"];

export const autocompleteTypes = new Set(['character', 'scene', 'transition']);

export function characterNames(script: Script, exceptId?: string): string[] {
  const count = new Map<string, number>();
  for (const c of script.cast) count.set(c.name.toUpperCase(), (count.get(c.name.toUpperCase()) ?? 0) + 1);
  for (const el of script.elements) {
    if (el.type !== 'character' || el.id === exceptId) continue;
    const n = baseName(el.text);
    if (n) count.set(n, (count.get(n) ?? 0) + 2);
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n);
}

export function suggestions(script: Script, el: El, prof: Profile): Suggestion[] {
  const up = el.text.toUpperCase();
  if (el.type === 'character') {
    const ext = up.match(/^(.*\()([^)]*)$/);
    if (ext && !prof.stage) {
      return EXTENSIONS.filter((x) => x.startsWith(ext[2].trim())).map((x) => ({ label: x, replace: `${ext[1]}${x})` }));
    }
    return characterNames(script, el.id)
      .filter((n) => n.startsWith(up.trim()) && n !== up.trim())
      .slice(0, 6)
      .map((n) => ({ label: n, replace: n }));
  }
  if (el.type === 'scene' && !prof.stage) {
    if (!/\s/.test(up)) {
      return PREFIXES.filter((p) => p.startsWith(up) && p !== up).map((p) => ({ label: p, replace: `${p} `, chain: true }));
    }
    const m = up.match(/^(INT\.\/EXT\.|INT\.|EXT\.|EST\.|I\/E\.)\s+(.*)$/);
    if (m && !m[2].includes(' - ')) {
      const locs = new Set<string>();
      for (const s of script.elements) {
        if (s.type !== 'scene' || s.id === el.id) continue;
        const sm = s.text.toUpperCase().match(/^(?:INT\.\/EXT\.|INT\.|EXT\.|EST\.|I\/E\.)\s+(.*?)(?:\s+-\s+.*)?$/);
        if (sm?.[1]) locs.add(sm[1]);
      }
      return [...locs]
        .filter((l) => l.startsWith(m[2]) && l !== m[2])
        .slice(0, 6)
        .map((l) => ({ label: l, replace: `${m[1]} ${l} - `, chain: true }));
    }
    const dash = up.lastIndexOf(' - ');
    if (dash > 0) {
      const head = up.slice(0, dash);
      const time = up.slice(dash + 3);
      return TIMES.filter((t) => t.startsWith(time) && t !== time).map((t) => ({ label: t, replace: `${head} - ${t}` }));
    }
    return [];
  }
  if (el.type === 'transition') {
    const list = prof.stage ? STAGE_TRANSITIONS : SCREEN_TRANSITIONS;
    return list.filter((t) => t.startsWith(up) && t !== up).map((t) => ({ label: t, replace: t }));
  }
  return [];
}
