import { analyze, type GNode } from './cue/game';
import { store } from './state';

/**
 * The branch map for video game scripts (D-044): every node, where it leads, and what is wrong with the
 * joins. The drawing is a picture of the list below it, so it is hidden from screen readers and the list is
 * the accessible version.
 */

const W = 300;
const BOX_H = 28;
const ROW = 52;

interface Pos {
  x: number;
  y: number;
  w: number;
}

function place(nodes: GNode[]) {
  const depth = new Map<string, number>();
  if (nodes.length) {
    depth.set(nodes[0].key, 0);
    const byKey = new Map(nodes.map((n) => [n.key, n]));
    const todo = [nodes[0]];
    for (let i = 0; i < todo.length; i++) {
      const n = todo[i];
      for (const x of n.exits) {
        const t = byKey.get(x.key);
        if (t && !depth.has(t.key)) {
          depth.set(t.key, depth.get(n.key)! + 1);
          todo.push(t);
        }
      }
    }
  }
  const rows: GNode[][] = [];
  const loose: GNode[] = [];
  for (const n of nodes) {
    const d = depth.get(n.key);
    if (d === undefined) loose.push(n);
    else (rows[d] ??= []).push(n);
  }
  if (loose.length) rows.push(loose);
  const pos = new Map<string, Pos>();
  rows.forEach((row, r) => {
    if (!row) return;
    const gap = 8;
    const w = Math.min(132, (W - 16 - gap * (row.length - 1)) / row.length);
    const total = row.length * w + gap * (row.length - 1);
    row.forEach((n, k) => pos.set(n.key, { x: (W - total) / 2 + k * (w + gap), y: 22 + r * ROW, w }));
  });
  return { pos, height: 22 + rows.length * ROW + 8, looseRow: loose.length ? rows.length - 1 : -1 };
}

const clip = (s: string, w: number) => {
  const max = Math.max(4, Math.floor((w - 12) / 6.4));
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

export function Branches({ onJump }: { onJump: (id: string) => void }) {
  const script = store.script;
  const game = analyze(script);
  const { pos, height } = place(game.nodes);
  const unlocked = script.elements.filter((e) => (e.type === 'character' || e.type === 'bark') && !e.lineId).length;
  const locked = script.elements.filter((e) => e.lineId).length;
  const fix = game.issues.filter((i) => i.level === 'fix');
  const consider = game.issues.filter((i) => i.level === 'consider');
  const issueNodes = new Set(game.issues.map((i) => i.id));
  return (
    <div className="branches" style={{ marginTop: 8, display: 'grid', gap: 12 }}>
      {game.nodes.length === 0 ? (
        <p className="hint">The map appears as you write nodes. A node is a scene heading; a GO TO line joins one node to another.</p>
      ) : (
        <>
          <svg className="bmap" viewBox={`0 0 ${W} ${height}`} role="img" aria-label={`Branch map: ${game.nodes.length} nodes. The list below says the same in words.`} aria-hidden="false">
            <defs>
              <marker id="bm-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L8 4 L0 8 z" className="bm-head" />
              </marker>
            </defs>
            {game.nodes.flatMap((n) =>
              n.exits.map((x, k) => {
                const a = pos.get(n.key);
                const b = pos.get(x.key);
                if (!a || !b) return null;
                const back = b.y <= a.y;
                const ax = a.x + a.w / 2;
                const bx = b.x + b.w / 2;
                let d: string;
                if (n.key === x.key) d = `M${a.x + a.w} ${a.y + 10} c 16 -2 16 18 0 16`;
                else if (back) {
                  // Back edges leave and enter by the right-hand side, further out the longer they are.
                  const ex = Math.max(a.x + a.w, b.x + b.w);
                  const out = Math.min(W - 4, ex + 12 + Math.round((a.y - b.y) / ROW) * 7 + (k % 2) * 5);
                  d = `M${a.x + a.w} ${a.y + BOX_H / 2 + 3} C ${out} ${a.y + BOX_H / 2 + 3}, ${out} ${b.y + BOX_H / 2 + 3}, ${b.x + b.w} ${b.y + BOX_H / 2 + 3}`;
                } else d = `M${ax} ${a.y + BOX_H} C ${ax} ${(a.y + BOX_H + b.y) / 2}, ${bx} ${(a.y + BOX_H + b.y) / 2}, ${bx} ${b.y}`;
                return <path key={`${n.id}-${x.id}`} d={d} className={`bm-edge${back ? ' back' : ''}`} markerEnd="url(#bm-arrow)" />;
              }),
            )}
            {game.nodes.map((n, i) => {
              const p = pos.get(n.key)!;
              return (
                <g key={n.id} className={`bm-node${i === 0 ? ' start' : ''}${!n.reachable ? ' loose' : ''}${issueNodes.has(n.id) ? ' flag' : ''}`}>
                  <rect x={p.x} y={p.y} width={p.w} height={BOX_H} rx="4" />
                  <text x={p.x + p.w / 2} y={p.y + 18} textAnchor="middle">
                    {clip(n.name, p.w)}
                  </text>
                </g>
              );
            })}
          </svg>
          <ul className="bnodes">
            {game.nodes.map((n, i) => (
              <li key={n.id}>
                <button type="button" className="bnode" onClick={() => onJump(n.id)} aria-label={`${n.name}${i === 0 ? ' (start)' : ''}. ${n.lines} lines, ${n.choices} choices. Go to this node.`}>
                  <span className="b-name">{n.name}</span>
                  {i === 0 && <span className="b-tag">Start</span>}
                  {!n.reachable && <span className="b-tag warn">Unreached</span>}
                  <span className="b-meta">
                    {n.lines} line{n.lines === 1 ? '' : 's'} · {n.choices} choice{n.choices === 1 ? '' : 's'}
                    {n.barks ? ` · ${n.barks} bark${n.barks === 1 ? '' : 's'}` : ''}
                  </span>
                </button>
                <div className="b-exits">
                  {n.exits.length === 0 ? (
                    <span className="b-meta">No exits</span>
                  ) : (
                    <>
                      <span className="b-meta">Leads to</span>
                      {n.exits.map((x) => {
                        const to = game.nodes.find((m) => m.key === x.key);
                        return to ? (
                          <button key={x.id} type="button" className="b-chip" onClick={() => onJump(to.id)}>
                            {to.name}
                          </button>
                        ) : (
                          <button key={x.id} type="button" className="b-chip bad" onClick={() => onJump(x.id)} aria-label={`Missing node ${x.target || 'empty'}. Go to this line.`}>
                            {x.target || '(empty)'} ✕
                          </button>
                        );
                      })}
                    </>
                  )}
                  {n.items.some((it) => it.kind === 'goto' && it.key === 'END') && <span className="b-chip end">END</span>}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <section aria-label="Checks">
        <h3 className="b-h">{game.issues.length ? `${fix.length ? `${fix.length} to fix` : ''}${fix.length && consider.length ? ', ' : ''}${consider.length ? `${consider.length} to consider` : ''}` : 'No problems found'}</h3>
        {game.issues.length === 0 && game.nodes.length > 0 && <p className="hint">Every jump lands, every node can be reached, every flag that is checked is set somewhere.</p>}
        <ul className="b-issues">
          {[...fix, ...consider].map((i) => (
            <li key={i.key} className={i.level}>
              <span>{i.text}</span>
              {i.id && (
                <button type="button" className="btn btn-quiet" onClick={() => onJump(i.id)}>
                  Show
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Line IDs">
        <h3 className="b-h">Recording line IDs</h3>
        <p className="hint">
          {locked} locked, {unlocked} not yet. Until you lock them, IDs follow script order and shift when lines move. Lock them before the first recording session, and recorded files keep their names whatever you rewrite.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn" disabled={unlocked === 0} onClick={() => store.lockLineIds()}>
            Lock {unlocked || 'all'} line ID{unlocked === 1 ? '' : 's'}
          </button>
          <button type="button" className="btn btn-quiet" disabled={locked === 0} onClick={() => store.unlockLineIds()}>
            Unlock all
          </button>
        </div>
      </section>
    </div>
  );
}
