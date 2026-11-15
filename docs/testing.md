# Test strategy

Format correctness and data safety are the product, so they get the most tests and the strictest gates. Packages are pure TypeScript, so most tests run in Node in milliseconds; the browser suite covers what only a browser can show.

## Shape
| Layer | Tool | What | Gate |
|---|---|---|---|
| Unit and golden | Vitest (Node) | model, fountain, fdx, detect, layout, docx structure | Every pull request |
| Property | Vitest + fast-check (MIT, dev only) | Round trips over generated scripts | Every pull request |
| Browser end to end | Playwright: Chromium, WebKit, Firefox; iPhone and Pixel emulation | Element flow, page view, storage, export, phone | Every pull request |
| Accessibility | @axe-core/playwright; manual VoiceOver and NVDA pass | Every key screen state | axe on every pull request; manual each release |
| Performance | Vitest bench (Node); Playwright with 4× CPU throttling | Repagination; keystroke-to-screen | Every pull request |
| Reference fidelity | Private fixtures run locally | Page breaks against reference PDFs | Before each release |

Coverage targets: 95% of lines in `layout` and `fountain`, 90% in the other packages. App code is held to its flows (every prd.md acceptance criterion has a test), not to a percentage.

## Fixtures
- `tests/fixtures/` (committed): the three original samples (docs/samples/), one small fixture per pagination rule, and generated long scripts (the samples repeated to 150 pages).
- `tests/private/` (git-ignored): the owner's dogfood scripts and reference PDFs from other apps, which can't be published. CI skips them; the release checklist runs them locally.
- Every fixture states its paper, profile and expected page breaks as `expected.json`: for each page, the element id and text offset where it starts.

## Format logic (Node)
**Fountain parser:** one test per rule in docs/research/format-verification.md, plus the OpenAct conventions (ADR-0002). Example:
```ts
test('a single leading full stop forces a scene heading and is removed', () => {
  expect(parse('\n.SNIPER RIFLE POV\n').elements[0]).toMatchObject({ type: 'scene', text: 'SNIPER RIFLE POV' });
});
```
**Round trips:** Fountain → model → Fountain is identical on the second pass for every fixture and for 1,000 generated scripts. FDX → model → FDX keeps element types, text, styles, scene numbers and the title page. Every importer reports what it couldn't map.

**Golden pagination:** each rule in the script-formats skill gets a fixture and an expected break. Example:
```ts
test('a speech that crosses a page splits at a sentence, with (MORE) and a (CONT\'D) cue', () => {
  const pages = paginate(fixture('last-wash'), profiles.screenplay, papers.a4);
  expect(breakAfter(pages, 0)).toEqual({ element: 'nell-long-speech', at: 'sentence', more: true });
  expect(firstLine(pages[1])).toBe("NELL (CONT'D)");
});
```
**Reference PDFs:** extract each page's first and last lines from a reference PDF (the pdf skill's text extraction), map them to elements, and compare with the engine's breaks. A difference is either fixed or logged in decisions.md with its reason.

**Paste detection:** a corpus of pasted scripts (UK `NAME:` style, US plain-text screenplays, text copied from PDFs with page numbers and headers) with expected element types. Target: 95% of elements typed correctly.

## In the browser (Playwright)
- **Element flow:** tests are generated from each profile's Enter and Tab tables, so the tests and the profiles can't drift apart. Also: autocomplete, inserting a parenthetical, Backspace merging, undo and redo, and IME composition (Chromium's `Input.imeSetComposition`).
- **Leaving the script:** Esc then Tab moves focus to the next control; the script has exactly one tab stop.
- **Page view equals PDF:** export each fixture as a PDF and compare text positions with the layout output (within 0.5 pt); check that fonts are embedded.
- **Word export:** unzip the DOCX and check that one named style exists per element, with the profile's indents. Opening it in Word, LibreOffice and Google Docs is a manual release check.
- **Phone:** continuous view at 375 px, element bar, no horizontal scroll.

## Data safety
- **Crash test:** type continuously, then kill the page mid-keystroke at a random point; reopen and compare. Run 20 trials: at most two seconds lost in every one.
- **Snapshots:** restore any snapshot; pruning keeps the last 50 and one a day for 30 days.
- **Persistence refused:** mock `navigator.storage.persist()` to return false; the backup prompt appears. Seven days without a file save also triggers it (fake clock).
- **Real files (Chromium):** autosave writes to the file handle; a file changed by another app triggers "Keep both".

## Accessibility
- axe on these states, in light and dark, desktop and phone: the start dialog, an editor with each profile, every panel, the export, paste, title, song and note dialogs. Gate: no serious or critical violations.
- Keyboard-only runs of every core flow (docs/design/flows.md).
- Manual pass each release with VoiceOver (macOS and iOS) and NVDA (Windows), following the screen-reader table in docs/design/accessibility.md.

## Performance
- `layout` bench: full repagination of the 150-page fixture under 200 ms; incremental pass under 16 ms.
- Typing: with 4× CPU throttling, 95% of keystrokes reach the screen within 50 ms in the 150-page fixture (measured from the input event to the next frame).

## Security
- Hostile files: an XML entity bomb, external-entity references, a 50 MB file and HTML in notes and titles. All must be refused or neutralised with a clear message.

## Continuous integration
GitHub Actions on every pull request: lint, type-check, Node tests (unit, golden, property), Playwright in three browsers, axe, and benchmarks. A failure blocks the merge. Private fixtures run on the maintainer's machine before each release.

## Submission review (version 2)
- **One fixture per check and status:** each check in docs/research/submission-checks.md gets a small script that makes it return fix, consider and pass. The prototype's flawed "Kettle" fixture (all checks firing) and the fifteen templates (no structural findings) are the starting set.
- **Targets as data:** a test reads `review-data` and fails if any check or target cites a source id that doesn't exist, or a target has no research date.
- **Anonymous export:** export a script whose title page names the writer, then extract the PDF's text and metadata (the pdf skill) and assert the name, email and phone appear in neither.
- **Never edits silently:** run every check on every fixture and assert the script is unchanged unless a fix was pressed; each fix is one undo step.
- **Accessibility:** axe with every row expanded, in light and dark themes, on desktop and phone layouts.

## Offline and installed (slice 12)
The four-mode check in docs/research/offline-check.md becomes a Playwright suite in Chromium, WebKit and Firefox: hosted online, installed online, installed offline (server stopped and network off; a new tab opens), and the downloaded file with every request blocked. Each mode must open the sample, keep the same page count and review results, and keep an edit across a reload. The suite also fails on any request to another origin.

## Spelling and grammar (version 3)
- Planted-error fixture: every error found, with the right suggestion first.
- Names: no character name, location or song title from the three samples is ever flagged.
- Dialect pairs (colour and color, organise and organize) flip with the script's dialect.
- Grammar runs on action and directions only, unless the per-script setting includes dialogue.
- With the network blocked after the grammar download, checking still works.
- Benchmark: checking a 150-page script in the worker never pushes a keystroke past R16's 50 ms.
