// The UMD build: bundling jsPDF's ES build drops its TrueType plugin, which leaves the font unembedded.
import { jsPDF } from 'jspdf/dist/jspdf.umd.min.js';
import { FONT_DATA } from './fonts';
import { wrapText } from './wrap';
import { layout, type Frag } from './layout';
import type { Script } from './model';
import { PAPERS, profileOf, styleOf, type ElStyle } from './profiles';

/**
 * PDF export (D-042). Each page is drawn from the same layout the page view uses, so page breaks, (MORE),
 * (CONT'D), numbering and the title page match the screen. Courier Prime (SIL OFL 1.1) is embedded.
 * Courier is a grid: 10 characters an inch across, 6 lines an inch down.
 */
const IN = 72;
const LH = 12; // one line, 1/6 inch, in points
const CH = 7.2; // one character, 1/10 inch, in points
const BASE = 9.5; // from the top of a line to its baseline, in points

// Parcel percent-encodes data URLs ("=" becomes "%3D"), which atob rejects, so decode that first.
const b64 = (dataUrl: string) => decodeURIComponent(dataUrl.slice(dataUrl.indexOf(',') + 1));

const fontStyle = (s: { bold?: boolean; italic?: boolean }) => (s.bold && s.italic ? 'bolditalic' : s.bold ? 'bold' : s.italic ? 'italic' : 'normal');

export interface PdfOptions {
  anonymous: boolean;
}

export function scriptToPdf(script: Script, opts: PdfOptions): Blob {
  const prof = profileOf(script.profile);
  const paper = PAPERS[script.paper];
  const lay = layout(script, { paged: true });
  const W = paper.width * IN;
  const H = paper.height * IN;
  const doc = new jsPDF({ unit: 'pt', format: [W, H], compress: true, putOnlyUsedFonts: true });
  doc.addFileToVFS('CourierPrime-Regular.ttf', b64(FONT_DATA.regular));
  doc.addFileToVFS('CourierPrime-Bold.ttf', b64(FONT_DATA.bold));
  doc.addFileToVFS('CourierPrime-Italic.ttf', b64(FONT_DATA.italic));
  doc.addFileToVFS('CourierPrime-BoldItalic.ttf', b64(FONT_DATA.boldItalic));
  doc.addFont('CourierPrime-Regular.ttf', 'CourierPrime', 'normal');
  doc.addFont('CourierPrime-Bold.ttf', 'CourierPrime', 'bold');
  doc.addFont('CourierPrime-Italic.ttf', 'CourierPrime', 'italic');
  doc.addFont('CourierPrime-BoldItalic.ttf', 'CourierPrime', 'bolditalic');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  const t = script.title;
  doc.setProperties({
    title: t.title.trim() || 'Untitled',
    subject: '',
    author: opts.anonymous ? '' : t.authors.replace(/\s+/g, ' ').trim(),
    keywords: '',
    creator: 'OpenAct',
  });
  doc.setCreationDate(new Date());

  const right = W - prof.marginRight * IN;
  const draw = (text: string, x: number, top: number, st: { bold?: boolean; italic?: boolean; underline?: boolean; align?: 'left' | 'center' | 'right' }, areaLeft = x) => {
    if (!text) return;
    doc.setFont('CourierPrime', fontStyle(st));
    const w = text.length * CH;
    let x0 = x;
    if (st.align === 'center') x0 = (areaLeft + right) / 2 - w / 2;
    else if (st.align === 'right') x0 = right - w;
    doc.text(text, x0, top + BASE);
    if (st.underline) doc.line(x0, top + BASE + 1.6, x0 + w, top + BASE + 1.6);
  };

  // ---------- title page ----------
  const hasTitle = !!t.title.trim();
  if (hasTitle) {
    let y = 1 * IN + 2.2 * IN;
    const block = [t.title, '', t.credit, t.authors, '', t.source].filter((x, i, a) => x || (i > 0 && a[i - 1]));
    block.forEach((line, i) => {
      for (const l of (line || '').split('\n')) {
        const text = i === 0 ? l.toUpperCase() : l;
        draw(text, prof.marginLeft * IN, y, { underline: i === 0 && !!text, align: 'center' }, prof.marginLeft * IN);
        y += LH;
      }
    });
    const contact = t.contact ? t.contact.split('\n') : [];
    const date = t.draftDate ? t.draftDate.split('\n') : [];
    const rows = Math.max(contact.length, date.length);
    const bottom = H - 1 * IN;
    for (let i = 0; i < rows; i++) {
      const top = bottom - (rows - i) * LH;
      if (contact[i]) draw(contact[i], prof.marginLeft * IN, top, {});
      if (date[i]) draw(date[i], 0, top, { align: 'right' });
    }
  }

  // ---------- script pages ----------
  const cue = styleOf(prof, 'character')!;
  const action = styleOf(prof, 'action')!;
  lay.pages.forEach((pg, i) => {
    if (i > 0 || hasTitle) doc.addPage([W, H]);
    if (i > 0) draw(prof.stage ? `${i + 1}` : `${i + 1}.`, 0, 0.5 * IN, { align: 'right' });
    let y = 1 * IN;
    let floatBottom = 0;
    let prev: Frag | null = null;
    const decoLine = (text: string, kind: 'heading' | 'cast', before: number) => {
      y = Math.max(y, floatBottom) + before * LH;
      if (kind === 'heading') draw(text, prof.marginLeft * IN, y, { align: 'center', underline: true }, prof.marginLeft * IN);
      else draw(text, action.left * IN, y, {});
      y += LH;
    };
    for (const f of pg.frags) {
      const el = script.elements.find((e) => e.id === f.id);
      if (!el) continue;
      const s: ElStyle = styleOf(prof, f.type)!;
      if (f.contCue) {
        y = Math.max(y, floatBottom);
        draw(f.contCue, cue.left * IN, y, {});
        y += LH;
      }
      let first = f.before;
      f.decoBefore?.forEach((d, k) => {
        decoLine(d.text, d.kind, k === 0 ? f.before : 0);
        first = 0;
      });
      // The frag itself.
      const sp = s.lineSpacing ?? 1;
      const mt = first + (prev?.hang ? prev.before : 0);
      if (!prev?.hang && !f.hang) y = Math.max(y, floatBottom);
      const top = y + mt * LH;
      let text = (f.prefix ?? '') + el.text.slice(f.start, f.end) + (f.suffix ?? '');
      if (s.upper) text = text.toUpperCase();
      const width = f.hang ? Math.round(((prof.styles.dialogue?.left ?? s.left + 1.6) - s.left) * 10) : s.width;
      const lines = wrapText(text, width);
      lines.forEach((l, k) => draw(l, s.left * IN, top + k * sp * LH, s, s.left * IN));
      if (f.cue) draw(String(f.cue), 0.45 * IN, top, {});
      const height = (lines.length * sp - (sp - 1)) * LH;
      if (f.hang) {
        floatBottom = top + height;
      } else {
        y = top + height;
      }
      f.decoAfter?.forEach((d) => decoLine(d.text, d.kind, 0));
      if (f.more) {
        draw('(MORE)', cue.left * IN, y, {});
        y += LH;
      }
      prev = f;
    }
  });
  if (!lay.pages.length && !hasTitle) doc.text('', 0, 0);
  return doc.output('blob');
}

/** Page count of the exported PDF (title page included), for the message after saving. */
export const pdfPageCount = (script: Script) => layout(script, { paged: true }).pages.length + (script.title.title.trim() ? 1 : 0);

