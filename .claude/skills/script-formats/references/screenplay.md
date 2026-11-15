# Screenplay layout

## Page
- Courier 12 pt: 10 characters per inch and 6 lines per inch, so layout is a character grid. Bundle Courier Prime (SIL Open Font License, by Quote-Unquote Apps) for screen and PDF. It is reported to match Courier's metrics; a unit test checks every glyph advances 0.6 em, so a 12 pt line holds exactly 10 characters per inch and line breaks match other apps.
- Paper: US Letter (8.5 × 11 in) or A4 (210 × 297 mm). Keep the same indents on both; A4 fits a few more lines per page (take the count from a reference A4 PDF).
- Margins: top 1 in, bottom about 1 in, left 1.5 in (room for binding), right about 1 in, ragged.
- About 55 lines per US Letter page. One page is roughly one minute of screen time; label runtime as an estimate.
- Page numbers sit top right, about 0.5 in from the top edge, with a trailing full stop (`12.`). The first page of the script carries no number; the title page is neither numbered nor counted.

## Element layout
Measured from the left edge of the page. Sources agree on the left edges; dialogue width varies between sources (3 to 4 in), so Final Draft's 3.5 in is the default. Some guides start transitions at 6.0 in instead of right-aligning them; that is a setting.

| Element | Left edge | Right edge | Case | Blank lines before |
|---|---|---|---|---|
| Scene heading | 1.5 in | 7.5 in (60 characters) | Upper | 1 (some writers use 2) |
| Action | 1.5 in | 7.5 in (60 characters) | As typed | 1 |
| Character | 3.7 in | Right margin | Upper | 1 |
| Parenthetical | 3.1 in | About 5.5 in (to confirm) | As typed, in brackets | 0 |
| Dialogue | 2.5 in | 6.0 in (35 characters) | As typed | 0 |
| Transition | Right-aligned to 7.5 in | | Upper | 1 |
| Shot | 1.5 in | 7.5 in (60 characters) | Upper | 1 |

Dual dialogue sets two narrower columns side by side and paginates them as one block.

## Pagination
Wrap each element to its width, then break pages using these defaults:
1. A scene heading travels with what follows: keep it with at least the first two lines of the next element, or all of it if shorter.
2. A character cue and any parenthetical travel with at least the first line of speech, preferably two. A page never ends on a cue or a parenthetical.
3. Dialogue splits only at a sentence boundary, leaving at least two lines on each side. Below the split, print `(MORE)` at the character indent; at the top of the next page, repeat the cue with `(CONT'D)`, keeping any extension: `SARAH (V.O.) (CONT'D)`.
4. Action splits only at a sentence boundary, leaving at least two lines on each side; otherwise the whole paragraph moves to the next page.
5. A transition stays on the page with the content before it.
6. Forced page breaks always break.
7. Optional, off by default: `CONTINUED:` and `(CONTINUED)` where a scene runs across pages, an older production style.
8. Optional, on by default: automatic `(CONT'D)` when a character speaks again in the same scene with only action in between.

Give each rule a golden test: a short fixture and its expected page breaks. Then compare full-length reference scripts against PDFs from an established app.

## Title page
The title sits centred about a third of the way down, followed by "Written by" and the author(s), also centred. Contact details go bottom left; draft date or notes bottom right. No page number.

## Production features (after MVP)
- Scene numbers in both margins. Once numbers are locked, inserted scenes take letters (`12A`, `12B`; before scene 1, `A1`), and removed scenes leave `OMITTED` in place.
- Revisions: changed lines get an asterisk in the right margin, and each revision set has a colour and date in the page header. The WGA West order is White, Blue, Pink, Yellow, Green, Goldenrod, Buff, Salmon, Cherry. Final Draft continues with Tan, then Double White, Double Blue and so on; some lists go straight from Cherry to the doubles. Make the sequence configurable, defaulting to Final Draft's.
- Locked pages: material added to a locked page goes on A-pages (`12A`).
- Scene length in eighths of a page, for scheduling.
