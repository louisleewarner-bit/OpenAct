import { analyze, type Cond, type Game, type GNode, type Item } from './game';
import type { Script } from './model';

/**
 * Game hand-off files (D-044): a voice-over recording sheet (CSV), and the branching story as Ink, Yarn Spinner
 * or OpenAct JSON. Written from the public syntax of each; nothing is copied from either tool.
 */

// ---------- voice-over sheet ----------
const cell = (v: string) => {
  // A cell that starts with = + - @ would run as a formula when opened in a spreadsheet.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};
const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();

export const CSV_HEADER = ['line_id', 'type', 'node', 'speaker', 'text', 'delivery', 'context', 'condition', 'recorded', 'notes'];

export function toRecordingCsv(script: Script, game: Game = analyze(script)): string {
  const rows: string[][] = [CSV_HEADER];
  let choiceN = 0;
  for (const n of game.nodes) {
    let context = '';
    for (const it of n.items) {
      if (it.kind === 'context') context = oneLine(it.text);
      else if (it.kind === 'line') rows.push([it.id, 'line', n.name, it.speaker, it.text, it.delivery, context, it.guard?.text ?? '', '', it.el.note ?? '']);
      else if (it.kind === 'bark') rows.push([it.id, 'bark', n.name, it.speaker, it.text, '', context, it.guard?.text ?? '', '', it.el.note ?? '']);
      else if (it.kind === 'choice') rows.push([`PLAYER_${String(++choiceN).padStart(3, '0')}`, 'choice', n.name, 'PLAYER', it.text, '', context, it.guard?.text ?? '', '', it.el.note ?? '']);
    }
  }
  // A byte-order mark so Excel reads the file as UTF-8.
  return `\uFEFF${rows.map((r) => r.map(cell).join(',')).join('\r\n')}\r\n`;
}

// ---------- Ink ----------
const inkEsc = (s: string) => s.replace(/[\\{}|[\]#]/g, '\\$&').replace(/->/g, '\\->').replace(/<-/g, '\\<-').replace(/\/(?=[/*])/g, '\\/');
const inkCond = (c: Cond) => (c.not ? `not ${c.flag}` : c.flag);
const paras = (s: string) => s.split(/\n\n+/).map((p) => oneLine(p)).filter(Boolean);

export function toInk(script: Script, game: Game = analyze(script)): string {
  const out: string[] = [];
  out.push(`// ${oneLine(script.title.title) || 'Untitled'}: exported from OpenAct`);
  out.push('// One knot per node. GO TO becomes a divert, SET a variable, IF a condition.', '');
  game.flags.forEach((f) => out.push(`VAR ${f} = false`));
  if (game.flags.length) out.push('');
  if (game.nodes.length) out.push(`-> ${game.nodes[0].key}`, '');
  const emit = (it: Item): void => {
    switch (it.kind) {
      case 'context':
        paras(it.text).forEach((p) => out.push(`// ${p}`));
        break;
      case 'beat':
        out.push(`// QUEST BEAT: ${oneLine(it.text)}`);
        break;
      case 'lore':
        out.push(`// LORE: ${oneLine(it.text)}`);
        break;
      case 'line':
        paras(it.text).forEach((p, k) => {
          const text = `${it.speaker}: ${inkEsc(p)}`;
          const tags = k === 0 ? ` #id:${it.id}${it.delivery ? ` #delivery:${it.delivery.replace(/[^\w ]/g, '').trim().replace(/\s+/g, '_')}` : ''}` : '';
          out.push(it.guard ? `{${inkCond(it.guard)}: ${text}}${tags}` : `${text}${tags}`);
        });
        break;
      case 'bark':
        out.push(`// BARK ${it.id} ${it.speaker}: ${oneLine(it.text)}`);
        break;
      case 'set':
        out.push(`~ ${it.cond.flag} = ${it.cond.op === 'set' ? 'true' : 'false'}`);
        break;
      case 'goto':
        out.push(it.guard ? `{${inkCond(it.guard)}: -> ${it.key}}` : `-> ${it.key}`);
        break;
      case 'choice':
        out.push(`* ${it.guard ? `{${inkCond(it.guard)}} ` : ''}[${inkEsc(oneLine(it.text))}]`);
        break;
    }
  };
  game.preamble.forEach(emit);
  if (game.preamble.length) out.push('');
  for (const n of game.nodes) {
    out.push(`=== ${n.key} ===`);
    n.items.forEach(emit);
    out.push('');
  }
  return `${out.join('\n').replace(/\n+$/, '')}\n`;
}

// ---------- Yarn Spinner ----------
const yarnEsc = (s: string) => s.replace(/[\\[\]{}<>#]/g, '\\$&').replace(/\/(?=\/)/g, '\\/');
const yarnCond = (c: Cond) => (c.not ? `!$${c.flag}` : `$${c.flag}`);

export function toYarn(script: Script, game: Game = analyze(script)): string {
  const out: string[] = [];
  game.nodes.forEach((n, i) => {
    out.push(`title: ${n.key}`, '---');
    if (i === 0) game.flags.forEach((f) => out.push(`<<declare $${f} = false>>`));
    let inChoice = false;
    const pre = () => (inChoice ? '    ' : '');
    const guard = (g: Cond | undefined, s: string) => (g ? `${pre()}<<if ${yarnCond(g)}>>${s}<<endif>>` : `${pre()}${s}`);
    for (const it of n.items) {
      switch (it.kind) {
        case 'context':
          paras(it.text).forEach((p) => out.push(`${pre()}// ${p}`));
          break;
        case 'beat':
          out.push(`${pre()}// QUEST BEAT: ${oneLine(it.text)}`);
          break;
        case 'lore':
          out.push(`${pre()}// LORE: ${oneLine(it.text)}`);
          break;
        case 'line':
          paras(it.text).forEach((p, k) => out.push(guard(it.guard, `${it.speaker}: ${yarnEsc(p)}${k === 0 && it.id ? ` #line:${it.id}` : ''}`)));
          break;
        case 'bark':
          out.push(`${pre()}// BARK ${it.id} ${it.speaker}: ${oneLine(it.text)}`);
          break;
        case 'set':
          out.push(`${pre()}<<set $${it.cond.flag} to ${it.cond.op === 'set' ? 'true' : 'false'}>>`);
          break;
        case 'goto':
          out.push(guard(it.guard, it.key === 'END' ? '<<stop>>' : `<<jump ${it.key}>>`));
          break;
        case 'choice':
          out.push(`-> ${yarnEsc(oneLine(it.text))}${it.guard ? ` <<if ${yarnCond(it.guard)}>>` : ''}`);
          inChoice = true;
          break;
      }
    }
    out.push('===', '');
  });
  return `${out.join('\n').replace(/\n+$/, '')}\n`;
}

// ---------- JSON ----------
const jsonItem = (it: Item) => {
  switch (it.kind) {
    case 'line':
      return { type: 'line', id: it.id, speaker: it.speaker, delivery: it.delivery || undefined, text: it.text, if: it.guard?.text };
    case 'bark':
      return { type: 'bark', id: it.id, speaker: it.speaker, text: it.text, if: it.guard?.text };
    case 'choice':
      return { type: 'choice', text: it.text, if: it.guard?.text };
    case 'set':
      return { type: it.cond.op, flag: it.cond.flag };
    case 'goto':
      return { type: 'goto', to: it.key, if: it.guard?.text };
    default:
      return { type: it.kind, text: it.text };
  }
};

export function toGameJson(script: Script, game: Game = analyze(script)): string {
  const node = (n: GNode) => ({ key: n.key, name: n.name, items: n.items.map(jsonItem) });
  return `${JSON.stringify({ format: 'openact-game', version: 1, title: script.title.title, flags: game.flags, start: game.nodes[0]?.key ?? null, preamble: game.preamble.map(jsonItem), nodes: game.nodes.map(node) }, null, 2)}\n`;
}
