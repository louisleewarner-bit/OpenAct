# Formats

OpenAct's sixteen format profiles (D-024, PRD R3). Each is data read by one layout engine; switching profile keeps every element. Rule-by-rule status: docs/research/format-verification.md. Agent-facing rules: the script-formats skill.

| Group | Format | What makes it different | Template (original) |
|---|---|---|---|
| Film | Screenplay | Standard US layout on US Letter or A4; (MORE) and (CONT'D) | Blank, plus the Last Wash sample |
| Television | TV drama (one hour) | Teaser, acts and tag; each act on a new page, closed by END OF ACT | Night Shift |
| Television | TV comedy (single camera) | Screenplay layout with cold open, acts and tag | Open Plan |
| Television | TV sitcom (multi-camera) | Lettered scenes on new pages, cast under each heading, action in capitals, double-spaced dialogue | Two Doors Down |
| Television | UK studio sitcom | The multi-camera layout on A4 with numbered scenes | Last Orders |
| Television | Vertical micro-drama | One- to two-minute numbered episodes, each on a new page | Wrong Number |
| Theatre | Stage play (UK) | Speaker beside the speech, directions in italics | A kitchen play opening |
| Theatre | Stage play (US) | Speaker centred above the speech | A kitchen play opening |
| Theatre | Musical (UK and US) | Numbered songs with singers, function, staging and feel; lyrics styled | A song-spot skeleton (UK); The Lighthouse Keeper's Daughter sample (US) |
| Theatre | Pantomime | Front-cloth and full-stage scenes, stock cast, songsheet, walkdown | The panto skeleton, plus the Jack and the Beanstalk sample |
| Audio | Radio drama (UK) | Numbered cues restarting on each page, sound cues, double-spaced speeches, A4 | The Lock-Keeper |
| Audio | Audio drama and podcast | Screenplay layout with numbered sound cues | Dead Air |
| Games | Video game | Nodes, player choices, conditions and jumps, barks, quest beats and lore; recording line IDs; branch map; Ink, Yarn Spinner and recording-sheet exports (D-044) | Salt Road |
| Comics | Comic or graphic novel | Pages, panels and lettering numbered for the artist and letterer | Moth and Lantern |
| Documents | Treatment or outline | Headings and prose | A Last Wash treatment |

## Your own formats (D-040)
Writers can add formats of their own by importing an OpenAct format file, a Final Draft file or template (`.fdx`, `.fdxt`), or a Word document or template (`.docx`, `.dotx`). An imported format is one of the fifteen above plus its own page setup and element layouts. The built-in it is based on decides which elements exist and how Enter and Tab move; the file decides margins, paper and each element's left edge, width, spacing, capitals, bold, italic, underline, alignment, double spacing and page breaks. OpenAct's "Find a format" lists common formats and how close the built-ins get; it links to each organisation's own page and holds no copy of anyone's template. Sample files for testing are in `docs/samples/formats/`.

Not included: show- and network-branded templates (trade marks and house formats belong to others; D-024, D-028) and AV two-column scripts (P1, later.md).

What each format's review checks depend on: docs/research/submission-checks.md.
