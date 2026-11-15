# Design system

Source of truth for values: prototype/src/index.css (tokens are CSS custom properties on `:root`, redefined for dark mode under `prefers-color-scheme` and `[data-theme]`). This page explains them; when the two disagree, the CSS wins and this page gets fixed.

## Tokens

### Colour
| Token | Light | Dark | Use |
|---|---|---|---|
| `--desk` | #E8EBF0 | #12161E | Surface behind the page |
| `--panel` | #F5F7F9 | #181D27 | Side panels, top bar, status line |
| `--paper` | #FFFFFF | #1D2330 | Script page, inputs, dialogs |
| `--ink` | #1C2433 | #E3E6EC | Script text and primary text |
| `--ink-soft` | #566074 | #A2AABA | Secondary text, hints |
| `--pencil` | #6A7387 | #8E97AA | Margin notes, placeholders, "on stage" marks |
| `--rule` | #D5DAE2 | #2C3444 | Borders and table rules |
| `--accent` | #2D4DA6 | #9DB2FF | Primary buttons, focus, caret, "speaks" marks |
| `--accent-ink` | #FFFFFF | #10162A | Text on the accent |
| `--highlight` | #FFEE8A | #5A4E1C | Highlighted character lines |
| `--tint-blue` | #D7E6FA | #22324D | Full-stage scenes |
| `--tint-pink` | #F9D9E6 | #43263A | Front-cloth scenes |
| `--tint-gold` | #F6E2A6 | #43391C | Song numbers |
| `--tint-salmon` / `--warn-ink` | #F8D3C4 / #8A3B1E | #4A2A22 / #F3B49C | Warnings |

Contrast (WCAG 2.2 AA needs 4.5:1 for text): ink on paper 15.6:1 light, 12.6:1 dark; ink-soft on panel 5.6:1 and 7.2:1; pencil on paper 4.8:1 and 5.4:1; accent on paper 7.7:1; ink on every tint at least 9:1; warning text 5.5:1 and 7.2:1. Tints never carry meaning alone; each has a text label.

### Type
| Role | Face | Size |
|---|---|---|
| Script | Courier Prime 400 and 700, italic | 12 pt on the page (exactly 10 characters per inch, 6 lines per inch); 15 px when reflowed on phones |
| Interface | Atkinson Hyperlegible Next 400–700 | 14 px base; 12–13 px for hints and table text; 15–20 px for titles |
| Wordmark | Courier Prime 700 | 20 px |

### Space, shape, depth
- Spacing steps: 2, 4, 6, 8, 12, 16, 24, 32 px. Script spacing is in lines (1/6 in), never pixels.
- Radius: 4 px for small marks, 6 px for buttons and inputs, 8 px for dialogs and choices, fully rounded for chips.
- Elevation: only the page and floating surfaces (autocomplete, dialogs) cast a shadow (`--sheet-shadow`).

## Components

| Component | What it is | States | Accessibility |
|---|---|---|---|
| Page (sheet) | A paper-sized frame holding element fragments; page number top right | Normal; title page (opens the title dialog) | `section` labelled "Page n" |
| Element fragment | One editable block per element, or per part of a split element | Empty (shows its type as a placeholder), focused, highlighted | `textbox` (or `combobox` where autocomplete applies) named by element type; only the current one is a tab stop |
| Margin note | The current element's name in the left margin with an accent tick | Follows focus | Hidden from screen readers; the type is announced instead |
| Margin chip | Scene type in the right margin (panto) | Full stage (blue), front cloth (pink) | Not a tab stop; the same toggle is in the outline |
| Pencil note | A note beside the page, or a "Note" chip when there's no room | Read-only on the page; edited in a dialog | `role="note"` |
| Autocomplete list | Suggestions under the caret | Active option tinted blue | `listbox` with `aria-activedescendant` on the element |
| Outline item | Scene number, heading and page | Current scene (paper fill and border), dragging, drop target (accent line) | Button; Alt+↑/↓ moves it; moves are announced |
| Scene-type chip | Toggle under each panto scene in the outline | Full stage, front cloth | Button with a full label; at least 24 px tall |
| Warning | Salmon note under a scene | Dismissible | `role="note"`; the dismiss button is labelled |
| Song row | Number badge (goldenrod), title, singers, function, page | Hover | Button that jumps to the song; "Edit" opens the song dialog |
| Cast table | Character, speeches, words; highlight, rename, add to cast | Highlight on (pressed) | Table with headers; toggle uses `aria-pressed` |
| Scene chart | Characters by scenes; ● speaks or sings, ○ named in a direction | Scrolls sideways inside its frame | Each cell has a text label |
| Status line | Current element, key caps for Enter, Tab and Shift+Tab, page, runtime, save state | Saved, saving, can't save | Visible text; announcements go to a separate live region |
| Element bar (phone and desktop, D-038) | Current-type key with a type list; one key per element, likeliest next first; cast names on an empty character line; Done on phones | Current type filled; likeliest next outlined in accent | A labelled region holding a toolbar; keys keep the keyboard open; Alt+1–9 (Ctrl on a Mac) |
| Buttons | Primary (accent fill), standard (paper with rule), quiet (no border) | Hover, focus ring (2 px accent), disabled | Visible focus on every control |

## Rules
- Colour comes from tokens only; a literal colour in component CSS is a bug.
- Print output never uses screen tokens: the PDF is black on white whatever the theme.
- Every new component documents its role, keyboard behaviour and focus state here.

## The calm, precise system (D-039)
The look follows one rule: structure comes from hairlines and spacing, and the accent marks only what is current.

| Part | Rule |
|---|---|
| Corners | Two radii: `--r-1` 4px for controls, rows and chips; `--r-2` 8px for dialogs and pop-ups. No pills. |
| Text | Four UI sizes: `--fs-1` 12, `--fs-2` 13, `--fs-3` 14, `--fs-4` 16 px; weights 400 and 600 (700 only in the script face). Sentence case; no all-caps labels. |
| Spacing | A 4px grid: 4, 8, 12, 16, 24. One control height, `--ctl`: 32px, and 44px on phones. |
| Surfaces | Flat. Only the script page and pop-ups are raised. Panels are separated by hairlines (`--rule`), not boxes. |
| Accent | Used only for the current state (the selected tab, the current outline row, the current element key, focus) and for the one main action, Export. |
| Wordmark | A spike mark (an L of accent-coloured tape, as a stage manager marks a position) before OpenAct in Courier Prime bold. |

### Component: element bar (D-038, restyled in D-039)
| | |
|---|---|
| What | One segmented strip: the current-type key first (a menu), then one key per element type, divided by hairlines. |
| States | Current type: semibold with an accent underline. Likeliest next: a soft accent tint. Hover: desk grey. Focus: a 2px accent outline inside the key. |
| Order | Likeliest next first, then the format's own order. Shortcuts (Alt+1 to 9, Ctrl on a Mac) follow the format's order and show only while the key is held; the status line says so. |
| Phone | A single row that scrolls sideways with a fade at the right edge; 44px keys; Done (a keyboard icon) hides the keyboard. |
| Desktop | Wraps to a second row in the narrow column; keys grow to fill each row. |
| Accessibility | A labelled region holding a toolbar. Each key's name says whether it changes this line or adds a new one, and its shortcut. |

### Navigation
Outline on the left and Details and Review on the right as underlined tabs. Review has no top-bar button; its tab, the menu item "Ready to submit?…" and the phone's bottom bar open it.

