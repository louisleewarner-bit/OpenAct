---
name: script-formats
description: Script format rules for OpenAct's sixteen formats (screenplay; TV drama, single- and multi-camera comedy, UK sitcom, vertical drama; UK and US stage, musicals, panto; radio and audio drama; comics; treatments), Fountain and Final Draft (.fdx) syntax, pagination, and the submission review's checks. Use when building or testing element flow, the parser, the layout engine, an importer or exporter, a format profile, or the "Ready to submit?" review.
---

# Script formats

Each rule here is a default inside a **format profile** (one of the sixteen below) paired with a **paper profile** (US Letter, A4). Profiles are data read by the single layout engine: indents, widths, spacing and line counts live in profiles, and code reads them from there. Where sources disagree, the other option becomes a profile setting instead of being dropped, because theatres, publishers and contests each expect their own house style.

## How sure each rule is
docs/research/format-verification.md records every rule's status (verified, secondary, unverified), its source and the default chosen. Check a rule's status there before it goes into a golden test: an unverified rule needs a source or a measurement from a reference PDF first, and the result goes back into that file.

Sources to check against:
- Fountain: https://fountain.io/syntax (blocked from the design sandbox; open it from a normal browser).
- Screenplay layout: PDFs of one script exported from Final Draft, Fade In or Highland; Final Draft's help centre and blog; *The Hollywood Standard* by Christopher Riley.
- UK stage, TV and radio: BBC Writersroom formatting guidance and templates; publishers' house styles.
- US stage and musicals: the Dramatists Guild's recommended manuscript guidelines; Final Draft's stage play and musical templates.

## Format library
| Group | Profile (id) | Paper default | Reference |
|---|---|---|---|
| Film | Screenplay (`screenplay`) | Writer's locale | screenplay.md |
| Television | One-hour drama (`tv-drama`), single-camera comedy (`tv-single`), multi-camera sitcom (`tv-multi`) | Writer's locale | television.md |
| Television | UK studio sitcom (`uk-sitcom`) | A4 | television.md |
| Television | Vertical micro-drama (`vertical`) | Writer's locale | television.md |
| Theatre | Stage play UK and US (`stage-uk`, `stage-us`), musical UK and US (`musical`, `musical-us`), pantomime (`panto`) | Writer's locale | stage.md |
| Audio | UK radio drama (`radio-uk`) | A4 | audio.md |
| Audio | Audio drama and podcast (`audio-us`) | Writer's locale | audio.md |
| Games | Video game (`game`) | A4 | games.md |
| Comics | Comic or graphic novel (`comic`) | Writer's locale | comics.md |
| Documents | Treatment or outline (`treatment`) | Writer's locale | documents.md |

Every profile starts from an original template. Never ship show- or network-branded templates (D-024, D-028). AV two-column scripts are P1.

## Element model
A script is an ordered list of elements. Each has an id, a type and styled text runs (bold, italic, underline).

| Type | Screenplay | Stage, musical, panto |
|---|---|---|
| Scene heading | `INT. KITCHEN - NIGHT` | Act or scene heading: `ACT ONE`, `SCENE 2: THE PALACE KITCHEN` |
| Action | Action | Stage direction |
| Character | OpenAct above the speech | Speaker name, above or beside the speech depending on layout |
| Parenthetical | `(beat)` under the cue | Short direction inside a speech |
| Dialogue | Speech | Speech |
| Lyrics | Sung lines | Sung lines |
| Song | – | Song spot: number, title, singers, notes |
| Transition | `CUT TO:` | Rare: `BLACKOUT.`, `CURTAIN.` |
| Shot | `ANGLE ON` | – |
| Centred text, page break | Both | Both |
| Note, section, synopsis | Never printed | Never printed |

Dual dialogue pairs two speeches side by side. Stage profiles add scene metadata (setting, scene type) and tags (entrance, exit, routine, audience participation).

## Keyboard flow
Writers' fingers know Final Draft's flow, so it is the default; each profile can override it.

| In | Enter → | Tab → |
|---|---|---|
| Scene heading | Action | |
| Action | Action | Character (on an empty line) |
| Character | Dialogue | Parenthetical; on an empty line, Transition |
| Parenthetical | Dialogue | |
| Dialogue | Action (setting: Character) | Parenthetical |
| Transition | Scene heading | |
| Shot | Action | |

Adding a parenthetical inserts both brackets and puts the cursor between them. Show the next element in the interface ("Tab → Character") so the flow teaches itself. Touch keyboards have no Tab key, so touch users get an element switcher bar. Songs and lyrics need their own flow in stage profiles; design it in Phase 3 and test it with writers.

Autocomplete: scene prefixes (`INT.`, `EXT.`, `INT./EXT.`, `I/E.`), locations and characters already used, times of day (`DAY`, `NIGHT`, `MORNING`, `EVENING`, `CONTINUOUS`, `LATER`, `MOMENTS LATER`), extensions (`V.O.`, `O.S.`, `O.C.`, `CONT'D`) and common transitions. Scene headings, cues and transitions are auto-capitalised.

## Reference by task
- Layout engine, page view or PDF export: read [references/screenplay.md](references/screenplay.md) for page geometry, indents, pagination, (MORE)/(CONT'D), title page, scene numbers and revisions.
- Any stage, musical or panto profile, the cast list, song list or character chart: read [references/stage.md](references/stage.md).
- Parser, importer or exporter: read [references/interchange.md](references/interchange.md) for Fountain and FDX syntax, round-trip rules and untrusted input.
- TV acts, multi-camera scene letters and cast lines, UK sitcom or vertical episodes: read [references/television.md](references/television.md).
- Radio or audio drama, cue numbers and sound cues: read [references/audio.md](references/audio.md).
- Comic pages, panels and lettering numbers: read [references/comics.md](references/comics.md). Treatments: [references/documents.md](references/documents.md).
- The "Ready to submit?" review, its targets or a new check: read [references/submission.md](references/submission.md).
