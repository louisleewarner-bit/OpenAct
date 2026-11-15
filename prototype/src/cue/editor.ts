import { baseName, type El, type ElType } from './model';
import type { Deco, Frag } from './layout';
import { labelOf, PAPERS, styleOf, type ElStyle, type Profile } from './profiles';
import type { Store } from './store';
import { autocompleteTypes, suggestions, type Suggestion } from './suggest';

export interface EditorHooks {
  announce(msg: string): void;
  openTitle(): void;
  openNote(id: string): void;
  multiLinePaste(text: string): void;
}

const CE: string = (() => {
  const d = document.createElement('div');
  try {
    d.contentEditable = 'plaintext-only';
  } catch {
    /* older browsers reject the value */
  }
  return d.contentEditable === 'plaintext-only' ? 'plaintext-only' : 'true';
})();

const div = (cls: string) => {
  const d = document.createElement('div');
  d.className = cls;
  return d;
};

const isEmptyParen = (el: El) => el.type === 'paren' && /^\(\s*\)$/.test(el.text.trim());

/**
 * The page editor owns its own DOM: one editable block per element fragment, rebuilt after each layout pass,
 * with the caret restored by element id and offset. React draws the chrome around it.
 */
export class PageEditor {
  fit = true;
  private sheets: HTMLElement | null = null;
  private relayoutTimer = 0;
  private pending: { id: string; offset: number; scroll?: boolean } | null = null;
  private composing = false;
  private escArmed = false;
  private lastFocusId: string | null = null;
  private ac: { box: HTMLDivElement; items: Suggestion[]; active: number; frag: HTMLElement } | null = null;
  private cleanup: (() => void)[] = [];

  private root: HTMLElement;
  private store: Store;
  private hooks: EditorHooks;

  constructor(root: HTMLElement, store: Store, hooks: EditorHooks) {
    this.root = root;
    this.store = store;
    this.hooks = hooks;
    const on = <K extends keyof HTMLElementEventMap>(t: K, fn: (e: HTMLElementEventMap[K]) => void) => {
      root.addEventListener(t, fn as EventListener);
      this.cleanup.push(() => root.removeEventListener(t, fn as EventListener));
    };
    on('input', this.onInput);
    on('keydown', this.onKeyDown);
    on('focusin', this.onFocusIn);
    on('paste', this.onPaste);
    on('click', this.onClick);
    on('compositionstart', () => (this.composing = true));
    on('compositionend', () => {
      this.composing = false;
      this.scheduleRelayout();
    });
    on('scroll', () => this.closeAc());
    this.cleanup.push(store.subscribeDoc(() => this.render()));
    const ro = new ResizeObserver(() => this.updateZoom());
    ro.observe(root);
    this.cleanup.push(() => ro.disconnect());
    this.render();
  }

  destroy() {
    this.closeAc();
    this.cleanup.forEach((f) => f());
  }

  // ---------- public API for the chrome ----------
  focusElement(id: string) {
    this.focusAt(id, 0, false);
    this.fragsOf(id)[0]?.scrollIntoView({ block: 'center' });
  }
  currentId() {
    return this.lastFocusId;
  }
  setCurrentType(t: ElType) {
    const el = this.lastFocusId ? this.store.el(this.lastFocusId) : undefined;
    if (el) this.structural(() => this.convertNow(el, t));
  }
  /** The element bar: an empty line becomes the type; a line with text gets a new line of that type below. */
  applyType(t: ElType) {
    this.closeAc();
    const els = this.store.script.elements;
    const el = (this.lastFocusId ? this.store.el(this.lastFocusId) : undefined) ?? els[els.length - 1];
    if (!el) return;
    const empty = !el.text.trim() || isEmptyParen(el);
    this.structural(() => {
      if (empty) {
        if (el.type === t) return { id: el.id, offset: t === 'paren' ? 1 : 0 };
        return this.convertNow(el, t);
      }
      const n = this.store.insertAfter(el.id, { type: t, text: t === 'paren' ? '()' : '' });
      this.hooks.announce(`New ${labelOf(this.store.profile, t)}`);
      return { id: n.id, offset: t === 'paren' ? 1 : 0 };
    });
  }
  /** Fill the current (character) line with a name and move on to the line that follows it. */
  insertName(name: string) {
    this.closeAc();
    const el = this.lastFocusId ? this.store.el(this.lastFocusId) : undefined;
    if (!el) return;
    this.structural(() => {
      let target = el;
      if (el.text.trim() && !isEmptyParen(el)) target = this.store.insertAfter(el.id, { type: 'character', text: '' });
      else if (target.type !== 'character') this.store.setType(target.id, 'character', '');
      this.store.setText(target.id, name);
      const fresh = this.store.el(target.id)!;
      const next = this.nextType(fresh);
      const n = this.store.insertAfter(fresh.id, { type: next, text: next === 'paren' ? '()' : '' });
      this.hooks.announce(`${name}. ${labelOf(this.store.profile, next)}`);
      return { id: n.id, offset: next === 'paren' ? 1 : 0 };
    });
  }
  pressTab() {
    const id = this.lastFocusId;
    const el = id ? this.store.el(id) : undefined;
    if (el) this.tab(el, el.text.length, false);
  }
  setFit(fit: boolean) {
    this.fit = fit;
    this.updateZoom();
  }
  insertAtEnd(items: { type: ElType; text: string }[]) {
    if (!items.length) return;
    this.store.commit();
    this.store.appendMany(items);
    this.store.commit();
    const last = this.store.script.elements[this.store.script.elements.length - 1];
    this.pending = { id: last.id, offset: last.text.length, scroll: true };
    this.store.relayout();
  }

  // ---------- rendering ----------
  render() {
    const store = this.store;
    const prof = store.profile;
    const paper = PAPERS[store.script.paper];
    const active = document.activeElement as HTMLElement | null;
    const hadFocus = !!active && this.root.contains(active) && active.classList.contains('frag');
    const target: { id: string; offset: number; scroll?: boolean } | null = this.pending ?? (hadFocus ? this.caretPos() : null);
    this.pending = null;
    this.closeAc();
    const scrollTop = this.root.scrollTop;
    this.root.textContent = '';
    if (store.paged) {
      const pages = div('pages');
      pages.style.setProperty('--page-w', `${paper.width}in`);
      pages.style.setProperty('--page-h', `${paper.height}in`);
      pages.style.setProperty('--margin-l', `${prof.marginLeft}in`);
      pages.style.setProperty('--margin-r', `${prof.marginRight}in`);
      if (store.script.title.title.trim()) pages.appendChild(this.titleSheet());
      store.layout.pages.forEach((pg, i) => pages.appendChild(this.sheet(pg.frags, i, prof)));
      this.root.appendChild(pages);
      this.sheets = pages;
      this.updateZoom();
    } else {
      const flow = div(`flow p-${prof.stage ? 'stage' : 'screenplay'}`);
      flow.setAttribute('role', 'group');
      flow.setAttribute('aria-label', 'Script');
      store.layout.pages.forEach((pg) => pg.frags.forEach((f, k, arr) => this.appendFrag(flow, f, prof, arr[k - 1] ?? null)));
      this.root.appendChild(flow);
      this.sheets = null;
    }
    this.root.scrollTop = scrollTop;
    this.placeOverlays();
    if (target) this.focusAt(target.id, target.offset, !!target.scroll);
    else this.updateMarginNote();
    this.updateTabStop();
    this.applyHighlight();
  }

  /** One tab stop for the whole script: the current element. Tab inside the script changes elements instead. */
  private updateTabStop() {
    const frags = [...this.root.querySelectorAll<HTMLElement>('.frag')];
    const current = (this.lastFocusId && frags.find((f) => f.dataset.id === this.lastFocusId)) || frags[0];
    frags.forEach((f) => (f.tabIndex = f === current ? 0 : -1));
  }

  private titleSheet() {
    const t = this.store.script.title;
    const sec = div('sheet title-sheet');
    sec.setAttribute('role', 'button');
    sec.tabIndex = -1;
    sec.setAttribute('aria-label', `Title page: ${t.title}. Select to edit.`);
    const block = div('title-block');
    const lines = [t.title, '', t.credit, t.authors, '', t.source].filter((x, i, a) => x || (i > 0 && a[i - 1]));
    lines.forEach((l, i) => {
      const d = div(i === 0 ? 't' : '');
      d.textContent = l || ' ';
      block.appendChild(d);
    });
    const foot = div('title-foot');
    const left = div('');
    left.textContent = t.contact;
    const right = div('');
    right.textContent = t.draftDate;
    foot.append(left, right);
    sec.append(block, foot);
    return sec;
  }

  private sheet(frags: Frag[], i: number, prof: Profile) {
    const sec = document.createElement('section');
    sec.className = 'sheet';
    sec.setAttribute('aria-label', `Page ${i + 1}`);
    if (i > 0) {
      const num = div('sheet-num');
      num.textContent = prof.stage ? `${i + 1}` : `${i + 1}.`;
      num.setAttribute('aria-hidden', 'true');
      sec.appendChild(num);
    }
    let prev: Frag | null = null;
    for (const f of frags) {
      this.appendFrag(sec, f, prof, prev);
      prev = f;
    }
    return sec;
  }

  /** A fragment plus the printed lines around it that the writer doesn't type. */
  private appendFrag(host: HTMLElement, f: Frag, prof: Profile, prev: Frag | null) {
    const cue = styleOf(prof, 'character')!;
    if (f.contCue) host.appendChild(this.deco(f.contCue, cue, prof));
    let frag = f;
    f.decoBefore?.forEach((d, k) => {
      host.appendChild(this.decoLine(d, prof, k === 0 ? f.before : 0));
      frag = { ...frag, before: 0 };
    });
    host.appendChild(this.fragEl(frag, prof, prev));
    f.decoAfter?.forEach((d) => host.appendChild(this.decoLine(d, prof, 0)));
    if (f.more) host.appendChild(this.deco('(MORE)', cue, prof));
  }

  private decoLine(d: Deco, prof: Profile, before: number) {
    const line = div(`deco clear ${d.kind === 'heading' ? 'center underline' : ''}`);
    line.setAttribute('aria-hidden', 'true');
    line.textContent = d.text;
    if (this.store.paged) {
      const paper = PAPERS[this.store.script.paper];
      const action = styleOf(prof, 'action')!;
      if (d.kind === 'heading') line.style.width = `${paper.width - prof.marginLeft - prof.marginRight}in`;
      else line.style.marginLeft = `${action.left - prof.marginLeft}in`;
      if (before) line.style.marginTop = `calc(${before}in / 6)`;
    }
    return line;
  }

  private deco(text: string, s: ElStyle, prof: Profile) {
    const d = div('deco clear');
    d.style.marginLeft = `${s.left - prof.marginLeft}in`;
    d.setAttribute('aria-hidden', 'true');
    d.textContent = text;
    return d;
  }

  private fragEl(f: Frag, prof: Profile, prev: Frag | null) {
    const el = this.store.el(f.id)!;
    const s = styleOf(prof, f.type)!;
    const d = document.createElement('div');
    d.className = ['frag', `t-${f.type}`, s.upper && 'upper', s.bold && 'bold', s.italic && 'italic', s.underline && 'underline', s.align === 'center' && 'center', s.align === 'right' && 'right']
      .filter(Boolean)
      .join(' ');
    d.contentEditable = CE;
    d.spellcheck = true;
    d.lang = 'en-GB';
    d.dataset.id = f.id;
    d.dataset.start = String(f.start);
    d.dataset.end = String(f.end);
    d.dataset.type = f.type;
    d.dataset.placeholder = labelOf(prof, f.type);
    if (f.prefix) d.dataset.prefix = f.prefix;
    if (f.suffix) d.dataset.suffix = f.suffix;
    const combo = autocompleteTypes.has(f.type);
    d.setAttribute('role', combo ? 'combobox' : 'textbox');
    if (!combo) d.setAttribute('aria-multiline', 'true');
    d.setAttribute('aria-label', `${labelOf(prof, f.type)}${f.start > 0 ? ' (continued)' : ''}`);
    d.tabIndex = -1;
    if (combo) {
      d.setAttribute('aria-autocomplete', 'list');
      d.setAttribute('aria-expanded', 'false');
    }
    if (this.store.paged) {
      const paper = PAPERS[this.store.script.paper];
      const ml = s.left - prof.marginLeft;
      const area = paper.width - prof.marginLeft - prof.marginRight;
      d.style.marginLeft = `${ml}in`;
      d.style.width = s.align && s.align !== 'left' ? `${area - ml}in` : `${s.width}ch`;
      const mt = f.before + (prev?.hang ? prev.before : 0);
      const sp = s.lineSpacing ?? 1;
      if (sp > 1) {
        // Double spacing on the 1/6-inch grid: taller line boxes. The box starts where the layout says (a negative
        // top margin would be cancelled by `clear` after a speaker float and push the speech half a line down),
        // is pulled up half a line so the text sits on the grid, and gives back the extra line below.
        d.style.lineHeight = `calc(${sp}in / 6)`;
        if (mt) d.style.marginTop = `calc(${mt}in / 6)`;
        d.style.marginBottom = `calc(${-(sp - 1)}in / 6)`;
        d.style.position = 'relative';
        d.style.top = `calc(${-(sp - 1) / 2}in / 6)`;
      } else if (mt) d.style.marginTop = `calc(${mt}in / 6)`;
      if (f.hang) {
        d.classList.add('hang');
        d.style.width = `${(prof.styles.dialogue?.left ?? s.left + 1.6) - s.left}in`;
      } else if (!prev?.hang) d.classList.add('clear');
    } else if ((s.lineSpacing ?? 1) > 1) d.classList.add('double');
    if (f.cue) d.dataset.cue = String(f.cue);
    d.textContent = el.text.slice(f.start, f.end);
    return d;
  }

  private placeOverlays() {
    const prof = this.store.profile;
    const paper = PAPERS[this.store.script.paper];
    const zoom = Number(this.sheets?.style.getPropertyValue('--zoom') || 1);
    const spare = (this.root.clientWidth - paper.width * 96 * zoom) / 2;
    const roomForNotes = spare > 2.5 * 96 * zoom;
    for (const f of this.root.querySelectorAll<HTMLElement>('.frag')) {
      if (f.dataset.start !== '0') continue;
      const el = this.store.el(f.dataset.id!);
      if (!el) continue;
      const host = f.parentElement!;
      if (f.dataset.cue) {
        const c = div('cue-num');
        c.setAttribute('aria-hidden', 'true');
        c.textContent = f.dataset.cue;
        if (this.store.paged) {
          c.style.top = `${f.offsetTop}px`;
          host.appendChild(c);
        } else host.insertBefore(c, f);
      }
      if (el.type === 'scene' && prof.sceneTypes) {
        const cloth = el.sceneType === 'cloth';
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `margin-chip ${cloth ? 'cloth' : 'full'}`;
        b.dataset.sceneId = el.id;
        b.tabIndex = -1;
        b.textContent = cloth ? 'Front cloth' : 'Full stage';
        b.setAttribute('aria-label', `Scene type: ${b.textContent}. Switch to ${cloth ? 'full stage' : 'front cloth'}.`);
        if (this.store.paged) {
          b.style.top = `${f.offsetTop}px`;
          b.style.right = '0.12in';
          host.appendChild(b);
        } else host.insertBefore(b, f);
      }
      if (el.note) {
        if (this.store.paged && roomForNotes) {
          const n = div('pencil-note');
          n.setAttribute('role', 'note');
          n.textContent = el.note;
          n.style.top = `${f.offsetTop}px`;
          host.appendChild(n);
        } else {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'note-btn';
          b.dataset.noteId = el.id;
          b.tabIndex = -1;
          b.textContent = 'Note';
          b.title = el.note;
          b.setAttribute('aria-label', `Note: ${el.note}`);
          if (this.store.paged) {
            b.style.top = `${f.offsetTop}px`;
            host.appendChild(b);
          } else host.insertBefore(b, f.nextSibling);
        }
      }
    }
  }

  private updateMarginNote() {
    this.root.querySelectorAll('.margin-note').forEach((n) => n.remove());
    const a = document.activeElement as HTMLElement | null;
    if (!a || !a.classList.contains('frag') || !this.root.contains(a) || !this.store.paged) return;
    const n = div(`margin-note${this.store.profile.cueNumbers ? ' right' : ''}`);
    n.setAttribute('aria-hidden', 'true');
    n.textContent = labelOf(this.store.profile, a.dataset.type as ElType);
    n.style.top = `${a.offsetTop}px`;
    a.parentElement!.appendChild(n);
  }

  private updateZoom() {
    if (!this.sheets) return;
    const paper = PAPERS[this.store.script.paper];
    const z = this.fit ? Math.max(0.45, Math.min(1, (this.root.clientWidth - 48) / (paper.width * 96))) : 1;
    this.sheets.style.setProperty('--zoom', z.toFixed(3));
  }

  private applyHighlight() {
    const reg = (CSS as unknown as { highlights?: Map<string, unknown> }).highlights;
    const HighlightCtor = (window as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight;
    if (!reg || !HighlightCtor) return;
    reg.delete('openact-lines');
    const who = this.store.highlight;
    if (!who) return;
    const ranges: Range[] = [];
    let speaker: string | null = null;
    this.root.querySelectorAll<HTMLElement>('.frag').forEach((f) => {
      const el = this.store.el(f.dataset.id!);
      if (!el) return;
      const t = f.dataset.type;
      if (t === 'character') speaker = baseName(el.text);
      else if (t === 'dialogue' || t === 'lyrics' || t === 'paren') {
        if (speaker === who && f.firstChild) {
          const r = document.createRange();
          r.selectNodeContents(f);
          ranges.push(r);
        }
      } else speaker = null;
    });
    if (ranges.length) reg.set('openact-lines', new HighlightCtor(...ranges));
  }

  // ---------- caret helpers ----------
  private fragsOf(id: string) {
    return [...this.root.querySelectorAll<HTMLElement>(`.frag[data-id="${CSS.escape(id)}"]`)];
  }
  private locate(frag: HTMLElement, k: number): [Node, number] {
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);
    let acc = 0;
    let n: Node | null;
    let last: Node | null = null;
    while ((n = walker.nextNode())) {
      const len = (n.textContent ?? '').length;
      if (k <= acc + len) return [n, k - acc];
      acc += len;
      last = n;
    }
    return last ? [last, (last.textContent ?? '').length] : [frag, 0];
  }
  private caretIn(frag: HTMLElement) {
    const sel = getSelection();
    if (!sel || !sel.rangeCount) return 0;
    const r = sel.getRangeAt(0);
    if (!frag.contains(r.startContainer)) return 0;
    const pre = document.createRange();
    pre.selectNodeContents(frag);
    pre.setEnd(r.startContainer, r.startOffset);
    return pre.toString().length;
  }
  private collapsed() {
    const sel = getSelection();
    return !!sel && sel.isCollapsed;
  }
  private setCaret(frag: HTMLElement, k: number) {
    frag.focus({ preventScroll: true });
    const [node, off] = this.locate(frag, k);
    const r = document.createRange();
    r.setStart(node, off);
    r.collapse(true);
    const sel = getSelection()!;
    sel.removeAllRanges();
    sel.addRange(r);
  }
  private caretPos() {
    const a = document.activeElement as HTMLElement | null;
    if (!a || !a.classList.contains('frag')) return null;
    return { id: a.dataset.id!, offset: Number(a.dataset.start) + this.caretIn(a) };
  }
  private focusAt(id: string, offset: number, scroll: boolean) {
    const fs = this.fragsOf(id);
    if (!fs.length) return;
    const f = fs.find((x) => offset >= Number(x.dataset.start) && offset <= Number(x.dataset.end)) ?? (offset < Number(fs[0].dataset.start) ? fs[0] : fs[fs.length - 1]);
    const k = Math.max(0, Math.min(offset - Number(f.dataset.start), (f.textContent ?? '').length));
    this.setCaret(f, k);
    if (scroll) f.scrollIntoView({ block: 'nearest' });
    this.lastFocusId = id;
    this.updateMarginNote();
    this.store.setCursor(id);
  }
  private charRect(frag: HTMLElement, k: number) {
    const len = (frag.textContent ?? '').length;
    if (!len) return frag.getBoundingClientRect();
    const a = Math.min(k, len - 1);
    const [n1, o1] = this.locate(frag, a);
    const [n2, o2] = this.locate(frag, a + 1);
    const r = document.createRange();
    r.setStart(n1, o1);
    r.setEnd(n2, o2);
    const rects = r.getClientRects();
    return rects.length ? rects[rects.length - 1] : r.getBoundingClientRect();
  }
  private onEdgeLine(frag: HTMLElement, which: 'first' | 'last') {
    if (!this.collapsed()) return false;
    const len = (frag.textContent ?? '').length;
    if (!len) return true;
    const here = this.charRect(frag, this.caretIn(frag)).top;
    const edge = this.charRect(frag, which === 'first' ? 0 : len).top;
    return Math.abs(here - edge) < 4;
  }
  private moveFrag(frag: HTMLElement, dir: 1 | -1) {
    const all = [...this.root.querySelectorAll<HTMLElement>('.frag')];
    const t = all[all.indexOf(frag) + dir];
    if (!t) return false;
    this.setCaret(t, dir < 0 ? (t.textContent ?? '').length : 0);
    t.scrollIntoView({ block: 'nearest' });
    return true;
  }

  // ---------- events ----------
  private onFocusIn = (e: FocusEvent) => {
    const f = (e.target as HTMLElement).closest?.('.frag') as HTMLElement | null;
    if (!f) return;
    this.lastFocusId = f.dataset.id!;
    this.updateMarginNote();
    this.updateTabStop();
    this.store.setCursor(f.dataset.id!);
    if (f.dataset.type === 'character' && !(f.textContent ?? '').trim()) this.updateAc(f);
  };

  private onClick = (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    const chip = t.closest('.margin-chip') as HTMLElement | null;
    if (chip?.dataset.sceneId) {
      const el = this.store.el(chip.dataset.sceneId);
      if (el) {
        const next = el.sceneType === 'cloth' ? 'full' : 'cloth';
        this.store.setSceneType(el.id, next);
        this.hooks.announce(next === 'cloth' ? 'Front cloth' : 'Full stage');
      }
      return;
    }
    const note = t.closest('.note-btn') as HTMLElement | null;
    if (note?.dataset.noteId) return this.hooks.openNote(note.dataset.noteId);
    if (t.closest('.title-sheet')) this.hooks.openTitle();
  };

  private onInput = (e: Event) => {
    const frag = (e.target as HTMLElement).closest?.('.frag') as HTMLElement | null;
    if (!frag) return;
    const id = frag.dataset.id!;
    const el = this.store.el(id);
    if (!el) return;
    const start = Number(frag.dataset.start);
    const end = Number(frag.dataset.end);
    const txt = (frag.textContent ?? '').replace(/ /g, ' ');
    const delta = start + txt.length - end;
    this.store.setText(id, el.text.slice(0, start) + txt + el.text.slice(end));
    frag.dataset.end = String(start + txt.length);
    for (const o of this.fragsOf(id)) {
      if (o !== frag && Number(o.dataset.start) > start) {
        o.dataset.start = String(Number(o.dataset.start) + delta);
        o.dataset.end = String(Number(o.dataset.end) + delta);
      }
    }
    this.updateAc(frag);
    this.scheduleRelayout();
  };

  private onPaste = (e: ClipboardEvent) => {
    const frag = (e.target as HTMLElement).closest?.('.frag');
    if (!frag) return;
    e.preventDefault();
    const text = (e.clipboardData?.getData('text/plain') ?? '').replace(/\r/g, '');
    if (text.trim().split('\n').length > 1) return this.hooks.multiLinePaste(text);
    document.execCommand('insertText', false, text);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.classList.contains('title-sheet') && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      return this.hooks.openTitle();
    }
    const frag = t.closest?.('.frag') as HTMLElement | null;
    if (!frag || this.composing || e.isComposing) return;
    const el = this.store.el(frag.dataset.id!);
    if (!el) return;
    const prof = this.store.profile;
    const start = Number(frag.dataset.start);
    const local = this.caretIn(frag);
    const offset = start + local;
    const mod = e.ctrlKey || e.metaKey;

    if (this.ac) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        return this.moveAc(e.key === 'ArrowDown' ? 1 : -1);
      }
      if ((e.key === 'Enter' || e.key === 'Tab') && !e.shiftKey) {
        e.preventDefault();
        return this.acceptAc();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        return this.closeAc();
      }
    }
    if (e.key === 'Escape') {
      this.escArmed = true;
      return;
    }
    if (e.key === 'Tab' && this.escArmed) {
      this.escArmed = false;
      return; // let focus leave the script
    }
    this.escArmed = false;

    if (mod && !e.altKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      return this.undoRedo(e.shiftKey ? 'redo' : 'undo');
    }
    if (mod && !e.altKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      return this.undoRedo('redo');
    }
    if (mod && e.altKey) {
      const digit = /^Digit([1-9])$/.exec(e.code);
      if (digit) {
        e.preventDefault();
        const type = prof.types[Number(digit[1]) - 1];
        if (type) this.structural(() => this.convertNow(el, type));
        return;
      }
      if (e.code === 'KeyM') {
        e.preventDefault();
        return this.hooks.openNote(el.id);
      }
    }
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (e.shiftKey) document.execCommand('insertText', false, '\n');
        else this.enter(el, offset);
        return;
      case 'Tab':
        e.preventDefault();
        return this.tab(el, offset, e.shiftKey);
      case 'Backspace':
        if (isEmptyParen(el) && local <= 1) {
          e.preventDefault();
          return this.removeAndFocusPrev(el);
        }
        if (local === 0 && this.collapsed() && this.backspace(el, start)) e.preventDefault();
        return;
      case 'ArrowUp':
        if (this.onEdgeLine(frag, 'first') && this.moveFrag(frag, -1)) e.preventDefault();
        return;
      case 'ArrowDown':
        if (this.onEdgeLine(frag, 'last') && this.moveFrag(frag, 1)) e.preventDefault();
        return;
      case 'ArrowLeft':
        if (local === 0 && this.collapsed() && this.moveFrag(frag, -1)) e.preventDefault();
        return;
      case 'ArrowRight':
        if (local === (frag.textContent ?? '').length && this.collapsed() && this.moveFrag(frag, 1)) e.preventDefault();
        return;
    }
  };

  // ---------- element flow ----------
  private structural(fn: () => { id: string; offset: number } | null) {
    window.clearTimeout(this.relayoutTimer);
    this.store.commit();
    const target = fn();
    this.store.commit();
    if (target) this.pending = { ...target, scroll: true };
    this.store.relayout();
  }

  private scheduleRelayout() {
    window.clearTimeout(this.relayoutTimer);
    this.relayoutTimer = window.setTimeout(() => {
      if (this.composing) return;
      this.store.commit();
      this.store.relayout();
    }, 400);
  }

  private undoRedo(dir: 'undo' | 'redo') {
    window.clearTimeout(this.relayoutTimer);
    const keep = this.lastFocusId;
    if (keep) this.pending = { id: keep, offset: Number.MAX_SAFE_INTEGER };
    const ok = dir === 'undo' ? this.store.undo() : this.store.redo();
    this.hooks.announce(ok ? (dir === 'undo' ? 'Undone' : 'Redone') : dir === 'undo' ? 'Nothing to undo' : 'Nothing to redo');
  }

  private nextType(el: El): ElType {
    const prof = this.store.profile;
    if (el.type === 'character') {
      const prev = this.store.prevOf(el.id);
      if (prof.songs && prev && (prev.type === 'lyrics' || prev.type === 'song')) return 'lyrics';
    }
    return prof.enter[el.type] ?? prof.blockType;
  }

  private convertNow(el: El, t: ElType) {
    let text = el.text;
    if (t === 'paren' && !/^\(.*\)$/.test(text.trim())) text = `(${text.trim()})`;
    if (el.type === 'paren' && t !== 'paren') text = text.trim().replace(/^\(\s*/, '').replace(/\s*\)$/, '');
    this.store.setType(el.id, t, text);
    this.hooks.announce(labelOf(this.store.profile, t));
    return { id: el.id, offset: t === 'paren' ? Math.max(1, text.length - 1) : text.length };
  }

  private enter(el: El, offset: number) {
    const prof = this.store.profile;
    const text = el.text;
    const empty = !text.trim() || isEmptyParen(el);
    const atEnd = offset >= text.length || (el.type === 'paren' && offset >= text.length - 1);
    this.structural(() => {
      if (empty) {
        if (el.type === prof.blockType) return null;
        return this.convertNow(el, prof.blockType);
      }
      if (offset === 0) {
        this.store.insertBefore(el.id, { type: el.type, text: '' });
        return { id: el.id, offset: 0 };
      }
      if (!atEnd) {
        this.store.setText(el.id, text.slice(0, offset).replace(/\s+$/, ''));
        const n = this.store.insertAfter(el.id, { type: el.type, text: text.slice(offset).replace(/^\s+/, '') });
        return { id: n.id, offset: 0 };
      }
      const next = this.nextType(el);
      const n = this.store.insertAfter(el.id, { type: next, text: next === 'paren' ? '()' : '' });
      this.hooks.announce(labelOf(prof, next));
      return { id: n.id, offset: next === 'paren' ? 1 : 0 };
    });
  }

  private tab(el: El, offset: number, shift: boolean) {
    const prof = this.store.profile;
    const text = el.text;
    const empty = !text.trim() || isEmptyParen(el);
    if (shift) {
      if (!empty) return;
      const from = (Object.entries(prof.tabEmpty) as [ElType, ElType][]).find(([, to]) => to === el.type)?.[0];
      if (from) this.structural(() => this.convertNow(el, from));
      return;
    }
    if (empty) {
      const t = prof.tabEmpty[el.type];
      if (t) this.structural(() => this.convertNow(el, t));
      return;
    }
    if (prof.tab[el.type] !== 'paren') return;
    this.structural(() => {
      if (el.type === 'dialogue' && offset === 0) {
        const p = this.store.insertBefore(el.id, { type: 'paren', text: '()' });
        return { id: p.id, offset: 1 };
      }
      if (el.type === 'dialogue' && offset < text.length) {
        this.store.setText(el.id, text.slice(0, offset).replace(/\s+$/, ''));
        const p = this.store.insertAfter(el.id, { type: 'paren', text: '()' });
        this.store.insertAfter(p.id, { type: 'dialogue', text: text.slice(offset).replace(/^\s+/, '') });
        this.hooks.announce(labelOf(prof, 'paren'));
        return { id: p.id, offset: 1 };
      }
      const p = this.store.insertAfter(el.id, { type: 'paren', text: '()' });
      this.hooks.announce(labelOf(prof, 'paren'));
      return { id: p.id, offset: 1 };
    });
  }

  private removeAndFocusPrev(el: El) {
    const prev = this.store.prevOf(el.id);
    if (!prev) return;
    this.structural(() => {
      this.store.remove(el.id);
      return { id: prev.id, offset: prev.text.length };
    });
  }

  private backspace(el: El, start: number): boolean {
    if (start > 0) {
      this.structural(() => {
        this.store.setText(el.id, el.text.slice(0, start - 1) + el.text.slice(start));
        return { id: el.id, offset: start - 1 };
      });
      return true;
    }
    const prev = this.store.prevOf(el.id);
    if (!prev) return true;
    if (!el.text) {
      this.removeAndFocusPrev(el);
      return true;
    }
    if (prev.type === el.type) {
      this.structural(() => {
        const pos = prev.text.length;
        const join = pos && !/\s$/.test(prev.text) ? ' ' : '';
        this.store.setText(prev.id, prev.text + join + el.text);
        this.store.remove(el.id);
        return { id: prev.id, offset: pos + join.length };
      });
      return true;
    }
    const pf = this.fragsOf(prev.id).pop();
    if (pf) this.setCaret(pf, (pf.textContent ?? '').length);
    return true;
  }

  // ---------- autocomplete ----------
  private updateAc(frag: HTMLElement) {
    if (!autocompleteTypes.has(frag.dataset.type ?? '')) return this.closeAc();
    const el = this.store.el(frag.dataset.id!);
    if (!el) return this.closeAc();
    if (Number(frag.dataset.start) + this.caretIn(frag) < el.text.length) return this.closeAc();
    const items = suggestions(this.store.script, el, this.store.profile);
    if (!items.length) return this.closeAc();
    let box = this.ac?.box;
    if (!box) {
      box = document.createElement('div');
      box.className = 'ac';
      box.id = 'openact-ac';
      box.setAttribute('role', 'listbox');
      box.setAttribute('aria-label', 'Suggestions');
      box.addEventListener('mousedown', (ev) => {
        ev.preventDefault();
        const o = (ev.target as HTMLElement).closest('[role="option"]') as HTMLElement | null;
        if (o && this.ac) {
          this.ac.active = Number(o.dataset.i);
          this.acceptAc();
        }
      });
      document.body.appendChild(box);
    }
    this.ac = { box, items, active: 0, frag };
    box.textContent = '';
    const hint = div('ac-hint');
    hint.textContent = 'Tab or Enter to accept. Esc to dismiss.';
    box.appendChild(hint);
    items.forEach((it, i) => {
      const o = document.createElement('div');
      o.setAttribute('role', 'option');
      o.id = `openact-ac-${i}`;
      o.dataset.i = String(i);
      o.textContent = it.label;
      o.setAttribute('aria-selected', String(i === 0));
      box!.appendChild(o);
    });
    frag.setAttribute('aria-expanded', 'true');
    frag.setAttribute('aria-controls', 'openact-ac');
    frag.setAttribute('aria-activedescendant', 'openact-ac-0');
    const r = this.charRect(frag, this.caretIn(frag));
    const h = box.offsetHeight || 160;
    box.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - 336))}px`;
    box.style.top = `${r.bottom + h + 12 > window.innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6}px`;
  }
  private moveAc(dir: 1 | -1) {
    if (!this.ac) return;
    const n = this.ac.items.length;
    this.ac.active = (this.ac.active + dir + n) % n;
    this.ac.box.querySelectorAll('[role="option"]').forEach((o, i) => o.setAttribute('aria-selected', String(i === this.ac!.active)));
    this.ac.frag.setAttribute('aria-activedescendant', `openact-ac-${this.ac.active}`);
  }
  private acceptAc() {
    if (!this.ac) return;
    const { items, active, frag } = this.ac;
    const it = items[active];
    const id = frag.dataset.id!;
    this.store.setText(id, it.replace);
    frag.textContent = it.replace;
    frag.dataset.end = String(it.replace.length);
    this.setCaret(frag, it.replace.length);
    this.closeAc();
    this.hooks.announce(it.label);
    if (it.chain) this.updateAc(frag);
    this.scheduleRelayout();
  }
  private closeAc() {
    if (!this.ac) return;
    this.ac.box.remove();
    this.ac.frag.setAttribute('aria-expanded', 'false');
    this.ac.frag.removeAttribute('aria-activedescendant');
    this.ac = null;
  }
}
