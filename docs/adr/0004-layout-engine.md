# ADR-0004: One layout engine for screen and paper

**Status:** Accepted · **Date:** 2026-11-08 · **Deciders:** owner

## Context
Format is the product (principle 4): the page view, the PDF, page counts and outline page numbers must all agree, and page breaks must match reference PDFs from established tools (prd.md, R4).

## Decision
A pure TypeScript package, `@openact/layout` (MIT), with no DOM access:
- **Input:** elements, a format profile, a paper profile and a text measurer.
- **Output:** pages of positioned lines (element id, text offsets, x, y, style) plus page furniture (page numbers, `(MORE)`, `CHARACTER (CONT'D)`, title page).
- **Measurer:** monospace in the MVP (characters × 0.1 in at 12 pt Courier Prime). The interface takes a proportional measurer from font-file metrics later (D-018), so screen and PDF still agree.
- **Incremental:** cache wrapped lines per element (by text and style); repaginate from the first changed page.
- **Rules:** every number and rule comes from the profile data in the script-formats skill, never from code constants.

Consumers: the editor's page-break decorations, the PDF renderer, page counts and runtime, outline page numbers, golden tests.

## Options considered
- **Browser layout (CSS paged media or measuring the DOM):** the browser decides breaks; PDFs from the same CSS differ by browser. Rejected.
- **A separate layout for PDF:** screen and paper drift apart. Rejected.

## Consequences
- The engine is the most testable part of the app: golden tests run in Node in milliseconds.
- The editor shows the engine's breaks; it never computes its own.
- Performance budget: full repagination of 150 pages under 200 ms; an incremental pass under 16 ms.

## Action items
1. [ ] Slice 2: engine with screenplay and UK stage profiles, golden tests for every rule.
2. [ ] Benchmark on a 150-page fixture in CI.
