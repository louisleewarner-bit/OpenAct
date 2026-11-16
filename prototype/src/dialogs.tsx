import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { detect, toFdx, toFountain, type Detected } from './cue/interchange';
import type { ElType, PaperId, SongMeta, TitlePage } from './cue/model';
import { exportsFdx, labelOf, PAPERS } from './cue/profiles';
import { strToU8, zipSync } from 'fflate';
import { uncoveredChars } from './assets/courier-prime-coverage';
import { scriptToDocx } from './cue/export-docx';
import { toGameJson, toInk, toRecordingCsv, toYarn } from './cue/export-game';
import { analyze } from './cue/game';
import { pdfPageCount, scriptToPdf } from './cue/export-pdf';
import { inHostedPreview, safeName, saveFile, type SaveOutcome } from './cue/save';
import { Mark } from './logo';
import { store } from './state';

type OpenProps = { open: boolean; onOpenChange: (o: boolean) => void };

export { WelcomeDialog } from './start';

type Fmt = 'pdf' | 'docx' | 'fountain' | 'fdx' | 'csv' | 'ink' | 'yarn' | 'json';
const FMTS: { id: Fmt; label: string; ext: string }[] = [
  { id: 'pdf', label: 'PDF', ext: 'pdf' },
  { id: 'docx', label: 'Word', ext: 'docx' },
  { id: 'fountain', label: 'Fountain', ext: 'fountain' },
  { id: 'fdx', label: 'Final Draft', ext: 'fdx' },
  { id: 'csv', label: 'Recording sheet (CSV)', ext: 'csv' },
  { id: 'ink', label: 'Ink', ext: 'ink' },
  { id: 'yarn', label: 'Yarn Spinner', ext: 'yarn' },
  { id: 'json', label: 'Game JSON', ext: 'json' },
];
const GAME_FMTS: Fmt[] = ['csv', 'ink', 'yarn', 'json'];

export function ExportDialog({ open, onOpenChange }: OpenProps) {
  const [fmt, setFmt] = useState<Fmt>('pdf');
  const [paper, setPaper] = useState<PaperId>(store.script.paper);
  const [titlePage, setTitlePage] = useState(true);
  const [fixedPages, setFixedPages] = useState(false);
  const anonymous = Boolean(store.script.review?.anonymous);
  const [result, setResult] = useState<{ kind: 'text'; text: string; file: string } | null>(null);
  const [status, setStatus] = useState<{ tone: 'ok' | 'warn'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const thumb = useRef<HTMLDivElement>(null);
  const screenplay = exportsFdx(store.script.profile);
  const isGame = !!store.profile.game;
  const fmts = FMTS.filter((f) => (GAME_FMTS.includes(f.id) ? isGame : f.id !== 'fdx' || !isGame));
  const textOnly = GAME_FMTS.includes(fmt);
  const name = store.script.title.title.trim() || 'Untitled';

  useEffect(() => {
    if (!open) return;
    setPaper(store.script.paper);
    setResult(null);
    setStatus(null);
    setCopied(false);
    if ((!screenplay && fmt === 'fdx') || (!isGame && GAME_FMTS.includes(fmt))) setFmt('pdf');
    const t = window.setTimeout(() => {
      const src = document.querySelector('.desk .sheet:not(.title-sheet)') as HTMLElement | null;
      if (!src || !thumb.current) return;
      const clone = src.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('[contenteditable]').forEach((n) => n.removeAttribute('contenteditable'));
      clone.querySelectorAll('.margin-note, .margin-chip, .pencil-note, .note-btn').forEach((n) => n.remove());
      clone.setAttribute('aria-hidden', 'true');
      clone.style.transform = `scale(${150 / src.offsetWidth})`;
      clone.style.transformOrigin = 'top left';
      clone.style.boxShadow = 'none';
      thumb.current.textContent = '';
      thumb.current.style.height = `${(src.offsetHeight * 150) / src.offsetWidth}px`;
      thumb.current.appendChild(clone);
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const doExport = async () => {
    const t = store.script.title;
    // An anonymous copy keeps the title only: no credit, writer, contact, source or date (blind reads).
    const title = !titlePage ? { ...t, title: '' } : anonymous ? { title: t.title, credit: '', authors: '', source: '', draftDate: '', contact: '' } : t;
    const script = { ...store.script, paper, title };
    const base = safeName(store.script.title.title);
    // Characters Courier Prime doesn't have would print as blanks in the PDF; say so, so nobody finds out later.
    const missing = fmt === 'pdf' ? uncoveredChars([script.title.title, script.title.credit, script.title.authors, script.title.source, script.title.contact, script.title.draftDate, ...script.elements.map((e) => e.text)].join('\n')) : [];
    const glyphNote = missing.length ? ` Heads up: Courier Prime has no ${missing.slice(0, 8).join(' ')}${missing.length > 8 ? ' and more' : ''}, so ${missing.length > 1 ? 'they' : 'it'} won’t print in the PDF. The Word file keeps ${missing.length > 1 ? 'them' : 'it'}.` : '';
    const anonNote = anonymous ? ' Anonymous: the title page shows the title only, and the file names no author.' : '';
    setBusy(true);
    setStatus(null);
    setResult(null);
    setCopied(false);
    // Let the button show "Making…" before the work starts.
    await new Promise((r) => window.setTimeout(r, 30));
    try {
      let out: SaveOutcome;
      if (fmt === 'pdf') {
        const n = pdfPageCount(script);
        out = await saveFile(`${base}.pdf`, scriptToPdf(script, { anonymous }));
        if (out.ok) setStatus({ tone: missing.length ? 'warn' : 'ok', text: `Saved “${out.name}”: ${n} page${n === 1 ? '' : 's'} on ${PAPERS[paper].name}, fonts embedded.${anonNote}${glyphNote}` });
      } else if (fmt === 'docx') {
        out = await saveFile(`${base}.docx`, scriptToDocx(script, { anonymous, fixedPages }));
        if (out.ok) setStatus({ tone: 'ok', text: `Saved “${out.name}”. Each element has its own Word style (“OpenAct Dialogue” and so on), so you can restyle them all at once.${fixedPages ? ' Page breaks match the PDF.' : ' Word sets the page breaks, so they may differ from the PDF.'}${anonNote}` });
      } else if (GAME_FMTS.includes(fmt)) {
        const game = analyze(script);
        const text = fmt === 'csv' ? toRecordingCsv(script, game) : fmt === 'ink' ? toInk(script, game) : fmt === 'yarn' ? toYarn(script, game) : toGameJson(script, game);
        const real = `${base}.${fmt}`;
        const hosted = inHostedPreview();
        const file = hosted && (fmt === 'ink' || fmt === 'yarn') ? `${real}.txt` : real;
        setResult({ kind: 'text', text, file: real });
        out = await saveFile(file, new Blob([text], { type: fmt === 'csv' ? 'text/csv;charset=utf-8' : fmt === 'json' ? 'application/json' : 'text/plain' }));
        const bad = game.issues.filter((i) => i.level === 'fix').length;
        const what = fmt === 'csv' ? 'One row per spoken line, bark and player choice, with its line ID.' : fmt === 'json' ? 'Nodes, items and flags, for your own tools.' : `One ${fmt === 'ink' ? 'knot' : 'node'} per node.${fmt === 'ink' ? ' Tested against the Ink compiler.' : ''}`;
        if (out.ok) setStatus({ tone: bad ? 'warn' : 'ok', text: `Saved “${out.name}”. ${what}${hosted && (fmt === 'ink' || fmt === 'yarn') ? ` Rename it to .${fmt}.` : ''}${bad ? ` ${bad} broken jump${bad === 1 ? '' : 's'} or duplicate${bad === 1 ? '' : 's'} in the script: see the Branches tab.` : ''}` });
      } else {
        const text = fmt === 'fountain' ? toFountain(script) : toFdx(script);
        // The hosted preview's save prompt accepts a short list of file types: Fountain goes as .txt, and Final Draft inside a .zip.
        const hosted = inHostedPreview();
        const real = fmt === 'fountain' ? `${base}.fountain` : `${base}.fdx`;
        const file = hosted ? (fmt === 'fountain' ? `${base}.fountain.txt` : `${base}.fdx.zip`) : real;
        setResult({ kind: 'text', text, file: real });
        const blob = hosted && fmt === 'fdx' ? new Blob([zipSync({ [real]: strToU8(text) }) as Uint8Array<ArrayBuffer>], { type: 'application/zip' }) : new Blob([text], { type: 'text/plain' });
        out = await saveFile(file, blob);
        if (out.ok) setStatus({ tone: 'ok', text: `Saved “${out.name}”.${hosted ? (fmt === 'fountain' ? ' Fountain is plain text; rename it to .fountain if your app needs that.' : ` Unzip it to get ${real}.`) : ''}${anonNote}` });
      }
      if (!out.ok) setStatus({ tone: 'warn', text: out.message });
    } catch {
      setStatus({ tone: 'warn', text: 'The file couldn’t be made. Try again, or export another format.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
          <DialogDescription>Save a copy of “{name}” to share or keep.</DialogDescription>
        </DialogHeader>
        <div className="export-grid">
          <div style={{ display: 'grid', gap: 14 }}>
            <fieldset style={{ display: 'grid', gap: 6 }}>
              <legend style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>File type</legend>
              <div className="radio-row">
                {fmts.map((f) => (
                  <label key={f.id}>
                    <input type="radio" name="fmt" id={`fmt-${f.id}`} checked={fmt === f.id} disabled={f.id === 'fdx' && !screenplay} onChange={() => { setFmt(f.id); setResult(null); setStatus(null); }} />
                    {f.label}
                  </label>
                ))}
              </div>
              {!screenplay && !isGame && <span className="hint" style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Final Draft files are for screen and audio formats.</span>}
            </fieldset>
            {!textOnly && (
            <fieldset style={{ display: 'grid', gap: 6 }}>
              <legend style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Paper</legend>
              <div className="radio-row">
                {(['a4', 'letter'] as PaperId[]).map((p) => (
                  <label key={p}>
                    <input type="radio" name="paper" id={`paper-${p}`} checked={paper === p} onChange={() => { setPaper(p); setResult(null); setStatus(null); }} />
                    {PAPERS[p].name}
                  </label>
                ))}
              </div>
            </fieldset>
            )}
            {!textOnly && (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" id="export-title" checked={titlePage} onChange={(e) => setTitlePage(e.target.checked)} /> Include the title page
            </label>
            )}
            {fmt === 'docx' && (
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <input type="checkbox" id="export-fixed" style={{ marginTop: 3 }} checked={fixedPages} onChange={(e) => { setFixedPages(e.target.checked); setStatus(null); }} />
                <span>
                  Keep the PDF’s page breaks
                  <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)' }}>Best for sending as it is. Leave it off to edit in Word, which then sets its own page breaks.</span>
                </span>
              </label>
            )}
            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                id="export-anon"
                style={{ marginTop: 3 }}
                checked={anonymous}
                onChange={(e) => {
                  store.setReview({ anonymous: e.target.checked });
                  setResult(null);
                }}
              />
              <span>
                Anonymous copy, for blind reading
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)' }}>The title page shows the title only and the file names no author.</span>
              </span>
            </label>
          </div>
          <div className="thumb" ref={thumb} aria-hidden="true" />
        </div>
        <p className={`export-status${status ? ` ${status.tone}` : ''}`} role="status" aria-live="polite">
          {status?.text ?? ''}
        </p>
        {result?.kind === 'text' && (
          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="export-out" style={{ fontWeight: 600, fontSize: 13 }}>
              {result.file}: the same text, to copy
            </label>
            <textarea id="export-out" className="code-out" readOnly value={result.text} />
          </div>
        )}
        <DialogFooter>
          {result?.kind === 'text' && (
            <button
              type="button"
              className="btn"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(result.text);
                  setCopied(true);
                } catch {
                  (document.getElementById('export-out') as HTMLTextAreaElement | null)?.select();
                }
              }}
            >
              {copied ? 'Copied' : 'Copy text'}
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={() => void doExport()} disabled={busy} aria-busy={busy}>
            {busy ? 'Making…' : `Export ${FMTS.find((f) => f.id === fmt)?.label}`}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PasteDialog({ text, onClose, onInsert }: { text: string | null; onClose: () => void; onInsert: (items: Detected[]) => void }) {
  const [raw, setRaw] = useState('');
  const [rows, setRows] = useState<Detected[] | null>(null);
  const prof = store.profile;
  useEffect(() => {
    if (text === null) return;
    setRaw(text);
    setRows(text.trim() ? detect(text, prof) : null);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  const types = prof.types;
  return (
    <Dialog open={text !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Paste a script</DialogTitle>
          <DialogDescription>Paste from Word, a PDF or an email. OpenAct finds the scene headings, character names and speeches; check them before adding.</DialogDescription>
        </DialogHeader>
        {rows === null ? (
          <div className="field">
            <label htmlFor="paste-raw">Script text</label>
            <textarea id="paste-raw" style={{ minHeight: 220, fontFamily: 'var(--font-script)', fontSize: 13 }} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={'DAME TROTT: Hello, boys and girls!\n(She waves.)\nSILLY BILLY: Hiya!'} />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            <p className="hint" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
              {rows.length} elements found. Change any that are wrong.
            </p>
            <div className="detect-list">
              {rows.map((r, i) => (
                <div key={i} className="detect-row">
                  <label className="sr-only" htmlFor={`det-${i}`}>
                    Element type for: {r.text}
                  </label>
                  <select id={`det-${i}`} value={r.type} onChange={(e) => setRows(rows.map((x, k) => (k === i ? { ...x, type: e.target.value as ElType } : x)))}>
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {labelOf(prof, t)}
                      </option>
                    ))}
                  </select>
                  <span className="txt">{r.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <DialogFooter>
          {rows === null ? (
            <button type="button" className="btn btn-primary" disabled={!raw.trim()} onClick={() => setRows(detect(raw, prof))}>
              Find elements
            </button>
          ) : (
            <>
              <button type="button" className="btn" onClick={() => setRows(null)}>
                Back to text
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onInsert(rows);
                  onClose();
                }}
              >
                Add {rows.length} elements to the end
              </button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TitleDialog({ open, onOpenChange }: OpenProps) {
  const [t, setT] = useState<TitlePage>(store.script.title);
  useEffect(() => {
    if (open) setT(store.script.title);
  }, [open]);
  const field = (k: keyof TitlePage, label: string, multi = false) => (
    <div className="field">
      <label htmlFor={`tp-${k}`}>{label}</label>
      {multi ? <textarea id={`tp-${k}`} value={t[k]} onChange={(e) => setT({ ...t, [k]: e.target.value })} /> : <input id={`tp-${k}`} value={t[k]} onChange={(e) => setT({ ...t, [k]: e.target.value })} />}
    </div>
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Title page</DialogTitle>
          <DialogDescription>Printed as the first page, without a page number.</DialogDescription>
        </DialogHeader>
        <form
          id="tp-form"
          style={{ display: 'grid', gap: 10 }}
          onSubmit={(e) => {
            e.preventDefault();
            store.setTitle(t);
            onOpenChange(false);
          }}
        >
          {field('title', 'Title')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {field('credit', 'Credit')}
            {field('authors', 'Author or authors')}
          </div>
          {field('source', 'Based on (optional)')}
          {field('draftDate', 'Draft and date')}
          {field('contact', 'Contact details', true)}
        </form>
        <DialogFooter>
          <button type="submit" form="tp-form" className="btn btn-primary">
            Save title page
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NoteDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const el = id ? store.el(id) : undefined;
  const [text, setText] = useState('');
  useEffect(() => {
    if (el) setText(el.note ?? '');
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Dialog open={!!el} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{el?.note ? 'Edit note' : 'Add a note'}</DialogTitle>
          <DialogDescription>Notes sit beside the script and never print.</DialogDescription>
        </DialogHeader>
        <div className="field">
          <label htmlFor="note-text">Note on: {el ? `${el.text.slice(0, 60)}${el.text.length > 60 ? '…' : ''}` : ''}</label>
          <textarea id="note-text" autoFocus value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <DialogFooter>
          {el?.note && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                store.setNote(el.id, '');
                onClose();
              }}
            >
              Delete note
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (el) store.setNote(el.id, text);
              onClose();
            }}
          >
            Save note
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SongDialog({ id, onClose, onJump }: { id: string | null; onClose: () => void; onJump: (id: string) => void }) {
  const el = id ? store.el(id) : undefined;
  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState<SongMeta>({ singers: '', func: '', staging: '', feel: '' });
  useEffect(() => {
    if (el) {
      setTitle(el.text);
      setMeta(el.song ?? { singers: '', func: '', staging: '', feel: '' });
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const no = el ? store.layout.songNo.get(el.id) : '';
  const input = (k: keyof Omit<SongMeta, 'reprise'>, label: string, multi = false) => (
    <div className="field">
      <label htmlFor={`song-${k}`}>{label}</label>
      {multi ? <textarea id={`song-${k}`} value={meta[k]} onChange={(e) => setMeta({ ...meta, [k]: e.target.value })} /> : <input id={`song-${k}`} value={meta[k]} onChange={(e) => setMeta({ ...meta, [k]: e.target.value })} />}
    </div>
  );
  return (
    <Dialog open={!!el} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Song {no}</DialogTitle>
          <DialogDescription>The title and singers print in the script; the notes stay in the song list.</DialogDescription>
        </DialogHeader>
        <div style={{ display: 'grid', gap: 10 }}>
          <div className="field">
            <label htmlFor="song-title">Title</label>
            <input id="song-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          {input('singers', 'Who sings')}
          {input('func', 'Dramatic function', true)}
          {input('staging', 'Staging')}
          {input('feel', 'Musical feel')}
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" id="song-reprise" checked={!!meta.reprise} onChange={(e) => setMeta({ ...meta, reprise: e.target.checked })} /> Reprise (numbered with a letter, like 2a)
          </label>
        </div>
        <DialogFooter>
          <button
            type="button"
            className="btn"
            onClick={() => {
              if (el) onJump(el.id);
              onClose();
            }}
          >
            Go to song
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (el) store.setSong(el.id, meta, title);
              onClose();
            }}
          >
            Save song
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShortcutsDialog({ open, onOpenChange }: OpenProps) {
  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  const mod = mac ? '⌘' : 'Ctrl';
  const alt = mac ? '⌥' : 'Alt';
  const prof = store.profile;
  const rows: [string, string][] = [
    ['Enter', 'New element: the next one in the flow'],
    ['Tab', 'Change an empty element, or add a parenthetical after a character or inside dialogue'],
    ['Shift + Tab', 'Change an empty element back'],
    ['Shift + Enter', 'Line break inside an element'],
    [`${mod} + ${alt} + 1–9`, `Set the element: ${prof.types.map((t, i) => `${i + 1} ${labelOf(prof, t)}`).join(', ')}`],
    [`${mod} + ${alt} + M`, 'Add or edit a note'],
    [`${mod} + Z`, 'Undo'],
    [`${mod} + Shift + Z`, 'Redo'],
    ['Esc, then Tab', 'Leave the script and move to the next control'],
    [`${alt} + ↑ / ↓`, 'In the outline: move the selected scene'],
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Everything in OpenAct works from the keyboard.</DialogDescription>
        </DialogHeader>
        <div className="shortcuts">
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: 'contents' }}>
              <kbd style={{ justifySelf: 'start', whiteSpace: 'nowrap' }}>{k}</kbd>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NoticeDialog({ message, onClose }: { message: string | null; onClose: () => void }) {
  return (
    <Dialog open={message !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Couldn’t open that file</DialogTitle>
          <DialogDescription id="notice-text">{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            OK
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Asked before a script is closed or replaced while it has changes that no file holds (D-046). */
export function LeaveDialog({ intent, onSave, onDiscard, onCancel }: { intent: 'close' | 'new' | 'open' | null; onSave: () => void; onDiscard: () => void; onCancel: () => void }) {
  const what = intent === 'open' ? 'open another script' : intent === 'new' ? 'start a new script' : 'close this script';
  const name = store.script.title.title.trim() || 'Untitled';
  return (
    <Dialog open={intent !== null} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Save “{name}” first?</DialogTitle>
          <DialogDescription>
            You’re about to {what}. {store.fileName ? `You’ve changed “${store.fileName}” since you last saved it.` : 'This script isn’t saved in a file yet.'} OpenAct keeps one script in this browser, so once you {intent === 'close' ? 'close it' : 'move on'} a saved file is the only way back to it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter style={{ flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-quiet" onClick={onCancel} id="leave-cancel">
            Keep writing
          </button>
          <button type="button" className="btn" onClick={onDiscard} id="leave-discard">
            {intent === 'close' ? 'Close without saving' : 'Continue without saving'}
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave} id="leave-save">
            Save a file, then {intent === 'close' ? 'close' : 'continue'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AboutDialog({ open, onOpenChange }: OpenProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <div className="about-brand">
            <Mark size={40} />
            <span className="about-name">OpenAct</span>
          </div>
          <DialogTitle className="sr-only">About OpenAct</DialogTitle>
          <DialogDescription>The free script editor for stage and screen.</DialogDescription>
        </DialogHeader>
        <div className="about">
          <section aria-labelledby="about-free">
            <h3 id="about-free">Free, and it stays free</h3>
            <p>Every format and every export, with no caps on scripts, no watermark, no account and nothing to buy.</p>
          </section>
          <section aria-labelledby="about-install">
            <h3 id="about-install">Install OpenAct</h3>
            <p>
              <strong>On a computer:</strong> download OpenAct and double-click the install file for your computer (Windows, Mac or Linux). Or, when OpenAct is on a web site, choose Install in your browser’s address bar or menu.
            </p>
            <p>
              <strong>On a phone or tablet:</strong> open the browser’s Share or menu button and choose Add to Home Screen.
            </p>
            <p>Once installed, OpenAct opens like any other app and works without a connection.</p>
            <p className="about-note">This prototype runs inside a preview page, so it can’t be installed from here.</p>
          </section>
          <section aria-labelledby="about-yours">
            <h3 id="about-yours">Your scripts stay with you</h3>
            <p>Scripts are kept on this device as you write, and go nowhere unless you export them. For a copy you can back up or move, use More, then Save to a file; More, then Open a script file brings it back.</p>
          </section>
          <section aria-labelledby="about-legal">
            <h3 id="about-legal">The small print</h3>
            <p>OpenAct is open source: the app under the GPL, version 3 or later, and its format libraries under the MIT licence. Courier Prime and Atkinson Hyperlegible Next are used under the SIL Open Font License.</p>
            <p>Copyright © 2026 Louis Lee Warner. OpenAct comes with no warranty.</p>
            <p>Final Draft is a trademark of Cast &amp; Crew Production Software, LLC. OpenAct is not affiliated with or endorsed by it, or by any competition, broadcaster, theatre or publisher named in the review or the format finder. Formats you import are read on your device and never uploaded.</p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
