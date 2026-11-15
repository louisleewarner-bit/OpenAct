import type { BuiltinProfileId, ElType, PaperId, ProfileId } from './model';

/** Layout of one element type. `left` is inches from the page's left edge; `width` is characters at 10 per inch. */
export interface ElStyle {
  left: number;
  width: number;
  before: number;
  upper?: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  /** UK stage layout: the cue sits beside the speech, in its own column. */
  hang?: boolean;
  pageBreakBefore?: boolean;
  /** 2 = double-spaced (multi-camera dialogue, radio speeches). */
  lineSpacing?: number;
}

export type FormatGroup = 'Film' | 'Television' | 'Theatre' | 'Audio' | 'Games' | 'Comics' | 'Documents';

export interface Profile {
  id: ProfileId;
  name: string;
  group: FormatGroup;
  blurb: string;
  paper?: PaperId;
  stage: boolean;
  songs: boolean;
  sceneTypes: boolean;
  types: ElType[];
  labels: Partial<Record<ElType, string>>;
  styles: Partial<Record<ElType, ElStyle>>;
  enter: Partial<Record<ElType, ElType>>;
  tab: Partial<Record<ElType, ElType>>;
  tabEmpty: Partial<Record<ElType, ElType>>;
  blockType: ElType;
  marginLeft: number;
  marginRight: number;
  autoContd: boolean;
  runtime: boolean;
  numberScenes: boolean;
  /** Multi-camera: a "SCENE A" (or "SCENE 1") line above each scene heading. */
  sceneLine?: 'letter' | 'number';
  /** Multi-camera: the scene's characters listed in brackets under its heading. */
  castLine?: boolean;
  /** Audio: every speech and sound cue numbered, starting again on each page. */
  cueNumbers?: boolean;
  /** Comics: comic pages, panels and lettering items numbered. */
  comic?: boolean;
  /** Vertical micro-drama: acts are numbered episodes. */
  episodes?: boolean;
  /** Video game: nodes, choices, jumps, barks and recording line IDs (D-044). */
  game?: boolean;
}

export interface Paper {
  id: PaperId;
  name: string;
  width: number;
  height: number;
  lines: number;
}

// Lines per page are profile data to be calibrated against reference PDFs (docs/research/format-verification.md).
export const PAPERS: Record<PaperId, Paper> = {
  a4: { id: 'a4', name: 'A4', width: 8.27, height: 11.69, lines: 58 },
  letter: { id: 'letter', name: 'US Letter', width: 8.5, height: 11, lines: 54 },
};

const LABELS: Record<ElType, string> = {
  act: 'Act',
  scene: 'Scene heading',
  action: 'Action',
  character: 'Character',
  paren: 'Parenthetical',
  dialogue: 'Dialogue',
  transition: 'Transition',
  shot: 'Shot',
  lyrics: 'Lyrics',
  song: 'Song',
  centered: 'Centred text',
  endAct: 'End of act',
  sound: 'Sound cue',
  page: 'Page',
  panel: 'Panel',
  caption: 'Caption',
  sfx: 'Lettered sound effect',
  choice: 'Player choice',
  bark: 'Bark',
  cond: 'Condition or flag',
  goto: 'Go to',
  beat: 'Quest beat',
  lore: 'Lore entry',
};

const STAGE_LABELS: Partial<Record<ElType, string>> = {
  scene: 'Scene',
  action: 'Stage direction',
  paren: 'Direction in speech',
  dialogue: 'Speech',
};

// ---------------- Film ----------------
const screenStyles: Partial<Record<ElType, ElStyle>> = {
  scene: { left: 1.5, width: 60, before: 1, upper: true },
  action: { left: 1.5, width: 60, before: 1 },
  character: { left: 3.7, width: 38, before: 1, upper: true },
  paren: { left: 3.1, width: 24, before: 0 },
  dialogue: { left: 2.5, width: 35, before: 0 },
  lyrics: { left: 2.5, width: 35, before: 0, italic: true },
  transition: { left: 1.5, width: 60, before: 1, upper: true, align: 'right' },
  shot: { left: 1.5, width: 60, before: 1, upper: true },
  centered: { left: 1.5, width: 60, before: 1, align: 'center' },
};

const screenplay: Profile = {
  id: 'screenplay',
  name: 'Screenplay',
  group: 'Film',
  blurb: 'Features and shorts. Standard layout on US Letter or A4.',
  stage: false,
  songs: false,
  sceneTypes: false,
  types: ['scene', 'action', 'character', 'paren', 'dialogue', 'transition', 'shot', 'lyrics', 'centered'],
  labels: LABELS,
  styles: screenStyles,
  enter: { scene: 'action', action: 'action', character: 'dialogue', paren: 'dialogue', dialogue: 'action', transition: 'scene', shot: 'action', lyrics: 'lyrics', centered: 'action' },
  tab: { character: 'paren', dialogue: 'paren' },
  tabEmpty: { action: 'character', character: 'transition', transition: 'scene', scene: 'action', dialogue: 'paren', paren: 'dialogue', shot: 'action', lyrics: 'character', centered: 'action' },
  blockType: 'action',
  marginLeft: 1.5,
  marginRight: 1.0,
  autoContd: true,
  runtime: true,
  numberScenes: false,
};

// ---------------- Television ----------------
const actHeading: ElStyle = { left: 1.5, width: 60, before: 0, upper: true, underline: true, align: 'center', pageBreakBefore: true };
const tvStyles: Partial<Record<ElType, ElStyle>> = {
  ...screenStyles,
  act: actHeading,
  endAct: { left: 1.5, width: 60, before: 2, upper: true, underline: true, align: 'center' },
};
const tvFlow = {
  enter: { ...screenplay.enter, act: 'scene', endAct: 'act' } as Partial<Record<ElType, ElType>>,
  tabEmpty: { ...screenplay.tabEmpty, transition: 'endAct', endAct: 'act', act: 'scene' } as Partial<Record<ElType, ElType>>,
};

const tvDrama: Profile = {
  ...screenplay,
  id: 'tv-drama',
  name: 'TV drama (one hour)',
  group: 'Television',
  blurb: 'Teaser, four or five acts and a tag. Each act starts a new page and ends with END OF ACT.',
  types: ['scene', 'action', 'character', 'paren', 'dialogue', 'transition', 'act', 'endAct', 'shot'],
  styles: tvStyles,
  ...tvFlow,
};

const tvSingle: Profile = {
  ...tvDrama,
  id: 'tv-single',
  name: 'TV comedy (single camera)',
  blurb: 'Half-hour single-camera comedy: cold open, acts and tag in screenplay layout.',
};

const multiStyles: Partial<Record<ElType, ElStyle>> = {
  ...tvStyles,
  scene: { left: 1.5, width: 60, before: 1, upper: true, underline: true, pageBreakBefore: true },
  action: { left: 1.5, width: 60, before: 1, upper: true },
  dialogue: { left: 2.5, width: 35, before: 0, lineSpacing: 2 },
};

const tvMulti: Profile = {
  ...tvDrama,
  id: 'tv-multi',
  name: 'TV sitcom (multi-camera)',
  blurb: 'Studio-audience sitcom: action in capitals, double-spaced dialogue, lettered scenes on new pages, cast listed under each heading.',
  styles: multiStyles,
  sceneLine: 'letter',
  castLine: true,
  autoContd: false,
};

const ukSitcom: Profile = {
  ...tvMulti,
  id: 'uk-sitcom',
  name: 'UK studio sitcom',
  blurb: 'BBC-style taped sitcom on A4: numbered scenes on new pages, cast lists, capitals for directions.',
  paper: 'a4',
  sceneLine: 'number',
};

const vertical: Profile = {
  ...screenplay,
  id: 'vertical',
  name: 'Vertical micro-drama',
  group: 'Television',
  blurb: 'One- to two-minute episodes for phone screens; each numbered episode starts a new page.',
  types: ['act', 'scene', 'action', 'character', 'paren', 'dialogue', 'transition', 'shot', 'centered'],
  labels: { ...LABELS, act: 'Episode' },
  styles: { ...screenStyles, act: { ...actHeading, underline: false, bold: true, align: 'left' } },
  enter: { ...screenplay.enter, act: 'scene' },
  tabEmpty: { ...screenplay.tabEmpty, transition: 'act', act: 'scene' },
  episodes: true,
};

// ---------------- Theatre ----------------
const ukStyles = (songs: boolean): Partial<Record<ElType, ElStyle>> => ({
  act: { left: 1.25, width: 60, before: 0, upper: true, bold: true, underline: true, align: 'center', pageBreakBefore: true },
  scene: { left: 1.25, width: 60, before: 2, upper: true, bold: true },
  action: { left: 2.85, width: 44, before: 1, italic: true },
  character: { left: 1.25, width: 15, before: 1, upper: true, bold: true, hang: true },
  dialogue: { left: 2.85, width: 44, before: 0 },
  paren: { left: 2.85, width: 44, before: 0, italic: true },
  lyrics: { left: 2.85, width: 44, before: 0, italic: true },
  transition: { left: 1.25, width: 60, before: 1, upper: true, align: 'right' },
  centered: { left: 1.25, width: 60, before: 1, align: 'center' },
  ...(songs ? { song: { left: 2.85, width: 44, before: 1, upper: true, bold: true } } : {}),
});

const stageFlow = (songs: boolean) => ({
  enter: { act: 'scene', scene: 'action', action: 'action', character: 'dialogue', paren: 'dialogue', dialogue: 'character', transition: 'scene', lyrics: 'lyrics', song: 'lyrics', centered: 'action' } as Partial<Record<ElType, ElType>>,
  tab: { character: 'paren', dialogue: 'paren' } as Partial<Record<ElType, ElType>>,
  tabEmpty: {
    action: 'character',
    character: songs ? 'song' : 'transition',
    song: 'transition',
    transition: 'scene',
    scene: 'act',
    act: 'action',
    dialogue: 'paren',
    paren: 'dialogue',
    lyrics: 'character',
    centered: 'action',
  } as Partial<Record<ElType, ElType>>,
});

const stageUk: Profile = {
  id: 'stage-uk',
  name: 'Stage play (UK)',
  group: 'Theatre',
  blurb: 'Names in a column beside the speech, directions in italics. A4.',
  paper: 'a4',
  stage: true,
  songs: false,
  sceneTypes: false,
  types: ['act', 'scene', 'action', 'character', 'paren', 'dialogue', 'transition', 'lyrics', 'centered'],
  labels: { ...LABELS, ...STAGE_LABELS },
  styles: ukStyles(false),
  ...stageFlow(false),
  blockType: 'action',
  marginLeft: 1.25,
  marginRight: 1.0,
  autoContd: false,
  runtime: false,
  numberScenes: true,
};

const usStageStyles: Partial<Record<ElType, ElStyle>> = {
  act: { left: 1.5, width: 60, before: 0, upper: true, bold: true, underline: true, align: 'center', pageBreakBefore: true },
  scene: { left: 1.5, width: 60, before: 2, upper: true, bold: true, align: 'center' },
  character: { left: 4.0, width: 30, before: 1, upper: true },
  paren: { left: 3.0, width: 30, before: 0, italic: true },
  dialogue: { left: 1.5, width: 60, before: 0 },
  action: { left: 3.0, width: 45, before: 1, italic: true },
  lyrics: { left: 2.5, width: 40, before: 0, upper: true },
  transition: { left: 1.5, width: 60, before: 1, upper: true, align: 'right' },
  centered: { left: 1.5, width: 60, before: 1, align: 'center' },
};

const stageUs: Profile = {
  ...stageUk,
  id: 'stage-us',
  name: 'Stage play (US)',
  blurb: 'Dramatists Guild-style manuscript: names above the speech, indented directions. US Letter.',
  paper: undefined,
  styles: usStageStyles,
  marginLeft: 1.5,
};

const musical: Profile = {
  ...stageUk,
  id: 'musical',
  name: 'Musical (UK)',
  blurb: 'UK stage layout plus numbered songs, singers and lyrics.',
  songs: true,
  types: ['act', 'scene', 'action', 'character', 'paren', 'dialogue', 'song', 'lyrics', 'transition'],
  styles: ukStyles(true),
  ...stageFlow(true),
};

const musicalUs: Profile = {
  ...stageUs,
  id: 'musical-us',
  name: 'Musical (US)',
  blurb: 'US manuscript layout with numbered songs and lyrics in capitals.',
  songs: true,
  types: ['act', 'scene', 'action', 'character', 'paren', 'dialogue', 'song', 'lyrics', 'transition'],
  styles: { ...usStageStyles, song: { left: 3.0, width: 45, before: 1, upper: true, bold: true } },
  ...stageFlow(true),
};

const panto: Profile = {
  ...musical,
  id: 'panto',
  name: 'Pantomime',
  blurb: 'UK layout with songs, front-cloth and full-stage scenes, and the panto template.',
  sceneTypes: true,
};

// ---------------- Audio ----------------
const radioUk: Profile = {
  id: 'radio-uk',
  name: 'Radio drama (UK)',
  group: 'Audio',
  blurb: 'Numbered cues that restart on each page, sound and music cues in capitals, double-spaced speeches. A4.',
  paper: 'a4',
  stage: true,
  songs: false,
  sceneTypes: false,
  types: ['scene', 'sound', 'character', 'paren', 'dialogue', 'centered'],
  labels: { ...LABELS, paren: 'Direction', dialogue: 'Speech' },
  styles: {
    scene: { left: 1.25, width: 60, before: 2, upper: true, bold: true, underline: true },
    sound: { left: 2.85, width: 44, before: 1, upper: true, underline: true },
    character: { left: 1.25, width: 15, before: 1, upper: true, hang: true },
    paren: { left: 2.85, width: 44, before: 0, upper: true },
    dialogue: { left: 2.85, width: 44, before: 0, lineSpacing: 2 },
    action: { left: 2.85, width: 44, before: 1, italic: true },
    centered: { left: 1.25, width: 60, before: 1, align: 'center' },
  },
  enter: { scene: 'sound', sound: 'character', character: 'dialogue', paren: 'dialogue', dialogue: 'character', centered: 'sound' },
  tab: { character: 'paren', dialogue: 'paren' },
  tabEmpty: { character: 'sound', sound: 'scene', scene: 'character', dialogue: 'paren', paren: 'dialogue', centered: 'sound' },
  blockType: 'sound',
  marginLeft: 1.25,
  marginRight: 1.0,
  autoContd: false,
  runtime: true,
  numberScenes: true,
  cueNumbers: true,
};

const audioUs: Profile = {
  ...screenplay,
  id: 'audio-us',
  name: 'Audio drama and podcast',
  group: 'Audio',
  blurb: 'Fiction podcasts and US audio drama: screenplay layout with numbered sound and music cues.',
  types: ['scene', 'sound', 'character', 'paren', 'dialogue', 'transition', 'action'],
  styles: { ...screenStyles, sound: { left: 1.5, width: 60, before: 1, upper: true, underline: true } },
  enter: { ...screenplay.enter, scene: 'sound', sound: 'character' },
  tabEmpty: { ...screenplay.tabEmpty, sound: 'character', scene: 'sound', action: 'character' },
  blockType: 'sound',
  cueNumbers: true,
};

// ---------------- Comics ----------------
const comic: Profile = {
  id: 'comic',
  name: 'Comic or graphic novel',
  group: 'Comics',
  blurb: 'Full script: comic pages and panels numbered, lettering items numbered for the letterer.',
  stage: false,
  songs: false,
  sceneTypes: false,
  types: ['page', 'panel', 'action', 'character', 'dialogue', 'caption', 'sfx', 'paren'],
  labels: { ...LABELS, action: 'Panel description', character: 'Speaker', dialogue: 'Balloon' },
  styles: {
    page: { left: 1.0, width: 65, before: 0, upper: true, bold: true, underline: true, pageBreakBefore: true },
    panel: { left: 1.0, width: 65, before: 2, upper: true, bold: true },
    action: { left: 1.0, width: 65, before: 1 },
    character: { left: 1.5, width: 18, before: 1, upper: true, hang: true },
    dialogue: { left: 3.3, width: 42, before: 0 },
    paren: { left: 3.3, width: 42, before: 0, italic: true },
    caption: { left: 1.5, width: 60, before: 1 },
    sfx: { left: 1.5, width: 60, before: 1, upper: true },
  },
  enter: { page: 'panel', panel: 'action', action: 'character', character: 'dialogue', dialogue: 'character', paren: 'dialogue', caption: 'character', sfx: 'character' },
  tab: { character: 'paren', dialogue: 'paren' },
  tabEmpty: { character: 'caption', caption: 'sfx', sfx: 'panel', panel: 'page', page: 'action', action: 'character', dialogue: 'paren', paren: 'dialogue' },
  blockType: 'action',
  marginLeft: 1.0,
  marginRight: 1.0,
  autoContd: false,
  runtime: false,
  numberScenes: false,
  comic: true,
};

// ---------------- Games ----------------
const game: Profile = {
  id: 'game',
  name: 'Video game',
  group: 'Games',
  blurb: 'Branching dialogue for games: nodes, player choices, conditions and jumps, barks, quest beats and lore, with recording line IDs. A4.',
  paper: 'a4',
  stage: false,
  songs: false,
  sceneTypes: false,
  types: ['scene', 'action', 'character', 'paren', 'dialogue', 'choice', 'cond', 'goto', 'bark', 'beat', 'lore'],
  labels: { ...LABELS, scene: 'Node', action: 'Context note', paren: 'Delivery', dialogue: 'Line' },
  styles: {
    scene: { left: 1.25, width: 65, before: 2, upper: true, bold: true, underline: true },
    beat: { left: 1.25, width: 65, before: 1, bold: true },
    action: { left: 1.25, width: 65, before: 1, italic: true },
    character: { left: 2.0, width: 40, before: 1, upper: true, bold: true },
    paren: { left: 2.5, width: 40, before: 0, italic: true },
    dialogue: { left: 2.0, width: 50, before: 0 },
    choice: { left: 1.75, width: 55, before: 1, bold: true },
    cond: { left: 1.25, width: 65, before: 1, italic: true },
    goto: { left: 1.75, width: 55, before: 1, upper: true },
    bark: { left: 1.25, width: 65, before: 1 },
    lore: { left: 1.75, width: 55, before: 1, italic: true },
  },
  enter: { scene: 'action', action: 'character', character: 'dialogue', paren: 'dialogue', dialogue: 'character', choice: 'character', cond: 'choice', goto: 'scene', bark: 'bark', beat: 'action', lore: 'action' },
  tab: { character: 'paren', dialogue: 'paren' },
  tabEmpty: { scene: 'beat', beat: 'action', action: 'character', character: 'choice', choice: 'cond', cond: 'goto', goto: 'bark', bark: 'lore', lore: 'scene', dialogue: 'paren', paren: 'dialogue' },
  blockType: 'action',
  marginLeft: 1.25,
  marginRight: 1.0,
  autoContd: false,
  runtime: false,
  numberScenes: false,
  game: true,
};

// ---------------- Documents ----------------
const treatment: Profile = {
  id: 'treatment',
  name: 'Treatment or outline',
  group: 'Documents',
  blurb: 'Pitch documents, treatments and series outlines: headings and prose.',
  stage: false,
  songs: false,
  sceneTypes: false,
  types: ['scene', 'action', 'centered'],
  labels: { ...LABELS, scene: 'Heading', action: 'Paragraph', centered: 'Title' },
  styles: {
    centered: { left: 1.0, width: 65, before: 0, upper: true, bold: true, align: 'center' },
    scene: { left: 1.0, width: 65, before: 2, upper: true, bold: true },
    action: { left: 1.0, width: 65, before: 1 },
  },
  enter: { scene: 'action', action: 'action', centered: 'action' },
  tab: {},
  tabEmpty: { action: 'scene', scene: 'centered', centered: 'action' },
  blockType: 'action',
  marginLeft: 1.0,
  marginRight: 1.0,
  autoContd: false,
  runtime: false,
  numberScenes: false,
};

export const PROFILES: Record<ProfileId, Profile> = {
  screenplay,
  'tv-drama': tvDrama,
  'tv-single': tvSingle,
  'tv-multi': tvMulti,
  'uk-sitcom': ukSitcom,
  vertical,
  'stage-uk': stageUk,
  'stage-us': stageUs,
  musical,
  'musical-us': musicalUs,
  panto,
  'radio-uk': radioUk,
  'audio-us': audioUs,
  comic,
  game,
  treatment,
};

export const PROFILE_ORDER: BuiltinProfileId[] = ['screenplay', 'tv-drama', 'tv-single', 'tv-multi', 'uk-sitcom', 'vertical', 'stage-uk', 'stage-us', 'musical', 'musical-us', 'panto', 'radio-uk', 'audio-us', 'game', 'comic', 'treatment'];
export const GROUPS: FormatGroup[] = ['Film', 'Television', 'Theatre', 'Audio', 'Games', 'Comics', 'Documents'];

/** Formats that export to Final Draft (.fdx). */
export const FDX_PROFILES = new Set<BuiltinProfileId>(['screenplay', 'tv-drama', 'tv-single', 'tv-multi', 'uk-sitcom', 'vertical', 'audio-us']);

/** The built-in format an id is, or is based on. Imported formats are `custom:<base>:<name>`. */
export const baseId = (id: ProfileId): BuiltinProfileId => {
  if (id.startsWith('custom:')) {
    const b = id.split(':')[1] as BuiltinProfileId;
    return b in PROFILES ? b : 'screenplay';
  }
  return id as BuiltinProfileId;
};

/**
 * The profile for an id. A script that uses an imported format opened on a device that doesn't have it
 * falls back to the built-in format it was based on, so it still opens and lays out.
 */
export const profileOf = (id: ProfileId): Profile => PROFILES[id] ?? PROFILES[baseId(id)];

/** Whether Final Draft export applies (imported formats follow the format they are based on). */
export const exportsFdx = (id: ProfileId): boolean => FDX_PROFILES.has(baseId(id));

export const labelOf = (p: Profile, t: ElType): string => p.labels[t] ?? LABELS[t];

// Elements a format has no style for borrow a close one, so switching format never hides content.
const FALLBACK: Partial<Record<ElType, ElType>> = {
  song: 'action',
  act: 'scene',
  lyrics: 'dialogue',
  shot: 'action',
  centered: 'action',
  endAct: 'centered',
  sound: 'action',
  page: 'scene',
  panel: 'action',
  caption: 'action',
  sfx: 'action',
  choice: 'action',
  bark: 'action',
  cond: 'action',
  goto: 'action',
  beat: 'action',
  lore: 'action',
  scene: 'action',
  character: 'action',
  dialogue: 'action',
  paren: 'dialogue',
  transition: 'action',
};
export const styleOf = (p: Profile, t: ElType): ElStyle | undefined => {
  let cur: ElType | undefined = t;
  for (let i = 0; i < 4 && cur; i++) {
    const s = p.styles[cur];
    if (s) return s;
    cur = FALLBACK[cur];
  }
  return p.styles.action;
};

export const defaultPaper = (): PaperId => {
  try {
    const lang = (navigator.language || 'en-GB').toLowerCase();
    return lang === 'en-us' || lang === 'en-ca' ? 'letter' : 'a4';
  } catch {
    return 'a4';
  }
};
