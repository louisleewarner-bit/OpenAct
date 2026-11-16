# Prototype checks

Playwright scripts used to test the prototype and make the overview screenshots. They are throwaway checks for the design prototype, not the product's test suite (docs/testing.md).

Run from a scratch folder with Playwright available and axe-core installed (`npm i axe-core` there). Set `SP` to that folder: outputs and screenshots go there, and axe is read from `$SP/axe/node_modules/axe-core/axe.min.js`.

| Script | What it checks or makes |
|---|---|
| `check-formats.cjs` | Loads every format template, records numbering and furniture, runs axe |
| `review-check.cjs` | The review panel on the screenplay sample and every template; anonymous fix; export note; axe |
| `review-fixture.cjs` | A flawed script that fires every check; jump links; fixes; persistence; dark theme and phone; axe |
| `review-targets.cjs` | Bruntwood on the panto template, Austin and the Nicholl on a TV template: target-specific rules, checklists and dates; axe |
| `offline-check.cjs` | The four-mode offline test in docs/research/offline-check.md (starts local web servers on ports 8761 and 8765) |
| `shots-pack.cjs`, `shots-review.cjs` | Screenshots for the overview page (`overview/build-pack.py <SP>`) |
| `render-icons.cjs` | PNG icons for the installable edition from `offline/app/*.svg` |
| `element-bar.cjs` | The always-on element bar (D-038): smart order, tap to add or retype, the type list, cast names, resume after Done, Alt shortcuts, on phone and desktop, with axe |
| `import-format.cjs` | Importing formats (D-040): OpenAct, Final Draft and Word files; preview and adjust; save, use, reload; export, edit, delete; error messages; the missing-format fallback; phone and desktop; axe. Needs `make-format-fixtures.py` run first |
| `finder.cjs` | The format finder: search, status, links open on a click, nothing sent while searching, start in the nearest format, phone and desktop; axe |
| `make-format-fixtures.py` | Writes the original sample files in `docs/samples/formats/` |
| `shots-look.cjs`, `lib.cjs` | Look-and-feel screenshots, light and dark, desktop and phone (`node checks/shots-look.cjs <tag>`); `lib.cjs` holds `openReview(page)`, which finds Review on any screen size |
| `start-check.cjs` | The start page (D-047): headline, primary action focused, resume card only with a script, Continue, Back and Escape, Open a file, all 16 formats as cards, no sideways scroll, axe in light, dark, narrow and phone. |
| `files-check.cjs` | Script files (D-046): Save (first time asks, then saves in place), Save a copy, Open, Close, and the save-first question before Close, New and Open; Ctrl+S; the status bar; bad, newer and damaged files; plain text through the paste preview; the download fallback; phone and desktop; axe. |
| `game-check.cjs`, `game-edge.cjs` | Video game format (D-044): Branches tab (map, list, checks, locked line IDs), the four game exports checked as files (CSV parsed, Ink compiled and played with inkjs, Yarn read, JSON), review target, phone and desktop, axe; then locked IDs, awkward text, empty and odd scripts, 400 nodes. inkjs is a check-only tool: `npm i inkjs` in a scratch folder and add it to NODE_PATH. |
| `export-check.cjs`, `export-verify.py` | Exports PDF, Word, Fountain and Final Draft for all 16 formats and 3 samples, then checks them: page counts, every line present, every line within 0.04 in of the page view, fonts embedded, paper size, anonymous copies |
| `export-verify-docx.py` | Fixed-page Word files against the PDFs, page for page, through LibreOffice (needs `soffice`) |
| `export-edge.cjs`, `export-edge.py` | Blank script, a very long speech (with and without full stops), characters the font lacks, an imported format, anonymous Final Draft, speed, and the hosted preview's save prompt (a stand-in host) |

Paths assume the kit lives at /home/user/script-app-kit; change them if it doesn't. Review has no top-bar button any more (D-039): open it with `openReview(page)` from `lib.cjs`.
