# Offline and installed-app check

Does OpenAct work as well offline, downloaded or installed, as it does online? Tested on the prototype on 2026-11-08 with Playwright and Chromium. Result: **yes, in all four modes, once the fonts are bundled.** The hosted prototype depends on Google Fonts and claude.ai, so it is the one edition that needs a connection.

## What was built
`artifact/rebuild.sh` now produces three editions from the same bundle:

| Edition | File | Fonts | Network needed |
|---|---|---|---|
| Hosted (the published Artifact) | `prototype/artifact/openact-prototype.html` | Google Fonts | Yes: claude.ai and Google Fonts |
| Downloadable single file | `prototype/offline/dist/openact-offline.html` (0.9 MB) | Embedded: Courier Prime and Atkinson Hyperlegible Next, both SIL OFL 1.1, licences beside the file | No |
| Installable app (PWA) | `prototype/offline/dist/pwa/` | Embedded | Only for the first visit |

The installable edition adds a web app manifest, icons (including a maskable one) and a hand-written service worker that caches the app shell and serves it cache-first, refreshing the copy in the background. The product will generate its worker with vite-plugin-pwa (ADR-0006); this one only proves the approach.

## How it was tested
The same smoke test ran in each mode: open the screenplay sample, wait for fonts, count pages, type a new element with Enter, wait for autosave, open the review, reload, and confirm the edit survived. Network requests and page errors were recorded throughout.

- **A. Hosted, online:** the published page served locally, with internet access.
- **B. Installed, online:** the PWA served from a local web server, first visit, then reloaded under the service worker.
- **C. Installed, offline:** the web server stopped and the browser set offline, then the page reloaded and a new tab opened on the app's address.
- **D. Downloaded file, offline:** `openact-offline.html` opened from disk with every non-file request blocked.

## Results
| | A. Hosted online | B. Installed online | C. Installed offline | D. File offline |
|---|---|---|---|---|
| App loads | Yes | Yes | Yes, from the cache | Yes |
| Time to ready | 0.77 s | 0.60 s | 0.04 s | 0.84 s |
| Script font (Courier Prime) | From Google | Embedded | Embedded | Embedded |
| Pages in the sample | 2 | 2 | 2 | 2 |
| Enter flow creates the expected element | Yes | Yes | Yes | Yes |
| Review results (fix, consider, passed) | 1, 3, 12 | 1, 3, 12 | 1, 3, 12 | 1, 3, 12 |
| Edit kept after reload | Yes | Yes | Yes, including an edit made offline | Yes |
| Requests to other sites | fonts.googleapis.com, fonts.gstatic.com | None | None | None |
| Page errors | None | None | None | None |
| Chrome installability errors | – | None; the manifest parses cleanly | – | – |
| Service worker controls the page | – | Yes | Yes; a new tab also opens offline | – |

Element types differ between rows only because each mode starts from a different last element (Enter after a transition gives a scene heading; after a scene heading, an action), which is the flow working as designed.

## What this means for the product
1. **Bundle the fonts.** Loading fonts from Google breaks offline use, and it sends each visitor's IP address to Google, which a German court held unlawful without consent (LG München I, 3 O 17493/20, 20 January 2022; reported, not read in full). Self-hosting fixes both. Recorded as D-026.
2. **Ship as a PWA with a precached shell** (ADR-0006, slice 11). The test shows the approach works: installable, opens offline instantly, keeps edits.
3. **Show updates, don't force them.** Cache-first means a new version applies on the next launch; the product should say "Update ready" and let the writer reload when they choose.
4. **The hosted Artifact is for demos only.** It needs claude.ai and a connection; anyone who wants OpenAct offline uses the download or the installed app.

## Limits of this check
- **Chromium only.** Playwright's Chromium was the only browser in the sandbox. Safari and Firefox need the same test before release (testing.md, slice 11), on real iPhone and Android devices too.
- **Storage.** The prototype saves to `localStorage`. The product uses IndexedDB with `navigator.storage.persist()` and backups (ADR-0003), because browsers can clear storage; Safari's limits on sites that aren't installed are the strictest.
- **Opening from disk.** Browsers give files opened from disk their own storage: in Chromium all local files share one, and other browsers differ. The single file suits trying OpenAct offline; installing the app is the dependable route.
- **Clipboard.** Copying export text needs a secure page (HTTPS or localhost); from a file on disk the prototype falls back to selecting the text.

## Try it
- Download `prototype/offline/dist/openact-offline.html` and open it in a browser with Wi-Fi off.
- Or serve `prototype/offline/dist/pwa/` (for example `python3 -m http.server --directory prototype/offline/dist/pwa`), open it, choose **Install** in the browser's address bar, then go offline.
