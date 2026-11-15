"""Reads the files export-check.cjs saved and compares them with the page view (D-042).
Usage: python3 prototype/checks/export-verify.py <dir with expected.json>"""
import json, re, sys, zipfile, xml.etree.ElementTree as ET
import pymupdf, docx

d = sys.argv[1]
exp = json.load(open(f'{d}/expected.json'))
norm = lambda s: re.sub(r'\s+', ' ', s).strip().lower()
report, problems = {}, []

def pdf_check(name, f, view):
    doc = pymupdf.open(f)
    want = len(view['pages']) + (1 if view['title'] else 0)
    fonts = {ft[3] for pg in doc for ft in pg.get_fonts()}
    off = 1 if view['title'] else 0
    missing = []
    for k, frags in enumerate(view['pages']):
        if k + off >= len(doc):
            break
        text = norm(doc[k + off].get_text())
        for t in frags:
            if norm(t) not in text:
                missing.append((k + 1, t[:50]))
    # Positions: each line's left edge and top, against where the page view puts it (inches).
    drift = []
    for k, geom in enumerate(view.get('geom', [])):
        if k + off >= len(doc): break
        lines = []
        for blk in doc[k + off].get_text('dict')['blocks']:
            for ln in blk.get('lines', []):
                txt = ''.join(sp['text'] for sp in ln['spans'])
                if txt.strip(): lines.append((norm(txt), ln['bbox'][0] / 72, ln['bbox'][1] / 72))
        pairs = []
        lines.sort(key=lambda l: (round(l[2], 2), l[1]))
        ptr = 0
        for g in sorted(geom, key=lambda g: (round(g['y'], 2), g['x'])):
            key = norm(g['text'])[:10]
            if len(key) < 3: continue
            ok = (lambda l: l == norm(g['text'])) if g.get('full') else (lambda l: l.startswith(key))
            j = next((q for q in range(ptr, len(lines)) if ok(lines[q][0])), None)
            if j is None: continue
            ptr = j + 1
            pairs.append((lines[j][1] - g['x'], lines[j][2] - g['y'], g['text']))
        if pairs:
            mx = sorted(p[0] for p in pairs)[len(pairs) // 2]; my = sorted(p[1] for p in pairs)[len(pairs) // 2]
            for dx, dy, tx in pairs:
                if abs(dx - mx) > 0.04 or abs(dy - my) > 0.04: drift.append((k + 1, tx, round(dx - mx, 2), round(dy - my, 2)))
    r = {'drift': drift[:6], 'pages': len(doc), 'want': want, 'fonts': sorted(fonts), 'size': [round(doc[0].rect.width, 1), round(doc[0].rect.height, 1)], 'missing': missing[:5], 'author': doc.metadata.get('author')}
    if len(doc) != want: problems.append(f'{name}: PDF has {len(doc)} pages, page view has {want}')
    if not fonts or not all('CourierPrime' in x for x in fonts): problems.append(f'{name}: fonts {fonts}')
    if missing: problems.append(f'{name}: {len(missing)} page-view lines not found in the PDF, e.g. {missing[:2]}')
    if drift: problems.append(f'{name}: {len(drift)} lines sit more than 0.04 in from where the page view puts them, e.g. {drift[:3]}')
    return r

def docx_check(name, f, view):
    dd = docx.Document(f)
    text = norm(' '.join(p.text for p in dd.paragraphs))
    styles = sorted({p.style.name for p in dd.paragraphs if p.style.name.startswith('OpenAct')})
    allfr = [t for pg in view['pages'] for t in pg]
    missing = [t[:50] for t in allfr if norm(t) not in text and '(cont' not in t.lower() and t != '(MORE)']
    sec = dd.sections[-1]
    r = {'paragraphs': len(dd.paragraphs), 'styles': styles, 'size': [round(sec.page_width.inches, 2), round(sec.page_height.inches, 2)], 'missing': missing[:5], 'author': dd.core_properties.author}
    if missing: problems.append(f'{name}: {len(missing)} lines missing from the Word file, e.g. {missing[:2]}')
    if not styles: problems.append(f'{name}: no OpenAct styles')
    return r

for name, job in exp.items():
    if name == 'anon':
        continue
    r = {}
    for fmt, info in job['files'].items():
        f = info['file']
        if fmt == 'pdf': r['pdf'] = pdf_check(name, f, job['view'])
        elif fmt == 'docx': r['docx'] = docx_check(name, f, job['view'])
        elif fmt == 'fountain':
            t = open(f, encoding='utf-8').read(); r['fountain'] = len(t)
            if len(t) < 10: problems.append(f'{name}: empty Fountain')
        elif fmt == 'fdx':
            root = ET.parse(f).getroot(); r['fdx'] = root.tag
            if root.tag != 'FinalDraft': problems.append(f'{name}: FDX root {root.tag}')
        if not info['status'].startswith('Saved'): problems.append(f'{name} {fmt}: status {info["status"][:60]}')
    report[name] = r

a = exp['anon']['files']
named = pymupdf.open(a['pdfNamed']['file']); anon = pymupdf.open(a['pdfAnon']['file'])
named_text = ' '.join(p.get_text() for p in named); anon_text = ' '.join(p.get_text() for p in anon)
dx = docx.Document(a['docxAnon']['file']); dx_text = ' '.join(p.text for p in dx.paragraphs)
with zipfile.ZipFile(a['docxAnon']['file']) as z: core = z.read('docProps/core.xml').decode()
fountain = open(a['fountainAnon']['file'], encoding='utf-8').read()
anon_r = {
    'named: author in metadata': named.metadata.get('author'), 'named: name on title page': 'Sam Writer' in named_text, 'named: A4': round(named[0].rect.width, 1),
    'anon: author in metadata': anon.metadata.get('author'), 'anon: name anywhere': 'Sam Writer' in anon_text or 'sam@example' in anon_text, 'anon: Letter': round(anon[0].rect.width, 1),
    'anon docx: creator': 'creator' in core, 'anon docx: name anywhere': 'Sam Writer' in dx_text or 'Sam Writer' in core,
    'anon fountain: name anywhere': 'Sam Writer' in fountain or 'sam@example' in fountain,
}
if anon_r['named: author in metadata'] != 'Sam Writer' or not anon_r['named: name on title page']: problems.append('named PDF lacks the author')
if anon_r['anon: author in metadata'] or anon_r['anon: name anywhere'] or anon_r['anon docx: creator'] or anon_r['anon docx: name anywhere'] or anon_r['anon fountain: name anywhere']: problems.append(f'anonymous copy leaks: {anon_r}')
if abs(anon_r['named: A4'] - 595.3) > 0.2 or anon_r['anon: Letter'] != 612.0: problems.append(f'paper sizes {anon_r}')
print(json.dumps({'report': report, 'anon': anon_r, 'problems': problems}, indent=1))
