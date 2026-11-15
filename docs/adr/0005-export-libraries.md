# ADR-0005: PDF, Word, Fountain and FDX

**Status:** Accepted · **Date:** 2026-11-08 · **Deciders:** owner

## Context
Exports run in the browser, offline, with no server. The PDF must be laid out exactly as the page view (R11) with embedded fonts; the Word file must keep editable styles for directors.

## Decision
- **PDF:** `jspdf` 4.x (MIT; last release 2026-03). Courier Prime's four styles are embedded with `addFileToVFS` and `addFont`; the renderer draws the layout engine's lines at exact coordinates and draws underlines as rules. Loaded only when exporting.
- **Word:** `docx` 9.x (MIT; released 2026-11). One named paragraph style per element, with the profile's indents in twips, A4 or US Letter margins, and Courier Prime as the font (Courier New as fallback). Word paginates its own copy; the export dialog says so.
- **Fountain:** our own `@openact/fountain` parser and serialiser (MIT), no dependencies.
- **FDX:** our own `@openact/fdx` (MIT), using `DOMParser` in the browser and `@xmldom/xmldom` (MIT, 0.9) in Node tests; external entities are never resolved.

## Options considered (PDF)
| | jsPDF 4 | pdf-lib 1.17 | PDFKit 0.20 |
|---|---|---|---|
| Maintenance | Active (2026) | No release since May 2022 | Active (2026) |
| Custom TrueType fonts | Yes (`addFont`) | Yes (with fontkit, also stale) | Yes (fontkit, subsetting) |
| Browser use | Native | Native | Needs a standalone build or polyfills |
| Size | Moderate | Small | Large |

## Trade-off analysis
pdf-lib has the nicest API but four years without a release is a risk for a long-lived app. PDFKit is strong but Node-first. jsPDF is maintained, browser-native and enough for placing monospaced text. The renderer sits behind a small interface, so swapping later costs one module.

## Consequences
- The fonts ship with the app (self-hosted, OFL), so exports and the interface work offline and make no third-party requests.
- A golden test extracts text positions from exported PDFs and compares them with the layout engine's output.

## Action items
1. [ ] Slice 5 spike: one page through jsPDF, compared with a reference PDF using the pdf skill's text extraction.
