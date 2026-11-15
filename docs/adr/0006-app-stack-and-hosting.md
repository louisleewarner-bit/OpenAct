# ADR-0006: App stack and hosting

**Status:** Accepted · **Date:** 2026-11-08 · **Deciders:** owner

## Decision
- **Language and build:** TypeScript (Apache-2.0), Vite 8 (MIT), pnpm workspaces.
- **Interface:** React 19 (MIT) for the chrome around the editor; Radix primitives (MIT) for dialogs, menus, tabs and selects, because they get focus handling right; plain CSS with the design tokens (design-system.md), no utility framework.
- **Offline:** `vite-plugin-pwa` 2 (MIT, Workbox) precaches the app shell and fonts.
- **Tests:** Vitest 5 (MIT), Playwright 1.64 (Apache-2.0), `@axe-core/playwright` (MPL-2.0, development only).
- **Hosting:** static files on Cloudflare's free tier, which allows custom headers for a strict Content-Security-Policy (`connect-src 'self'`, no third-party scripts). GitHub Pages is the fallback (CSP by meta tag only). CI on GitHub Actions, free for public repositories.
- **Privacy:** no analytics, no runtime requests to third parties, fonts self-hosted.

## Options considered
- **Svelte or Solid** instead of React: smaller bundles, but React has the accessible primitives and more contributors. The editor itself is framework-free, so this choice stays cheap to change.
- **Tailwind** (used in the prototype): fast to prototype, but tokens in plain CSS are easier for contributors to read and keep the bundle small.
- **A server:** none. Principle 6.

## Consequences
- Running cost: £0 plus a domain.
- The CSP blocks any accidental third-party call, which keeps the privacy promise honest.
