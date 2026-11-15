# ADR-0001: Editor framework

**Status:** Accepted · **Date:** 2026-11-08 · **Deciders:** owner (approved all recommendations)

## Context
The editor must hold typed script elements (scene heading, speech, song and so on) with attributes, follow a custom Enter/Tab flow, draw page breaks, (MORE) and (CONT'D) inside the text without making them editable, handle IME and mobile keyboards, stay accessible, and leave a path to live co-writing (D-006). Licences must suit a GPL app.

## Decision
Build on **ProseMirror** directly (`prosemirror-model`, `-state`, `-view`, `-history`, `-keymap`, `-commands`, `-inputrules`; all MIT, maintained in 2026).

## Options considered
| | ProseMirror | TipTap 3 | CodeMirror 6 | Lexical |
|---|---|---|---|---|
| Typed elements with attributes | Schema of node types | Same (wraps ProseMirror) | Text only; structure re-parsed from Fountain | Node classes |
| Page breaks inside an element | Widget decorations at any position (`Decoration.widget`) | Same | Decorations on lines; page-shaped layout is awkward | Possible; less established |
| IME and mobile input | Mature | Same | Excellent | Good |
| Co-writing | `y-prosemirror` (MIT) | Same, plus paid cloud options | `y-codemirror.next` | `@lexical/yjs` |
| Maturity | 10+ years, stable 1.x | Stable; extra layer | Stable | Pre-1.0 (0.53), API still moving |
| Licence | MIT | MIT core; some extensions paid | MIT | MIT |

## Trade-off analysis
CodeMirror would make OpenAct a plain-text Fountain editor like Beat, which suits markup-literate screenwriters but not stage writers, and makes the page view harder. Lexical is capable but still pre-1.0. TipTap adds convenience at the price of another abstraction and a commercial edge we don't need. ProseMirror gives the element schema and the decoration model the page view needs, with the fewest moving parts.

## Consequences
- Easier: one node type per element; the Enter/Tab flow as a keymap plugin; page breaks, (MORE) and (CONT'D) as widget decorations computed from the layout engine; `y-prosemirror` later.
- Harder: more glue code than TipTap; contenteditable quirks remain ours to test.
- Revisit: if the screen-reader pass (accessibility.md, item 10) finds blocking problems.

## Action items
1. [ ] Spike in slice 3: schema, flow keymap and one page-break widget splitting a speech.
2. [ ] VoiceOver and NVDA pass on the spike before building further.
