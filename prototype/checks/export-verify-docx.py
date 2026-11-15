"""Fixed-page Word files against the PDF, page for page (D-042). LibreOffice converts each Word file to PDF; both PDFs are read
and compared: page count, the first line of every page, and the position of every line (inches). Needs LibreOffice (soffice).
Usage: python3 prototype/checks/export-verify-docx.py <dir with expected.json>"""
import json, os, re, subprocess, sys, tempfile, pymupdf

d = sys.argv[1]
exp = json.load(open(f'{d}/expected.json'))
norm = lambda s: re.sub(r'\s+', ' ', s).strip().lower()
tmp = tempfile.mkdtemp()
files = [(n, j['files']['docxFixed']['file'], j['files']['pdf']['file'], j['view']['title']) for n, j in exp.items() if 'docxFixed' in j.get('files', {})]
subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', tmp] + [f[1] for f in files], capture_output=True, timeout=900)

def lines(doc, pg):
    out = []
    for b in doc[pg].get_text('dict')['blocks']:
        for l in b.get('lines', []):
            t = ''.join(s['text'] for s in l['spans'])
            if t.strip() and not re.fullmatch(r'\d+\.?', t.strip()): out.append((norm(t), l['bbox'][0] / 72, l['bbox'][1] / 72))
    return sorted(out, key=lambda x: (round(x[2], 2), x[1]))

problems, rows = [], []
for name, docx_f, pdf_f, title in files:
    w = pymupdf.open(os.path.join(tmp, os.path.basename(docx_f).rsplit('.', 1)[0] + '.pdf')); p = pymupdf.open(pdf_f)
    row = {'name': name, 'pdf': len(p), 'word': len(w)}
    if len(w) != len(p): problems.append(f'{name}: Word has {len(w)} pages, PDF has {len(p)}')
    worst = 0; firsts = []
    for k in range(min(len(w), len(p))):
        a, b = lines(p, k), lines(w, k)
        if k == 0 and title: pass
        if not a: continue
        if k >= (1 if title else 0) and b and a[0][0][:12] != b[0][0][:12]: firsts.append((k + 1, a[0][0][:20], b[0][0][:20]))
        ptr = 0
        for t, x, y in a:
            j = next((q for q in range(ptr, len(b)) if b[q][0][:10] == t[:10]), None)
            if j is None: continue
            ptr = j + 1
            worst = max(worst, abs(b[j][2] - y), abs(b[j][1] - x))
    row['worst_in'] = round(worst, 2); rows.append(row)
    if firsts: problems.append(f'{name}: different first line on page(s) {firsts[:3]}')
    if worst > 0.06: problems.append(f'{name}: Word lines are up to {worst:.2f} in from the PDF')
print(json.dumps({'rows': rows, 'problems': problems}, indent=1))
