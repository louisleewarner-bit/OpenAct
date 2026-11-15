"""Turn Parcel's single-file bundle into an Artifact page fragment (no doctype/html/head/body)."""
import re, sys, pathlib
src = pathlib.Path(sys.argv[1]).read_text()
out = pathlib.Path(sys.argv[2])
styles = re.findall(r'<style[^>]*>.*?</style>', src, re.S)
scripts = re.findall(r'<script type="module">.*?</script>', src, re.S)
assert len(scripts) == 1, len(scripts)
fonts = ("https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,400..700;1,400..700"
         "&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap")
head = f'''<title>OpenAct Writing Tool</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{fonts}">
'''
body = '\n'.join(styles) + '\n<div id="root"></div>\n' + scripts[0] + '\n'
out.write_text(head + body)
harness = out.with_name('harness.html')
harness.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
                   '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>'
                   '</head><body>' + head + body + '</body></html>')
print(out, out.stat().st_size, harness)
