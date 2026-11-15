I want to design a free app for writing scripts: screenplays, stage plays, musicals and pantomimes. I write panto and stage musicals myself and want screenplays too. You're the product designer and architect. This session produces an approved design in docs/; building comes later, one slice per session.

## Why it should exist (my hunch: test it in research)
Industry tools are expensive, and free tiers tend to cap scripts, watermark exports or keep your work in their cloud. Stage writers have it worse: screenwriting apps treat stage formats as an afterthought, so panto and musical writers end up fighting Word templates.

## Principles (trace every design decision to one)
1. Free for writers, always: unlimited scripts, every export, no watermark, no account.
2. Local-first: works offline; scripts stay on the writer's device until they choose to export, share or sync.
3. Open formats: Fountain is first-class; FDX and DOCX in and out; PDF out. Writers can always leave with their work.
4. Format is the product: pages look right first time, because readers judge format before story.
5. The page is the interface: keyboard-first, smart Tab/Enter flow between elements, chrome out of the way.
6. £0 running cost, a domain name aside: static hosting. Anything with an ongoing cost (sync, live co-writing, AI) is optional and sits behind its own module boundary.
7. Accessible (WCAG 2.2 AA), quick on an old laptop, usable on a phone.

## Formats
Format profiles: Screenplay (film and TV); Stage play (UK and US layouts); Musical (stage play plus song spots and lyrics); Pantomime (stage play plus full-stage/front-cloth scenes, routines, songsheet and walkdown). US Letter and A4. The rules live in the script-formats skill (.claude/skills/script-formats/); read it before any format work.

## MVP (this list is the scope; park every other idea in docs/later.md)
- Editor: smart elements, Tab/Enter flow, auto-caps, autocomplete (characters, locations, times of day, extensions, transitions), dual dialogue.
- Page view with accurate pagination, page count, and a runtime estimate for screenplays.
- Outline of acts and scenes: jump to any scene, drag to reorder.
- Title page, cast list, and song list (number, title, singers, dramatic function).
- Character-by-scene chart and line counts, for casting and rehearsals.
- Notes that never print.
- Import Fountain, FDX, DOCX and pasted text, with a review step to fix detected elements. Export PDF, DOCX, Fountain and FDX.
- Autosave, snapshots and crash recovery; open and save real files where the browser allows.
- Installable PWA: offline, light and dark, focus mode.

Later (design so these fit): index cards; setup/payoff, running-gag and topical-joke trackers (topical jokes get a check-before date); revision mode; rehearsal scripts with line numbers and cues; live co-writing; audio drama; PDF import; an opt-in AI collaborator that gives feedback on structure and continuity while the writer does the writing, using the writer's own API key.

## How we work
In phases. Each phase writes its outputs to docs/, ends with a five-line summary and open questions, then waits for my go-ahead. docs/decisions.md is the running log: date, decision, reason, source.

### Phase 0: Decisions
- Interview me with anthropic-skills:grill-me until each of these has an answer or an agreed default: who it's for first; which formats ship first; browser only, or a desktop wrapper too; default paper size; licence; how much co-writing matters; the three scripts I'll dogfood with.
- Write a short CLAUDE.md: the principles, plus pointers to docs/ and the script-formats skill.

Done when: every decision is in decisions.md.

### Phase 1: Research (docs/research/)
- anthropic-skills:deep-research and product-management:competitive-brief on Final Draft, Fade In, WriterDuet/WriterSolo, Arc Studio, Celtx, Highland, Trelby, Beat, Story Architect (formerly KIT Scenarist), Afterwriting and Scrivener, plus every stage, musical or panto tool you find (shared Word templates count). For each: price, free-tier limits, platforms, file formats, stage and musical support, standout features, top three complaints. Every price and limit gets a dated source.
- Check the script-formats skill against the sources it lists; fill gaps with anthropic-skills:skill-creator.
- design:user-research: a 30-minute interview guide and a short survey for screenwriters and for amateur-theatre writers and directors; proto-personas and jobs-to-be-done, each claim marked evidence or assumption.

Done when: competitors.md has a row per tool with every cell filled or marked unknown; gaps.md ranks the ten biggest unmet needs with evidence; positioning.md holds a one-paragraph positioning statement; every script-formats rule the MVP relies on has a logged source or an "unverified" flag.

### Phase 2: Spec (docs/prd.md)
- product-management:product-brainstorming to challenge the positioning and the MVP cut with me, then product-management:write-spec: problem, personas, jobs, MVP with acceptance criteria per feature, the later list, risks, and success measures that need no tracking (dogfood tasks done, export fidelity, issues filed).

Done when: every MVP feature has testable acceptance criteria and traces to a gap or a dogfood task.

### Phase 3: UX and visual design (docs/design/)
- Map the core flows: first run to a correctly formatted page in under two minutes; import an existing script; write a scene keyboard-only; add a song; reorder scenes; export a PDF and a Word file for a director; recover after a crash; edit on a phone, which has no Tab key (design an element switcher bar).
- anthropic-skills:frontend-design for the visual direction: calm, writerly, with the page as the hero. anthropic-skills:web-artifacts-builder for a clickable prototype of the editor, outline, song list and export.
- design:design-system for tokens and components, light and dark. design:ux-copy for empty states, element hints ("Tab → Character"), errors and export dialogs.
- design:design-critique, then design:accessibility-review, on the prototype.

Done when: the prototype covers every core flow, and every review finding is fixed or logged with a reason.

### Phase 4: Architecture (docs/adr/)
- engineering:architecture, one ADR per decision: editor framework (ProseMirror/TipTap, CodeMirror 6 or Lexical, judged on structured elements, IME and mobile input, Yjs bindings and accessibility); document model and source of truth (Fountain text or a JSON model); storage (IndexedDB or OPFS, File System Access API); PDF and DOCX libraries; desktop wrapper; licence; the path to sync and co-writing.
- engineering:system-design for the module map and data model, anchored on a single layout engine: pure TypeScript, (script, format profile, paper) → pages. The page view and the PDF export both render its output, so screen and paper always match.
- Use Context7 for current library docs.
- Starting point for the ADRs to confirm or overturn: TypeScript, Vite, React, ProseMirror, Dexie, pdf-lib, docx, Vitest, Playwright, static hosting on Cloudflare or GitHub Pages.

Done when: every MVP feature maps to a module, and every dependency has a one-line justification and a licence.

### Phase 5: Test strategy and build plan (docs/testing.md, docs/plan.md)
- engineering:testing-strategy, covering: parser tests from the Fountain spec; golden pagination tests (fixtures with expected page breaks, plus reference PDFs I supply, with their breaks extracted using anthropic-skills:pdf); round trips (Fountain ↔ model ↔ FDX); Playwright tests for the Tab/Enter flow; axe accessibility checks; a performance budget, e.g. keystroke to screen under 50 ms in a 150-page script.
- anthropic-skills:creative-writing-partner: please draft three short original sample scripts for onboarding: a screenplay scene, a panto front-cloth scene, and a musical scene with a song spot.
- plan.md: vertical slices in build order, each with a done-when line. Suggested order: script model and Fountain parser; layout engine with golden tests; editor and element flow; page view; PDF export; storage and autosave; outline; title page and cast list; stage, musical and panto profiles; song list and character chart; DOCX and FDX; PWA; polish.

Done when: every slice has a done-when line someone else could check.

## Ground rules
- Facts about competitors, formats and libraries carry a source; anything unsourced is marked "unverified".
- When a format rule is ambiguous, follow the script-formats skill, then an established tool's behaviour, and log the choice.
