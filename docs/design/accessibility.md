# Accessibility audit: OpenAct prototype

**Standard:** WCAG 2.2 AA (design:accessibility-review covers 2.1 AA; 2.2's target-size and focus criteria were added). **Date:** 2026-11-03.
**Method:** axe-core 4.10 in Chromium at desktop (light and dark) and phone sizes, scripted keyboard tests in Playwright, 200% zoom (720 px viewport), and contrast arithmetic on every token pairing. No screen-reader session yet; that is the main open item.

## Summary
11 issues found; 9 fixed, 2 open. After fixes, axe reports no violations in any of the three views.

## Findings
| # | Issue | Criterion | Severity | Fix | Status |
|---|---|---|---|---|---|
| 1 | Every element was a tab stop; Esc then Tab couldn't leave the script | 2.1.2 No keyboard trap, 2.4.3 Focus order | Critical | Roving tab stop: only the current element is in the tab order | Fixed |
| 2 | `aria-multiline` on elements with the combobox role | 4.1.2 Name, role, value | Major | Only text boxes carry it | Fixed |
| 3 | Help text read out on every element | 2.4.6 Headings and labels (noise) | Major | One description on the script region (`aria-describedby`) | Fixed |
| 4 | Scene reordering not announced | 4.1.3 Status messages | Major | Live-region announcements | Fixed |
| 5 | Scene-type chips, margin chips, note chips under 24 px | 2.5.8 Target size (minimum) | Major | 24 px minimum | Fixed |
| 6 | No top-level heading | 1.3.1 Info and relationships | Minor | Visually hidden h1 with the script title | Fixed |
| 7 | Live region and help text outside landmarks | 1.3.1 | Minor | Moved into the banner | Fixed |
| 8 | Phone element bar outside landmarks | 1.3.1 | Minor | Wrapped in a footer | Fixed |
| 9 | Page had no language set when the host didn't set one | 3.1.1 Language of page | Minor | Sets `lang="en-GB"` when missing | Fixed |
| 10 | Untested with VoiceOver and NVDA; contenteditable behaviour varies by browser and reader | 4.1.2 | Major | Manual screen-reader pass before the editor framework is locked (ADR 0001) | Open |
| 11 | The current element is shown by the caret and the margin note, not a ring around the text | 2.4.7 Focus visible | Minor | Confirm in usability tests; add an optional focus ring setting | Open |

## Keyboard map
| Where | Tab | Enter / Space | Escape | Arrows |
|---|---|---|---|---|
| Top bar | Title, format, paper, menu, Export, in order | Activates | Closes menus | Move within menus and selects |
| Outline | Each scene, then its type chip | Jumps to the scene | – | Alt+↑/↓ moves the scene |
| Script | One stop; inside, Tab changes the element | Enter: next element; Shift+Enter: line break | Esc, then Tab: leave the script | Move between lines and elements |
| Details tabs | Tab list, then panel content | Activates | – | ←/→ switch tabs |
| Dialogs | Trapped inside while open | Activates | Closes, focus returns | – |

## Screen reader (expected; to verify)
| Element | Announced as | Note |
|---|---|---|
| Script element | "Speech, edit text" plus its text | Name is the element type |
| Element change | "Direction in speech" via the live region | Polite, so typing isn't interrupted |
| Autocomplete | Combobox with a listbox of names | Active option via `aria-activedescendant` |
| Scene chart cell | "speaks", "on stage" or "not in scene" | Row and column headers give context |

## Zoom and reflow
At 200% zoom (720 px wide) the layout switches to the reflowed phone view with no horizontal scrolling.
