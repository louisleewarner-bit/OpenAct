# OpenAct brand

Everything here is built from one source. Run `python3 brand/build-brand.py` for the SVGs, then `node brand/render-png.cjs` for the PNGs and `favicon.ico`.

| File | What |
|---|---|
| `mark*.svg` | The spike mark alone: blue, ink, white, and the dark-mode blue |
| `logo*.svg` | The lockup (mark and name, with the name drawn as outlines so no font is needed): blue, dark, ink, white, stacked |
| `app-icon.svg`, `app-icon-maskable.svg`, `favicon.svg` | The app icon, its maskable version, and the small version without the page |
| `social-card.svg` | A 1200 by 630 card for link previews |
| `*.png`, `favicon.ico` | Rendered sizes: 512, 192, maskable 512, Apple touch 180, favicons 16, 32 and 48, the card, and the lockups |
| `brand-guide.html` | The guide: the idea, clear space, colours with contrast, depth, type, and what not to do |

## The idea
A spike mark is the L of tape a stage manager lays on the floor to show where something goes. Two strips of tape, the lower a little deeper so the overlap reads. The name is Courier Prime Bold, the face of the script page; the mark stands on its baseline and is a touch taller than the capitals.

## Using the name and logo
- The software is free under the GNU GPL (`prototype/LICENSE`). The name and logo are not covered by it.
- You may use them to say you used OpenAct, or to link to it. If you change the software and share your version, give it another name and logo.
- Write the name as one word: OpenAct.
- No trade mark is filed or cleared yet (`docs/research/names.md`). This is guidance, not legal advice.

The name is set in Courier Prime Bold (SIL Open Font License 1.1, `prototype/src/assets/fonts`).
