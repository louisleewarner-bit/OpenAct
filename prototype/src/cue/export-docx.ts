import { strToU8, zipSync } from 'fflate';
import { FONT_DATA } from './fonts';
import { wrapText } from './wrap';
import { layout, type Frag } from './layout';
import type { ElType, Script } from './model';
import { labelOf, PAPERS, profileOf, styleOf, type ElStyle, type Profile } from './profiles';

/**
 * Word export (D-042). A real .docx with one named paragraph style per element ("OpenAct Dialogue" and so on),
 * so a director can keep editing in Word and restyle every speech at once. The page size, margins, 12-point
 * Courier Prime on an exact 12-point line, page numbers from the second script page, and a title page match
 * the page view. Courier Prime (SIL OFL 1.1) is embedded, so the file looks right on a computer without it.
 *
 * Two modes. Flowing (the default) lets Word paginate, which is best for editing. Fixed pages puts Word's page
 * breaks exactly where the PDF's are, with (MORE) and (CONT'D) where a speech is split, and keeps each
 * paragraph's blank lines as the page view has them; best for sending as it is, but a break stays put if the
 * text is edited.
 */
const TW = 1440; // twips per inch
const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const W_NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const FONT = '<w:rFonts w:ascii="Courier Prime" w:hAnsi="Courier Prime" w:cs="Courier Prime" w:eastAsia="Courier Prime"/>';

const styleId = (t: string) => `OpenAct${t[0].toUpperCase()}${t.slice(1)}`;
const bytes = (dataUrl: string): Uint8Array => {
  const b = atob(decodeURIComponent(dataUrl.slice(dataUrl.indexOf(',') + 1)));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
};

/** A font made unreadable to other programs in the way Word expects (ECMA-376 part 2, "obfuscated fonts"): the first 32 bytes XORed with the GUID. */
function obfuscate(font: Uint8Array, guid: string): Uint8Array {
  const hex = guid.replace(/[{}-]/g, '');
  const key: number[] = [];
  for (let i = hex.length - 2; i >= 0; i -= 2) key.push(parseInt(hex.slice(i, i + 2), 16));
  const out = font.slice();
  for (let i = 0; i < 32 && i < out.length; i++) out[i] ^= key[i % 16];
  return out;
}
const newGuid = () => `{${crypto.randomUUID().toUpperCase()}}`;

function rPr(s: { upper?: boolean; bold?: boolean; italic?: boolean; underline?: boolean }) {
  return `${s.upper ? '<w:caps/>' : ''}${s.bold ? '<w:b/>' : ''}${s.italic ? '<w:i/>' : ''}${s.underline ? '<w:u w:val="single"/>' : ''}`;
}
/** Run properties stated both ways, so a run doesn't inherit its paragraph style's italics or capitals. */
const rPrExact = (s: { upper?: boolean; bold?: boolean; italic?: boolean; underline?: boolean }) =>
  `<w:caps w:val="${s.upper ? 1 : 0}"/><w:b w:val="${s.bold ? 1 : 0}"/><w:i w:val="${s.italic ? 1 : 0}"/><w:u w:val="${s.underline ? 'single' : 'none'}"/>`;

function paraStyle(id: string, name: string, s: ElStyle, prof: Profile, pageW: number, keepNext: boolean) {
  const ml = Math.max(0, s.left - prof.marginLeft);
  const aligned = s.align === 'center' || s.align === 'right';
  // Half a character of slack, so a line that exactly fills the width is never wrapped early by rounding.
  // A negative right indent lets text run into the margin, as the page view does when a style is wider than the page.
  const rightIn = aligned ? 0 : pageW - prof.marginRight - (s.left + s.width / 10) - 0.05;
  const line = (s.lineSpacing ?? 1) * 240;
  return (
    `<w:style w:type="paragraph" w:customStyle="1" w:styleId="${id}"><w:name w:val="${xml(name)}"/><w:basedOn w:val="Normal"/><w:qFormat/>` +
    `<w:pPr>${keepNext ? '<w:keepNext/>' : ''}${s.pageBreakBefore ? '<w:pageBreakBefore/>' : ''}<w:spacing w:before="${s.before * 240}" w:after="0" w:line="${line}" w:lineRule="exact"/>` +
    `<w:ind w:left="${Math.round(ml * TW)}" w:right="${Math.round(rightIn * TW)}"/>${aligned ? `<w:jc w:val="${s.align}"/>` : ''}</w:pPr>` +
    `<w:rPr>${rPr(s)}</w:rPr></w:style>`
  );
}

const run = (text: string, extra = '') => {
  const parts = text.split('\n');
  return parts.map((p, i) => `${i ? '<w:r><w:br/></w:r>' : ''}<w:r>${extra ? `<w:rPr>${extra}</w:rPr>` : ''}<w:t xml:space="preserve">${xml(p)}</w:t></w:r>`).join('');
};

export interface DocxOptions {
  anonymous: boolean;
  /** Put Word's page breaks where the PDF's are. */
  fixedPages?: boolean;
}

export function scriptToDocx(script: Script, opts: DocxOptions): Blob {
  const prof = profileOf(script.profile);
  const paper = PAPERS[script.paper];
  const lay = layout(script, { paged: true });
  const t = script.title;
  const fixed = !!opts.fixedPages;

  // Styles: one per element the format has, plus the printed extras.
  const types = Array.from(new Set<ElType>([...prof.types, ...lay.pages.flatMap((p) => p.frags.map((f) => f.type))]));
  const keep = new Set<ElType>(['scene', 'act', 'character', 'paren', 'song', 'page', 'panel']);
  const action = styleOf(prof, 'action')!;
  const styles = [
    `<w:docDefaults><w:rPrDefault><w:rPr>${FONT}<w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="en-GB"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="exact"/></w:pPr></w:pPrDefault></w:docDefaults>`,
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>',
    ...types.map((ty) => paraStyle(styleId(ty), `OpenAct ${labelOf(prof, ty)}`, styleOf(prof, ty)!, prof, paper.width, keep.has(ty))),
    paraStyle('OpenActHeadingLine', 'OpenAct Printed heading', { left: prof.marginLeft, width: 60, before: 0, align: 'center', underline: true, upper: true }, prof, paper.width, true),
    paraStyle('OpenActCastLine', 'OpenAct Printed cast line', { ...action, before: 0 }, prof, paper.width, false),
    paraStyle('OpenActTitle', 'OpenAct Title page', { left: prof.marginLeft, width: 60, before: 0, align: 'center' }, prof, paper.width, false),
    paraStyle('OpenActTitleFoot', 'OpenAct Title page contact', { left: prof.marginLeft, width: 60, before: 0 }, prof, paper.width, false),
    '<w:style w:type="paragraph" w:styleId="Header"><w:name w:val="header"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="right"/></w:pPr></w:style>',
  ].join('');

  // ---------- body ----------
  const body: string[] = [];
  const hasTitle = !!t.title.trim();
  if (hasTitle) {
    // The title block starts 2.2 inches below the top margin, as in the PDF; the contact lines sit at the foot of the
    // page with the date on the right, using a right tab so they stay on the same line.
    const titleLines = t.title.toUpperCase().split('\n');
    titleLines.forEach((l, i) => body.push(`<w:p><w:pPr><w:pStyle w:val="OpenActTitle"/>${i === 0 ? `<w:spacing w:before="${Math.round(2.2 * TW)}"/>` : ''}</w:pPr>${run(l, '<w:u w:val="single"/>')}</w:p>`));
    const rest = [t.credit, t.authors, '', t.source].filter((x, i, a) => x || (i > 0 && a[i - 1]));
    const restLines = rest.flatMap((l) => (l || '').split('\n'));
    body.push('<w:p><w:pPr><w:pStyle w:val="OpenActTitle"/></w:pPr></w:p>');
    for (const l of restLines) body.push(`<w:p><w:pPr><w:pStyle w:val="OpenActTitle"/></w:pPr>${run(l)}</w:p>`);
    const contact = t.contact ? t.contact.split('\n') : [];
    const date = t.draftDate ? t.draftDate.split('\n') : [];
    const rows = Math.max(contact.length, date.length);
    if (rows) {
      const used = 2.2 + (titleLines.length + 1 + restLines.length) / 6;
      const gap = Math.max(0, paper.height - 2 - used - rows / 6);
      const textW = Math.round((paper.width - prof.marginLeft - prof.marginRight) * TW);
      for (let i = 0; i < rows; i++)
        body.push(`<w:p><w:pPr><w:pStyle w:val="OpenActTitleFoot"/><w:tabs><w:tab w:val="right" w:pos="${textW}"/></w:tabs>${i === 0 ? `<w:spacing w:before="${Math.round(gap * TW)}"/>` : ''}</w:pPr>${run(contact[i] ?? '')}<w:r><w:tab/></w:r>${run(date[i] ?? '')}</w:p>`);
    }
    // The title page is its own section, without a page number.
    body.push(`<w:p><w:pPr><w:sectPr><w:pgSz w:w="${Math.round(paper.width * TW)}" w:h="${Math.round(paper.height * TW)}"/><w:pgMar w:top="${TW}" w:right="${Math.round(prof.marginRight * TW)}" w:bottom="${TW}" w:left="${Math.round(prof.marginLeft * TW)}" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:pPr></w:p>`);
  }

  // Fixed pages: every line is written as the PDF breaks it, with a line break between lines (and a blank line between
  // them for double spacing), so Word cannot wrap, space or paginate differently.
  let breakNext = false;
  const para = (style: string, content: string, o: { before?: number; hang?: string; dbl?: boolean } = {}) => {
    let ppr = `<w:pStyle w:val="${style}"/>`;
    // The layout has placed every break, so a style's own "keep with next" and "new page" rules are switched off here.
    if (fixed) ppr += '<w:keepNext w:val="0"/>';
    if (breakNext) {
      ppr += '<w:pageBreakBefore/>';
      breakNext = false;
    } else if (fixed) ppr += '<w:pageBreakBefore w:val="0"/>';
    // A double-spaced paragraph is written as single lines with blank lines between, so its own line spacing is single.
    if (fixed && (o.before !== undefined || o.dbl)) ppr += `<w:spacing${o.before !== undefined ? ` w:before="${o.before * 240}"` : ''}${o.dbl ? ' w:line="240" w:lineRule="exact"' : ''}/>`;
    if (o.hang) ppr += o.hang;
    body.push(`<w:p><w:pPr>${ppr}</w:pPr>${content}</w:p>`);
  };
  /** The lines of a text as the PDF wraps them, joined by line breaks. `lead` is run content placed on the first line. */
  const lines = (text: string, width: number, dbl: boolean, lead = '', extra = '') => {
    const ls = wrapText(text, width);
    const br = dbl ? '<w:r><w:br/></w:r><w:r><w:br/></w:r>' : '<w:r><w:br/></w:r>';
    return ls.map((l, k) => (k === 0 ? lead : '') + run(l, extra)).join(br);
  };

  const cueStyle = styleOf(prof, 'character')!;
  const elOf = (id: string) => script.elements.find((e) => e.id === id);
  const textOf = (f: Frag) => {
    const el = elOf(f.id);
    return el ? (f.prefix ?? '') + el.text.slice(f.start, f.end) + (f.suffix ?? '') : '';
  };

  if (fixed) {
    lay.pages.forEach((pg, pi) => {
      const fs = pg.frags;
      breakNext = pi > 0;
      for (let i = 0; i < fs.length; i++) {
        const f = fs[i];
        const el = elOf(f.id);
        if (!el) continue;
        const s = styleOf(prof, f.type)!;
        const dbl = (s.lineSpacing ?? 1) > 1;
        if (f.contCue) para(styleId('character'), run(f.contCue), { before: 0 });
        let before = f.before;
        f.decoBefore?.forEach((dc, k) => {
          para(dc.kind === 'heading' ? 'OpenActHeadingLine' : 'OpenActCastLine', run(dc.text), { before: k === 0 ? f.before : 0 });
          before = 0;
        });
        const next = fs[i + 1];
        if (f.hang && next && next.type !== 'character' && !next.contCue && !next.decoBefore?.length) {
          // Speaker beside the speech (UK stage and radio layouts): one paragraph with a hanging indent and a tab.
          const ns = styleOf(prof, next.type)!;
          const ind = `<w:ind w:left="${Math.round((ns.left - prof.marginLeft) * TW)}" w:hanging="${Math.round((ns.left - cueStyle.left) * TW)}"/>`;
          const lead = run(textOf(f), rPrExact(s)) + '<w:r><w:tab/></w:r>';
          para(styleId(next.type), lines(textOf(next), ns.width, (ns.lineSpacing ?? 1) > 1, lead), { before: before + next.before, hang: ind, dbl: (ns.lineSpacing ?? 1) > 1 });
          next.decoAfter?.forEach((dc) => para(dc.kind === 'heading' ? 'OpenActHeadingLine' : 'OpenActCastLine', run(dc.text), { before: 0 }));
          if (next.more) para(styleId('character'), run('(MORE)'), { before: 0 });
          i++;
          continue;
        }
        const width = f.hang ? Math.round(((styleOf(prof, 'dialogue')?.left ?? s.left + 1.6) - s.left) * 10) : s.width;
        const aligned = s.align === 'center' || s.align === 'right';
        para(styleId(f.type), aligned ? run(textOf(f)) : lines(textOf(f), width, dbl), { before, dbl: dbl && !aligned });
        f.decoAfter?.forEach((dc) => para(dc.kind === 'heading' ? 'OpenActHeadingLine' : 'OpenActCastLine', run(dc.text), { before: 0 }));
        if (f.more) para(styleId('character'), run('(MORE)'), { before: 0 });
      }
    });
  } else {
    const frags: Frag[] = lay.pages.flatMap((p) => p.frags);
    for (let i = 0; i < frags.length; i++) {
      const f = frags[i];
      if (f.start > 0) continue; // the rest of an element split across a page: written whole with the first part
      const el = elOf(f.id);
      if (!el) continue;
      const last = [...frags].reverse().find((x) => x.id === f.id)!;
      f.decoBefore?.forEach((d) => para(d.kind === 'heading' ? 'OpenActHeadingLine' : 'OpenActCastLine', run(d.text)));
      const whole = (x: Frag) => (x.prefix ?? '') + (elOf(x.id)?.text ?? '') + (([...frags].reverse().find((y) => y.id === x.id) ?? x).suffix ?? '');
      const next = frags[i + 1];
      if (f.hang && next && next.start === 0 && next.type !== 'character') {
        const s = styleOf(prof, f.type)!;
        const ns = styleOf(prof, next.type)!;
        const ind = `<w:spacing w:before="${(s.before + ns.before) * 240}"/><w:ind w:left="${Math.round((ns.left - prof.marginLeft) * TW)}" w:hanging="${Math.round((ns.left - cueStyle.left) * TW)}"/>`;
        para(styleId(next.type), run(whole(f), rPrExact(s)) + '<w:r><w:tab/></w:r>' + run(whole(next)), { hang: ind });
        next.decoAfter?.forEach((d) => para(d.kind === 'heading' ? 'OpenActHeadingLine' : 'OpenActCastLine', run(d.text)));
        i++;
        continue;
      }
      para(styleId(f.type), run(whole(f)));
      last.decoAfter?.forEach((d) => para(d.kind === 'heading' ? 'OpenActHeadingLine' : 'OpenActCastLine', run(d.text)));
    }
  }

  const sect =
    `<w:sectPr><w:headerReference w:type="default" r:id="rIdHeader"/><w:titlePg/><w:pgNumType w:start="1"/>` +
    `<w:pgSz w:w="${Math.round(paper.width * TW)}" w:h="${Math.round(paper.height * TW)}"/>` +
    `<w:pgMar w:top="${TW}" w:right="${Math.round(prof.marginRight * TW)}" w:bottom="${TW}" w:left="${Math.round(prof.marginLeft * TW)}" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>`;
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${W_NS}><w:body>${body.join('')}${sect}</w:body></w:document>`;
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ${W_NS}>${styles}</w:styles>`;
  const headerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr ${W_NS}><w:p><w:pPr><w:pStyle w:val="Header"/></w:pPr><w:fldSimple w:instr="PAGE"><w:r><w:t>2</w:t></w:r></w:fldSimple>${prof.stage ? '' : '<w:r><w:t>.</w:t></w:r>'}</w:p></w:hdr>`;
  const settingsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings ${W_NS}><w:embedTrueTypeFonts/><w:saveSubsetFonts w:val="0"/><w:defaultTabStop w:val="720"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`;

  // Embedded fonts.
  const faces: [string, string, Uint8Array][] = [
    ['Regular', 'rIdF1', bytes(FONT_DATA.regular)],
    ['Bold', 'rIdF2', bytes(FONT_DATA.bold)],
    ['Italic', 'rIdF3', bytes(FONT_DATA.italic)],
    ['BoldItalic', 'rIdF4', bytes(FONT_DATA.boldItalic)],
  ];
  const keys = faces.map(() => newGuid());
  const fontTable =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:fonts ${W_NS}><w:font w:name="Courier Prime"><w:altName w:val="Courier New"/><w:charset w:val="00"/><w:family w:val="modern"/><w:pitch w:val="fixed"/>` +
    faces.map(([n, rid], i) => `<w:embed${n} r:id="${rid}" w:fontKey="${keys[i]}"/>`).join('') +
    '</w:font><w:font w:name="Courier New"><w:family w:val="modern"/><w:pitch w:val="fixed"/></w:font></w:fonts>';
  const fontRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    faces.map(([, rid], i) => `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="fonts/font${i + 1}.odttf"/>`).join('') +
    '</Relationships>';

  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const author = opts.anonymous ? '' : t.authors.replace(/\s+/g, ' ').trim();
  const coreXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
    `<dc:title>${xml(t.title.trim() || 'Untitled')}</dc:title>${author ? `<dc:creator>${xml(author)}</dc:creator>` : ''}` +
    `<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
  const appXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>OpenAct</Application></Properties>';
  const contentTypes =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
    '<Default Extension="odttf" ContentType="application/vnd.openxmlformats-officedocument.obfuscatedFont"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
    '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>' +
    '<Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>' +
    '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>' +
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>';
  const rels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>';
  const docRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '<Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>' +
    '<Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>' +
    '<Relationship Id="rIdFonts" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/></Relationships>';
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(contentTypes),
    '_rels/.rels': strToU8(rels),
    'docProps/core.xml': strToU8(coreXml),
    'docProps/app.xml': strToU8(appXml),
    'word/document.xml': strToU8(documentXml),
    'word/styles.xml': strToU8(stylesXml),
    'word/settings.xml': strToU8(settingsXml),
    'word/header1.xml': strToU8(headerXml),
    'word/fontTable.xml': strToU8(fontTable),
    'word/_rels/document.xml.rels': strToU8(docRels),
    'word/_rels/fontTable.xml.rels': strToU8(fontRels),
  };
  faces.forEach(([, , data], i) => (files[`word/fonts/font${i + 1}.odttf`] = obfuscate(data, keys[i])));
  const zip = zipSync(files, { level: 6 });
  return new Blob([zip as Uint8Array<ArrayBuffer>], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}
