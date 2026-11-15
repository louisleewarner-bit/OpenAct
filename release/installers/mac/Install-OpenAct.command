#!/bin/bash
# Installs OpenAct for this user: ~/Applications/OpenAct.app. Needs no password. Nothing is sent anywhere.
cd "$(dirname "$0")" || exit 1
HERE="$(pwd)"
DATA="$HOME/Library/Application Support/OpenAct"
APP="$HOME/Applications/OpenAct.app"

echo
echo "  Installing OpenAct, the free script editor, for you only."
echo

if [ ! -f "$HERE/OpenAct.html" ] || [ ! -f "$HERE/installer/icon-512.png" ]; then
  echo "  The installer can't find OpenAct.html next to it."
  echo "  Unzip the whole download first, then run this again from the unzipped folder."
  echo; read -r -p "  Press Return to close. " _; exit 1
fi

fail() {
  echo
  echo "  Something went wrong while installing. Nothing was sent anywhere."
  echo "  You can still use OpenAct without installing: open OpenAct.html in the unzipped folder."
  echo; read -r -p "  Press Return to close. " _; exit 1
}

mkdir -p "$DATA" "$HOME/Applications" || fail
cp "$HERE/OpenAct.html" "$DATA/OpenAct.html" || fail
cp "$HERE/LICENSE" "$DATA/LICENSE" 2>/dev/null
cp "$HERE/installer/Uninstall OpenAct.command" "$DATA/Uninstall OpenAct.command" && chmod +x "$DATA/Uninstall OpenAct.command"

# The app: a small launcher that opens the page in its own window, using Chrome, Edge, Brave or Chromium if present, otherwise your default browser.
if [ -d "$APP" ]; then rm -rf "$APP" || fail; fi
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources" || fail
cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>OpenAct</string>
<key>CFBundleDisplayName</key><string>OpenAct</string>
<key>CFBundleIdentifier</key><string>app.openact.launcher</string>
<key>CFBundleExecutable</key><string>OpenAct</string>
<key>CFBundleIconFile</key><string>OpenAct</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>1.0</string>
<key>LSMinimumSystemVersion</key><string>10.13</string>
<key>NSHighResolutionCapable</key><true/>
</dict></plist>
PLIST
cat > "$APP/Contents/MacOS/OpenAct" <<'LAUNCH'
#!/bin/bash
DATA="$HOME/Library/Application Support/OpenAct"
PAGE="$DATA/OpenAct.html"
URL="file://${PAGE// /%20}"
for B in "Google Chrome" "Microsoft Edge" "Brave Browser" "Chromium"; do
  for BASE in "/Applications" "$HOME/Applications"; do
    BIN="$BASE/$B.app/Contents/MacOS/$B"
    if [ -x "$BIN" ]; then
      exec "$BIN" --app="$URL" --user-data-dir="$DATA/profile" --no-first-run --no-default-browser-check
    fi
  done
done
exec /usr/bin/open "$PAGE"
LAUNCH
chmod +x "$APP/Contents/MacOS/OpenAct"

# The icon, made here from the picture in the download.
if command -v sips >/dev/null 2>&1 && command -v iconutil >/dev/null 2>&1; then
  SET="$(mktemp -d)/OpenAct.iconset"; mkdir -p "$SET"
  for s in 16 32 64 128 256 512; do sips -z $s $s "$HERE/installer/icon-512.png" --out "$SET/icon_${s}x${s}.png" >/dev/null 2>&1; done
  for s in 16 32 128 256; do d=$((s * 2)); cp "$SET/icon_${d}x${d}.png" "$SET/icon_${s}x${s}@2x.png"; done
  iconutil -c icns "$SET" -o "$APP/Contents/Resources/OpenAct.icns" >/dev/null 2>&1 || true
fi
xattr -dr com.apple.quarantine "$APP" "$DATA" 2>/dev/null
touch "$APP"

echo "  Done. OpenAct is in your Applications folder (inside your home folder)."
echo "  To remove it later, run  Uninstall OpenAct.command  from \"$DATA\"."
echo
open "$APP" 2>/dev/null
read -r -p "  Press Return to close this window. " _
