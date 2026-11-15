# ADR-0009: Path to sync and co-writing

**Status:** Accepted (deferred) · **Date:** 2026-11-08 · **Deciders:** owner (D-006)

## Decision
Nothing ships in the MVP. The path, in order:
1. **Your own cloud folder (no cost):** on Chromium, a script saved as a real file inside Dropbox, iCloud Drive or OneDrive syncs through that service. OpenAct detects a changed file (modified time and content hash) and offers "Keep both" instead of overwriting.
2. **Live co-writing (optional, isolated cost):** Yjs (MIT) with `y-prosemirror`, over a small relay (`y-websocket`) that a theatre company can self-host, or a donation-funded shared relay. Off by default and behind its own module; the script stays local-first and OpenAct Fountain stays the backup format.

## Why this order
Step 1 costs nothing and covers "I write on two computers", the commonest need. Step 2 needs a server, so it waits for interview evidence that co-writing matters to OpenAct's writers (open-questions.md).

## Consequences for the MVP
- Element nodes carry ids now, so a Yjs mapping can use them later.
- The editor never assumes it is the only writer of the document state, which keeps step 2 possible.
