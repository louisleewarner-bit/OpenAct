import { baseName, type El, type SceneType, type Script } from './model';
import type { Layout } from './layout';
import { profileOf } from './profiles';

export interface SceneInfo {
  id: string;
  no: number;
  label: string;
  page: number;
  sceneType?: SceneType;
}

export interface ActGroup {
  id: string | null;
  label: string | null;
  scenes: SceneInfo[];
}

export function outline(script: Script, lay: Layout): ActGroup[] {
  const prof = profileOf(script.profile);
  const groups: ActGroup[] = [{ id: null, label: null, scenes: [] }];
  for (const el of script.elements) {
    if (el.type === 'act') {
      const label = prof.episodes ? `Episode ${lay.episodeNo.get(el.id) ?? ''}${el.text ? `: ${el.text}` : ''}` : el.text || 'Act';
      groups.push({ id: el.id, label, scenes: [] });
    }
    if (el.type === 'page') {
      const no = lay.comicPageNo.get(el.id) ?? 0;
      groups[groups.length - 1].scenes.push({ id: el.id, no, label: `Page ${no}${el.text ? `: ${el.text}` : ''}`, page: (lay.pageOfEl.get(el.id) ?? 0) + 1 });
    }
    if (el.type === 'scene') {
      groups[groups.length - 1].scenes.push({
        id: el.id,
        no: lay.sceneNo.get(el.id) ?? 0,
        label: el.text || 'Untitled scene',
        page: (lay.pageOfEl.get(el.id) ?? 0) + 1,
        sceneType: el.sceneType,
      });
    }
  }
  return groups.filter((g) => g.label !== null || g.scenes.length > 0);
}

export interface Warning {
  key: string;
  afterId: string;
  text: string;
}

export function sceneWarnings(script: Script, groups: ActGroup[]): Warning[] {
  if (!profileOf(script.profile).sceneTypes) return [];
  const out: Warning[] = [];
  const all = groups.flatMap((g) => g.scenes);
  for (let i = 1; i < all.length; i++) {
    const a = all[i - 1];
    const b = all[i];
    const key = `full-full:${a.id}:${b.id}`;
    if (a.sceneType === 'full' && b.sceneType === 'full' && !script.dismissed.includes(key)) {
      out.push({ key, afterId: b.id, text: 'Two full-stage scenes in a row. A front-cloth scene between them would cover the set change.' });
    }
  }
  return out;
}

export interface SongInfo {
  id: string;
  no: string;
  title: string;
  page: number;
  el: El;
}

export function songList(script: Script, lay: Layout): SongInfo[] {
  return script.elements
    .filter((e) => e.type === 'song')
    .map((e) => ({ id: e.id, no: lay.songNo.get(e.id) ?? '', title: e.text || 'Untitled song', page: (lay.pageOfEl.get(e.id) ?? 0) + 1, el: e }));
}

export interface CastInfo {
  name: string;
  description: string;
  speeches: number;
  words: number;
  listed: boolean;
}

const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

export function castInfo(script: Script): CastInfo[] {
  const map = new Map<string, CastInfo>();
  for (const c of script.cast) map.set(c.name.toUpperCase(), { name: c.name.toUpperCase(), description: c.description, speeches: 0, words: 0, listed: true });
  let speaker: CastInfo | null = null;
  for (const el of script.elements) {
    if (el.type === 'character') {
      const n = baseName(el.text);
      if (!n) {
        speaker = null;
        continue;
      }
      if (!map.has(n)) map.set(n, { name: n, description: '', speeches: 0, words: 0, listed: false });
      speaker = map.get(n)!;
      speaker.speeches++;
    } else if (el.type === 'dialogue' || el.type === 'lyrics') {
      if (speaker) speaker.words += words(el.text);
    } else if (el.type !== 'paren') {
      speaker = null;
    }
  }
  return [...map.values()];
}

export interface Chart {
  characters: string[];
  scenes: SceneInfo[];
  cells: Map<string, 'speaks' | 'onstage'>;
}

export function sceneChart(script: Script, groups: ActGroup[]): Chart {
  const scenes = groups.flatMap((g) => g.scenes);
  const names = castInfo(script).map((c) => c.name);
  const cells = new Map<string, 'speaks' | 'onstage'>();
  let scene: string | null = null;
  const mark = (name: string, kind: 'speaks' | 'onstage') => {
    if (!scene) return;
    const k = `${name}|${scene}`;
    if (kind === 'speaks' || !cells.has(k)) cells.set(k, kind);
  };
  for (const el of script.elements) {
    if (el.type === 'scene' || el.type === 'page') scene = el.id;
    else if (el.type === 'character') mark(baseName(el.text), 'speaks');
    else if (el.type === 'song' && el.song?.singers) el.song.singers.split(/,|&| and /i).forEach((s) => mark(s.trim().toUpperCase(), 'speaks'));
    else if (el.type === 'action') {
      for (const n of names) if (new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(el.text)) mark(n, 'onstage');
    }
  }
  return { characters: names, scenes, cells };
}
