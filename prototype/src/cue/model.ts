export type ElType =
  | 'act'
  | 'scene'
  | 'action'
  | 'character'
  | 'paren'
  | 'dialogue'
  | 'transition'
  | 'shot'
  | 'lyrics'
  | 'song'
  | 'centered'
  | 'endAct'
  | 'sound'
  | 'page'
  | 'panel'
  | 'caption'
  | 'sfx'
  | 'choice'
  | 'bark'
  | 'cond'
  | 'goto'
  | 'beat'
  | 'lore';

export interface SongMeta {
  singers: string;
  func: string;
  staging: string;
  feel: string;
  reprise?: boolean;
}

export type SceneType = 'full' | 'cloth';

export interface El {
  id: string;
  type: ElType;
  text: string;
  song?: SongMeta;
  sceneType?: SceneType;
  note?: string;
  /** Video game: a recording line ID kept for good once locked, so recorded files never lose their name. */
  lineId?: string;
}

/** The sixteen built-in formats. */
export type BuiltinProfileId =
  | 'screenplay'
  | 'tv-drama'
  | 'tv-single'
  | 'tv-multi'
  | 'uk-sitcom'
  | 'vertical'
  | 'stage-uk'
  | 'stage-us'
  | 'musical'
  | 'musical-us'
  | 'panto'
  | 'radio-uk'
  | 'audio-us'
  | 'comic'
  | 'treatment'
  | 'game';
/** A built-in format, or a format the writer imported: `custom:<built-in it is based on>:<name>` (D-040). */
export type ProfileId = BuiltinProfileId | `custom:${string}`;
export type PaperId = 'a4' | 'letter';

export interface TitlePage {
  title: string;
  credit: string;
  authors: string;
  source: string;
  draftDate: string;
  contact: string;
}

export interface CastEntry {
  name: string;
  description: string;
}

/** The "Ready to submit?" settings, saved with the script. */
export interface ReviewState {
  target?: string;
  /** Exports leave out the writer's name, contact details and the PDF author. */
  anonymous?: boolean;
  /** Ticked manual checks, as "target:item". */
  ticked?: string[];
}

export interface Script {
  title: TitlePage;
  profile: ProfileId;
  paper: PaperId;
  elements: El[];
  cast: CastEntry[];
  dismissed: string[];
  review?: ReviewState;
}

let counter = 0;
export const newId = (): string => `e${Date.now().toString(36)}${(counter++).toString(36)}`;

export const emptyTitle = (): TitlePage => ({ title: '', credit: 'Written by', authors: '', source: '', draftDate: '', contact: '' });

/** A character cue without its extensions: "SARAH (V.O.)" becomes "SARAH". */
export const baseName = (cue: string): string => cue.replace(/\s*\(.*$/, '').trim().toUpperCase();
