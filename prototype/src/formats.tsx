import { useEffect, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, FileUp, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { saveFile } from './cue/save';
import { customFormats, formatFileName, formatFileText, idOf, removeFormat, saveFormat, type CustomFormat } from './cue/custom';
import { FINDER, FINDER_GROUPS, searchFinder, type FinderEntry } from './cue/finder';
import { applyWord, readFormatFile, readFormatText, toFormat, type Candidate } from './cue/import-format';
import type { BuiltinProfileId, ElType, PaperId, ProfileId } from './cue/model';
import { GROUPS, labelOf, PAPERS, PROFILE_ORDER, PROFILES, styleOf, type ElStyle, type Profile } from './cue/profiles';

type OpenProps = { open: boolean; onOpenChange: (o: boolean) => void };

// ---------- a live sample page ----------
const SAMPLE: Partial<Record<ElType, string>> = {
  act: 'ACT ONE',
  scene: 'INT. KITCHEN - NIGHT',
  action: 'Nell fills the kettle. Steam curls against the dark window.',
  character: 'NELL',
  paren: '(quietly)',
  dialogue: 'Where did I leave it? It was here a minute ago.',
  transition: 'CUT TO:',
  shot: 'CLOSE ON THE KETTLE',
  lyrics: 'Boil, kettle, boil.',
  song: 'SONG 1: THE KETTLE (NELL)',
  centered: 'THE END',
  endAct: 'END OF ACT ONE',
  sound: 'SOUND: A kettle whistles.',
  page: 'PAGE ONE',
  panel: 'PANEL 1. Close on the kettle.',
  caption: 'CAPTION: Night.',
  sfx: 'SFX: WHEEEE',
  choice: '1> Ask about the key.',
  bark: 'BARK: GUARD: Halt there!',
  cond: '[IF has_key]',
  goto: 'GO TO LIGHTHOUSE DOOR',
  beat: 'QUEST BEAT 1: Find the key',
  lore: 'LORE 1: The salt road is dry for four hours a day.',
};
const SEQUENCE: ElType[] = ['act', 'scene', 'action', 'character', 'paren', 'dialogue', 'character', 'dialogue', 'transition', 'scene', 'action'];

function SamplePage({ profile, paper, actual }: { profile: Profile; paper: PaperId; actual: boolean }) {
  const pg = PAPERS[paper];
  const wrap = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.5);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () => setZoom(actual ? 1 : Math.max(0.3, Math.min(0.9, (el.clientWidth - 2) / (pg.width * 96))));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pg.width, actual]);
  const area = pg.width - profile.marginLeft - profile.marginRight;
  const types = SEQUENCE.filter((t) => profile.types.includes(t));
  const lines = types.length ? types : (['action'] as ElType[]);
  const dialogueLeft = styleOf(profile, 'dialogue')?.left;
  return (
    <div ref={wrap} className={`fmt-sample${actual ? ' actual' : ''}`} role="region" aria-label="Sample page preview" tabIndex={0}>
      <div className="fmt-sheet" role="img" aria-label="A sample page laid out with these settings" style={{ zoom, width: `${pg.width}in`, minHeight: `${Math.min(pg.height, 6.4)}in`, paddingLeft: `${profile.marginLeft}in`, paddingRight: `${profile.marginRight}in` }}>
        {lines.map((t, i) => {
          const s: ElStyle | undefined = styleOf(profile, t);
          if (!s) return null;
          const ml = s.left - profile.marginLeft;
          const aligned = s.align && s.align !== 'left';
          const style: React.CSSProperties = {
            marginLeft: `${ml}in`,
            width: aligned ? `${area - ml}in` : `${s.width}ch`,
            marginTop: i === 0 ? 0 : `calc(${s.before}in / 6)`,
            textAlign: s.align ?? 'left',
            textTransform: s.upper ? 'uppercase' : undefined,
            fontWeight: s.bold ? 700 : 400,
            fontStyle: s.italic ? 'italic' : 'normal',
            textDecoration: s.underline ? 'underline' : 'none',
            lineHeight: s.lineSpacing === 2 ? 'calc(2in / 6)' : 'calc(1in / 6)',
          };
          if (s.hang) {
            style.float = 'left';
            style.width = `${(dialogueLeft ?? s.left + 1.6) - s.left}in`;
          }
          return (
            <div key={i} className={`fmt-line${s.hang ? ' hang' : ''}`} style={style} aria-hidden>
              {SAMPLE[t]}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- the preview and adjust screen ----------
const FORMAT_HINT = 'Imported formats are only used on this device, unless you export one.';
const summary = (s: ElStyle) =>
  [`left ${s.left} in`, `${s.width} wide`, s.before ? `${s.before} line${s.before > 1 ? 's' : ''} before` : '', s.upper ? 'capitals' : '', s.bold ? 'bold' : '', s.italic ? 'italic' : '', s.underline ? 'underlined' : '', s.align && s.align !== 'left' ? s.align : '']
    .filter(Boolean)
    .join(', ');

function ElementFields({ type, base, cand, onChange }: { type: ElType; base: Profile; cand: Candidate; onChange: (t: ElType, s: ElStyle) => void }) {
  const own = cand.styles[type];
  const s = own ?? base.styles[type] ?? styleOf(base, type)!;
  const label = labelOf(base, type);
  const id = `fe-${type}`;
  const set = (patch: Partial<ElStyle>) => {
    const next: ElStyle = { ...s, ...patch };
    (['upper', 'bold', 'italic', 'underline', 'pageBreakBefore'] as const).forEach((k) => {
      if (!next[k]) delete next[k];
    });
    if (next.lineSpacing !== 2) delete next.lineSpacing;
    if (!next.align || next.align === 'left') delete next.align;
    onChange(type, next);
  };
  const numField = (k: 'left' | 'width' | 'before', text: string, min: number, max: number, step: number) => (
    <div className="field">
      <label htmlFor={`${id}-${k}`}>{text}</label>
      <input id={`${id}-${k}`} type="number" inputMode="decimal" min={min} max={max} step={step} value={s[k]} onChange={(e) => {
          if (e.target.value !== '') set({ [k]: Number(e.target.value) });
        }}
      />
    </div>
  );
  const chk = (k: 'upper' | 'bold' | 'italic' | 'underline' | 'pageBreakBefore', text: string) => (
    <label className="fmt-check">
      <input type="checkbox" checked={!!s[k]} onChange={(e) => set({ [k]: e.target.checked })} /> {text}
    </label>
  );
  return (
    <details className="fmt-el">
      <summary>
        <span className="fmt-el-name">{label}</span>
        <span className="fmt-el-sum">{summary(s)}</span>
        <span className="fmt-el-from">{own ? `From ${cand.from[type] ?? 'the file'}` : `Kept from ${base.name}`}</span>
      </summary>
      <div className="fmt-el-grid">
        {numField('left', 'Left edge (in)', 0, 6, 0.05)}
        {numField('width', 'Width (characters)', 10, 100, 1)}
        {numField('before', 'Blank lines before', 0, 6, 1)}
        <div className="field">
          <label htmlFor={`${id}-align`}>Alignment</label>
          <select id={`${id}-align`} value={s.align ?? 'left'} onChange={(e) => set({ align: e.target.value as 'left' | 'center' | 'right' })}>
            <option value="left">Left</option>
            <option value="center">Centre</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
      <div className="fmt-checks">
        {chk('upper', 'Capitals')}
        {chk('bold', 'Bold')}
        {chk('italic', 'Italic')}
        {chk('underline', 'Underlined')}
        {chk('pageBreakBefore', 'Starts a new page')}
        <label className="fmt-check">
          <input type="checkbox" checked={s.lineSpacing === 2} onChange={(e) => set({ lineSpacing: e.target.checked ? 2 : undefined })} /> Double-spaced
        </label>
      </div>
    </details>
  );
}

function Review({ cand, setCand, editing }: { cand: Candidate; setCand: (c: Candidate) => void; editing: boolean }) {
  const base = PROFILES[cand.base];
  const [actual, setActual] = useState(false);
  const preview: Profile = {
    ...base,
    id: idOf({ base: cand.base, slug: 'preview' }),
    styles: { ...base.styles, ...cand.styles },
    marginLeft: cand.marginLeft,
    marginRight: cand.marginRight,
  };
  const missing = base.types.filter((t) => !cand.styles[t]);
  const setStyle = (t: ElType, s: ElStyle) => setCand({ ...cand, styles: { ...cand.styles, [t]: s }, from: { ...cand.from, [t]: cand.from[t] ?? 'your changes' } });
  const num = (v: string, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number(v) || lo));
  const wordChoose = (t: ElType, id: string) => {
    if (!cand.word) return;
    const chosen = { ...cand.word.chosen };
    if (id) chosen[t] = id;
    else delete chosen[t];
    setCand(applyWord({ ...cand, word: { ...cand.word, chosen } }));
  };
  return (
    <div className="fmt-review">
      <div className="fmt-controls">
        <div className="field">
          <label htmlFor="fmt-name">Name</label>
          <input id="fmt-name" value={cand.name} maxLength={60} onChange={(e) => setCand({ ...cand, name: e.target.value })} />
        </div>
        <div className="fmt-row2">
          <div className="field">
            <label htmlFor="fmt-base">Based on</label>
            <select id="fmt-base" value={cand.base} disabled={editing} onChange={(e) => setCand({ ...cand, base: e.target.value as BuiltinProfileId })}>
              {GROUPS.map((g) => (
                <optgroup key={g} label={g}>
                  {PROFILE_ORDER.filter((p) => PROFILES[p].group === g).map((p) => (
                    <option key={p} value={p}>
                      {PROFILES[p].name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="fmt-paper">Paper</label>
            <select id="fmt-paper" value={cand.paper} onChange={(e) => setCand({ ...cand, paper: e.target.value as PaperId, pageWidth: PAPERS[e.target.value as PaperId].width })}>
              <option value="a4">A4</option>
              <option value="letter">US Letter</option>
            </select>
          </div>
        </div>
        <p className="fmt-help">“Based on” decides which elements the format has and how Enter and Tab move between them{editing ? '; it can’t change once saved' : ''}.</p>
        <div className="fmt-row2">
          <div className="field">
            <label htmlFor="fmt-ml">Left margin (in)</label>
            <input id="fmt-ml" type="number" step="0.05" min="0.25" max="3" value={cand.marginLeft} onChange={(e) => setCand({ ...cand, marginLeft: num(e.target.value, 0.25, 3) })} />
          </div>
          <div className="field">
            <label htmlFor="fmt-mr">Right margin (in)</label>
            <input id="fmt-mr" type="number" step="0.05" min="0.25" max="3" value={cand.marginRight} onChange={(e) => setCand({ ...cand, marginRight: num(e.target.value, 0.25, 3) })} />
          </div>
        </div>

        {cand.notes.length > 0 && (
          <ul className="fmt-notes" aria-label="Notes about this file">
            {cand.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        {cand.kind !== 'openact' && (
          <p className="fmt-found" role="status">
            {Object.keys(cand.styles).length
              ? `Read ${Object.keys(cand.styles).length} element layout${Object.keys(cand.styles).length > 1 ? 's' : ''} from ${cand.fileName}.${missing.length ? ` Not found, so ${base.name}’s layout is kept for: ${missing.map((t) => labelOf(base, t)).join(', ')}.` : ''}`
              : `No element layouts matched yet. Match your Word styles below.`}
          </p>
        )}

        {cand.word && (
          <fieldset className="fmt-word">
            <legend>Match Word styles</legend>
            <p className="fmt-help">OpenAct guessed from the style names. Change any that are wrong.</p>
            {base.types.map((t) => (
              <div className="field fmt-word-row" key={t}>
                <label htmlFor={`ws-${t}`}>{labelOf(base, t)}</label>
                <select id={`ws-${t}`} value={cand.word!.chosen[t] ?? ''} onChange={(e) => wordChoose(t, e.target.value)}>
                  <option value="">Keep {base.name}’s layout</option>
                  {cand.word!.styles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                      {s.used ? ` (${s.used} used)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </fieldset>
        )}

        <h3 className="fmt-h">Element layouts</h3>
        <div>
          {base.types.map((t) => (
            <ElementFields key={`${cand.base}-${t}`} type={t} base={base} cand={cand} onChange={setStyle} />
          ))}
        </div>
      </div>
      <div className="fmt-preview">
        <div className="fmt-preview-head">
          <h3 className="fmt-h">Sample page</h3>
          <label className="fmt-check">
            <input type="checkbox" checked={actual} onChange={(e) => setActual(e.target.checked)} /> Actual size
          </label>
        </div>
        <SamplePage profile={preview} paper={cand.paper} actual={actual} />
      </div>
    </div>
  );
}

// ---------- import dialog ----------
export function ImportFormatDialog({ open, onOpenChange, editing, onSaved }: OpenProps & { editing: CustomFormat | null; onSaved: (id: ProfileId, use: boolean) => void }) {
  const [cand, setCand] = useState<Candidate | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [paste, setPaste] = useState('');
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError('');
    setPaste('');
    setBusy(false);
    if (editing) {
      setCand({ kind: 'openact', fileName: editing.source ?? 'saved format', name: editing.name, base: editing.base, paper: editing.paper ?? PROFILES[editing.base].paper ?? 'a4', marginLeft: editing.marginLeft, marginRight: editing.marginRight, pageWidth: PAPERS[editing.paper ?? PROFILES[editing.base].paper ?? 'a4'].width, styles: { ...editing.styles }, from: Object.fromEntries(Object.keys(editing.styles).map((k) => [k, 'your saved format'])) as Candidate['from'], notes: [] });
    } else setCand(null);
  }, [open, editing]);

  const take = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      setCand(await readFormatFile(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'This file can’t be read.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };
  const readPasted = () => {
    setError('');
    try {
      setCand(readFormatText(paste));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'This text can’t be read.');
    }
  };
  const save = (use: boolean) => {
    if (!cand) return;
    try {
      const d = saveFormat(toFormat(cand, editing?.slug ?? ''), !!editing);
      onSaved(idOf(d), use);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'This format can’t be saved.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`dlg-wide ${cand ? 'max-w-[1040px]' : 'max-w-[600px]'} max-h-[90vh] overflow-auto`}>
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${editing.name}` : cand ? 'Check the format' : 'Import a format'}</DialogTitle>
          <DialogDescription>
            {cand
              ? 'Check how the sample page looks, correct anything that’s off, then save. Nothing leaves this device.'
              : 'Use a template your theatre, competition or collaborator gave you. OpenAct reads its page setup and element layouts, and you check the result before saving. Your file stays on this device.'}
          </DialogDescription>
        </DialogHeader>

        {!cand && (
          <div className="fmt-choose">
            <div
              className={`fmt-drop${over ? ' over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                void take(e.dataTransfer.files[0]);
              }}
            >
              <FileUp size={22} aria-hidden />
              <p>Drop a file here, or</p>
              <label className="btn btn-primary fmt-pick" htmlFor="fmt-file">
                {busy ? 'Reading…' : 'Choose a file'}
              </label>
              <input ref={input} id="fmt-file" className="sr-only" type="file" accept=".fdx,.fdxt,.docx,.dotx,.json,.openact-format,application/json" onChange={(e) => void take(e.target.files?.[0])} />
              <p className="fmt-help">Final Draft (.fdx, .fdxt), Word (.docx, .dotx) or an OpenAct format file (.json)</p>
            </div>
            {error && (
              <p className="fmt-error" role="alert">
                {error}
              </p>
            )}
            <details className="fmt-paste">
              <summary>Paste an OpenAct format file instead</summary>
              <label className="sr-only" htmlFor="fmt-paste">
                OpenAct format file text
              </label>
              <textarea id="fmt-paste" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder='{ "kind": "openact-format", "version": 1, … }' />
              <button type="button" className="btn" disabled={!paste.trim()} onClick={readPasted}>
                Read pasted text
              </button>
            </details>
            <p className="fmt-help">{FORMAT_HINT}</p>
          </div>
        )}

        {cand && <Review cand={cand} setCand={setCand} editing={!!editing} />}
        {cand && error && (
          <p className="fmt-error" role="alert">
            {error}
          </p>
        )}

        {cand && (
          <DialogFooter className="fmt-footer">
            {!editing && (
              <button type="button" className="btn btn-quiet" onClick={() => setCand(null)}>
                Choose a different file
              </button>
            )}
            <span className="fmt-footer-spacer" />
            <button type="button" className="btn" onClick={() => save(false)}>
              {editing ? 'Save changes' : 'Save'}
            </button>
            {!editing && (
              <button type="button" className="btn btn-primary" onClick={() => save(true)}>
                Save and use for this script
              </button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------- a format file, to keep or hand on ----------
export function FormatFileDialog({ format, onClose }: { format: CustomFormat | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = format ? formatFileText(format) : '';
  const [saved, setSaved] = useState('');
  useEffect(() => {
    setCopied(false);
    setSaved('');
  }, [format]);
  return (
    <Dialog open={!!format} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Format file</DialogTitle>
          <DialogDescription>Keep this as a backup, or give it to someone to import into their OpenAct. It holds only the layout, no script text.</DialogDescription>
        </DialogHeader>
        <label className="sr-only" htmlFor="fmt-out">
          Format file text
        </label>
        <textarea id="fmt-out" className="code-out" readOnly value={text} onFocus={(e) => e.currentTarget.select()} />
        <DialogFooter className="fmt-footer">
          <button
            type="button"
            className="btn"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
              } catch {
                document.getElementById('fmt-out')?.focus();
              }
            }}
          >
            {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {copied ? 'Copied' : 'Copy'}
          </button>
          {format && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                const out = await saveFile(formatFileName(format), new Blob([text], { type: 'application/json' }));
                setSaved(out.ok ? `Saved “${out.name}”.` : out.message);
              }}
            >
              Save as a file
            </button>
          )}
        </DialogFooter>
        <p className="fmt-help" role="status">{saved || `If saving is blocked in this window, copy the text into a file called ${format ? formatFileName(format) : 'your-format.openact-format.json'}.`}</p>
      </DialogContent>
    </Dialog>
  );
}

// ---------- your formats, on the Start screen ----------
export function YourFormats({ onUse, onEdit, onExport }: { onUse: (id: ProfileId) => void; onEdit: (d: CustomFormat) => void; onExport: (d: CustomFormat) => void }) {
  const list = customFormats();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [, bump] = useState(0);
  if (!list.length) return null;
  return (
    <section aria-label="Your formats">
      <h3 className="gallery-head">Your formats</h3>
      <ul className="fmt-mine">
        {list.map((d) => {
          const id = idOf(d);
          const key = `${d.base}:${d.slug}`;
          return (
            <li key={key} className="fmt-mine-row">
              <button type="button" className="choice" onClick={() => onUse(id)}>
                <strong>{d.name}</strong>
                <span>{d.blurb}</span>
              </button>
              <span className="fmt-actions">
                <button type="button" className="btn btn-quiet" aria-label={`Edit ${d.name}`} onClick={() => onEdit(d)}>
                  Edit
                </button>
                <button type="button" className="btn btn-quiet" aria-label={`Export ${d.name}`} onClick={() => onExport(d)}>
                  Export
                </button>
                {confirm === key ? (
                  <button
                    type="button"
                    className="btn btn-quiet fmt-danger"
                    aria-label={`Confirm: delete ${d.name}`}
                    onBlur={() => setConfirm(null)}
                    onClick={() => {
                      removeFormat(d);
                      setConfirm(null);
                      bump((n) => n + 1);
                    }}
                  >
                    Delete it?
                  </button>
                ) : (
                  <button type="button" className="btn btn-quiet" aria-label={`Delete ${d.name}`} onClick={() => setConfirm(key)}>
                    Delete
                  </button>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ---------- the format finder ----------
const STATUS: Record<FinderEntry['status'], string> = { covered: 'In OpenAct', close: 'Close', missing: 'Not yet' };

export function FormatFinderDialog({ open, onOpenChange, onUse, onImport }: OpenProps & { onUse: (id: ProfileId) => void; onImport: () => void }) {
  const [q, setQ] = useState('');
  const nameOf = (id: ProfileId) => (PROFILES[id] ?? PROFILES.screenplay).name;
  const hits = searchFinder(q, nameOf);
  const checked = FINDER.reduce((m, e) => (e.checked > m ? e.checked : m), '');
  const month = checked ? new Date(`${checked}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '';
  useEffect(() => {
    if (open) setQ('');
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dlg-wide max-w-[760px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Find a format</DialogTitle>
          <DialogDescription>Common formats and how close OpenAct gets. This list is built into OpenAct, so searching it sends nothing anywhere.</DialogDescription>
        </DialogHeader>
        <div className="fmt-search">
          <Search size={16} aria-hidden />
          <label className="sr-only" htmlFor="fmt-q">
            Search formats
          </label>
          <input id="fmt-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “radio”, “Royal Court” or “teleplay”" autoComplete="off" />
        </div>
        <p className="fmt-count" role="status" aria-live="polite">
          {hits.length} {hits.length === 1 ? 'format' : 'formats'}
        </p>
        {FINDER_GROUPS.map((g) => {
          const rows = hits.filter((e) => e.group === g);
          if (!rows.length) return null;
          return (
            <section key={g} aria-label={g}>
              <h3 className="gallery-head">{g}</h3>
              <ul className="fmt-find">
                {rows.map((e) => (
                  <li key={e.id} className="fmt-find-row">
                    <div className="fmt-find-head">
                      <strong>{e.name}</strong>
                      <span className={`fmt-status ${e.status}`}>{STATUS[e.status]}</span>
                    </div>
                    <p>{e.summary}</p>
                    <p className="fmt-gap">{e.gap}</p>
                    <div className="fmt-find-actions">
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          onUse(e.nearest);
                          onOpenChange(false);
                        }}
                      >
                        Start with {nameOf(e.nearest)}
                      </button>
                      <button
                        type="button"
                        className="btn btn-quiet"
                        onClick={() => {
                          onOpenChange(false);
                          onImport();
                        }}
                      >
                        Import your file
                      </button>
                      {e.url && (
                        <a className="btn btn-quiet" href={e.url} target="_blank" rel="noopener noreferrer">
                          {e.linkLabel ?? 'Official page'} <ExternalLink size={14} aria-hidden />
                          <span className="sr-only"> (opens in your browser)</span>
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {hits.length === 0 && (
          <div className="fmt-none">
            <p>
              Nothing matches “{q}”. If a theatre, competition or collaborator sent you a Word or Final Draft template, import it and OpenAct will copy the layout.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onOpenChange(false);
                onImport();
              }}
            >
              Import a format file
            </button>
          </div>
        )}
        <p className="fmt-help">
          {month ? `Checked ${month}. ` : ''}OpenAct holds no copy of anyone’s template. Links open the organisation’s own page in your browser, only when you choose them. Rules change, so check the current ones before you send a script.
        </p>
      </DialogContent>
    </Dialog>
  );
}

