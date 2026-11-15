# OpenAct

A local-first app for writing scripts: screenplays, TV, stage plays, musicals, pantomime, audio drama and comics. Free for everyone (D-036). Called Cue while it was designed, then ActOne (D-029), which turned out to be taken; renamed OpenAct on 2026-11-15 (D-045). Write the name as one word, never "Open Act" or "Open-Act".

## Principles (trace every design decision to one)
1. Free for writers, always: unlimited scripts, every export, no watermark, no account, nothing to buy. The source stays open.
2. Local-first: works offline; scripts stay on the writer's device until they choose to export, share or sync.
3. Open formats: Fountain is first-class; FDX and DOCX in and out; PDF out.
4. Format is the product: pages look right first time.
5. The page is the interface: keyboard-first, smart Tab/Enter flow, chrome out of the way.
6. £0 running cost: static hosting; anything with an ongoing cost is optional and isolated.
7. Accessible (WCAG 2.2 AA), quick on an old laptop, usable on a phone.

## Where things live
- Format rules: the script-formats skill (.claude/skills/script-formats/). Read it before any format work.
- Decisions: docs/decisions.md (date, decision, reason, source). Log every new decision there.
- Product spec: docs/prd.md; parked ideas: docs/later.md; owner tasks: docs/open-questions.md.
- Research: docs/research/ (submission rules: submission-checks.md; offline results: offline-check.md). Design: docs/design/. Architecture: docs/architecture.md and docs/adr/.
- Formats: docs/formats.md lists the sixteen profiles. Legal: docs/legal/legal-review.md.
- Publishing: docs/publishing-plan.md (superseded by D-036; kept for its research if selling is ever reconsidered).
- Code: `packages/*` (MIT, pure TypeScript, no DOM) and `apps/web` (GPL). `pnpm run ci` runs lint, type-check, tests and build; `CONTRIBUTING.md` has the rest.
- Tests: docs/testing.md. Build order: docs/plan.md (one vertical slice per session; use PROMPT-2-build-slice.md).
- prototype/ is a design prototype, not the start of the codebase (D-020); reuse its samples, profiles and copy only.

## Working agreements
- Facts about competitors, formats and libraries carry a source; unsourced claims are marked "unverified".
- Format ambiguity: follow the script-formats skill, then an established tool's behaviour, and log the choice.
- Each dependency gets a one-line justification and its licence in docs/architecture.md.
- Clean room (D-028): never copy another app's code, screens, icons, help text, templates or sample scripts, and never decompile one. Mention other products only to describe compatibility ("opens Final Draft .fdx files").
- Nothing loads from other sites at run time: fonts and libraries ship with the app (D-026).
