# ADR-0008: Licence

**Status:** Accepted · **Date:** 2026-11-08 · **Deciders:** owner (D-005)

## Decision
- `apps/web`: **GPL-3.0-or-later**, so the app and any fork stay free for writers.
- `packages/*` (model, fountain, fdx, layout, pdf, docx, detect, samples): **MIT**, so other tools can adopt correct formatting and OpenAct Fountain.
- Fonts: Courier Prime and Atkinson Hyperlegible Next under the SIL Open Font License, bundled unmodified with their licence files.
- Contributions: Developer Certificate of Origin sign-off (`git commit -s`); no contributor licence agreement.

## Compatibility
Runtime dependencies are MIT, ISC or Apache-2.0, all compatible with GPL-3.0. MPL-2.0 (`@axe-core/playwright`) is a development-only tool and isn't distributed.

## Context
Open-source peers: Beat, Story Architect and Scrite are GPL-3.0 and Trelby is GPL; Afterwriting is MIT (D-012).
