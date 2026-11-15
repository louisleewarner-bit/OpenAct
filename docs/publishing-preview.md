# Publishing the free preview

OpenAct 1.0 is a public preview: free (D-036), GPL-3.0-or-later (D-041), no account, nothing uploaded. These steps need your accounts and your decisions, so nothing here has been done for you. Time: about an hour, plus the name check.

## 1. Before anything is public
1. **Name check.** Search the UK Intellectual Property Office trade mark register (classes 9 and 42) and the app stores for "OpenAct" and "Act One". The shortlist and findings are in docs/research/. The name is unverified until you do this, and a conflict means renaming (D-029, one script: `docs/` and `prototype/` use the name in text only).
2. **Say "preview".** The landing page and release notes already say public preview. Keep that word in the repository description, the release title and any post.
3. **Your name in the licence.** Done: Copyright © 2026 Louis Lee Warner is in `LICENSE.md`, `prototype/LICENSE` and the About screen.
4. **Contact for problems.** Done: the privacy note points to the repository's issue tracker (no email address is published).

## 2. The repository
```bash
cd script-app-kit
git init -b main
git add -A
git commit -m "OpenAct 1.0 preview"
gh repo create openact --public --source . --push --description "Free, local-first script writing for stage and screen (preview)"
```
`.gitignore` already leaves out node_modules, build folders and `tests/private` (your own scripts, D-022). Check `git status` shows no private files before the first commit. `.github/workflows/ci.yml` runs the checks on every push.

## 3. The release
```bash
python3 release/build-release.py <scratch dir>      # makes release/out/
gh release create v1.0-preview release/out/OpenAct-preview-1.0.zip release/out/OpenAct-preview-1.0.zip.sha256 \
  --prerelease --title "OpenAct 1.0 (public preview)" --notes-file release/out/OpenAct-preview-1.0/RELEASE-NOTES.txt
```
`--prerelease` keeps it labelled as a preview. People verify the download with `SHA256SUMS.txt` inside the zip, or the `.sha256` file beside it.

## 4. The website
The site in `release/out/site/` is static and loads nothing from other sites, so any static host works for £0 (GitHub Pages, Cloudflare Pages, Netlify). With GitHub Pages: push `release/out/site/` to a `gh-pages` branch, or point Pages at a `docs/` copy. The installable app lives at `/app/`, and it works offline after the first visit. Check it with `node release/check-release.cjs` against the live URL's files before you announce.

## 5. Say what it is
Suggested wording: "OpenAct is a free, open-source script editor for stage and screen, now in public preview. It keeps your scripts on your device. Real PDF and Word export, 16 formats including video game scripts. Tested in Chrome; not yet tried in Word, Final Draft, Safari or Firefox, so please report problems."

## Known limits to repeat in the release
The install files are unsigned (Windows and macOS will warn once), and the Windows installer has not been run on a real PC: run it on one before announcing. Real Word, Final Draft, Safari, Firefox and phone keyboards have not been tried. Final Draft indent units are unverified. Importing Ink and Yarn files is not built. The name is not cleared until step 1 is done.
