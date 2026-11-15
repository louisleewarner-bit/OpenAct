import { baseName, type El, type Script } from './model';
import { lineIds, splitBark } from './lineid';

/**
 * Video game scripts (D-044). A script is a set of nodes (scene headings) joined by GO TO lines. This reads that
 * structure once, for the branch map, the checks and the exports (voice-over sheet, Ink, Yarn Spinner, JSON).
 */

export type Cond = { op: 'if' | 'set' | 'clear'; flag: string; not: boolean; text: string };

export type Item =
  | { kind: 'context'; text: string; el: El }
  | { kind: 'beat'; text: string; el: El }
  | { kind: 'lore'; text: string; el: El }
  | { kind: 'line'; id: string; speaker: string; delivery: string; text: string; guard?: Cond; el: El }
  | { kind: 'bark'; id: string; speaker: string; text: string; guard?: Cond; el: El }
  | { kind: 'choice'; text: string; guard?: Cond; el: El }
  | { kind: 'set'; cond: Cond; el: El }
  | { kind: 'goto'; target: string; key: string; guard?: Cond; el: El };

export interface GNode {
  id: string;
  name: string;
  key: string;
  items: Item[];
  /** Nodes this one can lead to (by key), in the order written. END is not a node. */
  exits: { key: string; target: string; ok: boolean; id: string }[];
  lines: number;
  barks: number;
  choices: number;
  reachable: boolean;
}

export interface GameIssue {
  key: string;
  level: 'fix' | 'consider';
  text: string;
  id: string;
}

export interface Game {
  nodes: GNode[];
  flags: string[];
  issues: GameIssue[];
  /** Lines before the first node (a quest beat at the top, say). */
  preamble: Item[];
}

/** A node's name as a safe identifier: "Net loft" becomes "net_loft". */
export const nodeKey = (name: string): string => {
  const k = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return k ? (/^[0-9]/.test(k) ? `n_${k}` : k) : 'node';
};
export const isEnd = (target: string) => /^\s*(end|the end|exit)\s*$/i.test(target);

export function parseCond(text: string): Cond | null {
  const m = text.trim().match(/^(if|set|clear)\s+(not\s+|!\s*)?([A-Za-z_][\w ]*?)\s*$/i);
  if (!m) return null;
  return { op: m[1].toLowerCase() as Cond['op'], flag: m[3].trim().toLowerCase().replace(/\s+/g, '_'), not: !!m[2], text: text.trim() };
}

export function analyze(script: Script): Game {
  const ids = lineIds(script);
  const nodes: GNode[] = [];
  const preamble: Item[] = [];
  let cur: GNode | null = null;
  let pending: Cond | undefined;
  const issues: GameIssue[] = [];
  const els = script.elements;
  const push = (it: Item) => (cur ? cur.items.push(it) : preamble.push(it));
  const take = () => {
    const g = pending;
    pending = undefined;
    return g;
  };
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    const text = el.text.trim();
    switch (el.type) {
      case 'scene':
        cur = { id: el.id, name: text || 'Untitled node', key: nodeKey(text), items: [], exits: [], lines: 0, barks: 0, choices: 0, reachable: false };
        nodes.push(cur);
        pending = undefined;
        break;
      case 'action':
        push({ kind: 'context', text, el });
        break;
      case 'beat':
        push({ kind: 'beat', text, el });
        break;
      case 'lore':
        push({ kind: 'lore', text, el });
        break;
      case 'character': {
        let delivery = '';
        const body: string[] = [];
        let j = i + 1;
        for (; j < els.length; j++) {
          const n = els[j];
          if (n.type === 'paren') delivery = n.text.trim().replace(/^\(\s*/, '').replace(/\s*\)$/, '');
          else if (n.type === 'dialogue') body.push(n.text.trim());
          else break;
        }
        i = j - 1;
        push({ kind: 'line', id: ids.get(el.id) ?? '', speaker: baseName(el.text), delivery, text: body.join('\n\n'), guard: take(), el });
        if (cur) cur.lines++;
        break;
      }
      case 'bark': {
        const b = splitBark(el.text);
        push({ kind: 'bark', id: ids.get(el.id) ?? '', speaker: b.speaker, text: b.line, guard: take(), el });
        if (cur) cur.barks++;
        break;
      }
      case 'choice':
        push({ kind: 'choice', text, guard: take(), el });
        if (cur) cur.choices++;
        break;
      case 'cond': {
        const c = parseCond(text);
        if (!c) {
          issues.push({ key: `cond:${el.id}`, level: 'consider', id: el.id, text: `“${text || 'empty'}” isn’t a condition OpenAct can export. Write IF name, IF NOT name, SET name or CLEAR name.` });
        } else if (c.op === 'if') pending = c;
        else push({ kind: 'set', cond: c, el });
        break;
      }
      case 'goto': {
        const key = isEnd(text) ? 'END' : nodeKey(text);
        push({ kind: 'goto', target: text, key, guard: take(), el });
        break;
      }
      default:
        break;
    }
  }
  const byKey = new Map<string, GNode>();
  for (const n of nodes) {
    if (byKey.has(n.key)) issues.push({ key: `dupnode:${n.id}`, level: 'fix', id: n.id, text: `Two nodes are both called “${n.name}”. Jumps can only find one of them.` });
    else byKey.set(n.key, n);
  }
  for (const n of nodes) {
    for (const it of n.items) {
      if (it.kind !== 'goto') continue;
      const ok = it.key === 'END' || byKey.has(it.key);
      if (!ok) issues.push({ key: `badgoto:${it.el.id}`, level: 'fix', id: it.el.id, text: it.target ? `GO TO “${it.target}” leads to a node that doesn’t exist.` : 'A GO TO line is empty.' });
      if (it.key !== 'END') n.exits.push({ key: it.key, target: it.target, ok, id: it.el.id });
    }
  }
  // Reachability from the first node.
  if (nodes.length) {
    const seen = new Set<string>([nodes[0].key]);
    const todo = [nodes[0]];
    while (todo.length) {
      const n = todo.pop()!;
      for (const x of n.exits) {
        const t = byKey.get(x.key);
        if (t && !seen.has(t.key)) {
          seen.add(t.key);
          todo.push(t);
        }
      }
    }
    for (const n of nodes) n.reachable = seen.has(n.key);
  }
  for (const n of nodes) {
    if (!n.reachable) issues.push({ key: `unreached:${n.id}`, level: 'consider', id: n.id, text: `Nothing leads to “${n.name}”, so a player can never get there.` });
    const gotos = n.items.filter((x) => x.kind === 'goto');
    const last = n.items[n.items.length - 1];
    if (!gotos.length) issues.push({ key: `noexit:${n.id}`, level: 'consider', id: n.id, text: `“${n.name}” has no way out. End it with GO TO another node, or GO TO END.` });
    else if (last && last.kind !== 'goto' && !n.items.some((x) => x.kind === 'choice')) issues.push({ key: `trail:${n.id}`, level: 'consider', id: n.id, text: `“${n.name}” carries on after its last GO TO, and that text can never play.` });
    // A choice that does nothing: no reply and no jump before the next choice.
    const its = n.items;
    its.forEach((it, k) => {
      if (it.kind !== 'choice') return;
      let j = k + 1;
      let any = false;
      for (; j < its.length && its[j].kind !== 'choice'; j++) {
        if (its[j].kind === 'line' || its[j].kind === 'goto' || its[j].kind === 'set') any = true;
      }
      if (!any) issues.push({ key: `emptychoice:${it.el.id}`, level: 'consider', id: it.el.id, text: `The choice “${it.text.slice(0, 40)}” has no reply and no GO TO.` });
    });
  }
  // Flags: read but never set.
  const set = new Set<string>();
  const read = new Map<string, string>();
  const all = [...preamble, ...nodes.flatMap((n) => n.items)];
  for (const it of all) {
    if (it.kind === 'set') set.add(it.cond.flag);
    if ('guard' in it && it.guard) if (!read.has(it.guard.flag)) read.set(it.guard.flag, it.el.id);
  }
  for (const [f, id] of read) if (!set.has(f)) issues.push({ key: `flag:${f}`, level: 'consider', id, text: `IF ${f} is checked but nothing ever sets it.` });
  // Locked line IDs used twice.
  const seenIds = new Map<string, string>();
  for (const el of els) {
    if (!el.lineId) continue;
    const prev = seenIds.get(el.lineId);
    if (prev) issues.push({ key: `dupid:${el.id}`, level: 'fix', id: el.id, text: `Line ID ${el.lineId} is used twice. A recording file can only belong to one line.` });
    else seenIds.set(el.lineId, el.id);
  }
  if (!nodes.length) issues.push({ key: 'nonodes', level: 'consider', id: els[0]?.id ?? '', text: 'No nodes yet. A node is a scene heading; GO TO lines join them.' });
  const flags = [...new Set([...set, ...read.keys()])].sort();
  return { nodes, flags, issues, preamble };
}
