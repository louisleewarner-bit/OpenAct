import { AlertTriangle, CheckCircle2, CircleX, ExternalLink, Info, X } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { review, type Result, type Status } from './cue/review';
import { defaultTarget, KIND_LABEL, SOURCES, TARGET_GROUPS, TARGET_ORDER, TARGETS, type TargetId } from './cue/review-data';
import { store } from './state';

const STATUS_WORD: Record<Status, string> = { fix: 'To fix', consider: 'To consider', pass: 'Passed', info: 'Note' };

/** Which rows are open survives closing the panel, so jumping to a page and back keeps your place. */
const openRows = new Set<string>();

function StatusIcon({ s }: { s: Status }) {
  const p = { size: 17, 'aria-hidden': true as const, className: `rv-icon ${s}` };
  if (s === 'fix') return <CircleX {...p} />;
  if (s === 'consider') return <AlertTriangle {...p} />;
  if (s === 'pass') return <CheckCircle2 {...p} />;
  return <Info {...p} />;
}

function Sources({ ids }: { ids: string[] }) {
  return (
    <ul className="rv-sources" aria-label="Sources">
      {ids.map((id) => {
        const s = SOURCES[id];
        if (!s) return null;
        return (
          <li key={id}>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
                <ExternalLink size={12} aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span>{s.label}</span>
            )}
            <span className="rv-kind">{KIND_LABEL[s.kind]}</span>
            <span className="rv-date">{s.date}</span>
          </li>
        );
      })}
    </ul>
  );
}

function Row({ r, onJump, announce }: { r: Result; onJump: (id: string) => void; announce: (m: string) => void }) {
  const doFix = (action: string, arg?: string) => {
    if (action === 'remove-date') {
      store.setTitle({ ...store.script.title, draftDate: '' });
      announce('Draft date removed from the title page');
    } else if (action === 'anonymous-on') {
      store.setReview({ anonymous: true });
      announce('Exports will be anonymous');
    } else if (action === 'add-to-cast' && arg) {
      store.setCast([...store.script.cast, { name: arg, description: '' }]);
      announce(`${arg} added to the cast list`);
    }
  };
  return (
    <li>
      <details
        className={`rv-row ${r.status}`}
        open={openRows.has(r.id)}
        onToggle={(e) => {
          if ((e.currentTarget as HTMLDetailsElement).open) openRows.add(r.id);
          else openRows.delete(r.id);
        }}
        data-check={r.id}
      >
        <summary>
          <StatusIcon s={r.status} />
          <span className="rv-title">
            <span className="sr-only">{STATUS_WORD[r.status]}: </span>
            {r.title}
            <span className="rv-section">{r.section}</span>
          </span>
        </summary>
        <div className="rv-body">
          {r.detail && <p>{r.detail}</p>}
          {r.places && r.places.length > 0 && (
            <ul className="rv-places" aria-label="Where">
              {r.places.map((p, i) => (
                <li key={`${p.id}-${i}`}>
                  <button type="button" onClick={() => onJump(p.id)}>
                    <span className="rv-page">p. {p.page}</span> {p.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {r.fixes && r.fixes.length > 0 && (
            <div className="rv-fixes">
              {r.fixes.map((f) => (
                <button key={f.label} type="button" className="btn" onClick={() => doFix(f.action, f.arg)}>
                  {f.label}
                </button>
              ))}
            </div>
          )}
          <p className="rv-why">
            <strong>Why it matters:</strong> {r.why}
          </p>
          <Sources ids={r.sources} />
          {r.status === 'consider' && (
            <button
              type="button"
              className="btn btn-quiet rv-dismiss"
              onClick={() => {
                store.dismiss(`review:${r.id}`);
                announce('Set aside. You can put it back at the end of the list.');
              }}
            >
              Not relevant to this script
            </button>
          )}
        </div>
      </details>
    </li>
  );
}

export function ReviewPanel({ onJump, onClose, onExport, announce, heading = true }: { onJump: (id: string) => void; onClose?: () => void; onExport: () => void; announce: (m: string) => void; heading?: boolean }) {
  const st = store.script.review ?? {};
  const targetId: TargetId = st.target && st.target in TARGETS ? (st.target as TargetId) : defaultTarget(store.script.profile);
  const rep = review(store.script, store.layout, targetId, st.anonymous);
  const t = rep.target;
  const by = (s: Status) => rep.results.filter((r) => r.status === s);
  const fix = by('fix');
  const consider = by('consider');
  const pass = by('pass');
  const info = by('info');

  const setTarget = (id: string) => {
    store.setReview({ target: id });
    const r = review(store.script, store.layout, id, store.script.review?.anonymous);
    announce(`${TARGETS[id as TargetId].name}: ${r.counts.fix} to fix, ${r.counts.consider} to consider, ${r.counts.pass} passed`);
  };

  return (
    <div className="review">
      <div className="rv-head">
        {heading && <h2>Ready to submit?</h2>}
        {onClose && (
          <button type="button" className="btn btn-quiet btn-icon" aria-label="Close the review" onClick={onClose}>
            <X size={17} aria-hidden />
          </button>
        )}
      </div>
      <p className="hint">Checks for the things that drift while you redraft. They don’t change your script unless you press a fix.</p>

      <div className="rv-target">
        <label id="rv-target-label" htmlFor="rv-target">Where is it going?</label>
        <Select value={targetId} onValueChange={setTarget}>
          <SelectTrigger id="rv-target" aria-labelledby="rv-target-label" className="h-9 w-full bg-[var(--paper)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TARGET_GROUPS.map((g) => (
              <SelectGroup key={g}>
                <SelectLabel>{g}</SelectLabel>
                {TARGET_ORDER.filter((id) => TARGETS[id].group === g).map((id) => (
                  <SelectItem key={id} value={id}>
                    {TARGETS[id].name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <p className="rv-blurb">{t.blurb}</p>
        <p className="rv-dated">
          Rules researched {t.researched}. Rules change every year
          {t.rules ? (
            <>
              , so read the current ones:{' '}
              <a href={t.rules.url} target="_blank" rel="noreferrer">
                {t.rules.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </>
          ) : (
            ', so check the current guidelines before you send.'
          )}
        </p>
        {t.blind && (
          <label className="rv-anon">
            <input type="checkbox" checked={Boolean(st.anonymous)} onChange={(e) => store.setReview({ anonymous: e.target.checked })} />
            <span>
              Anonymous copy when I export
              <span className="hint"> The title page shows the title only and the PDF names no author. Your own copy keeps your details.</span>
            </span>
          </label>
        )}
      </div>

      <p className="rv-summary">
        <span className="rv-chip fix">{rep.counts.fix} to fix</span>
        <span className="rv-chip consider">{rep.counts.consider} to consider</span>
        <span className="rv-chip pass">{rep.counts.pass} passed</span>
      </p>

      {fix.length > 0 && (
        <section aria-labelledby="rv-h-fix">
          <h3 id="rv-h-fix">To fix</h3>
          <ul className="rv-list">{fix.map((r) => <Row key={r.id} r={r} onJump={onJump} announce={announce} />)}</ul>
        </section>
      )}
      {consider.length > 0 && (
        <section aria-labelledby="rv-h-consider">
          <h3 id="rv-h-consider">To consider</h3>
          <ul className="rv-list">{consider.map((r) => <Row key={r.id} r={r} onJump={onJump} announce={announce} />)}</ul>
        </section>
      )}
      {fix.length === 0 && consider.length === 0 && <p className="rv-clear">Nothing to fix or consider for this submission.</p>}

      {t.manual.length > 0 && (
        <section aria-labelledby="rv-h-manual">
          <h3 id="rv-h-manual">Before you send</h3>
          <p className="hint">OpenAct can’t check these, so tick them off yourself.</p>
          <ul className="rv-manual">
            {t.manual.map((m) => {
              const key = `${t.id}:${m.id}`;
              const ticked = (st.ticked ?? []).includes(key);
              return (
                <li key={key}>
                  <label>
                    <input type="checkbox" checked={ticked} onChange={() => store.toggleTicked(key)} />
                    <span>{m.text}</span>
                  </label>
                  <Sources ids={m.sources} />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {info.length > 0 && (
        <section aria-labelledby="rv-h-info">
          <h3 id="rv-h-info">Notes</h3>
          <ul className="rv-list">{info.map((r) => <Row key={r.id} r={r} onJump={onJump} announce={announce} />)}</ul>
        </section>
      )}

      {pass.length > 0 && (
        <details className="rv-group">
          <summary>Passed ({pass.length})</summary>
          <ul className="rv-list">{pass.map((r) => <Row key={r.id} r={r} onJump={onJump} announce={announce} />)}</ul>
        </details>
      )}

      {rep.dismissed.length > 0 && (
        <details className="rv-group">
          <summary>Set aside ({rep.dismissed.length})</summary>
          <ul className="rv-list rv-setaside">
            {rep.dismissed.map((r) => (
              <li key={r.id}>
                <span>{r.title}</span>
                <button type="button" className="btn btn-quiet" onClick={() => store.undismiss(`review:${r.id}`)}>
                  Put back
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="rv-foot">
        <button type="button" className="btn btn-primary" onClick={onExport}>
          {t.blind && st.anonymous ? 'Export an anonymous copy' : 'Export'}
        </button>
      </div>
    </div>
  );
}
