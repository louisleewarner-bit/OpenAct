# Build plan

One vertical slice per session, using PROMPT-2-build-slice.md. Tick a slice only when its done-when line holds. Requirements refer to docs/prd.md, tests to docs/testing.md, decisions to docs/adr/.

## Milestone 1: write a panto in OpenAct (slices 0–8)

- [ ] **0. Repository.** pnpm monorepo (packages/*, apps/web), licences (ADR-0008), CI running lint, type-check and tests, the script-formats skill and CLAUDE.md in place.
  Done when: CI passes on an empty package and an empty app, and both licence files are present.
  *Built 2026-11-11 (D-035): lint, type-check, tests and build pass locally with the CI commands, and both licence files are in place. Tick this once the workflow passes on GitHub.*

- [ ] **1. Model and OpenAct Fountain.** Element and script types, profiles as data, `@openact/fountain` parser and serialiser, `docs/openact-fountain.md`, samples moved to `packages/samples`.
  Done when: every Fountain rule in format-verification.md has a passing test, the three samples round-trip identically, and the property test is stable over 1,000 generated scripts.

- [ ] **2. Layout engine.** `@openact/layout` with the screenplay and UK stage profiles, incremental cache, page furniture.
  Done when: every pagination rule has a passing golden test, Last Wash splits Nell's speech with (MORE) and (CONT'D) on A4 and US Letter, and the 150-page bench runs in under 200 ms.

- [ ] **3. Editor.** ProseMirror schema, the always-on element bar (D-038), the element-flow keymap for every profile, autocomplete, undo, single tab stop (ADR-0001).
  Done when: flow tests generated from the profile tables pass in Chromium, WebKit and Firefox, and the screen-reader spike notes are recorded in ADR-0001.

- [ ] **4. Page view.** Page frames, numbers, (MORE) and (CONT'D) as decorations from the layout output; A4 and US Letter; fit-to-width.
  Done when: page-view breaks equal the layout output for every fixture, and typing in the 150-page fixture meets the 50 ms budget with 4× CPU throttling.

- [ ] **5. Storage.** IndexedDB autosave, snapshots, persistence request, real files on Chromium, downloads and uploads elsewhere, backup prompts; open Fountain files (ADR-0003).
  Done when: 20 of 20 crash trials lose at most two seconds, snapshot restore works, and the persistence-refused prompt appears.

- [ ] **6. PDF export.** jsPDF renderer with embedded Courier Prime (ADR-0005).
  Done when: PDF text positions match the layout output within 0.5 pt for every fixture, fonts are embedded, and the private reference PDFs match or have logged differences.

- [ ] **7. Outline, title page, cast list, notes, find and replace.** R2, R5, R6, R9.
  Done when: every acceptance criterion of R2, R5, R6 and R9 passes as a Playwright test.

- [ ] **8. Stage, musical and panto.** US layout setting, songs and lyrics with numbering, scene types and warnings, song list (R3, R7).
  Done when: R3 and R7 criteria pass, the panto and musical samples render with the format-verification defaults, and the owner has confirmed the UK layout with a director.

**Milestone 1:** the owner writes the panto in OpenAct and exports a PDF (dogfood task 1 starts).

## Milestone 2: MVP release (slices 9–13)

- [ ] **9. Format library.** Television, audio, comics and documents profiles with their numbering and furniture: act page breaks and END OF ACT, multi-camera scene letters and cast lines, radio cue numbers and double spacing, comic page, panel and balloon numbering, episodes (R3, D-024, docs/formats.md).
  Done when: every rule in format-verification.md's Television, Audio, Comics and Documents tables has a passing golden test or a logged decision, every template renders, and FDX round-trips the screen and audio profiles.
  Also in this slice: imported formats and the finder (R21, D-040), built from the prototype's `custom.ts`, `import-format.ts` and `finder.ts`. Done when: `checks/import-format.cjs` and `checks/finder.cjs` equivalents pass against the real editor, a format's layout changes the exported PDF, and a script using a missing format opens in its base format.

- [ ] **10. Counts, chart and paste.** Line counts and the scene chart (R8); paste with detection and the review step (R10).
  Done when: R8 criteria pass and detection types at least 95% of the paste corpus correctly.

- [ ] **11. Word and Final Draft.** DOCX export; FDX import and export (R10, R11).
  Done when: DOCX structure tests pass, the manual Word, LibreOffice and Google Docs check is logged, and FDX round trips pass on the owner's real files.

- [ ] **12. Offline, install and phone.** Service worker, install prompts, update prompt, self-hosted fonts, continuous view and element bar (R13, R14, D-026).
  Done when: every P0 flow passes with the network off, the four-mode check in docs/research/offline-check.md passes in Chromium, WebKit and Firefox, no request leaves the app's origin, and the phone suite passes on iPhone and Pixel emulation.

- [ ] **13. First run, accessibility and release.** Start dialog and samples (R17), accessibility polish (R15), About screen (licences, source link, no-warranty and not-affiliated lines, privacy notice), security review and deploy checklist.
  Done when: axe reports nothing serious or critical in three browsers, the VoiceOver and NVDA passes are logged, at least four of five first-time testers format a page in under two minutes, the legal-review actions for launch are done (docs/legal/legal-review.md), and /security-review and engineering:deploy-checklist are complete.

**Milestone 2:** public MVP (version 1) on a free static host, with the OpenAct public and free; all three dogfood scripts delivered (D-007).

## Milestone 3: version 2, ready to submit (slice 14)

- [ ] **14. Submission review.** `@openact/review` lifted from the prototype's `review.ts` and `review-data.ts`; the review panel; the anonymous export; targets and sources as data (R18, D-025).
  Done when: every check in docs/research/submission-checks.md has a fixture test for each status it can return; an anonymous PDF holds no writer name in its text or its metadata (checked by extracting both); every source URL has been opened by a person and confirmed or corrected; and axe passes with every row open.

**Milestone 3:** version 2 released; the owner runs the review on a real submission.

## Milestone 4: version 3, spelling and grammar (slices 15–18)

- [ ] **15. Language engine and spike.** `@openact/language`: nspell in a worker, British and American dictionaries, the script dictionary and element filter; the Harper comparison (ADR-0010 action items).
  Done when: a fixture's planted errors are all found, no character name, location or song title is flagged in the three samples, and checking a 150-page script never delays a keystroke beyond R16's budget.

- [ ] **16. Editor marks and suggestions.** Underlines as decorations, a suggestions popover, add to dictionary, ignore, and a keyboard command to move to the next issue.
  Done when: every action works by keyboard and is announced to screen readers, and marks update only for edited elements.

- [ ] **17. Grammar download.** Harper as an optional download, cached for offline use; grammar on action and directions, off in dialogue by default.
  Done when: grammar works with the network off after the download, and turning it off removes every grammar mark.

- [ ] **18. Review integration and settings.** The Language section of the review lists every issue with jump links; per-script dialect, dictionary and ignore lists saved in OpenAct Fountain.
  Done when: R19's criteria pass as Playwright tests, and the settings round-trip through Fountain.

**Milestone 4:** version 3 released.

## After version 3
P1 items in docs/later.md, in the order interviews support. Sharing, sync, co-writing and AI features need a legal review first (docs/legal/legal-review.md, L17).
