import { useEffect, useRef, useState } from 'react';
import { ClipboardCheck, Download, Keyboard, ListTree, Monitor, Moon, MoreHorizontal, PanelLeft, PanelRight, Plus, Sun, Users, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PageEditor } from './cue/editor';
import type { PaperId, ProfileId } from './cue/model';
import { customFormats, idOf, type CustomFormat } from './cue/custom';
import { baseId, GROUPS, PAPERS, PROFILE_ORDER, PROFILES } from './cue/profiles';
import { FormatFileDialog, FormatFinderDialog, ImportFormatDialog, YourFormats } from './formats';
import { AboutDialog, ExportDialog, LeaveDialog, NoticeDialog, NoteDialog, PasteDialog, ShortcutsDialog, SongDialog, TitleDialog, WelcomeDialog } from './dialogs';
import { Details, ElementBar, Outline, StatusBar } from './panels';
import { ReviewPanel } from './review';
import { isMac, shortcutIndex } from './cue/flow';
import { Mark } from './logo';
import { makeSample, makeTemplate } from './cue/samples';
import { canPickFile, fileNameFor, parseScriptFile, saveToPicked, ScriptFileError, toScriptFile, writeTo, MAX_SCRIPT_BYTES } from './cue/scriptfile';
import { inHostedPreview, saveFile } from './cue/save';
import { firstRun, store, useStoreVersion } from './state';

type Theme = 'system' | 'light' | 'dark';
type RightTab = 'details' | 'review';

function useMedia(q: string) {
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const f = () => setM(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, [q]);
  return m;
}

/** A per-viewer preference kept in this browser; the app works without it. */
function useStored<T extends string>(key: string, initial: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => {
    try {
      return (localStorage.getItem(key) as T) || initial;
    } catch {
      return initial;
    }
  });
  const set = (next: T) => {
    setV(next);
    try {
      localStorage.setItem(key, next);
    } catch {
      /* convenience only */
    }
  };
  return [v, set];
}

function useTheme(): [Theme, (t: Theme) => void] {
  const [t, setT] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('openact-theme') as Theme) || (localStorage.getItem('actone-theme') as Theme) || (localStorage.getItem('cue-theme') as Theme) || 'system';
    } catch {
      return 'system';
    }
  });
  useEffect(() => {
    const r = document.documentElement;
    if (t === 'system') delete r.dataset.theme;
    else r.dataset.theme = t;
    try {
      localStorage.setItem('openact-theme', t);
    } catch {
      /* per-viewer convenience only */
    }
  }, [t]);
  return [t, setT];
}

function FormatControls() {
  return (
    <>
      <Select value={store.script.profile} onValueChange={(v) => store.setProfile(v as ProfileId)}>
        <SelectTrigger aria-label="Format" className="format-select h-8 w-[210px] bg-[var(--paper)]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {customFormats().length > 0 && (
            <SelectGroup>
              <SelectLabel>Your formats</SelectLabel>
              {customFormats().map((d) => (
                <SelectItem key={idOf(d)} value={idOf(d)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          {!PROFILES[store.script.profile] && (
            <SelectGroup>
              <SelectLabel>Not on this device</SelectLabel>
              <SelectItem value={store.script.profile}>Missing format (using {PROFILES[baseId(store.script.profile)].name})</SelectItem>
            </SelectGroup>
          )}
          {GROUPS.map((g) => (
            <SelectGroup key={g}>
              <SelectLabel>{g}</SelectLabel>
              {PROFILE_ORDER.filter((p) => PROFILES[p].group === g).map((p) => (
                <SelectItem key={p} value={p}>
                  {PROFILES[p].name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      <Select value={store.script.paper} onValueChange={(v) => store.setPaper(v as PaperId)}>
        <SelectTrigger aria-label="Paper size" className="format-select h-8 w-[118px] bg-[var(--paper)]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(['a4', 'letter'] as PaperId[]).map((p) => (
            <SelectItem key={p} value={p}>
              {PAPERS[p].name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export default function App() {
  useStoreVersion();
  const deskRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<PageEditor | null>(null);
  const [welcome, setWelcome] = useState(firstRun);
  const [exportOpen, setExportOpen] = useState(false);
  const [pasteText, setPasteText] = useState<string | null>(null);
  const [titleOpen, setTitleOpen] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [songId, setSongId] = useState<string | null>(null);
  const [shortcuts, setShortcuts] = useState(false);
  const [about, setAbout] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingFormat, setEditingFormat] = useState<CustomFormat | null>(null);
  const [finderOpen, setFinderOpen] = useState(false);
  const [fileFormat, setFileFormat] = useState<CustomFormat | null>(null);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [rightSheet, setRightSheet] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('details');
  const [leftShown, setLeftShown] = useStored<'yes' | 'no'>('openact-left', 'yes');
  const [rightShown, setRightShown] = useStored<'yes' | 'no'>('openact-right', 'yes');
  const [typing, setTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useTheme();
  const phone = useMedia('(max-width: 760px)');
  const medium = useMedia('(max-width: 1180px)');

  useEffect(() => {
    let flip = false;
    const ed = new PageEditor(deskRef.current!, store, {
      announce: (m) => {
        flip = !flip;
        setMessage(m + (flip ? '​' : ''));
      },
      openTitle: () => setTitleOpen(true),
      openNote: (id) => setNoteId(id),
      multiLinePaste: (t) => setPasteText(t),
    });
    editorRef.current = ed;
    return () => ed.destroy();
  }, []);

  useEffect(() => {
    store.setPaged(!phone);
  }, [phone]);

  // Tracks whether the writer is in the script (the phone's Done key shows only then).
  useEffect(() => {
    const desk = deskRef.current!;
    const on = () => setTyping(true);
    const off = (e: FocusEvent) => {
      if (!desk.contains(e.relatedTarget as Node | null)) setTyping(false);
    };
    desk.addEventListener('focusin', on);
    desk.addEventListener('focusout', off);
    return () => {
      desk.removeEventListener('focusin', on);
      desk.removeEventListener('focusout', off);
    };
  }, []);

  // Element shortcuts work anywhere in the app: Alt+1 to Alt+9 (Ctrl on a Mac), in the format's own order.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = shortcutIndex(e);
      if (i < 0) return;
      const t = store.profile.types[i];
      if (!t || document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      editorRef.current?.applyType(t);
    };
    // Holding the modifier shows the shortcut on each key.
    const hold = (e: KeyboardEvent) => document.documentElement.classList.toggle('show-kbd', isMac ? e.ctrlKey : e.altKey);
    const clear = () => document.documentElement.classList.remove('show-kbd');
    window.addEventListener('keydown', onKey);
    window.addEventListener('keydown', hold);
    window.addEventListener('keyup', hold);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keydown', hold);
      window.removeEventListener('keyup', hold);
      window.removeEventListener('blur', clear);
    };
  }, []);

  // On a phone, size the app to the visible area so the element bar sits on top of the on-screen keyboard.
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    const root = document.documentElement;
    if (!phone || !vv) {
      root.style.removeProperty('--app-h');
      setKeyboard(false);
      return;
    }
    const fit = () => {
      root.style.setProperty('--app-h', `${Math.round(vv.height)}px`);
      setKeyboard(vv.height < window.innerHeight * 0.78);
    };
    fit();
    vv.addEventListener('resize', fit);
    return () => {
      vv.removeEventListener('resize', fit);
      root.style.removeProperty('--app-h');
    };
  }, [phone]);

  const say = (m: string) => setMessage(m + (message.endsWith('​') ? '' : '​'));

  // ---- script files (D-046): save, open, close ----
  const fileInput = useRef<HTMLInputElement>(null);
  const [leave, setLeave] = useState<{ intent: 'close' | 'new' | 'open'; then: () => void } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const hasContent = () => store.script.elements.some((e) => e.text.trim()) || !!store.script.title.title.trim();
  const needsSave = () => {
    store.commit(); // text typed a moment ago counts
    return store.fileDirty && hasContent();
  };
  const guarded = (intent: 'close' | 'new' | 'open', then: () => void) => (needsSave() ? setLeave({ intent, then }) : then());
  const saveScript = async (asCopy = false): Promise<boolean> => {
    store.commit(); // take in text typed a moment ago, so it counts as saved
    const text = toScriptFile(store.script);
    const name = fileNameFor(store.script);
    try {
      if (!asCopy && store.fileHandle) {
        try {
          await writeTo(store.fileHandle as Parameters<typeof writeTo>[0], text);
          store.markFileSaved(store.fileName ?? name);
          say(`Saved ${store.fileName}`);
          return true;
        } catch {
          store.fileHandle = null; // the file moved or permission lapsed: ask again
        }
      }
      if (canPickFile() && !inHostedPreview()) {
        const h = await saveToPicked(name, text);
        if (!h) return false;
        store.markFileSaved(h.name, h);
        say(`Saved ${h.name}`);
        return true;
      }
      const out = await saveFile(inHostedPreview() ? name.replace(/\.openact$/, '.openact.json') : name, new Blob([text], { type: 'application/json' }));
      if (!out.ok) {
        if (out.reason !== 'declined') setNotice(out.message);
        return false;
      }
      store.markFileSaved(out.name);
      say(`Saved ${out.name}`);
      return true;
    } catch {
      setNotice('The file couldn’t be saved. Try “Save a copy…”, or export a copy instead.');
      return false;
    }
  };
  const openScriptFile = async (file: File) => {
    if (file.size > MAX_SCRIPT_BYTES) return setNotice('This file is too large to be a script (over 20 MB).');
    const text = await file.text();
    try {
      const script = parseScriptFile(text);
      store.load(script, { name: file.name });
      setWelcome(false);
      focusFirst();
      say(`Opened ${file.name}`);
    } catch (e) {
      // Plain text (Fountain or a copy from elsewhere) goes through the paste preview instead.
      if (/\.(fountain|txt|md)$/i.test(file.name)) setPasteText(text);
      else setNotice(e instanceof ScriptFileError ? e.message : 'This file couldn’t be read as a script.');
    }
  };
  const askOpen = () => guarded('open', () => fileInput.current?.click());
  const askNew = () => guarded('new', () => setWelcome(true));
  const closeScript = () =>
    guarded('close', () => {
      store.load(makeSample('blank-screen', store.script.paper));
      setWelcome(true);
      say('Script closed');
    });
  const keys = useRef({ save: () => {}, open: () => {} });
  keys.current = { save: () => void saveScript(), open: askOpen };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(isMac ? e.metaKey : e.ctrlKey) || e.altKey || e.shiftKey) return;
      const k = e.key.toLowerCase();
      if ((k !== 's' && k !== 'o') || document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      (k === 's' ? keys.current.save : keys.current.open)();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  // The browser's own "leave this page?" prompt, while changes are in no file.
  useEffect(() => {
    window.onbeforeunload = (e) => {
      if (!needsSave()) return;
      e.preventDefault();
      e.returnValue = '';
    };
  });
  const jump = (id: string) => {
    setOutlineOpen(false);
    setRightSheet(false);
    window.setTimeout(() => editorRef.current?.focusElement(id), 30);
  };
  /** Wide screens keep the side panel open while you jump around. */
  const jumpKeep = (id: string) => window.setTimeout(() => editorRef.current?.focusElement(id), 30);
  /** Start a new script in a format (the Start screen's list and the finder). */
  const startWith = (id: ProfileId) => {
    store.load(makeTemplate(id));
    setWelcome(false);
    focusFirst();
  };
  const focusFirst = () => {
    const first = store.script.elements[store.script.elements.length > 2 ? 1 : 0];
    if (first) window.setTimeout(() => editorRef.current?.focusElement(first.id), 60);
  };

  const wide = !medium;
  const rightOpen = wide ? rightShown === 'yes' : rightSheet;
  const showRight = (tab: RightTab) => {
    setRightTab(tab);
    if (wide) setRightShown('yes');
    else setRightSheet(true);
  };
  const openExport = () => {
    setRightSheet(false);
    setExportOpen(true);
  };

  const title = store.script.title.title.trim() || 'Untitled';
  const rightTabs = (
    <div className="seg" role="tablist" aria-label="Side panel">
      {(['details', 'review'] as RightTab[]).map((t) => (
        <button key={t} type="button" role="tab" id={`tab-${t}`} aria-selected={rightTab === t} aria-controls="right-panel" onClick={() => setRightTab(t)}>
          {t === 'details' ? 'Details' : 'Review'}
        </button>
      ))}
    </div>
  );
  const rightBody = (
    <div id="right-panel" role="tabpanel" aria-labelledby={`tab-${rightTab}`}>
      {rightTab === 'details' ? (
        <div className="side" style={{ padding: 0, background: 'transparent' }}>
          {phone && (
            <div className="settings-block">
              <h3>Script settings</h3>
              <div className="tool-group" style={{ flexWrap: 'wrap' }}>
                <FormatControls />
              </div>
              <button type="button" className="btn" onClick={() => { setRightSheet(false); setTitleOpen(true); }}>
                Edit the title page
              </button>
            </div>
          )}
          <Details onJump={wide ? jumpKeep : jump} onEditSong={setSongId} />
        </div>
      ) : (
        <div className="side review-side" style={{ padding: 0, background: 'transparent' }}>
          <ReviewPanel heading={false} onJump={wide ? jumpKeep : jump} onExport={openExport} announce={say} />
        </div>
      )}
    </div>
  );

  const cols = {
    '--left': !phone && leftShown === 'yes' ? (medium ? '240px' : '260px') : '0px',
    '--right': wide && rightShown === 'yes' ? (rightTab === 'review' ? '400px' : '320px') : '0px',
  } as React.CSSProperties;

  return (
    <div className="app" style={cols}>
      <header className="topbar">
        <h1 className="sr-only">OpenAct: {title}</h1>
        <input
          ref={fileInput}
          type="file"
          id="open-script-file"
          className="sr-only"
          tabIndex={-1}
          aria-label="Open a script file"
          accept=".openact,.json,.fountain,.txt,application/json,text/plain"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) void openScriptFile(f);
          }}
        />
        <p id="editor-help" className="sr-only">
          Each paragraph is one script element. Enter starts the next element and Tab changes the element type. Press Escape, then Tab, to leave the script.
        </p>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {message}
        </div>
        {!phone && (
          <button type="button" className="btn btn-quiet btn-icon" aria-label="Outline panel" aria-pressed={leftShown === 'yes'} title="Show or hide the outline" onClick={() => setLeftShown(leftShown === 'yes' ? 'no' : 'yes')}>
            <PanelLeft size={18} aria-hidden />
          </button>
        )}
        <span className="wordmark" aria-label="OpenAct">
          <Mark size="0.64em" />
          OpenAct
        </span>
        <button type="button" className="script-title" onClick={() => setTitleOpen(true)} aria-label={`${title}: edit the title page`}>
          {title}
        </button>
        <span className="topbar-spacer" />
        <button type="button" className="btn" onClick={askNew} aria-label="New script">
          <Plus size={16} aria-hidden /> <span aria-hidden>New</span>
        </button>
        {!phone && (
          <button type="button" className="btn btn-quiet" onClick={closeScript} title="Close this script and go back to the start">
            <X size={16} aria-hidden /> Close
          </button>
        )}
        {!phone && (
          <div className="tool-group">
            <FormatControls />
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="btn btn-quiet btn-icon" aria-label="More">
              <MoreHorizontal size={18} aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={askNew}>Start a script…</DropdownMenuItem>
            <DropdownMenuItem onSelect={askOpen}>
              Open a script file…<DropdownMenuShortcut>{isMac ? '⌘O' : 'Ctrl+O'}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void saveScript()}>
              Save to a file<DropdownMenuShortcut>{isMac ? '⌘S' : 'Ctrl+S'}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void saveScript(true)}>Save a copy…</DropdownMenuItem>
            <DropdownMenuItem onSelect={closeScript}>Close this script</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setPasteText('')}>Paste a script…</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { setEditingFormat(null); setImportOpen(true); }}>Import a format file…</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFinderOpen(true)}>Find a format…</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => showRight('review')}>Ready to submit?…</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShortcuts(true)}>
              <Keyboard size={15} aria-hidden /> Keyboard shortcuts
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setAbout(true)}>Install OpenAct…</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setAbout(true)}>About OpenAct</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
              <DropdownMenuRadioItem value="system">
                <Monitor size={15} aria-hidden /> Match device
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="light">
                <Sun size={15} aria-hidden /> Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon size={15} aria-hidden /> Dark
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <button type="button" className="btn btn-primary" onClick={() => setExportOpen(true)}>
          <Download size={16} aria-hidden /> Export
        </button>
        {!phone && (
          <button
            type="button"
            className="btn btn-quiet btn-icon"
            aria-label="Side panel"
            aria-pressed={rightOpen}
            title="Show or hide the side panel"
            onClick={() => (wide ? setRightShown(rightShown === 'yes' ? 'no' : 'yes') : setRightSheet(true))}
          >
            <PanelRight size={18} aria-hidden />
          </button>
        )}
      </header>

      {!phone && leftShown === 'yes' && (
        <nav className="side side-left" aria-label="Outline">
          <Outline onJump={jump} announce={say} />
        </nav>
      )}

      <main className="desk" ref={deskRef} aria-label="Script pages" aria-describedby="editor-help" />

      {wide && rightShown === 'yes' && (
        <aside className="side side-right" aria-label="Details and review">
          {rightTabs}
          {rightBody}
        </aside>
      )}

      {!phone && <StatusBar />}
      <ElementBar
        phone={phone}
        typing={typing}
        onType={(t) => editorRef.current?.applyType(t)}
        onRetype={(t) => {
          const ed = editorRef.current;
          if (!ed) return;
          if (!ed.currentId()) ed.applyType(t);
          else ed.setCurrentType(t);
        }}
        onName={(n) => editorRef.current?.insertName(n)}
        onDone={() => {
          (document.activeElement as HTMLElement | null)?.blur();
          setTyping(false);
        }}
      />
      {phone && !keyboard && (
        <nav className="bottom-nav" aria-label="Sections">
          <button type="button" onClick={() => setOutlineOpen(true)}>
            <ListTree size={20} aria-hidden />
            Outline
          </button>
          <button type="button" onClick={() => showRight('details')}>
            <Users size={20} aria-hidden />
            Details
          </button>
          <button type="button" onClick={() => showRight('review')}>
            <ClipboardCheck size={20} aria-hidden />
            Review
          </button>
          <button type="button" onClick={askNew}>
            <Plus size={20} aria-hidden />
            New
          </button>
        </nav>
      )}

      <Sheet open={outlineOpen} onOpenChange={setOutlineOpen}>
        <SheetContent side="left" className="w-[300px] max-w-[88vw] overflow-auto bg-[var(--panel)]">
          <SheetHeader className="sr-only">
            <SheetTitle>Outline</SheetTitle>
            <SheetDescription>Acts and scenes</SheetDescription>
          </SheetHeader>
          <div className="side" style={{ padding: 0, background: 'transparent' }}>
            <Outline onJump={jump} announce={say} />
          </div>
        </SheetContent>
      </Sheet>
      {medium && (
        <Sheet open={rightSheet} onOpenChange={setRightSheet}>
          <SheetContent side="right" className="w-[420px] max-w-full overflow-auto bg-[var(--panel)]">
            <div className="sheet-head">
              <SheetHeader>
                <SheetTitle>{rightTab === 'review' ? 'Ready to submit?' : 'Script details'}</SheetTitle>
                <SheetDescription className="sr-only">Songs, cast, scenes and the submission review</SheetDescription>
              </SheetHeader>
              {rightTabs}
            </div>
            {rightBody}
          </SheetContent>
        </Sheet>
      )}

      <WelcomeDialog
        open={welcome}
        onOpenChange={setWelcome}
        onStart={focusFirst}
        onImport={() => { setWelcome(false); setEditingFormat(null); setImportOpen(true); }}
        onFind={() => { setWelcome(false); setFinderOpen(true); }}
        yourFormats={<YourFormats onUse={startWith} onEdit={(d) => { setWelcome(false); setEditingFormat(d); setImportOpen(true); }} onExport={(d) => { setWelcome(false); setFileFormat(d); }} />}
      />
      <ImportFormatDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        editing={editingFormat}
        onSaved={(id, use) => {
          if (use) {
            store.setProfile(id);
            const paper = PROFILES[id]?.paper;
            if (paper) store.setPaper(paper);
          }
          say(use ? `Saved and using ${PROFILES[id]?.name ?? 'the format'}` : 'Format saved');
        }}
      />
      <FormatFinderDialog open={finderOpen} onOpenChange={setFinderOpen} onUse={startWith} onImport={() => { setEditingFormat(null); setImportOpen(true); }} />
      <FormatFileDialog format={fileFormat} onClose={() => setFileFormat(null)} />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <LeaveDialog
        intent={leave?.intent ?? null}
        onCancel={() => setLeave(null)}
        onDiscard={() => {
          const go = leave?.then;
          setLeave(null);
          go?.();
        }}
        onSave={async () => {
          const go = leave?.then;
          if (await saveScript()) {
            setLeave(null);
            go?.();
          }
        }}
      />
      <NoticeDialog message={notice} onClose={() => setNotice(null)} />
      <PasteDialog text={pasteText} onClose={() => setPasteText(null)} onInsert={(rows) => editorRef.current?.insertAtEnd(rows)} />
      <TitleDialog open={titleOpen} onOpenChange={setTitleOpen} />
      <NoteDialog id={noteId} onClose={() => setNoteId(null)} />
      <SongDialog id={songId} onClose={() => setSongId(null)} onJump={jump} />
      <ShortcutsDialog open={shortcuts} onOpenChange={setShortcuts} />
      <AboutDialog open={about} onOpenChange={setAbout} />
    </div>
  );
}
