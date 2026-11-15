import { lineIds } from './lineid';
import { layout, type Layout } from './layout';
import { baseName, newId, type CastEntry, type El, type ElType, type PaperId, type ProfileId, type ReviewState, type Script, type SongMeta, type TitlePage } from './model';
import { profileOf } from './profiles';

type Listener = () => void;
const KEY = 'openact-prototype-v1';
/** Scripts saved before the renames (Cue, then ActOne: D-029, D-045). */
const OLD_KEYS = ['actone-prototype-v1', 'cue-prototype-v1'];

export interface Cursor {
  id: string | null;
  type: ElType | null;
}

export class Store {
  script: Script;
  layout: Layout;
  paged = true;
  cursor: Cursor = { id: null, type: null };
  highlight: string | null = null;
  saveState: 'saved' | 'unsaved' | 'unavailable' = 'saved';
  version = 0;
  private docListeners = new Set<Listener>();
  private uiListeners = new Set<Listener>();
  private history: string[] = [];
  private hIndex = -1;
  private saveTimer = 0;

  constructor(script: Script) {
    this.script = script;
    this.layout = layout(script);
    this.resetHistory();
  }

  // ---- subscriptions: "doc" re-renders the editor, "ui" only the chrome ----
  subscribeDoc = (fn: Listener) => {
    this.docListeners.add(fn);
    return () => this.docListeners.delete(fn);
  };
  subscribeUi = (fn: Listener) => {
    this.uiListeners.add(fn);
    return () => this.uiListeners.delete(fn);
  };
  getVersion = () => this.version;
  private emitUi() {
    this.version++;
    this.uiListeners.forEach((f) => f());
  }
  relayout() {
    this.layout = layout(this.script, { paged: this.paged });
    this.docListeners.forEach((f) => f());
    this.emitUi();
  }

  // ---- reads ----
  el(id: string) {
    return this.script.elements.find((e) => e.id === id);
  }
  index(id: string) {
    return this.script.elements.findIndex((e) => e.id === id);
  }
  prevOf(id: string) {
    const i = this.index(id);
    return i > 0 ? this.script.elements[i - 1] : undefined;
  }
  get profile() {
    return profileOf(this.script.profile);
  }

  // ---- edits ----
  setText(id: string, text: string) {
    const el = this.el(id);
    if (el) el.text = text;
    this.markUnsaved();
  }
  insertAfter(id: string | null, partial: Partial<El> & { type: ElType }): El {
    const el = this.withDefaults({ id: newId(), text: '', ...partial });
    const i = id ? this.index(id) : this.script.elements.length - 1;
    this.script.elements.splice(i + 1, 0, el);
    return el;
  }
  insertBefore(id: string, partial: Partial<El> & { type: ElType }): El {
    const el = this.withDefaults({ id: newId(), text: '', ...partial });
    this.script.elements.splice(this.index(id), 0, el);
    return el;
  }
  appendMany(items: { type: ElType; text: string }[]) {
    for (const it of items) this.script.elements.push(this.withDefaults({ id: newId(), ...it }));
  }
  remove(id: string) {
    this.script.elements.splice(this.index(id), 1);
  }
  setType(id: string, type: ElType, text?: string) {
    const el = this.el(id);
    if (!el) return;
    el.type = type;
    if (text !== undefined) el.text = text;
    Object.assign(el, this.withDefaults({ ...el }));
  }
  private withDefaults(el: El): El {
    if (el.type === 'song' && !el.song) el.song = { singers: '', func: '', staging: '', feel: '' };
    if (el.type === 'scene' && this.profile.sceneTypes && !el.sceneType) el.sceneType = 'full';
    return el;
  }
  setSong(id: string, meta: SongMeta, title?: string) {
    const el = this.el(id);
    if (!el) return;
    el.song = meta;
    if (title !== undefined) el.text = title;
    this.change();
  }
  setSceneType(id: string, t: 'full' | 'cloth') {
    const el = this.el(id);
    if (el) el.sceneType = t;
    this.change();
  }
  setNote(id: string, note: string) {
    const el = this.el(id);
    if (el) el.note = note.trim() || undefined;
    this.change();
  }
  /** Video game: keep every recording line ID where it is now, so recorded files never lose their name. */
  lockLineIds() {
    const ids = lineIds(this.script);
    this.script.elements.forEach((e) => {
      const id = ids.get(e.id);
      if (id) e.lineId = id;
    });
    this.change();
  }
  unlockLineIds() {
    this.script.elements.forEach((e) => delete e.lineId);
    this.change();
  }
  setProfile(p: ProfileId) {
    this.script.profile = p;
    this.script.elements.forEach((e) => Object.assign(e, this.withDefaults(e)));
    this.change();
  }
  setPaper(p: PaperId) {
    this.script.paper = p;
    this.change();
  }
  setTitle(t: TitlePage) {
    this.script.title = t;
    this.change();
  }
  setCast(c: CastEntry[]) {
    this.script.cast = c;
    this.change();
  }
  dismiss(key: string) {
    this.script.dismissed = [...this.script.dismissed, key];
    this.change();
  }
  undismiss(key: string) {
    this.script.dismissed = this.script.dismissed.filter((k) => k !== key);
    this.change();
  }
  setReview(patch: Partial<ReviewState>) {
    this.script.review = { ...this.script.review, ...patch };
    this.change();
  }
  toggleTicked(key: string) {
    const ticked = this.script.review?.ticked ?? [];
    this.setReview({ ticked: ticked.includes(key) ? ticked.filter((k) => k !== key) : [...ticked, key] });
  }
  /** Rename a character in every cue, in capitals inside stage directions, and in the cast list. */
  renameCharacter(from: string, to: string) {
    const f = from.toUpperCase();
    const t = to.toUpperCase().trim();
    if (!t || f === t) return 0;
    const word = new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    let changes = 0;
    for (const el of this.script.elements) {
      if (el.type === 'character' && baseName(el.text) === f) {
        el.text = t + el.text.toUpperCase().slice(f.length);
        changes++;
      } else if (el.type === 'action' && word.test(el.text)) {
        el.text = el.text.replace(word, t);
        changes++;
      }
      if (el.song) el.song.singers = el.song.singers.replace(word, t);
      word.lastIndex = 0;
    }
    this.script.cast = this.script.cast.map((c) => (c.name.toUpperCase() === f ? { ...c, name: t } : c));
    this.change();
    return changes;
  }
  /** Move a scene (heading plus everything up to the next scene or act) so it starts before `beforeId` (or at the end). */
  moveScene(headingId: string, beforeId: string | null) {
    const els = this.script.elements;
    const from = this.index(headingId);
    if (from < 0 || headingId === beforeId) return;
    let to = from + 1;
    while (to < els.length && els[to].type !== 'scene' && els[to].type !== 'act') to++;
    const block = els.splice(from, to - from);
    const at = beforeId ? this.index(beforeId) : els.length;
    els.splice(at < 0 ? els.length : at, 0, ...block);
    this.change();
  }
  load(script: Script) {
    this.script = script;
    this.resetHistory();
    this.markUnsaved(); // a script just started or opened is kept, even before the first edit
    this.change();
  }

  // ---- cursor and highlight (chrome only) ----
  setCursor(id: string | null) {
    const el = id ? this.el(id) : undefined;
    if (this.cursor.id === id && this.cursor.type === (el?.type ?? null)) return;
    this.cursor = { id, type: el?.type ?? null };
    this.emitUi();
  }
  setHighlight(name: string | null) {
    this.highlight = name;
    this.relayout();
  }
  setPaged(paged: boolean) {
    if (this.paged === paged) return;
    this.paged = paged;
    this.relayout();
  }

  // ---- history and saving ----
  private change() {
    this.commit();
    this.relayout();
  }
  private resetHistory() {
    this.history = [JSON.stringify(this.script)];
    this.hIndex = 0;
  }
  commit() {
    const snap = JSON.stringify(this.script);
    if (snap === this.history[this.hIndex]) return;
    this.history = this.history.slice(0, this.hIndex + 1);
    this.history.push(snap);
    if (this.history.length > 200) this.history.shift();
    this.hIndex = this.history.length - 1;
    this.markUnsaved();
  }
  undo() {
    this.commit();
    if (this.hIndex <= 0) return false;
    this.hIndex--;
    this.script = JSON.parse(this.history[this.hIndex]);
    this.markUnsaved();
    this.relayout();
    return true;
  }
  redo() {
    if (this.hIndex >= this.history.length - 1) return false;
    this.hIndex++;
    this.script = JSON.parse(this.history[this.hIndex]);
    this.markUnsaved();
    this.relayout();
    return true;
  }
  private markUnsaved() {
    if (this.saveState !== 'unavailable') this.saveState = 'unsaved';
    window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => this.save(), 600);
  }
  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.script));
      this.saveState = 'saved';
    } catch {
      this.saveState = 'unavailable';
    }
    this.emitUi();
  }
  static restore(): Script | null {
    try {
      const raw = localStorage.getItem(KEY) ?? OLD_KEYS.map((k) => localStorage.getItem(k)).find((v) => v !== null) ?? null;
      return raw ? (JSON.parse(raw) as Script) : null;
    } catch {
      return null;
    }
  }
}
