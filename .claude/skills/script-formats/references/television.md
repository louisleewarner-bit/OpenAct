# Television formats

Five profiles share the screenplay page (indents and pagination: screenplay.md) and add act and scene furniture. Status of each rule: docs/research/format-verification.md, Television table. Sources S30–S32 are in docs/research/competitors.md.

## Acts (one-hour drama, single-camera comedy, multi-camera, UK studio sitcom)
- An act heading (`TEASER`, `COLD OPEN`, `ACT ONE`, `TAG`) is centred, underlined capitals, and starts a new page. A page break is skipped when the previous element is itself an act heading.
- Each act ends with an END OF line two lines below the last element: `END OF TEASER`, `END OF ACT ONE`. The last act may end `END OF EPISODE` or `END OF SHOW`.
- Enter after an act heading gives a scene heading; Enter after an END OF line gives the next act heading. Tab on an empty transition gives END OF ACT.
- Act names are free text, so writers can use a network's own pattern (teaser plus four or five acts, or cold open, two acts and a tag). The review checks numbering and END OF lines (`acts`).
- Usual lengths: one hour 45–65 pages; single-camera half hour 28–35 (the review's `length`; sources in submission-checks.md).

## Multi-camera sitcom (US)
- Scene headings are underlined capitals and each scene starts a new page.
- Scenes are lettered: a `SCENE A` line above each heading (`sceneLine: 'letter'`).
- The characters in the scene are listed in brackets under the heading, built automatically from the cues (`castLine`).
- Action is in capitals; dialogue is double-spaced (printed as 2n−1 lines for n lines of text).
- No automatic (CONT'D).
- Usual length 40–55 pages, longer than single-camera because of the spacing.

## UK studio sitcom
- The multi-camera layout on A4 with numbered scenes (`SCENE 1`) instead of letters. Unverified: confirm against BBC Writersroom's sitcom samples from a normal browser (bbc.co.uk refuses automated readers).
- The BBC Writersroom open call asks for at least 30 pages.

## Vertical micro-drama
- Short episodes of one to two minutes for phone screens. The act element is relabelled **Episode**; each starts a new page with `EPISODE n:` and an optional title.
- Screenplay layout otherwise. No published standard was found (unverified); treat every rule as a setting.

## Interchange
- Fountain: act and END OF lines are centred lines (`> ACT ONE <`), preceded by a page break `===` for screen formats.
- FDX: END OF ACT maps to Final Draft's End Of Act paragraph type (secondary); the act heading is written as New Act (unverified until checked against real files).
