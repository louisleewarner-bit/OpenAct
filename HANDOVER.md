# Handover: OpenAct, end of the design phases (2026-11-08)

For the next session, human or agent. This page points to the documents that hold the detail; it doesn't repeat them.

## Where things stand (updated 2026-11-12)
- **Name:** OpenAct (D-029), one word.
- **Free:** OpenAct is free for everyone (D-036, reversing D-034). The selling plan is kept as research only; the legal review is back on the free premise.
- **Prototype layout:** a "New" button everywhere, a phone bottom bar, full-screen dialogs with a labelled Close, a Done key above the keyboard, and hideable side panels with Details and Review tabs on desktop (D-037).
- **Real exports (D-042, R22):** PDF, Word (flowing, or the PDF's page breaks), Fountain and Final Draft files, all checked against the page view. To test: `node prototype/checks/export-check.cjs`, then `python3 prototype/checks/export-verify.py` and `export-verify-docx.py` (the Python checks need pymupdf, python-docx and LibreOffice). Not tried: real Word, real Final Draft.
- **Video game writing (D-044, R23):** a sixteenth format with nodes, choices, conditions, jumps, barks, quest beats and lore; a Branches tab (map, checks, lockable recording line IDs); recording-sheet CSV, Ink, Yarn Spinner and JSON exports. Test: `NODE_PATH=<scratch>/node_modules SP=<scratch> node prototype/checks/game-check.cjs` (needs `npm i inkjs` in the scratch folder) and `game-edge.cjs`. Yarn output is checked structurally only.
- **Your own formats and the finder (D-040, R21):** import an OpenAct, Final Draft (.fdx, .fdxt) or Word (.docx, .dotx) file, check a sample page, save under Your formats; export, edit, delete. "Find a format" searches 25 built-in entries with verified links. Code: `prototype/src/cue/custom.ts`, `import-format.ts`, `finder.ts`, `src/formats.tsx`. The Final Draft indent units are unverified (format-verification.md): test with a real `.fdxt`.
- **Look:** the calm, precise system (D-039): hairlines, two radii, four text sizes, a spike-mark wordmark; Review lives in the side panel tabs. `prototype/checks/shots-look.cjs` takes before and after screenshots.
- **Element bar:** always on screen on phone and desktop, likeliest next element first, cast names on a character line, Alt+1–9 shortcuts (D-038). The product version belongs in slice 3 (editor) and slice 12 (phone).
- **Design:** complete for version 1 and version 2; version 3 planned with defaults decided (D-031).
- **Build:** slice 0 (the repository skeleton) is built (D-035). `pnpm run ci` passes locally: lint, type-check, two tests, build. It is **not ticked** in plan.md because the workflow hasn't run on GitHub: no project repository exists. The only repository visible to this session is an unrelated backup; don't push there.
- **Live pages** (private until shared): overview https://claude.ai/artifact/PWSgaPQibzbbLoXPjbaypX, prototype https://claude.ai/artifact/6EzKdcrFGEGHoqQnbY5eJM.
- **Offline prototype:** `prototype/offline/dist/openact-offline.html` and `prototype/offline/dist/pwa/`.

## Next
1. Owner creates an empty private GitHub repository; push the kit, confirm CI is green, tick slice 0.
2. Slice 1 (model and OpenAct Fountain): plan first, as PROMPT-2 says, then build test-first.
3. Owner tasks: `docs/owner-tasks.md`, section 10 first (the repository), then the name.

## What this phase produced
| Work | Where |
|---|---|
| Submission review research, every rule with its source and evidence level | `docs/research/submission-checks.md` |
| Review in the prototype: checks, targets, sources, panel, anonymous export | `prototype/src/cue/review.ts`, `review-data.ts`, `prototype/src/review.tsx`; export option in `dialogs.tsx` |
| Spec, plan and decisions for version 2 | PRD R18; plan slice 14; D-025; `docs/design/flows.md` flow 9; `docs/design/ux-copy.md` |
| Version 3 preparation | ADR-0010; PRD R19; plan slices 15–18; testing.md; architecture.md (`packages/language`) |
| Legal review of free distribution | `docs/legal/legal-review.md`; D-028; clean-room rule in CLAUDE.md |
| Offline and installed-app test | `docs/research/offline-check.md`; D-026; `prototype/artifact/build-offline.py`; `prototype/offline/` |
| Format library documentation | `docs/formats.md`; skill references `television.md`, `audio.md`, `comics.md`, `documents.md`, `submission.md`; new tables in `format-verification.md`; sources S30–S34; D-024 |
| Name: **OpenAct**, with its clash check; everything renamed (storage keys migrate) | D-029; `docs/research/names.md` |
| Remaining rules confirmed; targets, version 3 defaults and a provisional UK layout default decided | `submission-checks.md`; D-030 to D-032 |
| Rules confirmed on the official sites (second pass); Fountain rules confirmed | `submission-checks.md` (marked Confirmed), `format-verification.md`, `review-data.ts` |
| Owner task pack with ready-to-send text; UK layout sheet for the director | `docs/owner-tasks.md`, `docs/owner/uk-layout-choice.png` |
| Browser check scripts | `prototype/checks/` (see its README) |
| Selling OpenAct: researched, accepted, then withdrawn; OpenAct is free | `docs/publishing-plan.md` (superseded); D-033, D-034, D-036 |

Verified in this session: `tsc -b` passes; the review gives the expected results on all fifteen templates and on a flawed fixture; axe reports no violations with every row open, in light, dark and phone layouts; the four offline modes behave the same in Chromium.

## Next session: pick one
**A. Start the build.** Paste `PROMPT-2-build-slice.md`; it takes slice 0 from `docs/plan.md`. Build fresh from the ADRs. From the prototype, reuse only its profiles, samples, copy, and at slice 14, `review.ts` and `review-data.ts`, which are pure TypeScript written to move into `packages/review`.

**B. Owner tasks first.** `docs/owner-tasks.md` walks through each one. The ones that block launch, not the build: choose and clear a name; confirm the three remaining rules (BBC, Bruntwood's current year, the Nicholl logline); book a solicitor's review. Interviews and reference PDFs feed the golden tests from slice 2 onwards.

## Things a fresh agent needs to know
- **Tooling:** Biome, not ESLint, because typescript-eslint doesn't support TypeScript 7 yet. pnpm installs only releases at least a week old (`minimumReleaseAge`), so the very latest version of a package may be skipped on purpose. Workspace packages resolve from source through the `@openact/source` export condition.
- **The rename:** product text, the file convention (`[[openact: …]]` notes, the `/* openact {…} */` settings block), package names (`@openact/*`) and storage keys now say OpenAct. The prototype reads its old `cue-*` storage keys once, so earlier saves survive. Two things deliberately keep "cue": the prototype's internal source folder `prototype/src/cue/`, and theatrical cues (sound cues, cue numbers, the `cue-num` style), which are script terms, not the brand. Write the name as one word, never "Act-One": Runway's AI tool is called Act-One (names.md).
- **Network in this sandbox:** web search and the npm registry work, but direct fetches of oscars.org, austinfilmfestival.com, writeaplay.co.uk, royalcourttheatre.com, darkhorse.com, finaldraft.com and fountain.io are blocked by the environment's network policy (a request to allow them was rejected), and bbc.co.uk refuses automated readers. Searches restricted to one site (`allowed_domains`) quote official pages and were used to confirm the rules. Web search has a usage limit; it ran out once this session and reset at 23:00 UTC.
- **Rebuild the prototype** with `prototype/artifact/rebuild.sh`. It writes the hosted fragment, the local harness and both offline editions. Publish `prototype/artifact/openact-prototype.html` to the prototype URL above.
- **Rebuild the overview** with `python3 overview/build-pack.py <dir>`, where `<dir>` holds `pack-desktop.jpg`, `pack-phone.jpg`, `pack-review.jpg` and `pack-review-phone.jpg`. The scratchpad copies won't survive; regenerate them with `prototype/checks/shots-pack.cjs` and `shots-review.cjs`.
- **Rules data is dated.** Each target in `review-data.ts` carries "researched" and a rules link. Update yearly, following the steps in the skill's `references/submission.md`.
- **Templates model good practice.** Night Shift, Open Plan and the stage-play templates were edited this phase so they pass the review's character and cast checks; keep them passing.
- **Prototype quirk:** review settings and set-aside checks are stored on the script and make undo steps. Fine for the prototype; the product should save settings without adding undo steps.

## Suggested skills
| When | Skill |
|---|---|
| Planning any build slice | `anthropic-skills:cunning-plan` |
| Format, review or interchange work | `script-formats` (read its reference for the task first) |
| Running and checking the app | `run` |
| After each slice | `code-review`, then `simplify` |
| The ADR-0010 spike (version 3) | `engineering:architecture` |
| Test design for slices 12, 14 and 15–18 | `engineering:testing-strategy` |
| After choosing a name, and before sharing, sync or AI features | `legal:legal-risk-assessment`, `legal:compliance-check` |
| After interviews | `design:research-synthesis` |
| Republishing the overview or prototype pages | `artifact-design` |
| Before release | `security-review`, `engineering:deploy-checklist` |
