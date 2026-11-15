# Decisions log

One entry per decision: date, decision, reason, source. Newest at the bottom. Change a decision by adding a new entry that supersedes the old one.

The app is **OpenAct**, chosen by the owner on 2026-11-08 (D-029). Until then its working title was Cue, which earlier entries were written under; they have been updated to the new name.

## Phase 0: decisions (2026-11-03)

The owner approved every recommendation at once ("go with all recommendations"), so these are the recommended defaults and phases 0–5 run without stopping. Each later phase still logs its decisions here.

### D-001 Who it's for first
UK stage writers first: pantomime and musical writers, and the amateur theatre companies they write for, starting with the owner. Screenwriters second: students, beginners and indie writers who want a free, unlimited tool with correct pages.
- Reason: stage writing looks underserved (tested in Phase 1), and the owner writes panto and musicals, so every build gets real use. Screenwriting has many free tiers, so OpenAct competes there on "no limits, correct pages, your files".
- Source: owner's creative-writing profile; Phase 1 research.

### D-002 Formats in the MVP and build order
All four profiles ship in the MVP: Screenplay, Stage play (UK layout by default, US layout as an option), Musical, Pantomime. The layout engine is built with the Screenplay and UK Stage profiles from the start; Musical and Pantomime layer on top of Stage.
- Reason: profiles are data on one layout engine, so each extra profile is cheap. Screenplay has the strictest, best-documented rules and anchors the golden tests; UK Stage is what the owner needs daily.

### D-003 Platform
Browser-based, installable PWA only for the MVP: Chrome, Edge, Safari and Firefox on desktop and tablet; phones for reading and light edits. A desktop wrapper is reconsidered after the MVP if real-file access on Safari or Firefox proves to be a blocker.
- Reason: £0 running cost, one codebase, offline after first load, instant updates.

### D-004 Default paper size
A4 by default; US Letter one click away. Browsers with an en-US or en-CA locale default to US Letter.
- Reason: UK-first audience; US screenplay submissions expect US Letter.

### D-005 Licence
The app: GPL-3.0-or-later. The format libraries (Fountain parser, layout engine, importers and exporters): MIT.
- Reason: copyleft keeps the app and any fork free for writers; permissive libraries let other tools adopt correct formatting. Peers' licences are checked in Phase 1.

### D-006 Co-writing
Not in the MVP. One writer per script; scripts are shared as files. The architecture keeps the door open (stable element ids, an editor with a Yjs binding). Revisit after the MVP based on interview demand.
- Reason: live co-writing needs a relay or signalling server, an ongoing cost (principle 6).

### D-007 Dogfood scripts
1. The owner's pantomime in progress (full length, two acts).
2. The owner's stage musical in progress.
3. A 10–15 page screenplay (the onboarding sample, extended).

Each must be writable in OpenAct, exportable as an A4 PDF and a Word file for a director, and able to round-trip through Fountain.

### D-008 AI
No AI in the MVP. Later, an opt-in collaborator that gives feedback on structure and continuity while the writer does the writing, using the writer's own API key, off by default. Script text leaves the device only when the writer turns it on.
- Reason: principles 1, 2 and 6; many writers distrust AI ghostwriting.

### D-009 Process
Owner tasks that the design can't do alone are tracked in docs/open-questions.md: running interviews, supplying reference PDFs, confirming the dogfood scripts.

## Phase 1: research (2026-11-03)

### D-010 Positioning
"Stage and screen, free": UK and US stage layouts, songs, panto structure, casting helpers, and A4 and Word output are where OpenAct differs; screenplay formatting, Fountain, FDX and PDF are where it matches the field.
- Reason: no tool found occupies the free, stage-and-screen, any-device position; free screenwriting alone is easy for competitors to copy.
- Source: docs/research/positioning.md, competitors.md, gaps.md.

### D-011 Format defaults where sources conflict
Dialogue 3.5 in wide; transitions right-aligned (starting at 6.0 in is a setting); Tab on a Character gives a Parenthetical, and on an empty Character a Transition; UK stage speech sits beside the name in a hanging indent (speech below the name is a setting; owner to confirm with a director); US stage names start about 4 in from the left edge (centred is a setting); revision colours follow Final Draft's order.
- Reason: follow Final Draft where it has a documented default; otherwise the most common practice, with the alternative kept as a setting.
- Source: docs/research/format-verification.md.

### D-012 Licence check
Beat, Story Architect and Scrite are GPL-3.0 and Trelby is GPL; Afterwriting is MIT. D-005 stands: a GPL-3.0-or-later app with MIT format libraries matches the open-source peers.
- Source: competitors.md S11–S14, S16.

### D-013 Format skill refinement
The script-formats skill now carries the verified rules, and its open points are tracked in format-verification.md. skill-creator's test loop was skipped because the golden tests in the build exercise these rules directly; revisit if build sessions misapply the skill.

### D-014 Research limits
fountain.io, Highland's knowledge base and web.archive.org were unreachable from the design sandbox, so Fountain rules were checked through search summaries and vendor pages were mostly read the same way. Prices conflict across aggregators and are given as ranges; re-verify them before launch.

## Phase 2: spec (2026-11-03)

### D-015 MVP cut
Moved to P1: DOCX file import, dual dialogue side by side, focus mode, doubling flags, routine and participation tags. Added to P0: storage safety, find and replace (including renaming a character), spell check in the script's language.
- Reason: the riskiest assumptions are trust in browser storage and page-break fidelity, so they get requirements and the build order tackles them first; the cut items are either covered more cheaply (paste covers most DOCX import) or unproven (panto tags).
- Source: docs/research/mvp-challenge.md; docs/prd.md.

## Phase 3: design (2026-11-03)

### D-016 Element shortcuts
Ctrl+Alt+1–9 (⌘⌥ on a Mac) set element types; Ctrl+Alt+M adds a note.
- Reason: browsers reserve Ctrl/Cmd+1–9 for switching tabs; Google Docs uses the same Ctrl+Alt pattern.

### D-017 Leaving the script
The script is a single tab stop (the current element). Tab inside it changes elements; Esc, then Tab, moves focus out.
- Reason: WCAG 2.1.2 (no keyboard trap) while keeping Tab for the element flow writers expect.
- Source: docs/design/accessibility.md.

### D-018 Fonts for stage formats
MVP stage, musical and panto profiles print in Courier Prime, so one character-grid layout engine serves every format. Proportional fonts (Tinos, Arimo) are P1, and the engine's text-measurement interface is designed for them from the start.
- Reason: Courier is accepted for stage manuscripts; proportional layout needs font-metric measurement shared by screen and PDF, which is work the MVP doesn't need.

### D-019 Visual direction
Page as hero on a quiet desk; ink and highlighter; Courier Prime for the script, Atkinson Hyperlegible Next for the interface; the current element named in the margin like a prompt copy. No existing design system in the account applies (Ask Where It Stops, Navyard Wharf, Penny Falls, Site Signal belong to other projects).
- Source: docs/design/visual-direction.md, design-system.md.

### D-020 Prototype
A clickable prototype is published as a private artifact (docs/design/prototype.md). It is a design tool, not the start of the codebase: the product is built fresh from the ADRs, reusing only its samples, profiles and copy.

## Phase 4: architecture (2026-11-08)

### D-021 Architecture accepted
ADR-0001 to ADR-0009 (docs/adr/) and the module map in docs/architecture.md. In short: ProseMirror editor; OpenAct Fountain as the one stored format; IndexedDB with persistence, real files on Chromium and backup prompts elsewhere; one pure layout engine for screen and paper; jsPDF and docx for exports; React with Radix for the chrome; a static PWA on Cloudflare's free tier; GPL app with MIT packages; sync and co-writing deferred along a set path.
- Changed from the kickoff's starting point: jsPDF replaces pdf-lib (no pdf-lib release since May 2022); `idb` replaces Dexie (simpler needs, 1 kB); plain CSS with tokens replaces Tailwind for the product.
- Source: npm registry data (2026-11-08), WebKit storage policy, web.dev file-saving guide, Context7 docs for jsPDF and prosemirror-view.

## Phase 5: tests and plan (2026-11-08)

### D-022 Test strategy and build order
Format logic and data safety carry the strictest gates (docs/testing.md). The build runs in 13 slices over two milestones (docs/plan.md): milestone 1 is "the owner writes the panto in OpenAct"; milestone 2 is the public MVP. Copyrighted reference PDFs and the owner's scripts stay in a git-ignored private fixture folder.
- Added dev dependency: fast-check (MIT) for property tests.

### D-023 Samples
Three original sample scripts (docs/samples/) serve onboarding and testing; they are the only content OpenAct ships.

## Phase 6: format library, submission review, offline, legal (2026-11-08)

### D-024 Format library
OpenAct offers fifteen format profiles in six groups (docs/formats.md): screenplay; one-hour TV drama, single-camera comedy, multi-camera sitcom, UK studio sitcom, vertical micro-drama; UK and US stage plays, UK and US musicals, pantomime; UK radio drama, audio drama and podcast; comic or graphic novel; treatment or outline. Each starts from an original template. Show- and network-branded templates, which Final Draft ships, are left out: they rely on others' trade marks and house formats. AV two-column scripts are P1 (later.md).
- Reason: the owner asked for "all the acceptable convention formats … like what you'd get on Final Draft"; Final Draft 12's bundled template list was the benchmark.
- Source: [Final Draft: templates in Final Draft 12](https://kb.finaldraft.com/hc/en-us/articles/15574005998356-What-templates-come-with-Final-Draft-12); the format sources in format-verification.md.

### D-025 Submission review is version 2
A "Ready to submit?" panel (R18) checks what drifts during development against a chosen submission target, shows its sources, and changes nothing unless the writer presses a fix. Rules are dated data with sources; an anonymous export serves blind reads. It ships after the MVP as version 2 (plan.md slice 14).
- Reason: formatting is guaranteed by the layout engine, but length, title pages, anonymity, leftovers and names drift with every draft, and the rules differ by target.
- Source: docs/research/submission-checks.md.

### D-026 Self-hosted fonts; offline editions of the prototype
The product loads nothing from other sites: fonts ship with the app. The prototype now builds a downloadable single file and an installable app as well as the hosted Artifact; all four modes passed the same test in Chromium.
- Reason: Google Fonts broke offline use and passes visitors' IP addresses to Google (held unlawful without consent by a Munich court in 2022).
- Source: docs/research/offline-check.md; docs/legal/legal-review.md (L11).

### D-027 Spelling and grammar approach (version 3)
Spelling with nspell and the wooorm dictionaries shipped with the app; grammar with Harper as an optional 8 MB download; OpenAct decides which elements are checked and builds a script dictionary from names; no auto-correct. Proposed in ADR-0010, to be confirmed by the v3 spike.
- Source: ADR-0010; npm registry data, 2026-11-08.

### D-028 Legal posture
Build clean-room (no copying of other apps' code, screens, icons, help text or templates); mention other products only to describe compatibility, with not-affiliated lines; clear the name before launch; have a UK IP and technology solicitor review the name, marketing copy and the FDX approach before launch; review sharing, sync, co-writing and AI features legally before building them.
- Source: docs/legal/legal-review.md (prepared with the legal plugin's risk-assessment and compliance-check frameworks; not legal advice).

## Phase 7: name and remaining tasks (2026-11-08)

### D-029 Name: ActOne (dropped on 2026-11-15, see D-045)
The owner chose **ActOne**. Written as one word with a capital O, never "Act-One" or "Act 1". Everything is renamed: the prototype, its offline editions and manifest, the docs, the skill, the overview page, the file convention (ActOne Fountain, with `[[actone: …]]` notes and an `/* actone {…} */` settings block) and package names (`@actone/*`). Prototype storage moved to new keys and reads the old ones once, so nothing saved is lost.
- Clash check (searches, 2026-11-08): no script-writing app uses the name, and no plain ACT ONE or ACTONE software mark appeared on US trade mark aggregators. Three things to manage: Runway's **Act-One**, a well-known AI tool that animates film characters ([Runway](https://runwayml.com/research/introducing-act-one)), so the name sits near an AI film product; **ACTONE GOVERNMENT SOLUTIONS**, a registered class 42 mark for workforce software ([Justia](https://trademarks.justia.com/881/88/actone-government-88188461.html)), a different field; and "Act One" as a heading in every TV script, which makes the name harder to own and to find in search.
- Mitigations: one-word spelling; always pair it with a descriptor in marketing ("ActOne, the free script editor"); search the UK IPO, EUIPO and USPTO registers in classes 9 and 42 before launch; file a UK mark if clear; have the launch solicitor confirm (legal review L5).

### D-030 Submission targets
Keep all ten targets. Defaults stay by format: UK new-writing theatre for UK stage and panto, US theatre for US stage, new musical programmes for musicals, BBC radio for UK radio, comics publisher for comics, agent or producer for the rest. More targets are added as data when writers ask.
- Reason: the owner asked for every task to be finished, so the recommended set stands until interviews show which targets writers use (user-research.md now asks).

### D-031 Version 3 defaults
British spelling for A4 and UK formats, American for US Letter and US formats, changeable per script. Grammar checks run on action and directions only; dialogue gets spelling only unless the writer turns grammar on for that script. Closes ADR-0010 action item 4.

### D-032 UK stage layout default (provisional)
Keep layout A, the speaker's name beside the speech, as the UK default, and build layout B, the name above the speech, as a setting in slice 8. The director's answer to docs/owner/uk-layout-choice.png can flip the default before slice 8 starts.

### D-033 Selling OpenAct (proposed; accepted in D-034; superseded by D-036)
The owner asked how to publish OpenAct for sale and what low price to charge. Recommendation: **£9.99 once, VAT included, no subscription**, taken through a merchant of record (Paddle or Lemon Squeezy) so tax, receipts and refunds are handled. Sell the packaged apps and support; keep the web version free and the source open under GPL-3.0, because the GPL lets anyone share a copy and the app has no accounts to gate it. Costs, steps and what changes legally are in docs/publishing-plan.md.
- It would change principle 1 ("Free for writers, always") and the premise of the legal review, so it stays **proposed** until the owner says yes. A yes updates CLAUDE.md, the plan (new slice 13b), the legal review and the overview page.
- Source: docs/publishing-plan.md (GNU selling FAQ; Paddle and Lemon Squeezy fee guides; GOV.UK VAT, trade mark and trading allowance pages; Consumer Contracts Regulations 2013; Consumer Rights Act 2015).

## Phase 8: selling and the first build slice (2026-11-11)

### D-034 OpenAct is sold: free on the web, £9.99 once for the packaged apps (superseded by D-036)
Accepts D-033. The owner asked for a plan to publish OpenAct for sale, was shown the recommendation, and replied "continue". To reverse it, add a new entry; nothing has been built on it yet.
- **What is sold:** the packaged apps (store listings and a direct download) with email support, at £9.99 once, VAT included, no subscription. **What stays free:** the web app, with every feature, and the source code. Nothing in the app is locked, and there are no accounts, licence keys or nags.
- **Payment:** a merchant of record, Paddle first. Its help pages say individuals and sole traders need only an identity check, and that the site must be live with terms, a refund policy and a privacy notice. Lemon Squeezy is being folded into Stripe Managed Payments, so it is not the place to start.
- **Principle 1** is reworded in CLAUDE.md. The descriptor from D-029 becomes "OpenAct, the script editor for stage and screen", because "free" beside a priced product invites a misleading-claim complaint.
- **Follow-ups:** plan slice 13b (selling set-up); PRD R20; the legal review is reissued with the trader duties (L18 to L22) and higher scores for the name (L5) and marketing claims (L13).
- Source: docs/publishing-plan.md; docs/legal/legal-review.md.

### D-035 Repository scaffold (slice 0)
pnpm 10 workspace with `packages/*` (MIT) and `apps/web` (GPL-3.0-or-later); TypeScript 7; Vite 8; Vitest 5; React 19; Node 22. Packages are read from source through an `@openact/source` export condition, so tests and the app need no build step first, and publish built files from `dist`.
- **Biome replaces ESLint:** typescript-eslint 8.72 supports TypeScript only below 6.1, and the architecture chose TypeScript 7. Biome (MIT OR Apache-2.0) lints and formats in one dependency and has accessibility rules for JSX.
- **A one-week release delay** (`minimumReleaseAge`) guards against hijacked package releases.
- CI (GitHub Actions) runs lint, type-check, tests and build. The same commands pass locally; the workflow has not run on GitHub yet because no repository exists.
- Source: npm registry data, 2026-11-11.

## Phase 9: free again, and a better phone layout (2026-11-12)

### D-036 OpenAct is free: D-034 reversed
The owner asked for OpenAct to be free. Supersedes D-033 and D-034; nothing had been built on them.
- **Free for everyone:** the web app and any installed or packaged version, with every feature, no account, nothing to buy. Principle 1 goes back to "Free for writers, always".
- **Withdrawn:** plan slice 13b (selling set-up); PRD R20 becomes "Getting OpenAct" (free, with install help); the "Sales cover the fixed costs" measure; the trader rows in the legal review (L18 to L22), which stay only as notes in case selling is ever reconsidered. The name (L5) and marketing claims (L13) drop back to YELLOW.
- **The descriptor** goes back to "OpenAct, the free script editor for stage and screen" (D-029).
- **Kept:** the name, slice 0 and its tooling (D-035), and docs/publishing-plan.md as research, marked superseded.
- Source: the owner's request, 2026-11-12.

### D-037 Prototype layout pass for phone and desktop
- **Starting a script:** a "New" button in the top bar on every screen size and in the phone's bottom bar. The start screen leads with Blank screenplay and Blank stage play and says the new script replaces the one on screen.
- **Leaving things:** on a phone, dialogs fill the screen with a labelled Close button that stays in reach, and the element bar has a Done button that closes the keyboard and brings back the navigation bar.
- **Phone navigation:** a bottom bar with Outline, Details, Review and New. Format, paper and the title page move into Details under "Script settings".
- **Desktop:** both side panels can be hidden (remembered per browser), and the right panel has Details and Review tabs, so Review no longer replaces the details.
- Source: the owner's feedback ("hard to start new document / exit easier"); WCAG 2.2 target size (2.5.8).

### D-038 The element bar is always on screen, on phone and desktop
The owner asked for moving between elements to be much easier and always available, starting from the phone's bar. Decided with the owner, question by question (2026-11-12):
- **Always there:** on a phone the bar sits above the Outline, Details, Review and New bar (the navigation hides only while the on-screen keyboard is open). On desktop and tablet the same bar is docked under the page, above the status line.
- **First key, the current line's type** (for example "Action ▾"): opens the list of every type in the format and changes this line in place. Tab and Shift+Tab work as before.
- **Smart order:** the other keys start with what usually comes next, worked out from the format's own Enter and Tab rules; the rest follow in the format's order. The current type is filled in; the likeliest next is outlined in the accent colour.
- **Tapping a key:** an empty line becomes that type; a line with text gets a new line of that type below it.
- **Cast names:** on an empty character line, the bar shows the cast, most recent speakers first, with an "Elements" key to go back. A name fills the cue and moves on to the dialogue (or lyrics, in a song).
- **Resume:** tapping a key when you're outside the script goes back to the last line you edited. On a phone, Done (a keyboard icon) hides the keyboard.
- **Shortcuts:** Alt+1 to Alt+9 (Ctrl on a Mac) in the format's own order, so they never move as the bar reorders. Browsers keep Ctrl+1 to Ctrl+9 for switching tabs, so Alt is used instead. The badges show while the key is held.
- The type list opens on a full click, not on press, so lifting the pointer over the list can't choose a type by accident (found in testing).
- Source: the owner's answers; WCAG 2.2 target size (2.5.8); prototype/checks/element-bar.cjs.

### D-039 A calm, precise visual system
The owner found parts of the look "hokey pokey", with the element bar as the example. Decided with the owner (2026-11-15), after an audit that found six corner styles, about twelve text sizes and a bordered pill for almost every control.
- **Direction:** a calm, precise tool, not a stationery or backstage look. Colours, fonts and the "margin speaks" note are unchanged; chrome is quieter (a little lighter panels, hairlines in place of boxes).
- **The system:** two radii, four text sizes, a 4px grid, one control height, flat surfaces, the accent only for what is current (docs/design/design-system.md).
- **Element bar:** a single segmented strip, not pills (D-038 behaviour unchanged).
- **Review** moves out of the top bar into the side panel's Details and Review tabs (and stays in the menu and the phone's bottom bar).
- **Wordmark:** the spike mark with OpenAct in Courier Prime bold; the full stop goes. Chosen from five options.
- **Lists, not cards:** the start screen's formats are two-column list rows with hairlines; Review items are hairline rows with a coloured edge; section names are sentence case.
- Source: the owner's feedback and screenshots; WCAG 2.2 target size (2.5.8) kept: 32px controls on desktop, 44px on phones.

## Phase 10: your own formats (2026-11-15)

### D-040 Import your own formats, and a finder for common ones
The owner asked for writers to import official templates and to search for common formats OpenAct lacks. Decided with the owner by question (2026-11-15):
- **What can be imported:** a layout-rules file (an OpenAct format file, `.openact-format.json`), a Final Draft file or template (`.fdx`, `.fdxt`), and a Word document or template (`.docx`, `.dotx`). Only the page setup and element layouts are read; no script text, macros or other content is used, and nothing is run. Older `.doc` and `.dot` files are refused with a message.
- **A format is a built-in plus its own layout.** The built-in it is "based on" supplies the element list and the Enter and Tab flow; the import supplies margins, paper and each element's left edge, width, blank lines before, capitals, bold, italic, underline, alignment, double spacing and page breaks. A page size other than A4 or US Letter uses the nearer one, with a note.
- **Preview first.** Every import goes through a screen with a live sample page, where the writer corrects values, matches Word styles to elements, names the format and chooses "Save" or "Save and use for this script". Anything unreadable is flagged, not guessed.
- **Storage:** on this device (key `openact-formats`), under "Your formats" in the menus and on the Start screen; export and import as a small format file; edit and delete (delete asks twice). A script that uses a format missing from this device opens in the format it was based on, and says so.
- **Finder:** a catalogue built into OpenAct (25 entries at first, in four groups: competitions and schemes, theatre and publisher house styles, screen industry standards, other forms). It is searched on the device and sends nothing (D-026). Each entry says whether OpenAct covers it, is close, or can't draw it yet, offers to start a script in the nearest format, and links to the organisation's own page; a link opens in the browser only when clicked. Entries that couldn't be confirmed were left out or listed without a link.
- **Clean room (D-028):** OpenAct ships no one else's template. It reads a file the writer already has, the way it reads a Fountain file. The finder names organisations only to describe compatibility, and the About screen says OpenAct isn't affiliated with any of them.
- **Dependency:** fflate 0.8 (MIT) reads the zip container of Word files. Only two named parts are unpacked, each capped at 8 MB; files over 5 MB are refused; XML with entity declarations is refused.
- **Unverified:** the Final Draft indent units (a right indent is the position of the right edge, from the left of the page) come from memory of public example files and are logged in format-verification.md; the preview is how a writer catches a wrong reading.
- **Also fixed:** starting a new script did not save until the first edit; it now saves at once.
- Source: the owner's request and answers; docs/research/format-verification.md; finder links checked by site-restricted search, 2026-11.

### D-042 Real exports: PDF, Word, Fountain and Final Draft files
The owner said export is the point of the app, so the prototype now makes real files (2026-11-15). Checked against the page view, not by eye alone: every line of every format's PDF sits within 0.04 inch of where the page view puts it (`prototype/checks/export-check.cjs` and `export-verify.py`).
- **PDF:** drawn from the same layout as the page view (jsPDF 4.2, MIT), with Courier Prime embedded (SIL OFL 1.1, from the project's own TrueType files). Title page, page numbers, (MORE), (CONT'D), scene, song, page and panel numbering, cue numbers and the hanging speaker layouts match the screen.
- **Word:** a real `.docx` built directly (fflate) with a named paragraph style per element ("OpenAct Dialogue"), the right paper and margins, a title page with the contact lines at the foot, page numbers from the second script page, and Courier Prime embedded in the file (obfuscated font, ECMA-376). Two modes: **flowing** (default, best for editing: Word sets the page breaks) and **keep the PDF's page breaks** (fixed: every line written as the PDF breaks it, with (MORE) and (CONT'D); matches the PDF page for page in all fifteen formats and the samples; `checks/export-verify-docx.py`, rendered by LibreOffice). Real Word has not been tried: Word's own line placement may differ by a hair.
- **Fountain and Final Draft:** real files. The Final Draft indent units remain unverified (D-040).
- **Saving:** offline and installed editions download directly. The hosted preview uses the page's save prompt, which accepts a short list of file types, so Fountain is saved as `.fountain.txt` and Final Draft inside a `.zip`; a declined or blocked save says so.
- **Anonymous copies:** no author in the PDF's author field, the Word file's properties, or the Final Draft and Fountain text (checked).
- **Characters Courier Prime lacks** (for example ♪, arrows, Cyrillic) are listed in a warning when exporting a PDF; the Word file keeps them.
- **Bugs found by checking and fixed:** a bundler step damaged the embedded font so PDFs fell back to Times; a speech longer than two pages lost everything after page 2 (the layout engine split an element only once, now it splits across as many pages as needed, at a sentence or else a word); a double-spaced speech beside a speaker was half a line too low on screen.
- **Dependencies:** jspdf 4.2.1 (MIT; its optional canvg, html2canvas and dompurify are not bundled), fflate 0.8.2 (MIT).
- Source: prototype/checks/export-*.cjs, .py; docs/samples/exports/.

## Phase 11: release, brand and video games (2026-11-15)

### D-041 The prototype and its release package are GPL-3.0-or-later
The free preview ships under the same licence as the app (D-005, D-036). The source goes in the package (a zip with BUILDING.txt), every third-party notice is generated from the 95 runtime packages (all GPL-compatible, checked), fonts stay under SIL OFL 1.1, and a SHA256SUMS file lets anyone check the download. The static site loads nothing from other sites. Source: `release/`, docs/legal/legal-review.md.

### D-043 Logo, depth system and the free-distribution package
- **Logo:** the spike mark (an L of stage tape: two strips, the lower one deeper) with the name set in Courier Prime Bold outlines. One script (`brand/build-brand.py`) makes the lockups, icons (including a maskable one) and favicons, so they stay in step. `brand/brand-guide.html` shows the rules and contrast pairs.
- **Depth:** one light from the top left. Three elevation tokens (`--e1`, `--e2`, `--e3`) plus the sheet shadow, blue-tinted shadows, and a lifted surface with a top highlight in dark mode. Chrome stays flat; only the page, dialogs and menus lift.
- **Package:** `release/build-release.py` builds the offline edition, the installable app, the source zip, notices, privacy note, checksums and a landing page; `release/check-release.cjs` verifies it from a fresh unzip (checksums, offline, service worker, site links, axe).
- Source: brand/README.md, release/.

### D-044 Video game writing
The owner asked for a fully formed video game option (2026-11-15; plan option A approved). It is a sixteenth format, **Video game**, in a new "Games" group.
- **Elements:** Node (scene heading), Context note, Character with a recording line ID, Delivery, Line, Player choice, Condition or flag (IF, IF NOT, SET, CLEAR), Go to (a node, or END), Bark ("NAME: line"), Quest beat, Lore entry. Enter and Tab follow the writing order; the element bar and shortcuts work as in other formats.
- **Branch map:** a Branches tab (first tab for this format) draws the nodes and their jumps, lists each node with what it leads to, and checks the joins. A jump to a missing node and two nodes with one name are "fix"; a node with no way out, a node nothing leads to, a choice with no reply, text after the last jump, a flag that is checked but never set, and a condition OpenAct can't read are "consider". The drawing is a picture of the list, which is the accessible version.
- **Recording line IDs:** SPEAKER_001, counted per speaker in script order, and **lockable**: Lock keeps every ID where it is, so a recorded file never loses its name when lines are inserted or reordered; new lines count on from the highest locked number. A duplicate locked ID is a "fix".
- **Exports:** PDF and Word as for any format (matched page for page, within 0.02 inch); Fountain; a **recording sheet** (CSV, UTF-8 with a byte-order mark: line ID, type, node, speaker, text, delivery, context, condition, recorded, notes; cells that look like formulas are defused); **Ink**, **Yarn Spinner** and **OpenAct game JSON**. The Ink file is compiled and played with inkjs in the checks (the sample's 14 paths reach an end, and the gated line plays only where its flag is set). Yarn files are checked structurally only: no Yarn Spinner compiler was available. Final Draft export is not offered for games.
- **Review:** a "Game studio hand-off" target: joins, flow, lines over 40 words (a rule of thumb, not a standard), unlocked IDs, and a size note; manual items ask about the studio's own template and engine. Studios set their own rules, so the sources are marked as OpenAct house checks.
- **Clean room (D-028):** Ink and Yarn Spinner are named only to describe compatibility; the exporters are written from their public syntax. Both are MIT licensed and neither is shipped. inkjs (MIT) is used only by the checks.
- **Not in this version:** importing Ink or Yarn files, engine plugins, a playable preview, and localisation tables beyond the recording sheet.
- Source: prototype/checks/game-check.cjs, game-edge.cjs; docs/samples/games/.

### D-045 Name: OpenAct
The owner found that **ActOne was taken** and chose **OpenAct** instead (2026-11-15). Written as one word with capital O and capital A, never "Open Act" or "Open-Act". Everything is renamed: the prototype and its offline editions, the manifest, the logo wordmark, the docs, the format skill, the overview page, the release package and the file conventions (OpenAct Fountain with `[[openact: …]]` notes, the `.openact-format.json` format file, `openact-*` storage keys), and package names (`@openact/*`). Earlier entries above were renamed with it, except D-029 and the name research, which describe ActOne as it was.
- **Not yet cleared:** nobody has searched the registers for OpenAct. Do that before launch (docs/owner-tasks.md). "Open" names are common in open-source software, so expect near-matches and read them.
- **Saved work:** the prototype also reads the earlier ActOne storage keys once, so a script written before the rename is not lost.
- Source: the owner's instruction, 2026-11-15.

