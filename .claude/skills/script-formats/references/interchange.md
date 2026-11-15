# Fountain and Final Draft (.fdx)

## Fountain
Plain-text screenplay markup; the spec is at https://fountain.io/syntax.
- Title page: `Key: value` lines at the very top (Title, Credit, Author or Authors, Source, Draft date, Contact; other keys allowed). A value can run over several lines, each indented by three or more spaces or a tab. A blank line ends the title page.
- Scene heading: a line starting with INT, EXT, EST, INT./EXT, INT/EXT or I/E (any case) followed by a full stop or space, with at least one blank line before it. A leading `!` stops a line becoming a scene heading. Force one with a single leading `.`, which is removed from the output (`..` doesn't count). Scene numbers go at the end between hashes and can hold letters, digits, dashes and full stops: `#12A#`, `#A1#`, `#I-1-A#`.
- Character: a line entirely in capitals, containing at least one letter, with a blank line before it and dialogue directly after. Force one with `@` (for names like `@McCLANE`). Extensions in brackets: `MUM (O.S.)`. Dual dialogue: `^` after the second character's name.
- Dialogue: the lines after a character or parenthetical. Parenthetical: a line in brackets within dialogue.
- Transition: a line in capitals ending in `TO:`, with blank lines around it; a space after the colon keeps it as action. Force one with a leading `>`.
- Centred text: `> THE END <` (it counts as action).
- Action: anything else. Force with a leading `!`. Leading spaces and tabs are kept; tabs become four spaces (to confirm at fountain.io).
- Lyrics: always forced, with a line starting `~`.
- Emphasis: `*italic*`, `**bold**`, `***bold italic***`, `_underline_`; a backslash escapes.
- Page break: a line of three or more `=`.
- Never printed: notes `[[…]]`, boneyard `/* … */`, sections `#`, `##` and so on (outline levels), and synopses (a line starting with a single `=`).
- A blank line inside dialogue is a line containing two spaces (to confirm at fountain.io).

Fountain is screenplay-first. Stage, musical and panto extras (song spots, scene types, tags) need a convention that still parses as plain Fountain: for example, sections and synopses for structure, notes for tags, and app metadata in one boneyard block at the end of the file. Settle the convention in an ADR.

Sample scripts in Fountain are linked from fountain.io; check each one's licence before committing it as a test fixture.

## FDX
Final Draft's XML format. Build the importer against real exported files from more than one Final Draft version.
- Root: `<FinalDraft DocumentType="Script" …>`, holding `<Content>`: an ordered list of `<Paragraph Type="…">`, each with one or more `<Text>` runs. Runs carry styles such as `Style="Bold+Underline"`.
- Paragraph types include Scene Heading, Action, Character, Parenthetical, Dialogue, Transition, Shot, General, Cast List, New Act and End Of Act (capital O, as seen in real files).
- Expected, still to confirm against real files: scene numbers sit on the scene heading paragraph (`Number="12A"`), dual dialogue wraps the paired speeches in a `<DualDialogue>` element, and the title page is a separate `<TitlePage>` block of paragraphs.
- Files also carry element settings, page layout, revisions, tags and more. Keep what the app doesn't model, so a round trip loses nothing, and tell the writer about anything dropped.

## Round trips and safety
- Fountain → model → Fountain is stable: a second round trip changes nothing.
- FDX → model → FDX keeps element types, text, styles, scene numbers and the title page.
- Every importer reports what it couldn't map.
- A shared script file is untrusted input: parse XML with external entities disabled, cap file sizes, and escape text before rendering it.
