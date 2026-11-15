# Prototype

**Open it:** https://claude.ai/artifact/6EzKdcrFGEGHoqQnbY5eJM (private to the owner until shared from the page's Share menu).

## What to try
1. Pick the pantomime sample. Click at the end of the last stage direction, press Enter, then Tab, type `fl` and press Enter: Fleshcreep is offered and accepted. Press Enter for his speech, Tab for a direction in speech.
2. Switch the format to Screenplay with the selector at the top, then back. Nothing is lost.
3. Open the screenplay sample and scroll to the bottom of page 1: Nell's long speech splits with (MORE) and NELL (CONT'D).
4. In the outline, drag "The Market Square" above "A Lane Outside the Village", or select it and press Alt+↑.
5. In the Cast panel, choose "Highlight lines" for Dame Trott.
6. Export as Fountain to see OpenAct's plain-text file, including its conventions for songs and scene types.
7. Use the element bar under the page: tap a key to add that element, or the first key to change the current line. Hold Alt (Ctrl on a Mac) to see the shortcuts. Narrow the window below 760 px for the phone layout.
8. Choose the **Review** tab in the side panel ("Ready to submit?"). Switch the target to the Academy Nicholl Fellowships: the anonymity checks appear. Press **Make exports anonymous**, open a row's sources, and press a page link to jump to the problem.
9. From **Start a script**, open any of the sixteen format templates, then open Review to see the checks change with the format and target.
10. Offline: download `prototype/offline/dist/openact-offline.html` and open it with Wi-Fi off, or serve `prototype/offline/dist/pwa/` and install it (docs/research/offline-check.md).

## Built, simulated, missing
- **Built:** element flow, autocomplete, sixteen format profiles with original templates, the "Ready to submit?" review with ten targets and an anonymous export option, A4 and US Letter pagination with keep-together rules and (MORE)/(CONT'D), outline with reordering, scene types and warnings, songs with numbering and reprises, cast counts, rename, highlight, scene chart, notes, title page, paste with detection, Fountain and FDX text export, undo, light and dark themes, phone layout, local save in the browser.
- **Simulated:** saving PDF, Word, Fountain and FDX files (the dialog explains what would be saved).
- **Missing:** find and replace, real file open and save, snapshots, storage prompts, proportional fonts for stage formats.

## How it's built
React with Tailwind and Radix components for the chrome (web-artifacts-builder), and a small editor that owns its own DOM: one editable block per element fragment, rebuilt after each layout pass with the caret restored. The prototype's layout engine (prototype/src/cue/layout.ts) is a sketch of the real one in docs/architecture.md. Pages split only at element boundaries it controls; the real editor does this with editor decorations (ADR 0001).

Rebuild after changes: `prototype/artifact/rebuild.sh`, then publish `prototype/artifact/openact-prototype.html` to the same artifact. `prototype/artifact/harness.html` opens the same page locally. The script also builds the offline editions in `prototype/offline/dist/`: a single downloadable file and an installable app, both with the fonts embedded (D-026).

The review logic lives in `prototype/src/cue/review.ts` (checks) and `review-data.ts` (targets and sources). Both are pure TypeScript with no DOM access, written to move into `packages/review` unchanged.
