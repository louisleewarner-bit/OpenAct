import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, Highlighter, KeyboardOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { barOrder, isEmptyEl, isMac, recentNames, shortcutLabel } from './cue/flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { castInfo, outline, sceneChart, sceneWarnings, songList } from './cue/derive';
import { baseName, type ElType } from './cue/model';
import { labelOf, PAPERS } from './cue/profiles';
import { Branches } from './branches';
import { store } from './state';

export function Outline({ onJump, announce }: { onJump: (id: string) => void; announce: (m: string) => void }) {
  const groups = outline(store.script, store.layout);
  const warnings = sceneWarnings(store.script, groups);
  const prof = store.profile;
  const [drag, setDrag] = useState<{ id: string; over?: string; pos?: 'before' | 'after' } | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const flat = groups.flatMap((g) => g.scenes);
  const els = store.script.elements;
  const cursorIndex = store.cursor.id ? store.index(store.cursor.id) : -1;
  let current: string | null = null;
  for (let i = cursorIndex; i >= 0; i--) {
    if (els[i].type === 'scene') {
      current = els[i].id;
      break;
    }
  }

  useEffect(() => {
    if (!focusId) return;
    listRef.current?.querySelector<HTMLButtonElement>(`[data-scene="${CSS.escape(focusId)}"]`)?.focus();
    setFocusId(null);
  });

  // The element after a scene's block: where a scene dropped "after" it should start.
  const afterBlock = (id: string) => {
    let i = store.index(id) + 1;
    while (i < els.length && els[i].type !== 'scene' && els[i].type !== 'act') i++;
    return els[i]?.id ?? null;
  };
  const move = (id: string, dir: -1 | 1) => {
    const k = flat.findIndex((s) => s.id === id);
    if (dir < 0 && k > 0) store.moveScene(id, flat[k - 1].id);
    else if (dir > 0 && k < flat.length - 1) store.moveScene(id, afterBlock(flat[k + 1].id));
    else return announce(dir < 0 ? 'Already the first scene' : 'Already the last scene');
    setFocusId(id);
    announce(dir < 0 ? 'Scene moved up' : 'Scene moved down');
  };

  return (
    <div ref={listRef}>
      <h2>Outline</h2>
      {flat.length === 0 && <p className="hint">Scenes appear here as you write scene headings.</p>}
      {groups.map((g) => (
        <section key={g.id ?? 'top'} aria-label={g.label ?? 'Scenes'}>
          {g.label && <div className="outline-act">{g.label}</div>}
          <ul className="outline-list">
            {g.scenes.map((s) => {
              const seq = flat.findIndex((x) => x.id === s.id) + 1;
              const cls = ['outline-item', drag?.id === s.id ? 'dragging' : '', drag?.over === s.id ? `drop-${drag.pos}` : ''].join(' ');
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={cls}
                    data-scene={s.id}
                    aria-current={s.id === current}
                    aria-describedby="outline-help"
                    draggable
                    onClick={() => onJump(s.id)}
                    onKeyDown={(e) => {
                      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                        e.preventDefault();
                        move(s.id, e.key === 'ArrowUp' ? -1 : 1);
                      }
                    }}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', s.id);
                      e.dataTransfer.effectAllowed = 'move';
                      setDrag({ id: s.id });
                    }}
                    onDragOver={(e) => {
                      if (!drag) return;
                      e.preventDefault();
                      const r = e.currentTarget.getBoundingClientRect();
                      setDrag({ ...drag, over: s.id, pos: e.clientY < r.top + r.height / 2 ? 'before' : 'after' });
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (drag && drag.id !== s.id) {
                        store.moveScene(drag.id, drag.pos === 'after' ? afterBlock(s.id) : s.id);
                        announce('Scene moved');
                      }
                      setDrag(null);
                    }}
                    onDragEnd={() => setDrag(null)}
                  >
                    <span className="num">{prof.stage ? s.no : seq}</span>
                    <span className="label">{s.label}</span>
                    <span className="page">p.{s.page}</span>
                  </button>
                  {prof.sceneTypes && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2.6em 1fr', padding: '0 8px 4px' }}>
                      <span />
                      <button
                        type="button"
                        className={`scene-type ${s.sceneType === 'cloth' ? 'cloth' : 'full'}`}
                        aria-label={`Scene ${s.no} type: ${s.sceneType === 'cloth' ? 'front cloth' : 'full stage'}. Switch.`}
                        onClick={() => store.setSceneType(s.id, s.sceneType === 'cloth' ? 'full' : 'cloth')}
                      >
                        {s.sceneType === 'cloth' ? 'Front cloth' : 'Full stage'}
                      </button>
                    </div>
                  )}
                  {warnings
                    .filter((w) => w.afterId === s.id)
                    .map((w) => (
                      <div key={w.key} className="warn" role="note">
                        <span>{w.text}</span>
                        <button type="button" aria-label="Dismiss this warning" onClick={() => store.dismiss(w.key)}>
                          ×
                        </button>
                      </div>
                    ))}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {flat.length > 0 && (
        <p id="outline-help" className="hint" style={{ marginTop: 12 }}>
          Drag a scene to move it, or select it and press Alt + ↑ or ↓.
        </p>
      )}
    </div>
  );
}

export function Details({ onJump, onEditSong }: { onJump: (id: string) => void; onEditSong: (id: string) => void }) {
  const prof = store.profile;
  return (
    <Tabs key={prof.id} defaultValue={prof.game ? 'branches' : prof.songs ? 'songs' : 'cast'}>
      <TabsList className="w-full">
        {prof.game && (
          <TabsTrigger value="branches" className="flex-1">
            Branches
          </TabsTrigger>
        )}
        {prof.songs && (
          <TabsTrigger value="songs" className="flex-1">
            Songs
          </TabsTrigger>
        )}
        <TabsTrigger value="cast" className="flex-1">
          Cast
        </TabsTrigger>
        <TabsTrigger value="chart" className="flex-1">
          Scenes
        </TabsTrigger>
      </TabsList>
      {prof.game && (
        <TabsContent value="branches">
          <Branches onJump={onJump} />
        </TabsContent>
      )}
      {prof.songs && (
        <TabsContent value="songs">
          <Songs onJump={onJump} onEdit={onEditSong} />
        </TabsContent>
      )}
      <TabsContent value="cast">
        <Cast />
      </TabsContent>
      <TabsContent value="chart">
        <Chart />
      </TabsContent>
    </Tabs>
  );
}

function Songs({ onJump, onEdit }: { onJump: (id: string) => void; onEdit: (id: string) => void }) {
  const songs = songList(store.script, store.layout);
  const songKey = store.profile.types.indexOf('song') + 1;
  return (
    <div style={{ display: 'grid', gap: 4, marginTop: 8 }}>
      {songs.length === 0 && <p className="hint">No songs yet. On an empty Character line press Tab, or press Ctrl+Alt+{songKey}, to add one.</p>}
      {songs.map((s) => (
        <div key={s.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'start' }}>
          <button type="button" className="song-row" onClick={() => onJump(s.id)} aria-label={`Song ${s.no}: ${s.title}. Go to page ${s.page}.`}>
            <span className="no">{s.no}</span>
            <span className="title">{s.title}</span>
            <span className="meta">{s.el.song?.singers || 'Singers not set'}</span>
            {s.el.song?.func && <span className="meta">{s.el.song.func}</span>}
            <span className="meta">Page {s.page}</span>
          </button>
          <button type="button" className="btn btn-quiet" style={{ height: 28, marginTop: 4 }} onClick={() => onEdit(s.id)}>
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}

function Cast() {
  const cast = castInfo(store.script).sort((a, b) => b.speeches - a.speeches);
  const prof = store.profile;
  const [renaming, setRenaming] = useState<{ from: string; to: string } | null>(null);
  const highlighterWorks = typeof CSS !== 'undefined' && 'highlights' in CSS;
  const addToCast = (name: string) => store.setCast([...store.script.cast, { name, description: '' }]);
  return (
    <div style={{ marginTop: 8 }}>
      {cast.length === 0 && <p className="hint">Characters appear here once they speak.</p>}
      {cast.length > 0 && (
        <table className="counts">
          <thead>
            <tr>
              <th>Character</th>
              <th className="n">Speeches</th>
              <th className="n">Words</th>
            </tr>
          </thead>
          <tbody>
            {cast.map((c) => (
              <tr key={c.name}>
                <td>
                  <div className="cast-name">{c.name}</div>
                  {c.description && <div className="cast-desc">{c.description}</div>}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                    {highlighterWorks && (
                      <button
                        type="button"
                        className="btn btn-quiet"
                        style={{ height: 26, padding: '0 6px', fontSize: 12 }}
                        aria-pressed={store.highlight === c.name}
                        onClick={() => store.setHighlight(store.highlight === c.name ? null : c.name)}
                      >
                        <Highlighter size={14} aria-hidden /> {store.highlight === c.name ? 'Lines highlighted' : 'Highlight lines'}
                      </button>
                    )}
                    <button type="button" className="btn btn-quiet" style={{ height: 26, padding: '0 6px', fontSize: 12 }} onClick={() => setRenaming({ from: c.name, to: c.name })}>
                      Rename
                    </button>
                    {prof.stage && !c.listed && (
                      <button type="button" className="btn btn-quiet" style={{ height: 26, padding: '0 6px', fontSize: 12 }} onClick={() => addToCast(c.name)}>
                        Add to cast list
                      </button>
                    )}
                  </div>
                  {renaming?.from === c.name && (
                    <form
                      style={{ display: 'flex', gap: 4, marginTop: 6 }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        store.renameCharacter(renaming.from, renaming.to);
                        setRenaming(null);
                      }}
                    >
                      <label className="sr-only" htmlFor={`rename-${c.name}`}>
                        New name for {c.name}
                      </label>
                      <input id={`rename-${c.name}`} autoFocus className="field" style={{ flex: 1, padding: '4px 6px', border: '1px solid var(--rule)', borderRadius: 6, background: 'var(--paper)', color: 'var(--ink)' }} value={renaming.to} onChange={(e) => setRenaming({ ...renaming, to: e.target.value })} />
                      <button type="submit" className="btn" style={{ height: 30 }}>
                        Rename
                      </button>
                      <button type="button" className="btn btn-quiet" style={{ height: 30 }} onClick={() => setRenaming(null)}>
                        Cancel
                      </button>
                    </form>
                  )}
                </td>
                <td className="n">{c.speeches}</td>
                <td className="n">{c.words}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="hint" style={{ marginTop: 8 }}>
        Rename changes every cue and every mention in capitals in the stage directions, in one step you can undo.
      </p>
    </div>
  );
}

function Chart() {
  const groups = outline(store.script, store.layout);
  const chart = sceneChart(store.script, groups);
  const prof = store.profile;
  if (!chart.scenes.length) return <p className="hint" style={{ marginTop: 8 }}>The chart fills in as you add scenes.</p>;
  const colLabel = (id: string) => {
    if (!prof.stage) return String(chart.scenes.findIndex((s) => s.id === id) + 1);
    const gi = groups.findIndex((g) => g.scenes.some((s) => s.id === id));
    const s = groups[gi].scenes.find((x) => x.id === id)!;
    const acts = groups.filter((g) => g.label).length;
    return acts > 1 ? `${groups.slice(0, gi + 1).filter((g) => g.label).length}.${s.no}` : String(s.no);
  };
  return (
    <div style={{ marginTop: 8 }}>
      <div className="chart-wrap">
        <table className="chart">
          <caption className="sr-only">Who is in each scene</caption>
          <thead>
            <tr>
              <th scope="col">Character</th>
              {chart.scenes.map((s) => (
                <th key={s.id} scope="col" title={s.label}>
                  {colLabel(s.id)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.characters.map((c) => (
              <tr key={c}>
                <th scope="row" style={{ textAlign: 'left' }}>
                  {c}
                </th>
                {chart.scenes.map((s) => {
                  const v = chart.cells.get(`${c}|${s.id}`);
                  return (
                    <td key={s.id} className={v ?? ''} aria-label={v === 'speaks' ? 'speaks' : v === 'onstage' ? 'on stage' : 'not in scene'}>
                      {v === 'speaks' ? '●' : v === 'onstage' ? '○' : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="legend">
        <span>
          <span className="chart speaks">●</span> speaks or sings
        </span>
        <span>
          <span className="chart onstage">○</span> named in a stage direction
        </span>
      </div>
    </div>
  );
}

export function StatusBar() {
  const prof = store.profile;
  const el = store.cursor.id ? store.el(store.cursor.id) : undefined;
  const pages = store.layout.pages.length;
  const page = el ? (store.layout.pageOfEl.get(el.id) ?? 0) + 1 : 1;
  let enterTo: ElType | null = null;
  let tabTo: ElType | null = null;
  let backTo: ElType | null = null;
  if (el) {
    const empty = !el.text.trim() || (el.type === 'paren' && /^\(\s*\)$/.test(el.text.trim()));
    if (empty) {
      enterTo = el.type === prof.blockType ? null : prof.blockType;
      tabTo = prof.tabEmpty[el.type] ?? null;
      backTo = (Object.entries(prof.tabEmpty) as [ElType, ElType][]).find(([, to]) => to === el.type)?.[0] ?? null;
    } else {
      const prev = store.prevOf(el.id);
      enterTo = el.type === 'character' && prof.songs && prev && (prev.type === 'lyrics' || prev.type === 'song') ? 'lyrics' : (prof.enter[el.type] ?? prof.blockType);
      tabTo = prof.tab[el.type] ?? null;
    }
  }
  const minutes = Math.max(1, Math.round(store.layout.totalLines / PAPERS[store.script.paper].lines));
  const saved = store.saveState === 'saved' ? 'Saved in this browser' : store.saveState === 'unsaved' ? 'Saving…' : 'Can’t save in this browser: export a copy';
  return (
    <footer className="statusbar">
      <span className="current">{el ? labelOf(prof, el.type) : 'No element selected'}</span>
      {el && (
        <span className="keys" aria-label="Next element">
          {enterTo && (
            <span>
              <kbd>Enter</kbd> {labelOf(prof, enterTo)}
            </span>
          )}
          {tabTo && (
            <span>
              <kbd>Tab</kbd> {labelOf(prof, tabTo)}
            </span>
          )}
          {backTo && (
            <span>
              <kbd>Shift</kbd>+<kbd>Tab</kbd> {labelOf(prof, backTo)}
            </span>
          )}
        </span>
      )}
      <span className="facts">
        <span className="hint-keys">Hold {isMac ? '⌃' : 'Alt'} for shortcuts</span>
        <span>
          Page {page} of {pages}
        </span>
        {prof.runtime && <span>About {minutes} min</span>}
        <span>
          {store.saveState === 'saved' && <span className="saved-dot" aria-hidden />}
          {saved}
        </span>
      </span>
    </footer>
  );
}

export function ElementBar({
  onType,
  onRetype,
  onName,
  onDone,
  typing,
  phone,
}: {
  onType: (t: ElType) => void;
  onRetype: (t: ElType) => void;
  onName: (n: string) => void;
  onDone: () => void;
  typing: boolean;
  phone: boolean;
}) {
  const prof = store.profile;
  const el = store.cursor.id ? store.el(store.cursor.id) : undefined;
  const prev = el ? store.prevOf(el.id) : undefined;
  const order = barOrder(prof, el, prev);
  const empty = el ? isEmptyEl(el) : false;
  const nameLine = !!el && empty && el.type === 'character';
  const names = nameLine ? recentNames(store.script, el.id) : [];
  const [keysOnLine, setKeysOnLine] = useState<string | null>(null);
  const showNames = nameLine && names.length > 0 && keysOnLine !== el?.id;
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ left: 0 });
  }, [el?.id, el?.type, showNames]);
  const keep = (e: React.SyntheticEvent) => e.preventDefault();
  const chosen = useRef<ElType | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const cur = el?.type;
  return (
    <section className="element-bar" aria-label="Element bar">
      <div className="eb-row" role="toolbar" aria-label="Elements">
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          {/* Opens on a full click, so releasing the pointer can't pick an item by accident. */}
          <button type="button" className="eb-current" onMouseDown={keep} onPointerDown={keep} onClick={() => setMenuOpen((o) => !o)} aria-label={`This line: ${cur ? labelOf(prof, cur) : 'none'}. Change its type`}>
            <span className="eb-current-label">{cur ? labelOf(prof, cur) : 'Elements'}</span>
            <ChevronDown size={16} aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56" onCloseAutoFocus={(e) => {
            e.preventDefault();
            const t = chosen.current;
            chosen.current = null;
            if (t) onRetype(t);
          }}
        >
          <DropdownMenuLabel>Change this line to</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={cur ?? ''} onValueChange={(v) => (chosen.current = v as ElType)}>
            {prof.types.map((t, i) => (
              <DropdownMenuRadioItem key={t} value={t}>
                {labelOf(prof, t)}
                {!phone && i < 9 && <span className="eb-menu-kbd">{shortcutLabel(i)}</span>}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="eb-keys" ref={scroller}>
        {showNames ? (
          <>
            <button type="button" className="eb-key eb-back" onMouseDown={keep} onClick={() => setKeysOnLine(el!.id)}>
              <ChevronLeft size={16} aria-hidden /> Elements
            </button>
            {names.map((n) => (
              <button key={n} type="button" className="eb-key eb-name" onMouseDown={keep} onClick={() => onName(n)}>
                {n}
              </button>
            ))}
          </>
        ) : (
          order.map((t, i) => {
            const idx = prof.types.indexOf(t);
            const label = labelOf(prof, t);
            const replaces = empty && t !== cur;
            return (
              <button
                key={t}
                type="button"
                className={`eb-key${i === 0 ? ' eb-next' : ''}`}
                aria-pressed={t === cur}
                aria-label={`${replaces || !el ? label : t === cur && empty ? label : `New ${label}`}${!phone && idx < 9 ? `, shortcut ${shortcutLabel(idx)}` : ''}`}
                onMouseDown={keep}
                onClick={() => onType(t)}
              >
                {label}
                {!phone && idx < 9 && (
                  <kbd className="eb-kbd" aria-hidden title={shortcutLabel(idx)}>
                    {shortcutLabel(idx)}
                  </kbd>
                )}
              </button>
            );
          })
        )}
      </div>
      {phone && typing && (
        <button type="button" className="eb-done" aria-label="Done" title="Done: hide the keyboard" onClick={onDone}>
          <KeyboardOff size={20} aria-hidden />
        </button>
      )}
      </div>
    </section>
  );
}

export const speakerOf = (name: string) => baseName(name);
