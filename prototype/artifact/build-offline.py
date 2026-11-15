"""Build the offline editions of the prototype from Parcel's single-file bundle.

  offline/dist/openact-offline.html   one file to download and open from disk: fonts embedded, no network
  offline/dist/pwa/               the same page as an installable app: manifest, service worker, icons

The hosted Artifact (artifact/openact-prototype.html) loads its fonts from Google Fonts; these editions
embed Courier Prime and Atkinson Hyperlegible Next (both SIL OFL 1.1, licences in offline/fonts/).
"""
import base64, pathlib, re, shutil, sys

src = pathlib.Path(sys.argv[1]).read_text()
root = pathlib.Path(sys.argv[2])
fonts = root / 'fonts'
dist = root / 'dist'
pwa = dist / 'pwa'
pwa.mkdir(parents=True, exist_ok=True)

styles = re.findall(r'<style[^>]*>.*?</style>', src, re.S)
scripts = re.findall(r'<script type="module">.*?</script>', src, re.S)
assert len(scripts) == 1, len(scripts)

LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'


def face(family, file, style, weight, rng, fmt='woff2'):
    data = base64.b64encode((fonts / file).read_bytes()).decode()
    return (f"@font-face{{font-family:'{family}';font-style:{style};font-weight:{weight};font-display:swap;"
            f"src:url(data:font/woff2;base64,{data}) format('{fmt}');unicode-range:{rng}}}")


faces = []
for sub, rng in (('latin', LATIN), ('latin-ext', LATIN_EXT)):
    for w in (400, 700):
        for st in ('normal', 'italic'):
            faces.append(face('Courier Prime', f'courier-prime-{sub}-{w}-{st}.woff2', st, w, rng))
    for st in ('normal', 'italic'):
        faces.append(face('Atkinson Hyperlegible Next', f'atkinson-hyperlegible-next-{sub}-wght-{st}.woff2', st, '200 800', rng, 'woff2-variations'))
font_css = '<style>' + ''.join(faces) + '</style>'

base_css = ('<style>:root{color-scheme:light dark}html,body{height:100%;margin:0}body{font:14px system-ui;background:#E4E8EE}'
            '@media (prefers-color-scheme:dark){body{background:#12161E}}[hidden]{display:none!important}</style>')
body = '\n'.join(styles) + '\n<div id="root"></div>\n' + scripts[0]


def page(extra_head=''):
    return ('<!doctype html><html lang="en-GB"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
            '<title>OpenAct</title><meta name="description" content="The free script editor for stage and screen.">'
            + extra_head + base_css + font_css + '</head><body>' + body + '</body></html>')


favicon = base64.b64encode((root / 'app' / 'favicon.svg').read_bytes()).decode()
(dist / 'openact-offline.html').write_text(page(f'<link rel="icon" href="data:image/svg+xml;base64,{favicon}" type="image/svg+xml">'))

pwa_head = ('<link rel="manifest" href="manifest.webmanifest">'
            '<meta name="theme-color" content="#F5F7F9" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#181D27" media="(prefers-color-scheme: dark)">'
            '<link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="alternate icon" href="favicon.ico" sizes="48x48"><link rel="apple-touch-icon" href="apple-touch-icon.png">'
            "<script>if('serviceWorker' in navigator&&location.protocol.startsWith('http'))"
            "addEventListener('load',()=>navigator.serviceWorker.register('sw.js'))</script>")
(pwa / 'index.html').write_text(page(pwa_head))

for f in ('manifest.webmanifest', 'sw.js', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon.ico', 'favicon.svg'):
    shutil.copy(root / 'app' / f, pwa / f)
for f in fonts.glob('OFL-*.txt'):
    shutil.copy(f, dist / f.name)

print(dist / 'openact-offline.html', (dist / 'openact-offline.html').stat().st_size, pwa)
