# Architecture

Decisions behind this page: docs/adr/. Format rules: the script-formats skill.

## Requirements in brief
- **Functional:** prd.md R1–R17 (version 1), R18 (version 2: submission review), R19 (version 3: spelling and grammar), R20 (getting OpenAct), R21 (imported formats and the finder), R22 (real exports).
- **Non-functional:** works offline; no server; scripts never leave the device unless the writer exports, shares or syncs; WCAG 2.2 AA; typing stays under 50 ms per keystroke on a 150-page script; full repagination under 200 ms; at most two seconds of work lost in a crash.
- **Constraints:** one maintainer plus contributors; £0 running cost; GPL app with MIT libraries.

## Module map
A pnpm monorepo. Packages are pure TypeScript with no DOM access unless noted, so they test fast in Node.

```
packages/                         MIT
  model/      Element and script types, format and paper profiles (data),
              numbering, derived lists (outline, songs, cast counts, scene chart), rename
  fountain/   OpenAct Fountain parser and serialiser (ADR-0002)
  fdx/        Final Draft import and export (ADR-0005)
  detect/     Plain-text and pasted-text element detection
  layout/     Pagination engine (ADR-0004)
  pdf/        PDF renderer: layout output to jsPDF (lazy-loaded)
  docx/       Word exporter: elements to named paragraph styles (lazy-loaded)
  samples/    Original sample scripts and format templates (OpenAct Fountain files)
  review/     Version 2: submission checks and targets as dated, sourced data (R18);
              pure functions over the script and its layout
  language/   Version 3: spelling (nspell) and grammar (Harper) in workers, the script
              dictionary and element filter (R19, ADR-0010)
apps/web/                         GPL-3.0-or-later
  editor/     ProseMirror schema, element-flow keymap, autocomplete, find and replace,
              page-break decorations, highlight, notes (DOM)
  ui/         React chrome: top bar, outline, details panels, status line, element bar,
              dialogs (DOM)
  storage/    IndexedDB repository, snapshots, persistence, File System Access,
              backup prompts (ADR-0003)
  pwa/        Service worker configuration
  fonts/      Courier Prime and Atkinson Hyperlegible Next (OFL), self-hosted (D-026)
```

## Data model
```ts
type ElementType = 'act' | 'scene' | 'action' | 'character' | 'paren' | 'dialogue'
  | 'transition' | 'shot' | 'lyrics' | 'song' | 'centered' | 'pageBreak';

interface Run { text: string; bold?: boolean; italic?: boolean; underline?: boolean }

interface Element {
  id: string;                 // regenerated on load (ADR-0002)
  type: ElementType;
  runs: Run[];
  song?: { singers: string; func: string; staging: string; feel: string; reprise?: boolean };
  sceneType?: 'full' | 'cloth';
  note?: string;
}

interface Script {
  titlePage: { title: string; credit: string; authors: string; source: string; draftDate: string; contact: string };
  settings: { profile: 'screenplay' | 'stage-uk' | 'stage-us' | 'musical' | 'panto'; paper: 'a4' | 'letter'; dismissed: string[] };
  cast: { name: string; description: string }[];
  elements: Element[];
}
```
The ProseMirror schema mirrors `Element`: one node type per element type, its fields as node attributes, runs as text with marks. `@openact/fountain` converts between `Script` and OpenAct Fountain text; `apps/web/editor` converts between `Script` and the ProseMirror document.

## Data flow
```
keystroke ─► ProseMirror transaction ─► document
                                          │
                     ┌────────────────────┼─────────────────────────────┐
                     ▼                    ▼                             ▼
            layout (incremental)   storage (autosave ≤ 2 s)    derived lists
                     │                    │                    (outline, songs,
                     ▼                    ▼                     cast, chart)
      page-break decorations       IndexedDB + snapshots               │
      (MORE / CONT'D / numbers)    (+ real file on Chromium)           ▼
                     │                                            React panels
                     ▼
               page view  ═══ same layout output ═══►  PDF renderer (on export)
```

## MVP features to modules
| Requirement | Modules |
|---|---|
| R1 Editor and element flow | editor (keymap, autocomplete), model (profiles hold the flow maps) |
| R2 Find and replace | editor (search plugin), model (rename) |
| R3 Format and paper profiles | model, layout |
| R4 Page view and pagination | layout, editor (decorations) |
| R5 Outline | model (derived lists), ui |
| R6 Title page and cast list | model, ui, fountain (title page and settings block) |
| R7 Songs | model (numbering), ui, fountain (song convention) |
| R8 Line counts and scene chart | model, ui |
| R9 Notes | model, editor, fountain (`[[ ]]`) |
| R10 Import | fountain, fdx, detect, ui (review dialog) |
| R11 Export | pdf, docx, fountain, fdx, ui (export dialog) |
| R12 Storage safety | storage |
| R13 Offline and install | pwa |
| R14 Phone | editor (continuous mode), ui (element bar) |
| R15 Accessibility | editor (roles, single tab stop), ui (landmarks, live region) |
| R16 Performance | layout (incremental cache), editor (decorations update) |
| R17 First run | ui (start dialog), samples |
| R18 Submission review (version 2) | review, ui (review panel), pdf (anonymous export: no author metadata) |
| R19 Spelling and grammar (version 3) | language, editor (decorations), ui (review panel, settings), fountain (settings block) |

## Dependencies
Versions as published on npm on 2026-11-08.

| Dependency | Where | Licence | Version | Why it earns its place |
|---|---|---|---|---|
| prosemirror-model, -state, -view, -history, -keymap, -commands, -inputrules | editor | MIT | 1.25 / 1.4 / 1.42 / 1.5 / 1.2 / 1.7 / 1.5 | The editor (ADR-0001) |
| react, react-dom | ui | MIT | 19.3 | Chrome around the editor |
| @radix-ui/react-dialog, -dropdown-menu, -tabs, -select | ui | MIT | 1.3 and peers | Accessible focus handling we'd otherwise rebuild |
| idb | storage | ISC | 8.0 | IndexedDB in 1 kB (ADR-0003) |
| jspdf | pdf | MIT | 4.2 | Maintained, browser-native PDF with custom fonts (ADR-0005) |
| docx | docx | MIT | 9.15 | Word files with named styles |
| @xmldom/xmldom | fdx (tests) | MIT | 0.9 | XML in Node without external entities |
| jspdf | pdf | MIT | 4.2.1 | PDF export in the prototype: the UMD build, because the bundled ES build drops the TrueType plugin (D-042) |
| fflate | formats | MIT | 0.8 | Reads the zip container of Word files for format import (D-040); two named parts, each capped, nothing else unpacked |
| vite, vite-plugin-pwa | build | MIT | 8.3, 2.0 | Build and offline service worker |
| typescript | build | Apache-2.0 | 7.0 | Types |
| vitest | dev | MIT | 5.1 | Unit and golden tests |
| @playwright/test | dev | Apache-2.0 | 1.64 | Browser tests on Chromium, WebKit and Firefox |
| @axe-core/playwright | dev | MPL-2.0 | 4.14 | Accessibility checks in CI |
| Courier Prime, Atkinson Hyperlegible Next | fonts | OFL-1.1 | – | Script and interface type, self-hosted |
| @biomejs/biome | dev | MIT OR Apache-2.0 | 2.6 | Lint and format in one tool; works with TypeScript 7, which typescript-eslint doesn't yet (D-035) |
| @vitejs/plugin-react, @types/react, @types/react-dom, @types/node | dev | MIT | 6.2, 19.3, 19.3, 22.20 | React refresh in development, and types |
| *Version 3:* nspell | language | MIT | 2.1 | Offline Hunspell-style spelling in 42 kB (ADR-0010) |
| *Version 3:* dictionary-en-gb, dictionary-en | language | MIT AND BSD | 3.0, 4.0 | British and American word lists (about 0.6 MB each) |
| *Version 3:* harper.js | language | Apache-2.0 | 3.0 | Offline grammar in WebAssembly; optional 8 MB download (ADR-0010) |
| *Later:* yjs, y-prosemirror | editor | MIT | 13.6, 1.3 | Co-writing (ADR-0009) |

## Security and privacy
- Every opened or pasted file is untrusted: XML is parsed without external entities, files are size-capped (10 MB), text is never inserted as HTML, and notes and titles are escaped when rendered.
- A strict Content-Security-Policy (ADR-0006) blocks third-party scripts and network calls.
- No analytics and no accounts; nothing to breach on a server because there isn't one.
- No run-time requests to other sites: fonts are self-hosted (D-026), and the grammar download comes from OpenAct's own origin.
- Anonymous exports for blind reads leave out the writer's details and the PDF author field (R18); a test extracts both to prove it.

## Performance plan
- Layout caches wrapped lines per element and repaginates from the first changed page.
- Decorations update only for pages whose breaks changed.
- PDF and Word libraries load on first export, keeping the first load small.
- CI benchmark: a 150-page fixture must repaginate in under 200 ms.

## Revisit as OpenAct grows
- Proportional fonts for stage formats (D-018): add a font-metric measurer to `layout`.
- Co-writing (ADR-0009), a desktop wrapper (ADR-0007), and Safari storage behaviour (ADR-0003).
