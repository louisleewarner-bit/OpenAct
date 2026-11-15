#!/bin/bash
# Build the prototype and turn it into the Artifact page fragment: artifact/openact-prototype.html
set -e
cd "$(dirname "$0")/.."
rm -rf dist .parcel-cache
pnpm exec parcel build index.html --dist-dir dist --no-source-maps --log-level error
pnpm exec html-inline dist/index.html > bundle.html
python3 -I artifact/build-fragment.py bundle.html artifact/openact-prototype.html
# Offline editions: one downloadable file and an installable app, fonts embedded (offline/dist).
python3 -I artifact/build-offline.py bundle.html offline
