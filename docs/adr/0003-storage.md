# ADR-0003: Storage and files

**Status:** Accepted · **Date:** 2026-11-08 · **Deciders:** owner

## Context
Local-first with no server (principles 2 and 6), and trust in storage is the riskiest assumption (mvp-challenge.md). Browsers differ:
- WebKit grants persistent storage by heuristics, such as being opened as a Home Screen web app; an origin with persistent storage, or an active page, is excluded from eviction ([WebKit storage policy](https://webkit.org/updates)). Developers report Safari clearing site data after 7 days without a visit (unverified, anecdotal).
- `showSaveFilePicker()` (real files) is in Chrome and Edge from 86, and in neither Firefox nor Safari ([web.dev, updated 2026-09-04](https://web.dev/articles/files/save-a-file)).

## Decision
1. **IndexedDB** through `idb` (ISC, 8.0.4) holds every script as OpenAct Fountain text, its snapshots and app settings.
2. After the first save, OpenAct calls `navigator.storage.persist()` and shows the result.
3. **Chrome and Edge:** scripts can also be opened from and saved to real `.fountain` files; OpenAct keeps the file handle and writes on every autosave, asking again for permission each session.
4. **Safari and Firefox:** "Save a copy" downloads the file; "Open" reads one. On Safari, OpenAct suggests installing the app (Add to Dock or Home Screen) because installed apps are treated better.
5. **Backups:** if persistence was refused, or seven days pass without a file save, OpenAct asks the writer to save a copy.
6. **Snapshots:** every ten minutes of editing and on every export; keep the last 50 plus one a day for 30 days.

## Options considered
| | IndexedDB (`idb`) | IndexedDB (Dexie) | OPFS | Files only |
|---|---|---|---|---|
| Support | All browsers | All browsers | All, with differences | Chromium only |
| Size | About 1 kB | About 30 kB | None | None |
| Fit | Simple key-value stores are enough | Query features unused | No gain over IndexedDB here; same eviction rules | Leaves Safari and Firefox without autosave |

## Consequences
- Data safety rests on three layers: autosave, snapshots and real files or backups.
- Safari behaviour must be tested on real devices before launch, and this ADR revised with what we see.

## Action items
1. [ ] Storage module with a crash test: kill the tab mid-typing 20 times; at most two seconds lost.
2. [ ] Verify Safari's current eviction rules for installed and non-installed apps; update the sources above.
