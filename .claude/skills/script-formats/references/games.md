# Video game scripts (`game`)

There is no single standard for game scripts: studios set their own templates. OpenAct's format is a sensible default built from what every branching script needs. Status: OpenAct convention (D-044), not a published standard.

## Elements
| Element | Written as | Prints as |
|---|---|---|
| Node (scene heading) | A name: `Harbour gate` | Capitals, bold, underlined. A node is one place the story can be in; jumps use its name |
| Context note | Free text | Italic. Where and when it plays, who is on screen; goes into the recording sheet's context column |
| Character | A speaker name | Bold capitals with a line ID: `MARGOT  [MARGOT_001]` |
| Delivery | `wary` | Italic under the name; the recording sheet's delivery column |
| Line | The spoken text | Indented under the name |
| Player choice | The option the player sees | `1> text`, numbered per node |
| Condition or flag | `IF flag`, `IF NOT flag`, `SET flag`, `CLEAR flag` | `[IF flag]`. An IF applies to the next line, choice or jump; SET and CLEAR run where written |
| Go to | A node name, or `END` | `GO TO NET LOFT` |
| Bark | `NAME: short line` | `BARK [NAME_001]  NAME: short line`. A line played in the world, outside the conversation |
| Quest beat | A goal or step | `QUEST BEAT 1: text` |
| Lore entry | A codex or journal text | `LORE 1: text` |

## Flow
Enter after a node gives a context note, then character, line, character; after a choice it gives a character (the reply); after a condition it gives a choice; after a jump it gives a new node. Tab on an empty line steps through the types.

## Rules the checks apply
- A node's key is its name in lowercase with other characters as `_` (`Net loft` is `net_loft`); two names with one key are a fix. `END` (or `THE END`, `EXIT`) ends the story.
- A jump to a missing node is a fix. A node with no jump, a node nothing leads to, a choice with no reply, a flag that is checked but never set, and text after a node's last jump are things to consider.
- Line IDs are `SPEAKER_001`, counted per speaker in script order. **Lock** keeps them; new lines count on from the highest locked number.

## Exports
Recording sheet CSV (`line_id,type,node,speaker,text,delivery,context,condition,recorded,notes`), Ink (one knot per node, `VAR` per flag, `* {flag} [choice]`, `-> node`), Yarn Spinner (`title:` nodes, `<<declare>>`, `#line:` tags, `-> choice` with indented body, `<<jump>>`, `<<stop>>`), and OpenAct game JSON. Barks, quest beats and lore go into Ink and Yarn as comments and into the JSON and recording sheet in full.
