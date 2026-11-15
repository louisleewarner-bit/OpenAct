# ADR-0007: Desktop wrapper

**Status:** Accepted (deferred) · **Date:** 2026-11-08 · **Deciders:** owner

## Decision
No desktop wrapper in the MVP. The installable PWA covers desktop use (D-003). Revisit **Tauri 2** (Apache-2.0 or MIT; CLI 2.12, released 2026-10) if either:
- Safari or Firefox users need real files and autosave to them (ADR-0003), or
- storage eviction causes real data loss reports.

## Options considered
- **Tauri 2:** small binaries using the system web view; full file-system access; signing and update costs to manage.
- **Electron:** proven, but bundles a browser (large downloads) and adds update infrastructure.
- **PWA only:** zero distribution cost; limited file access outside Chromium.

## Consequences
Keep platform access behind the storage module's interface so a Tauri build can swap in native files without touching the editor.
