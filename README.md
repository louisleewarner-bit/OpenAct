# OpenAct

A local-first app for writing scripts: screenplays, TV, stage plays, musicals, pantomime, audio drama and comics. Free for everyone (D-036). The design is complete for versions 1 and 2, version 3 is planned, and the build has started: the project skeleton (slice 0) is in place.

- **Overview page:** https://claude.ai/artifact/PWSgaPQibzbbLoXPjbaypX
- **Clickable prototype:** https://claude.ai/artifact/6EzKdcrFGEGHoqQnbY5eJM (try the **Review** tab in the side panel)
- **Offline prototype:** `prototype/offline/dist/openact-offline.html`. Open it from disk, no connection needed. `prototype/offline/dist/pwa/` is the installable edition.
- **Handover for the next session:** `HANDOVER.md`
- **Your to-do list, with ready-to-send text:** `docs/owner-tasks.md`

Both pages are private until shared from their Share menus.

## Versions
| Version | What | Plan |
|---|---|---|
| 1 (MVP) | Fifteen formats, the editor, real pages, PDF, Word, Fountain and Final Draft files, offline | Slices 0–13 |
| 2 | "Ready to submit?": checks a script against where it's going, with sources | Slice 14 |
| 3 | Spelling and grammar on the device | Slices 15–18 |

## Start building
1. Put this folder in a new GitHub repository (for cloud sessions) or open it locally in Claude Code. The automatic checks in `.github/workflows/ci.yml` run on GitHub.
2. Run `pnpm install`, then `pnpm run ci` to check everything passes.
3. Paste `PROMPT-2-build-slice.md`. It builds the next unticked slice in `docs/plan.md` (slice 1 is next) and waits for your OK after planning.
4. Repeat, one slice per session.

## What's inside
| Path | What |
|---|---|
| `CLAUDE.md` | Principles, the clean-room rule and where everything lives; Claude Code reads it automatically |
| `HANDOVER.md` | Where this phase ended and what to do next |
| `.claude/skills/script-formats/` | Format rules for all sixteen formats, Fountain and FDX, and the submission review |
| `docs/decisions.md` | Every decision with its reason and source (D-001 to D-042) |
| `docs/prd.md`, `docs/later.md`, `docs/formats.md` | The spec (R1–R22), parked ideas, and the format list |
| `docs/research/` | Competitors, gaps, positioning, interviews, format checks, **submission checks with sources**, **offline test results**, **name shortlist** |
| `docs/legal/legal-review.md` | Risk assessment and compliance check for giving OpenAct away free (not legal advice) |
| `docs/publishing-plan.md` | A selling plan, superseded: OpenAct is free (D-036). Kept as research |
| `packages/`, `apps/web/` | The product code: MIT packages and the GPL app (slice 0 skeleton so far) |
| `LICENSE.md`, `CONTRIBUTING.md` | Which licence covers what, and how to contribute |
| `docs/design/` | Flows, visual direction, design system, copy, critique, accessibility audit, prototype notes |
| `docs/adr/`, `docs/architecture.md` | Ten architecture decisions (ADR-0010: spelling and grammar) and the module map |
| `docs/testing.md`, `docs/plan.md` | Test strategy and the 19-slice build plan across three versions |
| `docs/samples/` | Three original sample scripts in OpenAct Fountain, and invented sample format files for testing import (`docs/samples/formats/`) |
| `docs/open-questions.md`, `docs/owner-tasks.md` | Your to-do list, and a pack that walks through each task with ready-to-send text |
| `docs/owner/` | The UK layout sheet to send your director |
| `prototype/` | Source of the clickable prototype (a design tool, not the codebase) and its offline editions |
| `overview/` | Source of the overview page |
| `PROMPT-1-design.md` | The design kickoff prompt (already run) |

## Skills by stage
| Stage | Skills |
|---|---|
| Each build slice | anthropic-skills:cunning-plan, run, /code-review, /simplify, script-formats |
| Version 2 and 3 | script-formats (submission reference), engineering:architecture (ADR-0010 spike) |
| Before release | /security-review, engineering:deploy-checklist, engineering:documentation, legal:legal-risk-assessment, legal:compliance-check |
| After interviews | design:research-synthesis |
| Design (done) | grill-me (defaults accepted instead), deep-research, product-management:competitive-brief, design:user-research, skill-creator, product-management:product-brainstorming, product-management:write-spec, frontend-design, web-artifacts-builder, design:design-system, design:ux-copy, design:design-critique, design:accessibility-review, engineering:architecture, engineering:system-design, engineering:testing-strategy, creative-writing-partner, legal:legal-risk-assessment, legal:compliance-check |
