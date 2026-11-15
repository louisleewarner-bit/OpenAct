"""Reads what export-edge.cjs saved and checks the edge cases (D-042). Usage: python3 prototype/checks/export-edge.py <dir with edge/edge.json>"""
import json, re, sys, zipfile, xml.etree.ElementTree as ET
import pymupdf, docx
d = sys.argv[1] + '/edge'
e = json.load(open(f'{d}/edge.json')); r = e['res']; problems = []; info = {}
norm = lambda s: re.sub(r'\s+', ' ', s).strip()

# blank script
for f, x in r['blank'].items():
    if not x['status'].startswith('Saved'): problems.append(f'blank {f}: {x["status"][:80]}')
bp = pymupdf.open(r['blank']['pdf']['file']); info['blank pdf pages'] = len(bp)
if len(bp) < 1: problems.append('blank PDF has no pages')
docx.Document(r['blank']['docx']['file'])

# long speech
words = r['longWords']; info['long: pages on screen'] = r['longPages']
lp = pymupdf.open(r['long']['pdf']['file']); text = ' '.join(norm(p.get_text()) for p in lp)
# PDF: every word in order (ignoring the page number lines and (MORE)/(CONT'D) lines)
body = re.sub(r'\(MORE\)|\(CONT\'D\)|\b\d+\.\s', ' ', text)
got = re.findall(r'[A-Za-z]+', body); want = ['rain', 'hammers', 'the', 'shuttered', 'shops', 'and', 'Nell', 'counts', 'socks', 'again'] * 300
count = sum(1 for w in got if w.lower() in set(x.lower() for x in want[:10]))
if len(lp) != r['longPages'] + 1: problems.append(f'long PDF pages {len(lp)} vs screen {r["longPages"]} + title')
info['long: pdf pages'] = len(lp); info['long: words in pdf'] = count
if count < words * 0.99: problems.append(f'long PDF has {count} of {words} words')
for k in ('docxFlow', 'docxFixed'):
    dd = docx.Document(r['long'][k]['file']); t = ' '.join(p.text for p in dd.paragraphs); c = len(re.findall(r'\b(?:rain|hammers|shuttered|shops|Nell|counts|socks|again)\b', t)) + len(re.findall(r'\bthe\b|\band\b', t))
    info[f'long: {k} words'] = c
    if c < words * 0.99: problems.append(f'long {k} has {c} of {words} words')
info['long: export ms (pdf, flow, fixed)'] = [r['long'][k]['ms'] for k in ('pdf', 'docxFlow', 'docxFixed')]
if max(r['long'][k]['ms'] for k in ('pdf', 'docxFlow', 'docxFixed')) > 8000: problems.append('a long export took over 8 seconds')

# the same without any full stops
npdf = pymupdf.open(r['noStops']['pdf']['file']); nt = ' '.join(norm(p.get_text()) for p in npdf)
nc = len(re.findall(r'\b(?:rain|hammers|the|shuttered|shops|and|Nell|counts|socks|again)\b', re.sub(r"\(MORE\)|\(CONT'D\)", ' ', nt)))
info['no full stops: screen pages'] = r['noStopsPages']; info['no full stops: pdf pages'] = len(npdf); info['no full stops: words in pdf'] = nc
if nc < words * 0.99: problems.append(f'no-stops PDF has {nc} of {words} words')
nd = docx.Document(r['noStops']['docx']['file']); ndt = ' '.join(p.text for p in nd.paragraphs)
if len(re.findall(r'\b(?:rain|hammers|the|shuttered|shops|and|Nell|counts|socks|again)\b', ndt)) < words * 0.99: problems.append('no-stops fixed Word lost words')

# unicode
up = r['uni']['pdf']; info['unicode pdf status'] = up['status'][:200]; info['unicode pdf tone'] = up['tone']
if "warn" not in up['tone'] or 'Heads up' not in up['status']: problems.append('no warning for characters the font lacks')
for ch in '♪→😀Привет': pass
ud = docx.Document(r['uni']['docx']['file']); ut = ' '.join(p.text for p in ud.paragraphs)
for ch in ['Zoë', 'Łódź', '♪', 'Привет', '→', '—', '…']:
    if ch not in ut: problems.append(f'unicode: {ch!r} missing from the Word file')
upd = pymupdf.open(up['file']); upt = ' '.join(p.get_text() for p in upd)
for ch in ['Zoë', 'Łódź', '“quoted”', '—', '…']:
    if ch not in upt: problems.append(f'unicode: {ch!r} missing from the PDF')

# imported format: scene heading left 1.25 in (the format's scene style), A4
cp = pymupdf.open(r['custom']['pdf']['file']); pg = cp[len(cp) - 1 if len(cp) < 2 else 1]
sc = [l for b in pg.get_text('dict')['blocks'] for l in b.get('lines', []) if ''.join(s['text'] for s in l['spans']).startswith('INT. ')]
info['custom: scene heading left (in)'] = round(sc[0]['bbox'][0] / 72, 2) if sc else None; info['custom: page width'] = round(cp[0].rect.width, 1)
if not sc or abs(sc[0]['bbox'][0] / 72 - 1.25) > 0.03: problems.append('imported format layout not used in the PDF')

# anonymous Final Draft
named = open(r['fdx']['named']['file'], encoding='utf-8').read(); anon = open(r['fdx']['anon']['file'], encoding='utf-8').read()
ET.fromstring(anon)
info['fdx: named has author'] = 'Sam Writer' in named; info['fdx: anon has author/contact'] = 'Sam Writer' in anon or 'sam@example' in anon
if 'Sam Writer' not in named: problems.append('named FDX lacks the author')
if 'Sam Writer' in anon or 'sam@example' in anon: problems.append('anonymous FDX leaks the author')

# hosted preview
h = r['hosted']; names = e['res']['hostedNames']; info['hosted file names'] = names
if names != ['Last Wash.pdf', 'Last Wash.docx', 'Last Wash.fountain.txt', 'Last Wash.fdx.zip']: problems.append(f'hosted names {names}')
z = zipfile.ZipFile(f'{d}/hosted-saved-Last Wash.fdx.zip'); inner = z.namelist(); info['hosted fdx zip holds'] = inner
if inner != ['Last Wash.fdx']: problems.append(f'fdx zip holds {inner}')
else: ET.fromstring(z.read('Last Wash.fdx'))
pymupdf.open(f'{d}/hosted-saved-Last Wash.pdf'); docx.Document(f'{d}/hosted-saved-Last Wash.docx')
for k in ('pdf', 'docx', 'fountain', 'fdx'):
    if not h[k]['status'].startswith('Saved'): problems.append(f'hosted {k}: {h[k]["status"][:80]}')
info['hosted: fdx message'] = h['fdx']['status'][:120]; info['hosted: declined'] = h['declined']['status']; info['hosted: blocked'] = h['blocked']['status'][:80]
if h['declined']['status'] != 'Not saved.': problems.append('declined message wrong')
if 'couldn’t save' not in h['blocked']['status']: problems.append('blocked message missing')
print(json.dumps({'info': info, 'problems': problems}, indent=1, ensure_ascii=False))
