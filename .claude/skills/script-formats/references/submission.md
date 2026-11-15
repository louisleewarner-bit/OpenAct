# Submission review ("Ready to submit?")

Version 2 (PRD R18). Checks for what drifts while a script develops, against a chosen submission target. Research and every source: docs/research/submission-checks.md. Prototype code: `prototype/src/cue/review.ts` (checks) and `review-data.ts` (targets and sources), both pure TypeScript to move into `packages/review`.

## Rules for checks
- A check never changes the script. A fix button may, and only for safe, reversible changes (remove the draft date, add to the cast list, make exports anonymous), each one undo step.
- Every result cites at least one source id from `SOURCES`. A house check with no outside source cites `cue` and says so.
- Status: **fix** for a broken rule or something a reader notices at once; **consider** for a convention (dismissible per script); **pass**; **note** for information. Estimates (running time) never return fix.
- Results list where they occur (page and a snippet) so the writer can jump there.
- Formatting (indents, page breaks, (MORE)/(CONT'D)) is the layout engine's job, not the review's.

## Targets
Each target is data: name, group, the formats it suits, whether it is read blind, whether spec conventions apply, a link to the current rules, the date it was researched, and its "Before you send" items with sources. Blind targets switch on the anonymity checks and the anonymous export (title only on the title page; no credit, writer, contact, source or date; no PDF author).

## Adding or updating a target
1. Find the body's current rules and open the official page from a normal browser.
2. Add or edit the target in `review-data.ts` and its sources in `SOURCES`, with kind and date.
3. Add the target's rules to the matching table in submission-checks.md.
4. Add a fixture test for any new length rule or check.
5. Log the change in docs/decisions.md if it changes what a check does.

Review every target once a year; competitions change their rules each cycle.
