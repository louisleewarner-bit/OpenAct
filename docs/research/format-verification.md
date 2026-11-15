# Format rule verification

Each rule the MVP relies on, from the script-formats skill. Status: **Verified** (primary source, or several sources agree), **Secondary** (one secondary source, or sources conflict), **Unverified** (common practice, no source yet). Source ids refer to competitors.md. Checked 2026-11-03. fountain.io was blocked from the design sandbox, so Fountain rules were checked through search summaries of its pages.

Before a rule goes into a golden test: an Unverified rule needs a source or a measurement from a reference PDF, and a Secondary rule needs a second source. Update this table when that happens.

## Screenplay
| Rule | Status | Source | Default |
|---|---|---|---|
| US Letter, Courier 12 pt; margins 1 in top and bottom, 1.5 in left, 1 in right | Verified | S21 | As stated |
| Character cue starts 3.7 in from the left edge | Verified | S21 | 3.7 in |
| Parenthetical starts 3.1 in | Verified | S21 | 3.1 in |
| Dialogue starts 2.5 in | Verified | S21 | 2.5 in |
| Dialogue width | Secondary: 3 to 4 in across sources | S21 | 3.5 in (35 characters), Final Draft's |
| Transitions | Secondary: right-aligned to the right margin (Final Draft) or starting at 6.0 in | S21 | Right-aligned; 6.0 in is a setting |
| Action and scene heading width 6 in (60 characters) | Verified by arithmetic from the margins | S21 | 60 characters |
| About 55 lines per US Letter page; A4 count | Unverified | – | Measure from reference PDFs |
| Page number top right with a full stop; no number on page 1 | Unverified | – | As stated; confirm |
| Pagination rules 1–8, (MORE) and (CONT'D) | Unverified | – | Golden tests against reference PDFs |
| Title page: title, credit and author centred; contact and draft date in the lower corners | Secondary | S26 | As stated |
| Courier Prime is under the SIL Open Font License | Verified | S22 | Bundle it |
| Courier Prime matches Courier's metrics | Secondary (one source) | S22 | Unit test: every glyph advances 0.6 em |
| Revision colour order White, Blue, Pink, Yellow, Green, Goldenrod, Buff, Salmon, Cherry | Verified (WGA West, via Final Draft) | S23 | Configurable list |
| After Cherry | Secondary: Tan then doubles (Final Draft), or straight to doubles | S23 | Final Draft's order |
| A and B scene numbers, OMITTED, A-pages | Secondary | S23 | As stated |

## Keyboard flow (Final Draft defaults)
| Rule | Status | Source | Default |
|---|---|---|---|
| Enter: Action→Action, Character→Dialogue, Parenthetical→Dialogue, Dialogue→Action, Transition→Scene heading | Verified | S24 | As stated |
| Dialogue→Action can be switched to Dialogue→Character | Verified | S24 | Setting |
| Tab: Action→Character, Character→Parenthetical | Verified | S24 | As stated |
| Tab on an empty Character → Transition | Secondary (conflicts with the line above) | S24 | Only on an empty line |
| Tab: Dialogue→Parenthetical; Enter: Scene heading→Action, Shot→Action | Unverified | – | As stated; confirm |
| Adding a parenthetical inserts both brackets | Verified | S24 | As stated |

## Fountain
| Rule | Status | Source |
|---|---|---|
| Scene heading prefixes (INT, EXT, EST, INT./EXT, INT/EXT, I/E, any case, then a full stop or space); at least one blank line before; `!` prevents; single leading `.` forces and is removed | Verified | S26 |
| Scene numbers: letters, digits, dashes and full stops between `#` at the end | Verified | S26 |
| `@` forces a character; `^` after the second character marks dual dialogue; `~` lyrics (always forced); `> text <` centred (counts as action); capitals ending `TO:` are transitions, `>` forces one | Verified | S26 |
| Notes `[[ ]]`, boneyard `/* */`, sections `#`, synopses `=`, page break `===` | Verified | S26 |
| Title page keys and multi-line values indented 3+ spaces or a tab | Verified (fountain.io/syntax, site search 2026-11-08) | S26 |
| Emphasis `*italic*`, `**bold**`, `_underline_`; emphasis doesn't carry across line breaks | Verified (fountain.io/syntax, site search 2026-11-08) | S26 |
| Two spaces on an otherwise empty line keep a blank line inside dialogue | Verified (fountain.io/syntax, site search 2026-11-08) | S26 |
| Leading tabs and spaces are ignored except in Action, where they are kept; the spec doesn't say tabs become four spaces | Verified (fountain.io/syntax, site search 2026-11-08) | S26 |

## FDX
| Rule | Status | Source |
|---|---|---|
| XML since Final Draft 8; root `FinalDraft` with DocumentType and Version; `Paragraph Type="…"` with `Text` runs carrying styles | Secondary | S25 |
| Paragraph type names Action, Character, Dialogue, Scene Heading, End Of Act | Secondary | S25 |
| How dual dialogue, the title page and scene numbers are stored | Unverified | – (inspect real files) |

## Stage, musical and panto
| Rule | Status | Source | Default |
|---|---|---|---|
| UK: names at the left in capitals (often bold); directions in italics, one tab in; directions inside a speech in brackets and italics | Secondary (guides broadly agree) | S27 | As stated |
| UK: speech beside the name or on the line below | Secondary (guides conflict) | S27 | Beside, in a hanging indent; owner to confirm |
| US: names in capitals above the speech, about 4 in from the left edge, or centred | Secondary (conflict) | S28 | 4 in; centred is a setting |
| US: character names in capitals inside stage directions | Secondary | S28 | As stated |
| Musicals: a Dramatists Guild musicals format exists; lyrics often in capitals, indented, with the sung section marked | Secondary | S18 | Profile setting |
| Panto: front-cloth or tabs scenes alternate with full-set scenes; songsheet; walkdown at the end | Secondary | S19 | As stated |

## Television
Added 2026-11-08 with the format library (D-024). Sources S30–S32.

| Rule | Status | Source | Default |
|---|---|---|---|
| Act headings start a new page; each act ends with an END OF ACT line; teaser or cold open and tag are common | Secondary (guides agree) | S30, S31 | As stated; act names are free text |
| Act headings centred and underlined | Secondary | S31 | As stated; a setting |
| Multi-camera: underlined scene headings, each scene on a new page, scenes lettered, characters listed under the heading, action in capitals, dialogue double-spaced | Secondary (several practitioner sources agree) | S32 | As stated |
| UK studio sitcom: the multi-camera layout on A4 with numbered scenes | Unverified | – | Confirm against BBC Writersroom samples |
| Vertical micro-drama: one- to two-minute episodes, each starting a new page | Unverified (no published standard) | – | Profile setting |
| Final Draft ships TV templates by format and by show | Verified | S31 | OpenAct ships format templates only (D-024) |

## Audio
| Rule | Status | Source | Default |
|---|---|---|---|
| UK radio: speakers at the left, speeches beside them and double-spaced; scenes numbered | Secondary | S33 | As stated |
| UK radio: sound and music cues in capitals, underlined | Secondary | S33 | As stated |
| UK radio: cues numbered in the margin, restarting on each page | Secondary | S33 | As stated |
| US audio drama and podcasts: screenplay layout with numbered sound cues | Unverified (practice varies) | – | Profile setting |

## Comics
| Rule | Status | Source | Default |
|---|---|---|---|
| Full script numbers pages and panels; lettering follows each panel description in reading order, captions and sound effects labelled | Verified (publisher guide and letterer agree) | S34 | As stated |
| Lettering numbered within each page | Secondary | S34 | As stated |
| About 25 words a balloon, 50 a panel; three or four panels a page for action | Secondary (one publisher's guide) | S34 | Review checks only, never enforced |

## Documents
| Rule | Status | Source | Default |
|---|---|---|---|
| Treatments and outlines are prose with headings; no screenplay indents | Unverified (no standard) | – | As stated |

## Imported formats (D-040)
| Rule | Status | Source | Default |
|---|---|---|---|
| Final Draft states an element's right indent as the position of its right edge, measured from the left of the page; `SpaceBefore` is in points (12 = one line); `Spacing` 2 is double | **Unverified** (from memory of public example files; no real file was available to test) | – | OpenAct reads a right indent beyond the left indent as an edge position, and otherwise as a gap from the right margin. The preview lets the writer correct it. Check against a real `.fdxt` when one is available |
| Word indents are measured from the page margin, in twentieths of a point; `before` spacing is in twentieths of a point; double spacing is a `line` value of 480 or more | Confirmed (Office Open XML specification, ECMA-376) | – | As stated |
| Word templates (.dotx) often state no page size | Observed in the sample files made for testing | – | Assume US Letter with 1 inch margins, with a note |
| A page size other than A4 or US Letter | By design | D-040 | Use the nearer paper, with a note |
