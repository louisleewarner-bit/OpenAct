# OpenAct: product spec (MVP)

Positioning: docs/research/positioning.md. Decisions: docs/decisions.md.

## Problem
Writing a script means fighting the format. Screenwriters who can't pay hit capped or watermarked free tiers, and the fully free tools each run on one platform. Stage writers have it worse: screenwriting apps treat stage plays as a template, nothing handles songs or panto structure, so panto and musical writers format by hand in Word, then rebuild line counts and scene charts by hand for directors. The cost is hours of formatting, scripts that look amateur in the reader's hands, and work locked inside paid tools. Evidence: docs/research/gaps.md.

## Goals
1. A first-time writer gets a correctly formatted page in under two minutes, with no help.
2. Screenplay page breaks match the reference PDFs: every break in the reference set matches, or differs for a logged reason.
3. The owner writes and delivers this season's panto and musical drafts in OpenAct, and the director accepts the A4 PDF and Word files without reformatting.
4. No lost work: killing the tab mid-typing loses at most the last two seconds.
5. Running cost stays at £0 a month, a domain name aside.

## Non-goals (this version)
- Accounts and cloud sync: they add cost and a privacy promise to keep (principles 2 and 6).
- Live co-writing: needs a server (D-006). Files can be shared.
- AI features: off the table until after the MVP (D-008).
- Production tools (scheduling, budgeting, breakdowns): Celtx and Final Draft serve that market; it isn't OpenAct's position.
- Revision mode and locked scene numbers: production-stage needs, after the MVP.
- PDF import: hard to do well; Fountain, FDX and paste cover the moves writers make most.

## Users
Proto-personas in docs/research/user-research.md: Pat (panto writer, primary), Morgan (musical writer), Sam (amateur-theatre director), Jo (student screenwriter).

## User stories
**Pat, panto writer**
- As a panto writer, I want speeches laid out UK style on A4, so my director gets the script they expect.
- As a panto writer, I want each scene marked full stage or front cloth, so I can see the set changes work.
- As a panto writer, I want songs in the outline and a song list, so the show's shape is clear at a glance.
- As a panto writer, I want to send a Word file and a PDF, so the director and cast can use what they already use.

**Morgan, musical writer**
- As a musical writer, I want lyrics set apart from speech and songs numbered automatically, so the composer and director always see the current running order.

**Sam, director**
- As a director, I want line counts and a scene-by-character chart, so I can cast fairly and call only who's needed.

**Jo, screenwriter**
- As a student screenwriter, I want correctly formatted pages without paying or a watermark, so contest readers judge my writing.
- As a screenwriter, I want to open my Final Draft and Fountain files, so switching costs nothing.

**Everyone**
- As a writer, I want my script to survive a crash or a closed tab, so I never lose work.
- As a writer, I want to read and fix lines on my phone, so I can work away from my desk.

## Requirements

### P0: must have
Each requirement ends with acceptance criteria. Format rules come from the script-formats skill.

**R1. Editor and element flow**
- Given an empty screenplay, when the writer types `int. kitchen - night` and presses Enter, then the line shows as the scene heading `INT. KITCHEN - NIGHT` and the cursor sits in a new Action element.
- Tab on an empty Action makes it a Character; Enter after a Character gives Dialogue; Tab after a character name gives a Parenthetical with both brackets and the cursor between them; Enter after Dialogue gives Action (a setting switches it to Character). The full map is in the skill.
- The current element and what Enter and Tab will do next are always visible ("Tab → Character").
- Every element type can be set from the keyboard (Ctrl+Alt+1–9, or ⌘⌥ on a Mac; browsers keep Ctrl/Cmd+1–9 for switching tabs) and from the element menu.
- The script is a single tab stop: Tab inside it changes elements, and Esc then Tab leaves it.
- Autocomplete offers characters already used after one letter in a Character element; locations and times of day in scene headings; extensions after `(`; common transitions. Enter or Tab accepts, Esc dismisses.
- Scene headings, character cues and transitions are capitalised automatically.
- Undo and redo cover typing, element changes and reorders.
- The browser's spell check runs in the script's language (default English, UK).

**R2. Find and replace**
- Find and replace across the script, with match case and whole word.
- Renaming a character changes every cue, every mention in stage directions (with a preview), and the cast list, in one undoable step.

**R3. Format and paper profiles**
- Fifteen format profiles in six groups (D-024; docs/formats.md): **Film** (screenplay); **Television** (one-hour drama with acts, single-camera comedy, multi-camera sitcom, UK studio sitcom, vertical micro-drama); **Theatre** (UK and US stage plays, UK and US musicals, pantomime); **Audio** (UK radio drama, audio drama and podcast); **Comics** (comic or graphic novel); **Documents** (treatment or outline). Switching profile keeps all content.
- Each profile starts from an original template; there are no show- or network-branded templates. AV two-column scripts are P1.
- A4 or US Letter; the default follows D-004.
- Every layout difference listed in format-verification.md as a setting is a profile setting.

**R4. Page view and pagination**
- Pages are shown at true A4 or US Letter proportions with page numbers as the profile specifies.
- Every page break in the golden-test reference set matches its reference PDF, or differs for a reason logged in decisions.md.
- A speech split across pages shows `(MORE)` and `CHARACTER (CONT'D)`.
- Page count, and for screenplays a runtime estimate, update within 500 ms of the writer pausing.
- The page view and the exported PDF have identical line and page breaks.

**R5. Outline**
- Lists acts and scenes with headings and page numbers; selecting one jumps to it.
- A scene moves with all its elements by drag and drop or by keyboard (Alt+↑ / Alt+↓); undo restores it.
- In panto scripts each scene shows its type (full stage or front cloth), and two full-stage scenes in a row get a dismissible warning.

**R6. Title page and cast list**
- A title page form (title, credit, authors, source, draft date, contact) lays out per profile, unnumbered.
- Stage profiles have a cast list (name, one-line description). Characters who speak but are missing from the list are offered for adding.

**R7. Songs (musical and panto)**
- A Song element holds number, title, singers, and notes on dramatic function, staging and musical feel. Lyrics are their own element.
- The song list shows every song in order with its page; reprises take letters (`2a`); numbers update when songs move unless locked.
- A song can be a placeholder with no lyrics yet.

**R8. Line counts and scene chart**
- Line counts per character, per scene and in total.
- A scene-by-character chart marks who speaks in each scene, and who is on stage without speaking where entrances are tagged.

**R9. Notes**
- Notes attach to an element, never print, and export to Fountain as `[[notes]]`.

**R10. Import**
- Fountain: every element in the skill maps; anything unrecognised is kept, not dropped; a report lists what couldn't be mapped.
- FDX: element types, text, styles, scene numbers and the title page; dual dialogue is kept; a report lists the rest.
- Paste with detection: pasted text (including from Word) is split into elements, recognising scene headings, cues (including the UK `NAME:` style), parentheticals and dialogue. A review step shows the detected types, allows bulk fixes, and nothing lands until the writer confirms.

**R11. Export**
- PDF in A4 or US Letter, fonts embedded, no watermark, laid out exactly as the page view.
- DOCX: each element maps to a named Word paragraph style with the profile's indents; it opens with its layout intact in Word, LibreOffice and Google Docs.
- Fountain: exporting, importing and exporting again gives an identical file.
- FDX (screenplay profile): opens in Final Draft (manual check), and element types and text survive a round trip.

**R12. Storage safety**
- Autosave within two seconds of the last keystroke; killing the tab loses at most those two seconds.
- Automatic snapshots (every ten minutes of editing, and on every export) plus named snapshots; any snapshot can be restored.
- OpenAct asks the browser for persistent storage and shows whether it was granted. If it wasn't, or seven days pass without a backup, OpenAct prompts the writer to save a copy to a file.
- Where the browser allows, scripts open from and save to real files; elsewhere, download and upload. The file is valid Fountain.

**R13. Offline and install**
- After the first load, OpenAct opens and every P0 feature works with the network off.
- OpenAct installs as an app on desktop and mobile.

**R14. Phone**
- At 375 px wide the script reads as continuous text, without page frames.
- Editing uses an element switcher bar above the keyboard; every P0 action is reachable.

**R15. Accessibility**
- Core flows meet WCAG 2.2 AA: axe reports no serious or critical issues, and a manual keyboard and screen-reader pass completes every core flow.
- Every action works from the keyboard; focus is always visible; element changes are announced to screen readers.
- Text zoom to 200% loses nothing; reduced-motion preferences are respected; light and dark themes both meet contrast.

**R16. Performance**
- Typing in a 150-page script: 95% of keystrokes reach the screen within 50 ms on a mid-range 2019 laptop.
- A full repagination of 150 pages takes under 200 ms.

**R17. First run**
- First run offers original sample scripts (screenplay, panto, musical) or a blank script, and an optional one-minute guided first scene that can be skipped.
- The welcome says where scripts are stored and how to back them up.

### Export
**R22. Real exports** (D-042)
- Export saves a real PDF, Word, Fountain or Final Draft file. The PDF matches the page view line for line, with fonts embedded; Word has a named style for each element and can keep the PDF's page breaks; an anonymous copy names no author anywhere in the file or its properties.
- A character the font lacks is named before it is lost. A very long speech is never cut.
- Acceptance: `checks/export-check.cjs`, `export-verify.py`, `export-verify-docx.py` and `export-edge.cjs` pass with no problems.

### Script files
**R24. Save, open and close scripts** (D-046)
- A script can be saved to a `.openact` file, opened again, and closed; New, Open and Close ask first only when changes are in no file. The download has double-click installers for Windows, Mac and Linux.
- Acceptance: `checks/files-check.cjs` passes with no problems; the installers are run on each system before an announcement (Windows and Mac not yet).

### Video games
**R23. Video game writing** (D-044)
- A Video game format with nodes, player choices, conditions, jumps, barks, quest beats and lore; a Branches tab that maps the nodes and checks the joins; recording line IDs that can be locked.
- Export: recording sheet (CSV), Ink, Yarn Spinner and game JSON, as well as PDF, Word and Fountain. The Ink file compiles and plays.
- Acceptance: `checks/game-check.cjs` and `checks/game-edge.cjs` pass with no problems, and the PDF and Word exports of the Video game template match the page view.

### Your own formats
**R21. Import your own formats, and find common ones** (D-040)
- A writer can import a layout-rules file, a Final Draft file or template, or a Word document or template. OpenAct reads the page setup and element layouts, shows a sample page, lets the writer correct any value, and saves the result as a format.
- Saved formats live on the device, appear in the format menu and on the Start screen, and can be edited, exported as a small file and deleted. A script that uses a missing format falls back to the format it was based on.
- A "Find a format" search lists common formats and how close OpenAct gets, from a catalogue built into the app. It never sends a search anywhere. Each entry links to the organisation's own page, opened only when chosen.
- Nothing from an imported file is uploaded, and OpenAct ships no one else's template (D-028).
- Acceptance: the import check passes on desktop and phone with no accessibility violations (axe); a format's layout changes the page; a format survives a reload; bad files give a clear message.

### Release: free for everyone
**R20. Getting OpenAct** (D-036)
- OpenAct is free with every feature, on the web and installed. Nothing is locked, capped or watermarked, and there are no accounts, licence keys or payments.
- An "Install OpenAct" item in the menu and the About screen explains how to install the web app on a computer, phone or tablet so it opens like any other app and works offline.
- No nags: nothing interrupts writing.
- The About screen says the source is open and where to get it.

### Version 2: ready to submit
**R18. Submission review ("Ready to submit?")**
- One panel checks the script against a chosen submission target (agent or producer, Nicholl, Austin Film Festival, BBC Writersroom, Bruntwood, UK theatre, US theatre, new musical programme, comics publisher, BBC radio), defaulting from the format.
- Checks cover what drifts during development: length, title page, anonymity for blind reads, leftovers (placeholders, notes, empty elements), character names and introductions, cast list, spec conventions, TV act structure, songs, comics word counts, audio running time (docs/research/submission-checks.md).
- Each result says fix, consider, passed or note; lists where it occurs with a link to the page; explains why it matters; and names its sources with their kind and date.
- Nothing changes in the script unless the writer presses a fix (remove the draft date, add a character to the cast list, make exports anonymous). "Consider" results can be set aside for this script and put back.
- An anonymous export option leaves out the credit, writer, contact, source and date, names the file after the title, and writes no PDF author.
- Each target shows when its rules were researched, links to the current rules, and lists the checks OpenAct can't make ("Before you send") as a checklist saved with the script.
- Rules are data with dated sources; updating them yearly is a data change, not a code change.

### Version 3: spelling and grammar
**R19. Spelling and grammar**
- Offline, on-device spelling for every prose element, British or American per script; grammar for action and directions as an optional download (ADR-0010).
- Character names, locations and song titles are never flagged; cues, headings and transitions are skipped.
- No auto-correct; suggestions, "Add to script dictionary" and "Ignore in this script"; issues listed in the review panel with jump links.
- Typing stays within R16's budget while checking runs.

### P1: next
Dual dialogue side by side; focus mode; DOCX file import (reusing the paste detector); doubling flags in the chart; routine and audience-participation tags with a per-scene list; exporting the chart and line counts as CSV or PDF; comparing snapshots; scene numbers on screen and in print.

### P2: design for, build later
Kept in docs/later.md. The architecture must not block them: revision mode, live co-writing, sync through the writer's own cloud folder, index cards, story trackers, rehearsal scripts and cue lists, PDF import, an opt-in AI collaborator, a desktop wrapper, a translated interface.

## Success measures (no tracking needed)
| Measure | Target | How |
|---|---|---|
| First correctly formatted page | 4 of 5 first-time testers in under two minutes, unaided | Moderated usability test |
| Page-break fidelity | 100% of reference breaks match or are logged | Golden tests in CI |
| Data safety | 0 losses beyond two seconds in 20 kill-the-tab trials | Scripted crash test |
| Dogfood | All three D-007 scripts written and delivered in OpenAct | Owner |
| Hand-over | Director accepts the PDF and Word file without reformatting | Owner's director |
| Interest | Survey sign-ups, GitHub stars and issues, unprompted emails | Counted by hand |
| Cost | £0 a month | Hosting bill |

## Risks
| Risk | Impact | Mitigation |
|---|---|---|
| Browser storage cleared (Safari is strictest) | Lost scripts; trust gone | R12: persistent storage, real files, backup prompts; verify current browser policies in the storage ADR |
| Page breaks don't match industry tools | Positioning fails | Layout engine built second, straight against reference PDFs |
| Stage layouts vary by publisher | Writers still reformat | Every disputed rule is a setting (D-011) |
| Editing in the browser is fiddly (IME, mobile keyboards, paste) | Writers give up | Mature editor framework (ADR), Playwright tests per platform |
| Scope grows | MVP never ships | This spec is the scope; new ideas go to later.md |
| Owner is the only panto evidence | Building for one | Interviews before P1 panto work |

## Open questions
- **Owner:** which UK stage layout does your director expect? (Blocks the UK default.)
- **Owner:** reference PDFs and FDX files (docs/open-questions.md). (Blocks golden tests.)
- **Engineering:** current browser storage-eviction rules and `navigator.storage.persist()` support. (Storage ADR.)
- **Design:** the Enter and Tab flow for songs and lyrics. (Phase 3.)
- **Legal:** the name (docs/research/names.md); a solicitor's review before launch (docs/legal/legal-review.md). Bundling Courier Prime unmodified under the OFL is fine.

## Timeline
No hard deadlines. Panto scripts are written months before a December opening, so the stage and panto profiles come early enough for the owner's next season (D-002). Build order and milestones: docs/plan.md.
