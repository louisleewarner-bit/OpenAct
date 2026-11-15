import { baseName, type El, type ElType, type Script } from './model';
import type { Profile } from './profiles';

export const isEmptyEl = (el: El) => !el.text.trim() || (el.type === 'paren' && /^\(\s*\)$/.test(el.text.trim()));

/** What Enter would create after this element, mirroring the editor's own flow. */
export function nextAfter(prof: Profile, el: El, prev?: El): ElType {
  if (el.type === 'character' && prof.songs && prev && (prev.type === 'lyrics' || prev.type === 'song')) return 'lyrics';
  return prof.enter[el.type] ?? prof.blockType;
}

/**
 * The element bar's order: the likeliest choice for the writer's next step first, then the rest in the
 * format's own order. On an empty line the choice is what this line becomes; otherwise it is the line after.
 */
export function barOrder(prof: Profile, el: El | undefined, prev: El | undefined): ElType[] {
  const out: ElType[] = [];
  const push = (t: ElType | null | undefined) => {
    if (t && prof.types.includes(t) && !out.includes(t)) out.push(t);
  };
  if (!el) {
    push(prof.blockType);
  } else if (isEmptyEl(el)) {
    push(el.type);
    push(prof.tabEmpty[el.type]);
    if (prev) {
      push(nextAfter(prof, prev));
      push(prof.tab[prev.type]);
    }
    push(prof.blockType);
  } else {
    const next = nextAfter(prof, el, prev);
    push(next);
    push(prof.tab[el.type]);
    push(prof.tabEmpty[next]);
    push(prof.blockType);
  }
  prof.types.forEach(push);
  return out;
}

/** Cast names for the bar: most recent speakers before this line first, then everyone else. */
export function recentNames(script: Script, beforeId: string | null, limit = 12): string[] {
  const out: string[] = [];
  const els = script.elements;
  let i = beforeId ? els.findIndex((e) => e.id === beforeId) : els.length;
  if (i < 0) i = els.length;
  for (let j = i - 1; j >= 0 && out.length < limit; j--) {
    const e = els[j];
    if (e.type !== 'character') continue;
    const n = baseName(e.text);
    if (n && !out.includes(n)) out.push(n);
  }
  for (let j = i + 1; j < els.length && out.length < limit; j++) {
    const e = els[j];
    if (e.type !== 'character') continue;
    const n = baseName(e.text);
    if (n && !out.includes(n)) out.push(n);
  }
  for (const c of script.cast) {
    const n = c.name.trim().toUpperCase();
    if (n && !out.includes(n) && out.length < limit) out.push(n);
  }
  return out;
}

/** Desktop shortcuts follow the format's own order, so they never move. Mac: Ctrl+digit; others: Alt+digit. */
export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
export const shortcutLabel = (i: number) => (i < 9 ? `${isMac ? '⌃' : 'Alt+'}${i + 1}` : '');
export const shortcutIndex = (e: KeyboardEvent): number => {
  if (e.shiftKey || e.metaKey) return -1;
  const mod = isMac ? e.ctrlKey && !e.altKey : e.altKey && !e.ctrlKey;
  if (!mod) return -1;
  const m = e.code.match(/^Digit([1-9])$/);
  return m ? Number(m[1]) - 1 : -1;
};
