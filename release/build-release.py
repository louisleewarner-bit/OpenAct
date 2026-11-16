"""Builds the free-distribution package (D-043).  Usage: python3 release/build-release.py <screenshot dir>
Needs: a built prototype (bash prototype/artifact/rebuild.sh), node, and the pack screenshots (checks/shots-pack.cjs).
Writes release/out/:  OpenAct-preview-1.0/ (the download),  OpenAct-preview-1.0.zip (+ .sha256),  site/ (a static website)."""
import base64, hashlib, json, pathlib, shutil, subprocess, sys, zipfile
KIT = pathlib.Path(__file__).resolve().parent.parent
PROTO = KIT / 'prototype'
OUT = KIT / 'release' / 'out'
SHOTS = pathlib.Path(sys.argv[1])
VERSION = '1.0'
NAME = f'OpenAct-preview-{VERSION}'
if OUT.exists(): shutil.rmtree(OUT)
PKG = OUT / NAME; SITE = OUT / 'site'
for d in (PKG, PKG / 'app', PKG / 'licenses', PKG / 'source', SITE, SITE / 'img', SITE / 'fonts'): d.mkdir(parents=True, exist_ok=True)
dist = PROTO / 'offline' / 'dist'
assert (dist / 'openact-offline.html').exists(), 'build the prototype first: bash prototype/artifact/rebuild.sh'

# ---- the app, two ways ----
shutil.copy(dist / 'openact-offline.html', PKG / 'OpenAct.html')
for f in (dist / 'pwa').iterdir(): shutil.copy(f, PKG / 'app' / f.name)
for f in ('OFL-Atkinson-Hyperlegible-Next.txt', 'OFL-Courier-Prime.txt'): shutil.copy(PROTO / 'offline' / 'fonts' / f, PKG / 'licenses' / f)
shutil.copy(PROTO / 'LICENSE', PKG / 'LICENSE')
subprocess.run(['node', str(KIT / 'release' / 'notices.cjs'), str(PKG / 'THIRD-PARTY-NOTICES.txt')], check=True)


# ---- double-click installers (D-046) ----
INST = KIT / 'release' / 'installers'
(PKG / 'installer').mkdir(exist_ok=True)
from PIL import Image
icon512 = Image.open(KIT / 'brand' / 'icon-512.png').convert('RGBA')
shutil.copy(KIT / 'brand' / 'icon-512.png', PKG / 'installer' / 'icon-512.png')
icon512.save(PKG / 'installer' / 'OpenAct.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
def put(src, dst, crlf=False, exe=False):
    data = (INST / src).read_text()
    if crlf: data = data.replace('\r\n', '\n').replace('\n', '\r\n')
    d = PKG / dst; d.write_text(data, newline='')
    if exe: d.chmod(0o755)
put('windows/Install-OpenAct.cmd', 'Install OpenAct (Windows).cmd', crlf=True)
put('windows/Uninstall-OpenAct.cmd', 'installer/Uninstall OpenAct.cmd', crlf=True)
put('windows/make-shortcuts.ps1', 'installer/make-shortcuts.ps1', crlf=True)
put('mac/Install-OpenAct.command', 'Install OpenAct (Mac).command', exe=True)
put('mac/Uninstall-OpenAct.command', 'installer/Uninstall OpenAct.command', exe=True)
put('linux/Install-OpenAct.sh', 'Install OpenAct (Linux).sh', exe=True)
put('linux/uninstall-openact.sh', 'installer/uninstall-openact.sh', exe=True)

# ---- plain-language documents ----
(PKG / 'README.txt').write_text(f'''OpenAct {VERSION} (public preview)
The free script editor for stage and screen.

WHAT IT DOES
- Sixteen formats: screenplay, TV (one-hour drama, single-camera and multi-camera comedy, UK studio sitcom, vertical micro-drama), stage play (UK and US),
  musical (UK and US), pantomime, radio drama, audio drama and podcasts, video games (branching dialogue with a branch map, recording line IDs, and Ink,
  Yarn Spinner and recording-sheet export), comics, and treatments.
- Saves real files: PDF (matches the page on screen, fonts inside), Word (a named style for each element; it can keep the PDF's page breaks), Fountain and
  Final Draft. An anonymous copy names no author in the file or its properties.
- Import your own format from a Final Draft or Word template, and find common competition and theatre formats ("Find a format").
- "Ready to submit?" checks a script against where it is going, and shows the source for each rule.
- Works offline. No account. Nothing is sent anywhere.

INSTALL IT (easiest)
Unzip the download first (right-click the zip and choose Extract All, or double-click it on a Mac), then double-click the install file for your computer:
- Windows: "Install OpenAct (Windows).cmd". It adds OpenAct to your Desktop and Start menu. If Windows says it "protected your PC", choose More info, then Run anyway:
  the installer is not signed, because signing costs money. It is a plain text file you can open in Notepad and read first.
- Mac: "Install OpenAct (Mac).command". The first time, hold Control, click the file, choose Open, then Open again. It puts OpenAct.app in your Applications folder
  (inside your home folder).
- Linux: "Install OpenAct (Linux).sh" (right-click, Run, or in a terminal: bash "Install OpenAct (Linux).sh"). It adds OpenAct to your applications menu.
None of them needs a password or sends anything anywhere. Each leaves an uninstaller (see the end of the install window).
OpenAct opens in its own window, using Chrome, Edge, Brave or Chromium if you have one. Otherwise it opens in your default browser.

OR JUST OPEN IT
Double-click OpenAct.html. It runs in your browser, with no connection. (The "app" folder is for putting OpenAct on a web site, where it can be installed from the address bar.)

SAVING AND OPENING
OpenAct keeps your script in this computer's browser storage as you write. For a copy you can move, back up or send, use More, then Save to a file (Ctrl+S, or Command+S):
it makes a .openact file. More, then Open a script file (Ctrl+O) opens one again, and Close this script asks before it lets go of one you have not saved.

WHERE YOUR SCRIPTS ARE
In the app window's or browser's storage on your device, and in any .openact files you save. They go nowhere unless you export them. Clearing site data, using a private window, or opening OpenAct
in a different browser, profile or place starts empty, and OpenAct.html and the installed app each keep their own scripts. Export a PDF or a
Fountain file (plain text) now and then. This preview has no sync and no automatic backup.

TESTED, AND NOT YET TESTED
Tested with automated checks in Chrome on Linux: every format, export, import, accessibility (axe) and offline use, at desktop and phone sizes.
Not yet tried: Safari, Firefox, Edge on Windows, a real phone's on-screen keyboard, Word or Final Draft themselves. Please open an exported file
in the program you will use, and check it, before you send it anywhere important.

KNOWN LIMITS
- No spelling or grammar check yet. A4 and US Letter are the only page sizes.
- Final Draft import and export follow the file format as publicly understood; the indent units on import are unverified. Check the preview.
- Courier Prime has no glyph for some characters (for example music notes, arrows and Cyrillic). OpenAct tells you before a PDF drops them; Word keeps them.
- "Find a format" was checked in November 2026. Organisations change their rules, so read the current ones before you send a script.
- OpenAct is not affiliated with Final Draft, or with any competition, broadcaster, theatre or publisher it names.

LICENCE
Free software: GNU General Public License, version 3 or later (LICENSE). The full source, and how to build it, is in source/. The software and fonts
it contains, with their licences, are in THIRD-PARTY-NOTICES.txt and licenses/. The OpenAct name and logo are not covered by the GPL (see
source/brand/README.md).

CHECK YOUR DOWNLOAD
SHA256SUMS.txt lists a checksum for every file. "sha256sum -c SHA256SUMS.txt" (Linux, or "shasum -a 256 -c" on a Mac) checks them.
''')
(PKG / 'PRIVACY.txt').write_text(f'''OpenAct privacy notice

OpenAct collects nothing. It has no account, analytics, advertising, cookies or tracking, and it sends no information to anyone.

What is stored, and where: your scripts, your settings (theme, panel sizes), and any formats you import are kept in your browser's local storage on your
own device. The installed app also keeps a copy of itself so that it works offline. Nothing else is kept, and none of it leaves your device unless you
export a file and share it yourself.

Links: "Find a format" and the About screen contain links to other organisations' own pages. They open in your browser only when you choose them, and
those sites have their own privacy practices.

Your files: when you import a template, the file is read on your device and is not uploaded.

If someone else hosts OpenAct for you (for example a school or a company), their web server may keep ordinary logs such as your address and the time of
a visit. That is the host's practice, not OpenAct's, and they should have their own notice.

Questions and problems: use the issue tracker on the project's repository page.

To remove everything OpenAct has stored, clear this site's data in your browser's settings, or uninstall the app.
''')
(PKG / 'RELEASE-NOTES.txt').write_text(f'''OpenAct {VERSION} (public preview)

New in this release
- The logo: the spike mark, with a new app icon, favicon and social card.
- Real exports: PDF, Word, Fountain and Final Draft. Word can keep the PDF's page breaks. The font is embedded in PDF and Word files.
- Video game scripts: nodes, player choices, conditions, barks, quest beats and lore, a branch map that checks every jump, lockable recording line IDs, and export to a recording sheet (CSV), Ink and Yarn Spinner.
- Import your own formats (Final Draft, Word, or an OpenAct format file) and "Find a format".
- A calmer look, a phone layout with an element bar that is always there, and a New button on every screen.
- Free for everyone, under the GNU General Public License.

Fixed on the way
- A speech longer than two pages lost its text after page 2 in exports. It now splits across as many pages as it needs.
- PDFs fell back to a different font when built a certain way. The font is now embedded and checked.
- Starting a new script did not save until you typed. It saves at once.
- A double-spaced speech beside a speaker sat half a line too low on screen.

How exports were checked
Every line of every format's PDF sits within 0.04 inch of where the page shows it. Word files that keep the PDF's page breaks match the PDF page for
page when rendered in LibreOffice. Word and Final Draft themselves have not been tried.
''')
(PKG / 'source' / 'BUILDING.txt').write_text('''Building OpenAct from this source

You need Node 22 or later, pnpm 10, and Python 3.

  cd prototype
  pnpm install --ignore-workspace
  bash artifact/rebuild.sh

That writes prototype/offline/dist/openact-offline.html (the single file) and prototype/offline/dist/pwa/ (the installable app). The scripts in
prototype/checks/ test it (see prototype/checks/README.md); they need Playwright with Chromium, and the Python ones need pymupdf, python-docx
and LibreOffice. brand/build-brand.py makes the logo files; release/ makes this package.

Licence: GNU GPL, version 3 or later (prototype/LICENSE). Fonts: SIL Open Font License 1.1 (prototype/src/assets/fonts, prototype/offline/fonts).
''')

# ---- the source (the GPL asks for it) ----
inc = [('prototype/src', None), ('prototype/public', None), ('prototype/artifact', None), ('prototype/offline/app', None), ('prototype/offline/fonts', None), ('prototype/checks', None),
       ('prototype/index.html', 1), ('prototype/package.json', 1), ('prototype/pnpm-lock.yaml', 1), ('prototype/tsconfig.json', 1), ('prototype/tsconfig.app.json', 1), ('prototype/tsconfig.node.json', 1),
       ('prototype/tailwind.config.js', 1), ('prototype/postcss.config.js', 1), ('prototype/components.json', 1), ('prototype/.parcelrc', 1), ('prototype/vite.config.ts', 1), ('prototype/LICENSE', 1), ('prototype/README.md', 1),
       ('brand', None), ('release', None), ('docs/samples', None), ('LICENSE.md', 1)]
skip_parts = {'node_modules', '.parcel-cache', 'dist', 'out', '__pycache__'}
skip_files = {'bundle.html', 'openact-prototype.html', 'harness.html'}
src_zip = PKG / 'source' / f'openact-{VERSION}-source.zip'
with zipfile.ZipFile(src_zip, 'w', zipfile.ZIP_DEFLATED) as z:
    for rel, single in inc:
        p = KIT / rel
        files = [p] if single else sorted(x for x in p.rglob('*') if x.is_file())
        for f in files:
            parts = set(f.relative_to(KIT).parts)
            if parts & skip_parts or f.name in skip_files or f.name.endswith('.png') and 'brand' not in parts and 'public' not in parts and 'app' not in parts: continue
            z.write(f, f'openact-{VERSION}-source/{f.relative_to(KIT)}')
    z.write(PKG / 'source' / 'BUILDING.txt', f'openact-{VERSION}-source/BUILDING.txt')
shutil.copy(PKG / 'source' / 'BUILDING.txt', PKG / 'BUILDING.txt'); (PKG / 'source' / 'BUILDING.txt').unlink()
shutil.copytree(KIT / 'brand', PKG / 'source' / 'brand', ignore=shutil.ignore_patterns('__pycache__', '*.cjs', '*.py'))

# ---- checksums ----
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
lines = [f'{sha(f)}  {f.relative_to(PKG).as_posix()}' for f in sorted(PKG.rglob('*')) if f.is_file()]
(PKG / 'SHA256SUMS.txt').write_text('\n'.join(lines) + '\n')

# ---- the zip ----
ZIP = OUT / f'{NAME}.zip'
with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for f in sorted(PKG.rglob('*')):
        if f.is_file(): z.write(f, f'{NAME}/{f.relative_to(PKG).as_posix()}')
(OUT / f'{NAME}.zip.sha256').write_text(f'{sha(ZIP)}  {NAME}.zip\n')
size = f'{ZIP.stat().st_size / 1_048_576:.1f} MB'

# ---- the website ----
shutil.copytree(PKG / 'app', SITE / 'app'); shutil.copy(ZIP, SITE / ZIP.name)
for f in ('mark.svg', 'logo.svg', 'social-card.png', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png'): shutil.copy(KIT / 'brand' / f, SITE / 'img' / f)
for f in ('atkinson-hyperlegible-next-latin-wght-normal.woff2', 'courier-prime-latin-400-normal.woff2', 'courier-prime-latin-700-normal.woff2'): shutil.copy(PROTO / 'offline' / 'fonts' / f, SITE / 'fonts' / f)
from PIL import Image
for src, dst, w in (('pack-desktop.jpg', 'desktop.jpg', 1440), ('pack-phone.jpg', 'phone.jpg', 390), ('start-desk.png', 'start.jpg', 1440)):
    im = Image.open(SHOTS / src).convert('RGB'); im.thumbnail((w * 2 if w > 400 else w * 2, 4000)); im.save(SITE / 'img' / dst, quality=82, optimize=True)
fonts_css = '''<style>
@font-face { font-family: "Atkinson Hyperlegible Next"; font-weight: 200 800; font-display: swap; src: url(fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2) format("woff2-variations"); }
@font-face { font-family: "Courier Prime"; font-weight: 400; font-display: swap; src: url(fonts/courier-prime-latin-400-normal.woff2) format("woff2"); }
@font-face { font-family: "Courier Prime"; font-weight: 700; font-display: swap; src: url(fonts/courier-prime-latin-700-normal.woff2) format("woff2"); }
</style>'''
tpl = (KIT / 'release' / 'landing.html').read_text()
def fill(t, **kv):
    for k, v in kv.items(): t = t.replace('{{' + k + '}}', v)
    return t
index = fill(tpl, OG='img/social-card.png', FAVICON='img/favicon.svg', FONTS=fonts_css, OPEN='app/', ZIP=ZIP.name, ZIPSIZE=f'Download: {size}.', IMG_DESKTOP='img/desktop.jpg', IMG_PHONE='img/phone.jpg', IMG_START='img/start.jpg', PRIVACY='privacy.html')
(SITE / 'index.html').write_text(index)
import html
privacy = (PKG / 'PRIVACY.txt').read_text()
paras = ''.join(f'<p>{html.escape(x.strip())}</p>' for x in privacy.split('\n\n')[1:] if x.strip())
(SITE / 'privacy.html').write_text(fill(tpl, OG='img/social-card.png', FAVICON='img/favicon.svg', FONTS=fonts_css, OPEN='app/', ZIP=ZIP.name, ZIPSIZE='', IMG_DESKTOP='img/desktop.jpg', IMG_PHONE='img/phone.jpg', PRIVACY='privacy.html').split('<main id="main">')[0]
    + f'<main id="main"><div class="wrap" style="padding-block:48px"><h1>Privacy</h1><div style="display:grid;gap:14px;max-width:68ch">{paras}</div><p style="margin-top:24px"><a href="./">Back to OpenAct</a></p></div></main>'
    + '</body></html>')
print(json.dumps({'zip': str(ZIP), 'size': size, 'files': len(lines), 'sha256': sha(ZIP)}))
