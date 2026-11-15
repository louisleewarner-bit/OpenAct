# Contributing to OpenAct

## Before you start
- Read `CLAUDE.md` for the principles and where things live, and `docs/plan.md` for the build order.
- **Clean room (D-028):** never copy another app's code, screens, icons, help text, templates or sample scripts, and never decompile one.
- Format rules carry a source. Check `docs/research/format-verification.md` before a rule goes into a test.

## Commands
```bash
pnpm install
```
```bash
pnpm run ci
```
`pnpm run ci` runs what CI runs: `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`. `pnpm format` fixes formatting. `pnpm dev` starts the app.

## Licences and sign-off
The app (`apps/web`) is GPL-3.0-or-later and the packages are MIT (`LICENSE.md`). OpenAct is free for everyone (D-036). Sign off each commit with `git commit -s` to certify the Developer Certificate of Origin (https://developercertificate.org). There is no contributor licence agreement.

## Dependencies
Every new dependency needs a one-line reason and its licence in `docs/architecture.md`. New releases are installed only after a week in public (`minimumReleaseAge` in `pnpm-workspace.yaml`).
