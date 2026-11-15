import { lineIds } from './lineid';
import { baseName, type El, type ElType, type Script } from './model';
import { PAPERS, profileOf, styleOf, type ElStyle, type Profile } from './profiles';

/**
 * Prototype layout engine. The real one (docs/architecture.md) is a pure package shared by the page view and PDF export.
 * Courier is a character grid: 10 characters per inch, 6 lines per inch, so layout is counting.
 */

/** A printed line the writer doesn't type: "SCENE A" above a multi-camera scene, or its cast list below. */
export interface Deco {
  text: string;
  kind: 'heading' | 'cast';
}

export interface Frag {
  key: string;
  id: string;
  type: ElType;
  start: number;
  end: number;
  before: number;
  lines: number;
  prefix?: string;
  suffix?: string;
  more?: boolean;
  contCue?: string;
  hang?: boolean;
  /** Audio formats: the cue number, starting again on each page. */
  cue?: number;
  decoBefore?: Deco[];
  decoAfter?: Deco[];
}

export interface Page {
  frags: Frag[];
}

export type Numbering = ReturnType<typeof numbering>;

export interface Layout extends Numbering {
  pages: Page[];
  pageOfEl: Map<string, number>;
  totalLines: number;
  linesPerPage: number;
}

export function wrapLines(text: string, width: number): number {
  if (width <= 0) return 1;
  let total = 0;
  for (const para of text.split('\n')) {
    if (para.length === 0) {
      total += 1;
      continue;
    }
    let lines = 1;
    let line = 0;
    for (const word of para.split(' ')) {
      let w = word;
      if (line > 0 && line + 1 + w.length <= width) {
        line += 1 + w.length;
        continue;
      }
      if (line === 0 && w.length <= width) {
        line = w.length;
        continue;
      }
      if (line > 0) {
        lines++;
        line = 0;
      }
      while (w.length > width) {
        w = w.slice(width);
        lines++;
      }
      line = w.length;
    }
    total += lines;
  }
  return total;
}

/** Printed height of `n` text lines at a line spacing: double spacing puts a blank line between lines, not after the last. */
const spaced = (n: number, sp: number) => (n <= 0 ? 0 : n * sp - (sp - 1));

const SENTENCE_END = /[.!?…]["'”’)\]]*\s+/g;

/** Latest sentence boundary that leaves at least two lines on each side and fits in `avail` printed lines. */
export function findSplit(text: string, width: number, avail: number, sp = 1) {
  if (avail < 2) return null;
  const bounds: number[] = [];
  SENTENCE_END.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SENTENCE_END.exec(text))) bounds.push(m.index + m[0].length);
  for (let k = bounds.length - 1; k >= 0; k--) {
    const b = bounds[k];
    const p1 = text.slice(0, b).replace(/\s+$/, '');
    const p2 = text.slice(b);
    if (!p2.trim()) continue;
    const n1 = wrapLines(p1, width);
    const n2 = wrapLines(p2, width);
    const l1 = spaced(n1, sp);
    if (l1 <= avail && n1 >= 2 && n2 >= 2) return { end: p1.length, start2: b, l1, l2: spaced(n2, sp) };
  }
  return null;
}

/** When no sentence ends where a page does: the most words that fit in `avail` printed lines. */
export function splitAtWords(text: string, width: number, avail: number, sp = 1) {
  const spaces: number[] = [];
  for (let i = 0; i < text.length; i++) if (text[i] === ' ') spaces.push(i);
  let best = -1;
  let lo = 0;
  let hi = spaces.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (spaced(wrapLines(text.slice(0, spaces[mid]), width), sp) <= avail) {
      best = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  // A single run with no spaces: break it at the line length.
  const cut = best >= 0 ? spaces[best] : Math.max(1, Math.min(text.length - 1, width * Math.max(1, Math.floor((avail + (sp - 1)) / sp))));
  const p1 = text.slice(0, cut).replace(/\s+$/, '');
  const start2 = best >= 0 ? cut + 1 : cut;
  return { end: p1.length, start2, l1: spaced(wrapLines(p1, width), sp), l2: spaced(wrapLines(text.slice(start2), width), sp) };
}

const isSpeech = (t: ElType) => t === 'dialogue' || t === 'paren' || t === 'lyrics';

const WORDS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY'];
const TENS = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
export const inWords = (n: number): string => {
  if (n <= 20) return WORDS[n] ?? String(n);
  if (n < 100) return `${TENS[Math.floor(n / 10)]}${n % 10 ? `-${WORDS[n % 10]}` : ''}`;
  return String(n);
};
const sceneLetter = (i: number) => {
  // A..Z, then AA, BB... as multi-camera scripts tend to do.
  const base = String.fromCharCode(65 + (i % 26));
  return base.repeat(Math.floor(i / 26) + 1);
};

export function numbering(script: Script) {
  const prof = profileOf(script.profile);
  const songNo = new Map<string, string>();
  const sceneNo = new Map<string, number>();
  const contd = new Set<string>();
  const sceneLine = new Map<string, string>();
  const castLine = new Map<string, string>();
  const episodeNo = new Map<string, number>();
  const comicPageNo = new Map<string, number>();
  const panelNo = new Map<string, number>();
  const panelsOnPage = new Map<string, number>();
  const balloonNo = new Map<string, number>();
  const choiceNo = new Map<string, number>();
  const beatNo = new Map<string, number>();
  const loreNo = new Map<string, number>();
  const lineId = prof.game ? lineIds(script) : new Map<string, string>();
  let choices = 0;
  let beats = 0;
  let lores = 0;
  let songs = 0;
  let letter = 0;
  let scenes = 0;
  let allScenes = 0;
  let episodes = 0;
  let lastSpeaker = '';
  let castFor: { id: string; names: string[] } | null = null;
  let page: string | null = null;
  let pages = 0;
  let panels = 0;
  let balloons = 0;
  for (const el of script.elements) {
    if (prof.game) {
      if (el.type === 'choice') choiceNo.set(el.id, ++choices);
      else if (el.type !== 'cond' && el.type !== 'goto' && el.type !== 'paren' && el.type !== 'dialogue' && el.type !== 'character' && el.type !== 'action') choices = 0;
      if (el.type === 'beat') beatNo.set(el.id, ++beats);
      if (el.type === 'lore') loreNo.set(el.id, ++lores);
    }
    if (el.type === 'act') {
      if (prof.stage) scenes = 0;
      if (prof.episodes) episodeNo.set(el.id, ++episodes);
      lastSpeaker = '';
    } else if (el.type === 'scene') {
      scenes++;
      sceneNo.set(el.id, scenes);
      if (prof.sceneLine === 'letter') sceneLine.set(el.id, `SCENE ${sceneLetter(allScenes)}`);
      if (prof.sceneLine === 'number') sceneLine.set(el.id, `SCENE ${allScenes + 1}`);
      allScenes++;
      if (prof.castLine) {
        castFor = { id: el.id, names: [] };
        castLine.set(el.id, '');
      }
      lastSpeaker = '';
    } else if (el.type === 'song') {
      if (el.song?.reprise && songs > 0) {
        letter++;
        songNo.set(el.id, `${songs}${String.fromCharCode(96 + letter)}`);
      } else {
        songs++;
        letter = 0;
        songNo.set(el.id, String(songs));
      }
      lastSpeaker = '';
    } else if (el.type === 'character') {
      const n = baseName(el.text);
      if (prof.autoContd && n && n === lastSpeaker && !/CONT'D/i.test(el.text)) contd.add(el.id);
      lastSpeaker = n;
      if (castFor && n && !castFor.names.includes(n)) {
        castFor.names.push(n);
        castLine.set(castFor.id, `(${castFor.names.join(', ')})`);
      }
      if (prof.comic) balloonNo.set(el.id, ++balloons);
    } else if (el.type === 'transition') {
      lastSpeaker = '';
    } else if (el.type === 'page') {
      page = el.id;
      comicPageNo.set(el.id, ++pages);
      panelsOnPage.set(el.id, 0);
      panels = 0;
      balloons = 0;
    } else if (el.type === 'panel') {
      panelNo.set(el.id, ++panels);
      if (page) panelsOnPage.set(page, panels);
    } else if (el.type === 'caption' || el.type === 'sfx') {
      if (prof.comic) balloonNo.set(el.id, ++balloons);
    }
  }
  return { songNo, sceneNo, contd, sceneLine, castLine, episodeNo, comicPageNo, panelNo, panelsOnPage, balloonNo, choiceNo, beatNo, loreNo, lineId };
}

export function decor(el: El, prof: Profile, n: Numbering) {
  let prefix = '';
  let suffix = '';
  const t = el.text.trim();
  if (el.type === 'scene' && prof.numberScenes) prefix = `SCENE ${n.sceneNo.get(el.id) ?? ''}: `;
  if (el.type === 'song') {
    prefix = `SONG ${n.songNo.get(el.id) ?? ''}: `;
    if (el.song?.singers) suffix = ` (${el.song.singers})`;
  }
  if (el.type === 'character') {
    if (n.contd.has(el.id)) suffix = " (CONT'D)";
    if (prof.comic && n.balloonNo.has(el.id)) prefix = `${n.balloonNo.get(el.id)}. `;
  }
  if (el.type === 'act' && prof.episodes) prefix = `EPISODE ${n.episodeNo.get(el.id) ?? ''}${t ? ': ' : ''}`;
  if (el.type === 'page') {
    const count = n.panelsOnPage.get(el.id) ?? 0;
    prefix = `PAGE ${inWords(n.comicPageNo.get(el.id) ?? 0)}${t ? ': ' : ''}`;
    suffix = ` (${inWords(count)} PANEL${count === 1 ? '' : 'S'})`;
  }
  if (el.type === 'panel') prefix = `PANEL ${n.panelNo.get(el.id) ?? ''}${t ? ': ' : ''}`;
  if (el.type === 'caption') prefix = `${n.balloonNo.get(el.id) ?? ''}. CAPTION: `;
  if (el.type === 'sfx') prefix = `${n.balloonNo.get(el.id) ?? ''}. SFX: `;
  if (prof.game) {
    if (el.type === 'character' && n.lineId.has(el.id)) suffix = `  [${n.lineId.get(el.id)}]`;
    if (el.type === 'bark') prefix = `BARK [${n.lineId.get(el.id) ?? ''}]  `;
    if (el.type === 'choice') prefix = `${n.choiceNo.get(el.id) ?? ''}> `;
    if (el.type === 'cond') {
      prefix = '[';
      suffix = ']';
    }
    if (el.type === 'goto') prefix = 'GO TO ';
    if (el.type === 'beat') prefix = `QUEST BEAT ${n.beatNo.get(el.id) ?? ''}${t ? ': ' : ''}`;
    if (el.type === 'lore') prefix = `LORE ${n.loreNo.get(el.id) ?? ''}${t ? ': ' : ''}`;
  }
  return { prefix, suffix };
}

export function decosFor(el: El, n: Numbering) {
  const before: Deco[] = [];
  const after: Deco[] = [];
  if (el.type === 'scene') {
    const line = n.sceneLine.get(el.id);
    if (line) before.push({ text: line, kind: 'heading' });
    const cast = n.castLine.get(el.id);
    if (cast) after.push({ text: cast, kind: 'cast' });
  }
  return { before, after };
}

export function layout(script: Script, opts: { paged: boolean } = { paged: true }): Layout {
  const prof = profileOf(script.profile);
  const L = opts.paged ? PAPERS[script.paper].lines : Number.MAX_SAFE_INTEGER;
  const els = script.elements;
  const n = numbering(script);
  const pages: Page[] = [{ frags: [] }];
  const pageOfEl = new Map<string, number>();
  let y = 0;
  let totalLines = 0;
  const st = (t: ElType): ElStyle | undefined => styleOf(prof, t);
  const cur = () => pages[pages.length - 1];
  const newPage = () => {
    totalLines += y;
    pages.push({ frags: [] });
    y = 0;
  };
  const push = (f: Frag) => {
    cur().frags.push(f);
    if (!pageOfEl.has(f.id)) pageOfEl.set(f.id, pages.length - 1);
    y += f.before + f.lines;
  };
  const fullText = (el: El) => {
    const d = decor(el, prof, n);
    return { ...d, full: d.prefix + el.text + d.suffix };
  };
  /** Printed lines of an element (text at its spacing, plus its deco lines), or of its first `max` text lines. */
  const heightOf = (el: El, max = Infinity) => {
    const s = st(el.type);
    if (!s) return 0;
    const deco = decosFor(el, n);
    const lines = Math.min(max, wrapLines(fullText(el).full, s.width));
    return spaced(lines, s.lineSpacing ?? 1) + deco.before.length + deco.after.length;
  };
  const cueFor = (i: number) => {
    for (let j = i - 1; j >= 0; j--) {
      const t = els[j].type;
      if (t === 'character') {
        const cue = els[j].text.toUpperCase();
        return /CONT'D/.test(cue) ? cue : `${cue} (CONT'D)`;
      }
      if (!isSpeech(t)) break;
    }
    return undefined;
  };
  const firstLinesNeed = (j: number, count: number): number => {
    const el = els[j];
    if (!el) return 0;
    const s = st(el.type);
    if (!s) return 0;
    if (el.type === 'character') {
      const next = els[j + 1];
      const hang = !!s.hang && next && isSpeech(next.type);
      return s.before + (hang ? 0 : heightOf(el)) + (next ? heightOf(next, count) : 0);
    }
    return s.before + heightOf(el, count);
  };

  els.forEach((el, i) => {
    const s = st(el.type);
    if (!s) return;
    const sp = s.lineSpacing ?? 1;
    const { prefix, suffix, full } = fullText(el);
    const deco = decosFor(el, n);
    const prevType = els[i - 1]?.type;
    if (s.pageBreakBefore && y > 0 && prevType !== 'act') newPage();
    const next = els[i + 1];
    const hang = !!s.hang && !!next && isSpeech(next.type) && full.length <= s.width;
    const textLines = hang ? 0 : spaced(wrapLines(full, s.width), sp);
    const lines = textLines + deco.before.length + deco.after.length;
    let before = y === 0 ? 0 : s.before;

    let need = before + lines;
    if (el.type === 'scene' || el.type === 'act' || el.type === 'song' || el.type === 'shot' || el.type === 'page' || el.type === 'panel') {
      need += firstLinesNeed(i + 1, 2);
    } else if (el.type === 'character') {
      let j = i + 1;
      let extra = 0;
      while (j < els.length && els[j].type === 'paren') extra += heightOf(els[j++]);
      if (j < els.length && (els[j].type === 'dialogue' || els[j].type === 'lyrics')) extra += heightOf(els[j], 2);
      need += extra;
    } else if (el.type === 'paren' && next && (next.type === 'dialogue' || next.type === 'lyrics')) {
      need += 1;
    }

    if (y > 0 && y + need > L) {
      if ((el.type === 'dialogue' || el.type === 'action') && y + before + lines > L) {
        const reserve = el.type === 'dialogue' ? 1 : 0;
        const avail = L - y - before - reserve;
        // No sentence end fits: a speech or action longer than a whole page is split at a word instead of overflowing.
        const split = findSplit(el.text, s.width, avail, sp) ?? (lines > L && avail >= 2 ? splitAtWords(el.text, s.width, avail, sp) : null);
        if (split) {
          push({ key: `${el.id}:0`, id: el.id, type: el.type, start: 0, end: split.end, before, lines: split.l1, more: el.type === 'dialogue' });
          y += reserve;
          newPage();
          // The rest goes on the next page, and keeps going over as many pages as it needs.
          let start = split.start2;
          for (let guard = 0; ; guard++) {
            const cue = el.type === 'dialogue' ? cueFor(i) : undefined;
            const rest = el.text.slice(start);
            const restLines = spaced(wrapLines(rest, s.width), sp);
            const room = L - (cue ? 1 : 0);
            if (restLines <= room || guard > 500) {
              push({ key: `${el.id}:${start}`, id: el.id, type: el.type, start, end: el.text.length, before: 0, lines: restLines + (cue ? 1 : 0), contCue: cue });
              break;
            }
            const again = findSplit(rest, s.width, room - reserve, sp) ?? splitAtWords(rest, s.width, room - reserve, sp);
            push({ key: `${el.id}:${start}`, id: el.id, type: el.type, start, end: start + again.end, before: 0, lines: again.l1 + (cue ? 1 : 0), contCue: cue, more: el.type === 'dialogue' });
            y += reserve;
            newPage();
            start += again.start2;
          }
          return;
        }
      }
      const frags = cur().frags;
      if (isSpeech(el.type)) {
        const carried: Frag[] = [];
        while (frags.length && (frags[frags.length - 1].type === 'paren' || frags[frags.length - 1].type === 'character')) {
          const last = frags.pop()!;
          carried.unshift(last);
          y -= last.before + last.lines;
          if (last.type === 'character') break;
        }
        if (carried.length && carried[0].type === 'character' && frags.length > 0) {
          newPage();
          carried.forEach((c, k) => push({ ...c, before: k === 0 ? 0 : c.before }));
        } else {
          carried.forEach((c) => {
            frags.push(c);
            y += c.before + c.lines;
          });
          newPage();
        }
      } else if (el.type === 'transition') {
        const last = frags[frags.length - 1];
        if (last && last.lines <= 3 && frags.length > 1 && last.type !== 'scene' && last.type !== 'character') {
          frags.pop();
          y -= last.before + last.lines;
          newPage();
          push({ ...last, before: 0 });
        } else newPage();
      } else {
        newPage();
      }
      before = y === 0 ? 0 : s.before;
    }
    push({
      key: `${el.id}:0`,
      id: el.id,
      type: el.type,
      start: 0,
      end: el.text.length,
      before,
      lines,
      prefix: prefix || undefined,
      suffix: suffix || undefined,
      hang: hang || undefined,
      decoBefore: deco.before.length ? deco.before : undefined,
      decoAfter: deco.after.length ? deco.after : undefined,
    });
  });
  totalLines += y;

  if (prof.cueNumbers) {
    for (const pg of pages) {
      let c = 0;
      for (const f of pg.frags) if (f.start === 0 && (f.type === 'character' || f.type === 'sound')) f.cue = ++c;
    }
  }
  return { pages, pageOfEl, ...n, totalLines, linesPerPage: L };
}
