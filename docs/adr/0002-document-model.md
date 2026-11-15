# ADR-0002: Document model and source of truth

**Status:** Accepted · **Date:** 2026-11-08 · **Deciders:** owner

## Context
Principle 3 says writers can always leave with their work. Stage extras (songs, scene types, cast descriptions) have no native Fountain syntax. The same script must live in browser storage, in real files and in exports.

## Decision
- **In memory:** a ProseMirror document. One node per element; attributes for id, song details, scene type and note; marks for bold, italic and underline.
- **Stored everywhere (browser storage, files, Fountain export):** *OpenAct Fountain*, which is plain Fountain plus documented conventions:
  - acts as centred lines (`> ACT ONE <`);
  - numbered stage scenes as forced headings (`.SCENE 2: THE PALACE KITCHEN`), followed by `[[openact: front cloth]]` in pantos;
  - songs as a forced action line (`!SONG 3: TITLE (SINGERS)`) followed by `[[openact: song | singers: … | function: … | staging: … | feel: … | reprise: yes]]`;
  - notes as `[[…]]` after their element;
  - one trailing boneyard block holding settings Fountain has no place for: `/* openact {"v":1,"profile":"panto","paper":"a4","cast":[…],"dismissed":[…]} */`.

## Options considered
| | OpenAct Fountain everywhere | JSON in storage, Fountain on export |
|---|---|---|
| Readable in other apps | Yes, prints sensibly in any Fountain reader | Only after export |
| One format to test | Yes | Two (JSON and Fountain) |
| Element ids across sessions | Regenerated on load | Kept |
| Risk | Another app may strip the boneyard block | Lock-in creeps in |

## Trade-off analysis
Keeping ids between sessions only matters for co-writing, which will carry its own Yjs state (ADR-0009). Everything else favours one plain-text format: writers can open their scripts in Beat, Highland or a text editor today, and version them in Git.

## Consequences
- Round-tripping must be exact: a second round trip changes nothing (testing.md).
- If another app rewrites the file and drops the block, OpenAct falls back to defaults (profile guessed from content) and says so.
- The conventions are published in the repository so other tools can adopt them.

## Action items
1. [ ] Write `docs/openact-fountain.md` (the conventions above, with examples) in slice 1.
2. [ ] Property test: parse → serialise → parse is stable for every fixture.
