import type { ElType, Script } from './model';
import { decor, numbering } from './layout';
import { profileOf, type Profile } from './profiles';

/**
 * Fountain export using OpenAct's conventions for stage extras (to be settled in an ADR):
 * acts are centred lines, numbered stage scenes are forced headings, songs are forced action
 * lines followed by a [[openact: song ...]] note, and scene types are [[openact: ...]] notes.
 * Plain Fountain readers still print a sensible script.
 */
export function toFountain(script: Script): string {
  const prof = profileOf(script.profile);
  const n = numbering(script);
  const out: string[] = [];
  const t = script.title;
  const tp: [string, string][] = [
    ['Title', t.title],
    ['Credit', t.credit],
    ['Author', t.authors],
    ['Source', t.source],
    ['Draft date', t.draftDate],
    ['Contact', t.contact],
  ];
  tp.filter(([, v]) => v.trim()).forEach(([k, v]) => out.push(`${k}: ${v.replace(/\n/g, '\n   ')}`));
  if (out.length) out.push('');

  let prevType: ElType | null = null;
  const screenActs = !prof.stage && !prof.comic;
  for (const el of script.elements) {
    const text = el.text;
    const d = decor(el, prof, n);
    const tight = (el.type === 'dialogue' || el.type === 'paren' || el.type === 'lyrics') && prevType !== null && ['character', 'dialogue', 'paren', 'lyrics'].includes(prevType);
    if (!tight && out.length && out[out.length - 1] !== '') out.push('');
    switch (el.type) {
      case 'act':
        if (screenActs && prevType !== null) out.push('===', '');
        out.push(`> ${(d.prefix + text).toUpperCase()} <`);
        break;
      case 'endAct':
        out.push(`> ${text.toUpperCase()} <`);
        break;
      case 'sound':
        out.push(`!${text.toUpperCase()}`);
        break;
      case 'page':
        if (prevType !== null) out.push('===', '');
        out.push(`!${(d.prefix + text + d.suffix).toUpperCase()}`);
        break;
      case 'panel':
      case 'caption':
        out.push(`!${d.prefix}${text}`);
        break;
      case 'sfx':
        out.push(`!${d.prefix}${text.toUpperCase()}`);
        break;
      case 'scene':
        if (prof.numberScenes) out.push(`.SCENE ${n.sceneNo.get(el.id)}: ${text.toUpperCase()}`);
        else out.push(/^(INT|EXT|EST|INT\.?\/EXT|I\/E)[.\s]/i.test(text) ? text.toUpperCase() : `.${text.toUpperCase()}`);
        if (prof.sceneTypes && el.sceneType) out.push(`[[openact: ${el.sceneType === 'cloth' ? 'front cloth' : 'full stage'}]]`);
        break;
      case 'character':
        out.push(text.toUpperCase());
        break;
      case 'paren':
        out.push(/^\(.*\)$/.test(text.trim()) ? text.trim() : `(${text.trim()})`);
        break;
      case 'dialogue':
        out.push(text.replace(/\n\n/g, '\n  \n'));
        break;
      case 'lyrics':
        text.split('\n').forEach((l) => out.push(`~${l}`));
        break;
      case 'transition':
        out.push(/TO:$/.test(text.toUpperCase()) ? text.toUpperCase() : `> ${text.toUpperCase()}`);
        break;
      case 'shot':
        out.push(`!${text.toUpperCase()}`);
        break;
      case 'centered':
        out.push(`> ${text} <`);
        break;
      case 'choice':
      case 'bark':
      case 'goto':
      case 'beat':
      case 'lore':
        out.push(`!${(d.prefix + text + d.suffix).replace(/\n/g, ' ')}`);
        break;
      case 'cond':
        out.push(`[[openact: condition | ${text}]]`);
        break;
      case 'song': {
        const s = el.song;
        out.push(`!SONG ${n.songNo.get(el.id)}: ${text.toUpperCase()}${s?.singers ? ` (${s.singers})` : ''}`);
        const parts = [`singers: ${s?.singers ?? ''}`, `function: ${s?.func ?? ''}`, `staging: ${s?.staging ?? ''}`, `feel: ${s?.feel ?? ''}`];
        if (s?.reprise) parts.push('reprise: yes');
        out.push(`[[openact: song | ${parts.join(' | ')}]]`);
        break;
      }
      default: {
        const forced = /^[A-Z0-9 .,'!?-]+$/.test(text) && text.length < 40 ? '!' : '';
        out.push(`${forced}${text}`);
      }
    }
    if (el.note) out.push(`[[${el.note}]]`);
    prevType = el.type;
  }
  return `${out.join('\n').trim()}\n`;
}

const FDX_TYPES: Partial<Record<ElType, string>> = {
  scene: 'Scene Heading',
  action: 'Action',
  character: 'Character',
  paren: 'Parenthetical',
  dialogue: 'Dialogue',
  transition: 'Transition',
  shot: 'Shot',
  lyrics: 'Dialogue',
  centered: 'Action',
  act: 'New Act',
  endAct: 'End of Act',
  sound: 'Action',
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Screenplay-only Final Draft export (sketch; the real exporter keeps unknown elements from imported files). */
export function toFdx(script: Script): string {
  const lines = script.elements
    .filter((e) => FDX_TYPES[e.type])
    .map((e) => {
      const attrs = e.type === 'centered' ? ' Alignment="Center"' : '';
      const style = e.type === 'lyrics' ? ' Style="Italic"' : '';
      return `    <Paragraph Type="${FDX_TYPES[e.type]}"${attrs}>\n      <Text${style}>${esc(e.text)}</Text>\n    </Paragraph>`;
    });
  const t = script.title;
  const tp = [t.title.toUpperCase(), t.credit, t.authors]
    .filter(Boolean)
    .map((x) => `      <Paragraph Alignment="Center"><Text>${esc(x)}</Text></Paragraph>`);
  return `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n<FinalDraft DocumentType="Script" Template="No" Version="5">\n  <Content>\n${lines.join('\n')}\n  </Content>\n  <TitlePage>\n    <Content>\n${tp.join('\n')}\n    </Content>\n  </TitlePage>\n</FinalDraft>\n`;
}

export interface Detected {
  type: ElType;
  text: string;
}

/** Split pasted text into elements. The writer reviews the result before anything lands. */
export function detect(raw: string, prof: Profile): Detected[] {
  const out: Detected[] = [];
  const lines = raw.replace(/\r/g, '').split('\n');
  let gap = true;
  const lastType = () => (out.length ? out[out.length - 1].type : null);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      gap = true;
      continue;
    }
    const next = (lines[i + 1] ?? '').trim();
    const inSpeech = !gap && ['character', 'paren', 'dialogue'].includes(lastType() ?? '');
    if (line.startsWith('~')) out.push({ type: 'lyrics', text: line.slice(1).trim() });
    else if (/^(INT|EXT|EST|INT\.?\/EXT|I\/E)[.\s]/i.test(line)) out.push({ type: prof.stage ? 'scene' : 'scene', text: line });
    else if (/^ACT\s+\w+/i.test(line) && line.length < 30) out.push({ type: prof.stage ? 'act' : 'centered', text: line.toUpperCase() });
    else if (/^SCENE\s+\w+/i.test(line)) out.push({ type: 'scene', text: line.replace(/^SCENE\s+\w+\s*[:.\-–]\s*/i, '') });
    else if (/^[A-Z0-9 .,'!?-]+(TO:|OUT\.|IN:)$/.test(line) || /^(BLACKOUT|CURTAIN)\.?$/i.test(line)) out.push({ type: 'transition', text: line });
    else if (/^\(.*\)$/.test(line) && (inSpeech || !gap)) out.push({ type: 'paren', text: line });
    else {
      const uk = line.match(/^([A-Z][A-Z0-9 .'-]{0,28}[A-Z.])\s*:\s*(.*)$/);
      if (uk) {
        out.push({ type: 'character', text: uk[1] });
        if (uk[2]) {
          const paren = uk[2].match(/^(\([^)]*\))\s*(.*)$/);
          if (paren) {
            out.push({ type: 'paren', text: paren[1] });
            if (paren[2]) out.push({ type: 'dialogue', text: paren[2] });
          } else out.push({ type: 'dialogue', text: uk[2] });
        }
      } else if (/^[A-Z][A-Z0-9 .'()-]{0,34}$/.test(line) && /[A-Z]/.test(line) && next && gap) {
        out.push({ type: 'character', text: line });
      } else if (inSpeech) {
        const prev = out[out.length - 1];
        if (prev.type === 'dialogue') prev.text += ` ${line}`;
        else out.push({ type: 'dialogue', text: line });
      } else {
        out.push({ type: 'action', text: line });
      }
    }
    gap = false;
  }
  return out;
}
