# Design critique: OpenAct prototype

design:design-critique, run on screenshots of the prototype (panto, screenplay and musical page views; dark mode; phone; start, export and paste dialogs) at desktop and phone sizes, 2026-11-03.

## Overall impression
The page reads as the product within two seconds: real script layout, quiet chrome, and the right detail in the right place (scene types, song numbers, (MORE) and (CONT'D)). The biggest opportunity is in the details panel, which gets busy once a cast grows.

## Usability
| Finding | Severity | Recommendation | Status |
|---|---|---|---|
| Every script paragraph was a tab stop, so keyboard users couldn't get past the script, and "Esc then Tab" landed on the next paragraph | Critical | One tab stop for the whole script; Tab inside changes elements | Fixed |
| The Shift+Tab hint said "back", which doesn't say what you get | Moderate | Name the target: "Shift+Tab Character" | Fixed |
| The panto warning described the problem but not the fix | Moderate | "A front-cloth scene between them would cover the set change." | Fixed |
| Scene moves happened silently for screen-reader users | Moderate | Announce "Scene moved up" and the edge cases | Fixed |
| Element shortcuts were planned as Ctrl/Cmd+1–9, which browsers keep for switching tabs | Moderate | Ctrl+Alt+1–9 (⌘⌥ on a Mac), as Google Docs does | Fixed (D-016) |
| The Cast panel stacks two actions under every name, so a cast of 20 becomes a long scroll | Minor | Move the actions into a row menu, or show them on hover and focus only | Open |
| On phones the element bar scrolls sideways with no hint that more chips exist | Minor | Fade the right edge, or order chips by likelihood after the current type | Fixed: both (D-038) |

## Visual hierarchy
- **What draws the eye first:** the page. Correct.
- **Reading flow:** title and format in the top bar, outline on the left, page, then the details panel; the status line is glanceable.
- **Emphasis:** Export is the only filled button. The margin note is quiet enough not to compete with the script.

## Consistency
| Element | Issue | Recommendation | Status |
|---|---|---|---|
| Chip heights | Scene-type chips, margin chips and note chips were under 24 px | Minimum 24 px for all three | Fixed |
| Small text | Several hint sizes (11.5 to 12.5 px) | Settle on 12.5 px for hints and 12 px for table text | Open (minor) |

## Accessibility
- **Contrast:** every text pairing passes 4.5:1 in both themes (design-system.md).
- **Touch targets:** chips raised to 24 px; element-bar buttons are 36 px tall.
- **Readability:** 12 pt Courier on the page; 15 px on phones; 14 px interface text.

## What works well
- The UK hanging layout (name column beside the speech) is right for panto and immediately familiar.
- Key caps in the status line teach the element flow without a tutorial.
- Revision-paper tints give scene types and songs meaning at a glance, always with a label.

## Priority recommendations
1. Test the element flow with five writers before building more (interview guide, reaction section).
2. Tidy the Cast panel before casts grow beyond ten characters.
3. Add the edge fade to the phone element bar.
