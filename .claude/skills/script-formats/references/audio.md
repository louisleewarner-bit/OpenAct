# Audio formats

Two profiles. Status: docs/research/format-verification.md, Audio table; source S33 in docs/research/competitors.md.

## UK radio drama (`radio-uk`)
- A4. Scene headings bold, underlined capitals, numbered (`SCENE 1:`).
- Speaker names in capitals at the left; the speech sits beside the name in a hanging column, double-spaced.
- Sound and music cues are their own element: capitals, underlined, in the speech column (`blockType: 'sound'`).
- Cue numbers: every speech and sound cue gets a number in the left margin, starting again at 1 on each page, so a studio can say "page 12, cue 4".
- Directions inside a speech in capitals; there is no action element by default because listeners can't see it.
- Enter flow: scene heading → sound cue → speaker → speech → speaker; Tab on an empty speaker gives a sound cue.

## Audio drama and podcast (`audio-us`)
- Screenplay layout with sound cues (capitals, underlined) and the same per-page cue numbers. Unverified as a standard: fiction-podcast scripts vary.

## Writing for the ear (review checks)
- Running time is estimated from spoken words at 150 to 180 a minute; read a few scenes aloud to calibrate (`length`).
- Names that start with the same letter, rhyme or differ by a letter or two blur on the radio (`sound-alike`).
- BBC Radio 4's afternoon slot takes plays of about 45 minutes; plays are pitched through producers (submission-checks.md).
