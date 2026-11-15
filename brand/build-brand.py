"""Builds OpenAct's logo files from one source (D-043): SVG marks, lockups with the name drawn as outlines (no font needed),
app icons and favicons (SVG and PNG), and a social card. Usage: python3 brand/build-brand.py [out dir]
The name is set in Courier Prime Bold (SIL OFL 1.1); the mark is a spike mark, the L of tape a stage manager lays on the
floor to mark where something goes. Light comes from the top left everywhere; shade is blue-tinted, never grey or black."""
import pathlib, sys, json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = pathlib.Path(__file__).resolve().parent
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT
FONT = TTFont(ROOT.parent / 'prototype/src/assets/fonts/CourierPrime-Bold.ttf')
UPM = FONT['head'].unitsPerEm; CAP = FONT['OS/2'].sCapHeight; GS = FONT.getGlyphSet(); CMAP = FONT.getBestCmap()

INK = '#1C2433'; ACCENT = '#2D4DA6'; ACCENT_HI = '#5B7BEA'; ACCENT_LO = '#223C86'; PAPER = '#F6F7F9'
DARK_INK = '#E3E6EC'; DARK_ACCENT = '#9DB2FF'; DARK_ACCENT_LO = '#6F88E6'

def text_path(s, size, x, baseline, track=-0.03):
    """The text as one SVG path: Courier is monospaced, so each glyph steps by the advance plus tracking."""
    k = size / UPM; pen_x = x; parts = []
    for ch in s:
        g = CMAP[ord(ch)]; p = SVGPathPen(GS, ntos=lambda v: f'{v:.2f}')
        GS[g].draw(TransformPen(p, (k, 0, 0, -k, pen_x, baseline)))
        parts.append(p.getCommands()); pen_x += (FONT['hmtx'][g][0] + track * UPM) * k
    return ' '.join(parts), pen_x - x - track * size

def mark_shapes(x, y, s, fill, fill2=None, hi=None):
    """The spike mark in a box at (x, y) of side s: two strips of tape, the horizontal laid over the vertical, ends cut at a slant.
    `fill2` is the lower strip's tone (a little deeper, so the overlap reads); in one colour the seam is a hairline gap."""
    u = s / 100; P = lambda *pts: ' '.join(f'{x + a * u:.2f},{y + b * u:.2f}' for a, b in pts)
    vert = P((0, 7), (27, 0), (27, 68), (0, 68))
    horz = P((0, 72), (100, 72), (94, 100), (0, 100))
    a = f'<polygon points="{vert}" fill="{fill2 or fill}"/>'
    b = f'<polygon points="{horz}" fill="{fill}"/>'
    sheen = f'<polygon points="{P((0, 72), (100, 72), (99, 76), (0, 76))}" fill="{hi}" opacity=".55"/>' if hi else ''
    return a + b + sheen

def svg(w, h, body, defs='', title=''):
    t = f'<title>{title}</title>' if title else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img">{t}<defs>{defs}</defs>{body}</svg>\n'

files = {}
# ---- marks ----
for name, fill, fill2 in [('mark', ACCENT, ACCENT_LO), ('mark-ink', INK, INK), ('mark-white', '#FFFFFF', '#FFFFFF'), ('mark-dark', DARK_ACCENT, DARK_ACCENT_LO)]:
    gap = name in ('mark-ink', 'mark-white')
    files[f'{name}.svg'] = svg(100, 100, mark_shapes(0, 0, 100, fill, fill2), title='OpenAct')

# ---- lockups ----
def lockup(mark_fill, mark_fill2, ink, stacked=False, label='OpenAct'):
    size = 100.0; cap = CAP / UPM * size
    if not stacked:
        # The mark stands on the text's baseline and is a touch taller than the capitals, so it reads as the same height.
        m = cap * 1.08; baseline = 100 + cap / 2; ty = baseline
        path, tw = text_path('OpenAct', size, 0, 0)
        gapx = m * 0.30
        W = m + gapx + tw + 4; H = 200
        body = mark_shapes(0, baseline - m, m, mark_fill, mark_fill2) + f'<path transform="translate({m + gapx:.2f},{ty:.2f})" d="{path}" fill="{ink}"/>'
        return svg(round(W), H, body, title=label)
    m = 150; path, tw = text_path('OpenAct', size, 0, 0)
    W = max(tw, m) + 60; H = m + 60 + cap + 70
    body = mark_shapes((W - m) / 2, 30, m, mark_fill, mark_fill2) + f'<path transform="translate({(W - tw) / 2:.2f},{30 + m + 52 + cap:.2f})" d="{path}" fill="{ink}"/>'
    return svg(round(W), round(H), body, title=label)
files['logo.svg'] = lockup(ACCENT, ACCENT_LO, INK)
files['logo-dark.svg'] = lockup(DARK_ACCENT, DARK_ACCENT_LO, DARK_INK)
files['logo-ink.svg'] = lockup(INK, INK, INK)
files['logo-white.svg'] = lockup('#FFFFFF', '#FFFFFF', '#FFFFFF')
files['logo-stacked.svg'] = lockup(ACCENT, ACCENT_LO, INK, stacked=True)
files['logo-stacked-dark.svg'] = lockup(DARK_ACCENT, DARK_ACCENT_LO, DARK_INK, stacked=True)

# ---- app icon (512): an ink tile, a script page, the tape laid across the page's lower-left corner ----
DEFS_ICON = f'''
<linearGradient id="tile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E3A55"/><stop offset=".55" stop-color="#1C2433"/><stop offset="1" stop-color="#121826"/></linearGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".09"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4E9F3"/></linearGradient>
<linearGradient id="tapeH" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{ACCENT_HI}"/><stop offset="1" stop-color="{ACCENT}"/></linearGradient>
<linearGradient id="tapeV" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A68CF"/><stop offset="1" stop-color="{ACCENT_LO}"/></linearGradient>
<filter id="sh1" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="8" dy="12" stdDeviation="14" flood-color="#070B18" flood-opacity=".55"/></filter>
<filter id="sh2" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="4" dy="6" stdDeviation="6" flood-color="#0A1230" flood-opacity=".5"/></filter>'''
def icon_body(scale=1.0, rounded=True):
    r = 112 if rounded else 0
    c = 256; t = f'translate({c},{c}) scale({scale}) translate({-c},{-c})'
    page = f'''<g filter="url(#sh1)"><rect x="150" y="82" width="214" height="290" rx="14" fill="url(#paper)"/></g>
    <rect x="150" y="82" width="214" height="290" rx="14" fill="url(#sheen)"/>
    <g fill="#5A657B"><rect x="186" y="128" width="112" height="13" rx="6"/></g>
    <g fill="#B8C1D2"><rect x="186" y="164" width="140" height="10" rx="5"/><rect x="186" y="186" width="118" height="10" rx="5"/></g>
    <g fill="#5A657B"><rect x="238" y="226" width="54" height="11" rx="5"/></g>
    <g fill="#B8C1D2"><rect x="206" y="248" width="116" height="10" rx="5"/><rect x="206" y="270" width="92" height="10" rx="5"/></g>'''
    m = 190; mx, my = 96, 214; u = m / 100; P = lambda *pts: ' '.join(f'{mx + a * u:.1f},{my + b * u:.1f}' for a, b in pts)
    tape = f'''<g filter="url(#sh2)"><polygon points="{P((0, 7), (27, 0), (27, 68), (0, 68))}" fill="url(#tapeV)"/><polygon points="{P((0, 72), (100, 72), (94, 100), (0, 100))}" fill="url(#tapeH)"/></g>
    <polygon points="{P((0, 72), (100, 72), (99, 76), (0, 76))}" fill="#FFFFFF" opacity=".35"/>'''
    tile = f'<rect width="512" height="512" rx="{r}" fill="url(#tile)"/><rect width="512" height="512" rx="{r}" fill="url(#sheen)"/>'
    if not rounded: tile = '<rect width="512" height="512" fill="url(#tile)"/><rect width="512" height="512" fill="url(#sheen)"/>'
    return tile + f'<g transform="{t}">{page}{tape}</g>'
files['app-icon.svg'] = svg(512, 512, icon_body(), DEFS_ICON, 'OpenAct')
files['app-icon-maskable.svg'] = svg(512, 512, icon_body(0.74, rounded=False), DEFS_ICON, 'OpenAct')
# small sizes: no page, just the tape on the tile (legible at 16 px)
DEFS_SMALL = DEFS_ICON
small = f'<rect width="512" height="512" rx="112" fill="url(#tile)"/>' + f'<g filter="url(#sh2)">{mark_shapes(118, 112, 276, "url(#tapeH)", "url(#tapeV)")}</g>'
files['favicon.svg'] = svg(512, 512, small, DEFS_SMALL, 'OpenAct')

# ---- social card (1200 x 630): the lockup on ink ----
path, tw = text_path('OpenAct', 150, 0, 0); cap = CAP / UPM * 150; m = cap * 1.08
sub1, w1 = text_path('The free script editor', 38, 0, 0, track=0); sub2, w2 = text_path('for stage and screen', 38, 0, 0, track=0)
card = (f'<rect width="1200" height="630" fill="{INK}"/><rect width="1200" height="630" fill="url(#sheen)"/>'
        f'<g transform="translate(110,215)">{mark_shapes(0, cap - m, m, DARK_ACCENT, DARK_ACCENT_LO)}<path transform="translate({m + m * .30:.1f},{cap:.1f})" d="{path}" fill="{DARK_INK}"/></g>'
        f'<path transform="translate(110,430)" d="{sub1}" fill="#A2AABA"/><path transform="translate(110,484)" d="{sub2}" fill="#A2AABA"/>')
files['social-card.svg'] = svg(1200, 630, card, DEFS_ICON, 'OpenAct, the free script editor for stage and screen')

OUT.mkdir(parents=True, exist_ok=True)
for n, c in files.items(): (OUT / n).write_text(c)
print(json.dumps(sorted(files)))
