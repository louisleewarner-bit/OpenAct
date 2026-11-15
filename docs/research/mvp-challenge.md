# MVP challenge

product-management:product-brainstorming, run as a self-critique because the owner approved all recommendations. It tests the positioning and the MVP list from the kickoff prompt, then records what changed (logged as D-015).

## Assumptions, riskiest first
1. **Writers will trust a browser app with their scripts.** If storage is lost once, OpenAct is finished. Browsers can clear site data (Safari is the strictest), so local-first in a browser needs persistent storage, real files and backup prompts. Cheapest test: ask in interviews where they'd expect the script to be saved. Build response: storage safety becomes its own P0 requirement.
2. **OpenAct's pages can match Final Draft's page breaks.** This is the proof point of the whole positioning. Cheapest test: build the layout engine second (before the editor), straight against reference PDFs. If it can't get close, rethink before building the rest.
3. **Stage writers will leave Word.** Word is what directors and publishers ask for. Response: DOCX export stays P0, so leaving Word costs nothing at hand-over time.
4. **Panto writers want structure tools, not just layout.** No evidence beyond the owner. Response: keep scene types and the template (cheap, and they shape the outline), and move routine and participation tags to P1 behind interviews.
5. **Directors want line counts and charts from the writer's app.** Assumption. They're cheap once the model knows who speaks where, so they stay P0 at their simplest; doubling flags move to P1.

## Alternatives considered
- **Word templates plus a free converter, not an app.** Meets writers where they are and costs far less to build, but gives no page logic, outline, song list or charts. Rejected; DOCX export keeps the benefit.
- **Fountain-only plain-text editor (like Beat or Highland).** Simple and robust, but stage elements, songs and scene types don't fit plain Fountain well, and many stage writers don't want markup. Rejected as the editing model; Fountain stays the file format (see the ADRs).
- **Stage-only app.** Sharper focus, but the owner wants screenplays, and the screenplay profile is the strictest test of the layout engine. Rejected.

## Changes to the MVP list
- **Cut to P1:** DOCX file import (pasting from Word with element detection covers most of it at lower risk); dual dialogue side by side (import and export still preserve it); focus mode; doubling flags; routine and participation tags.
- **Added to P0:** storage safety (persistent storage, backup prompts, real files where possible); find and replace, including renaming a character everywhere; spell check in the script's language.
- **Kept, deliberately:** all four profiles (cheap on one engine), FDX in and out, and the phone view with an element switcher bar.
