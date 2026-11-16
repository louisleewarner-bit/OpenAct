import type React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { FolderOpen, Search, Upload } from 'lucide-react';
import { GROUPS, PROFILE_ORDER, PROFILES, profileOf } from './cue/profiles';
import { makeSample, makeTemplate, type SampleId } from './cue/samples';
import { GroupArt, HeroArt } from './illustrations';
import { Mark } from './logo';
import { store } from './state';

const SAMPLES: { id: SampleId; title: string; sample: string; desc: string }[] = [
  { id: 'panto', title: 'Pantomime', sample: 'Jack and the Beanstalk', desc: 'Front cloths, songs, and a "behind you".' },
  { id: 'musical', title: 'Musical', sample: "The Lighthouse Keeper's Daughter", desc: 'Numbered songs with singers and staging notes.' },
  { id: 'screenplay', title: 'Screenplay', sample: 'Last Wash', desc: 'A speech that runs over a page, with (MORE) and (CONT’D).' },
];

const BLANKS = [
  ['blank-screen', 'Blank screenplay', 'An empty page, ready for a scene heading.'],
  ['blank-stage', 'Blank stage play', 'Act One, Scene 1, in UK layout.'],
] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
  onImport: () => void;
  onFind: () => void;
  onOpenFile: () => void;
  yourFormats: React.ReactNode;
}

/**
 * The start page (D-047): where a script begins. Full screen, with a headline and the two things most people want
 * (a blank page, or a file), a card to carry on with the script already open, and every format as a card in its
 * group. It is a dialog underneath, so focus stays inside it and Escape goes back to the script.
 */
export function WelcomeDialog({ open, onOpenChange, onStart, onImport, onFind, onOpenFile, yourFormats }: Props) {
  const s = store.script;
  const hasScript = s.elements.some((e) => e.text.trim());
  const begin = (script: ReturnType<typeof makeSample>) => {
    store.load(script);
    onOpenChange(false);
    onStart();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`start-page${hasScript ? ' has-script' : ''}`} onOpenAutoFocus={(e) => { e.preventDefault(); document.getElementById('start-blank')?.focus(); }}>
        <div className="start-wrap">
          <div className="start-brand">
            <span className="wordmark" aria-hidden="true">
              <Mark size="0.7em" />
              OpenAct
            </span>
            {hasScript && (
              <button type="button" className="btn btn-quiet" onClick={() => onOpenChange(false)}>
                Back to my script
              </button>
            )}
          </div>

          <div className="start-hero">
            <div className="start-hero-text">
              <DialogTitle className="start-title">
                Start a script
              </DialogTitle>
              <DialogDescription className="start-lede">Pick a format and start writing. Your scripts stay on your device, and nothing is uploaded.</DialogDescription>
              <div className="start-actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={() => begin(makeSample('blank-screen', s.paper))} id="start-blank">
                  Start a blank screenplay
                </button>
                <button type="button" className="btn btn-lg" onClick={onOpenFile} id="start-open">
                  <FolderOpen size={17} aria-hidden /> Open a file…
                </button>
              </div>
              <div className="start-tools">
                <button type="button" className="btn btn-quiet" onClick={onFind}>
                  <Search size={15} aria-hidden /> Find a format…
                </button>
                <button type="button" className="btn btn-quiet" onClick={onImport}>
                  <Upload size={15} aria-hidden /> Import a format file…
                </button>
              </div>
            </div>
            <HeroArt />
          </div>

          {hasScript && (
            <section className="resume" aria-label="The script you have open">
              <GroupArt group="Blank" size={44} />
              <div className="resume-text">
                <strong>{s.title.title.trim() || 'Untitled'}</strong>
                <span>
                  {profileOf(s.profile).name}
                  {' · '}
                  {store.fileName ? (store.fileDirty ? `Changed since saved to ${store.fileName}` : `Saved to ${store.fileName}`) : 'Kept in this browser'}
                </span>
              </div>
              <button type="button" className="btn" onClick={() => onOpenChange(false)}>
                Continue writing
              </button>
            </section>
          )}

          {yourFormats}

          <div className="start-grid">
            <div className="start-card" role="group" aria-label="Blank">
              <div className="start-card-head">
                <GroupArt group="Blank" />
                <h3>Blank</h3>
              </div>
              <div className="choice-grid two">
                {BLANKS.map(([id, title, desc]) => (
                  <button key={id} type="button" className="choice choice-blank" onClick={() => begin(makeSample(id, s.paper))}>
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="start-card" role="group" aria-label="Samples">
              <div className="start-card-head">
                <GroupArt group="Samples" />
                <h3>Samples</h3>
              </div>
              <div className="choice-grid three">
                {SAMPLES.map((c) => (
                  <button key={c.id} type="button" className="choice" onClick={() => begin(makeSample(c.id, s.paper))}>
                    <strong>{c.title}</strong>
                    <em>{c.sample}</em>
                    <span>{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {GROUPS.map((g) => (
              <section key={g} className="start-card" aria-label={g}>
                <div className="start-card-head">
                  <GroupArt group={g} />
                  <h3>{g}</h3>
                </div>
                <div className="choice-grid three">
                  {PROFILE_ORDER.filter((p) => PROFILES[p].group === g).map((p) => (
                    <button key={p} type="button" className="choice" onClick={() => begin(makeTemplate(p))}>
                      <strong>{PROFILES[p].name}</strong>
                      <span>{PROFILES[p].blurb}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="start-foot">OpenAct is free and open source. It keeps scripts on your device and never uploads them. Save a file (Ctrl+S) for a copy you can back up or move.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
