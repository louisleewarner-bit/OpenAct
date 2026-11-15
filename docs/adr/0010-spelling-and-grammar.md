# ADR-0010: Spelling and grammar (version 3)

**Status:** Proposed, for version 3 · **Date:** 2026-11-08 · **Deciders:** owner

## Context
Version 3 adds spelling and grammar checking, the last check a writer runs before sending a script out (the "Ready to submit?" review already reserves a place for it). The checker must:
- Work offline and keep text on the device (principle 2), cost nothing to run (principle 6), and leave typing within its 50 ms budget on an old laptop (R16).
- Understand scripts. Character names, invented places and song titles aren't misspellings. Scene headings, cues and transitions are capitals and abbreviations by design. Dialogue is often ungrammatical on purpose, so grammar rules suit action and stage directions, not speech.
- Spell British or American English per script.

The browser's own spell check already works in the editor, but OpenAct can't control it: it can't learn the script's names, it can't skip cues and headings consistently, it can't list issues in the review, and it differs between browsers. Chrome's Enhanced mode sends typed text to Google; its basic mode stays on the device ([Chrome Help](https://support.google.com/chrome/answer/12027911)).

## Options considered
Package data from the npm registry on 2026-11-08; Harper's sizes measured from the published package.

| | Browser spell check | nspell + wooorm dictionaries | Harper (harper.js) | LanguageTool | retext plugins |
|---|---|---|---|---|---|
| Licence | – | MIT; `dictionary-en-gb` and `dictionary-en` are MIT AND BSD | Apache-2.0 | LGPL-2.1 | MIT |
| Offline | Basic mode only | Yes | Yes (WebAssembly) | Only a self-hosted server | Yes |
| Privacy | Enhanced mode sends text to Google | On device | On device | The hosted API receives the text | On device |
| Grammar | No | No | Yes, rule-based | Yes, the strongest | Light: repeated words, a/an, passive voice |
| British English | Browser setting | `dictionary-en-gb` | Dialect setting (American by default) | Yes | Through nspell |
| Download | None | About 0.6 MB per dictionary, 42 kB engine | 8.3 MB gzipped (20 MB WebAssembly) | A Java server | Small |
| Script names | No (the browser's own dictionary) | Yes (`add`) | Ignore lists and dictionary export; an add-word call to confirm in the spike | Yes | Through nspell |
| Running cost | £0 | £0 | £0 | A server or a paid API | £0 |
| Latest release | – | nspell 2.1.5 (2022); dictionaries 3.0 and 4.0 (2023) | 3.0.0 (October 2026) | Active | retext-spell 6.1 (2024) |

## Decision
1. **Spelling ships with the app:** nspell with `dictionary-en-gb` or `dictionary-en`, run in a Web Worker, cached for offline use. Only the script's dialect is loaded.
2. **Grammar is an optional download:** Harper, run in its `WorkerLinter`, offered on first use ("Download grammar checking: 8 MB, then it works offline") and cached by the service worker.
3. **OpenAct decides what gets checked** (a new `@openact/language` package):

| Element | Spelling | Grammar |
|---|---|---|
| Action, stage direction, caption, treatment paragraph | Yes | Yes |
| Dialogue, lyrics | Yes | Off by default; a per-script setting |
| Parenthetical, song title | Yes | No |
| Scene heading, character cue, transition, shot, sound cue | No; their words feed the script dictionary | No |
| Title page | Title only | No |

   The script dictionary is built automatically from character cues, the cast list, scene-heading locations and song titles, plus words the writer adds. Extensions (V.O., O.S., CONT'D), numbers and times are skipped.
4. **Dialect** follows the script: A4 and UK formats default to British English, US Letter and US formats to American, with a per-script override.
5. **Never auto-correct.** Issues show as wavy underlines for spelling and dotted ones for grammar (not colour alone), with suggestions on request, "Add to script dictionary" and "Ignore in this script". The review panel's Language section lists every issue with a jump link, replacing today's placeholder.
6. **Until version 3**, the editor sets the HTML `spellcheck` attribute on prose elements (action, dialogue, lyrics) and turns it off on cues, headings and transitions, so the browser's checker helps without flagging every slugline. Version 3 turns the browser's checker off to avoid double underlines.
7. Per-script dictionary words and ignored issues are saved in the OpenAct Fountain settings block (ADR-0002); the writer's personal dictionary lives in IndexedDB on the device.

## Trade-off analysis
- **Harper alone** would mean one engine, but its 8 MB download is heavy for a first visit on a phone, and spelling should work from install. If the spike shows Harper's spelling is as good as Hunspell's on scripts, and the download is acceptable, drop nspell and keep one engine.
- **LanguageTool** has the best grammar, but it needs a server, which breaks local-first and the £0 running cost. It stays out unless a writer runs their own server, which could become an advanced setting later.
- **The browser's checker only** costs nothing but can't be made script-aware or listed in the review, and its Enhanced mode sends text to Google.
- **retext** adds light style checks cheaply; consider its repeated-word and a/an rules if Harper is too heavy.

## Consequences
- The offline precache grows by about 0.6 MB; grammar adds 8.3 MB only for writers who choose it.
- All checking runs in workers and only on changed elements (cached by a hash of each element's text), so typing stays within budget.
- New tests (docs/testing.md): a fixture with known errors; names never flagged; dialect pairs (colour/color); grammar off in dialogue by default; checks with the network blocked; a 150-page benchmark in the worker.
- Licences: Apache-2.0 is compatible with OpenAct's GPL-3.0; the dictionaries' MIT AND BSD terms need their notices in About (docs/legal/legal-review.md, L8).

## Action items
1. [ ] v3 spike: Harper and nspell on the three samples and an owner script; count false positives on names and slang; time loading and checking on a 4×-throttled CPU.
2. [ ] Confirm harper.js's API for adding words (the reference lists `clearWords` and `exportWords`) and how its British dialect behaves.
3. [ ] Confirm where Harper's built-in dictionary comes from and its licence.
4. [x] Dialect defaults and grammar in dialogue: decided in D-031 (British for A4 and UK formats; grammar off in dialogue by default).
