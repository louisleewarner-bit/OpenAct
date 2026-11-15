#!/bin/bash
# Installs OpenAct for this user: an entry in your applications menu. Needs no password. Nothing is sent anywhere.
cd "$(dirname "$0")" || exit 1
HERE="$(pwd)"
DATA="${XDG_DATA_HOME:-$HOME/.local/share}"
DEST="$DATA/openact"

pause() { if [ -t 0 ]; then echo; read -r -p "  Press Return to close. " _; fi; }
fail() { echo; echo "  Something went wrong while installing. Nothing was sent anywhere."; echo "  You can still use OpenAct without installing: open OpenAct.html in the unzipped folder."; pause; exit 1; }

echo
echo "  Installing OpenAct, the free script editor, for you only."
echo
if [ ! -f "$HERE/OpenAct.html" ] || [ ! -f "$HERE/installer/icon-512.png" ]; then
  echo "  The installer can't find OpenAct.html next to it."
  echo "  Unzip the whole download first, then run this again from the unzipped folder."
  pause; exit 1
fi

mkdir -p "$DEST" "$DATA/applications" "$DATA/icons/hicolor/512x512/apps" || fail
cp "$HERE/OpenAct.html" "$DEST/OpenAct.html" || fail
cp "$HERE/LICENSE" "$DEST/LICENSE" 2>/dev/null
cp "$HERE/installer/icon-512.png" "$DATA/icons/hicolor/512x512/apps/openact.png" || fail
cp "$HERE/installer/uninstall-openact.sh" "$DEST/uninstall-openact.sh" && chmod +x "$DEST/uninstall-openact.sh"

cat > "$DEST/openact-launch.sh" <<'LAUNCH'
#!/bin/bash
DEST="${XDG_DATA_HOME:-$HOME/.local/share}/openact"
PAGE="$DEST/OpenAct.html"
URL="file://$PAGE"
URL="${URL// /%20}"
for B in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge microsoft-edge-stable brave-browser; do
  if command -v "$B" >/dev/null 2>&1; then
    exec "$B" --app="$URL" --user-data-dir="$DEST/profile" --no-first-run --no-default-browser-check
  fi
done
exec xdg-open "$PAGE"
LAUNCH
chmod +x "$DEST/openact-launch.sh"

cat > "$DATA/applications/openact.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=OpenAct
GenericName=Script editor
Comment=The free script editor for stage and screen
Exec="$DEST/openact-launch.sh"
Icon=openact
Terminal=false
Categories=Office;TextEditor;
DESKTOP
chmod +x "$DATA/applications/openact.desktop"
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$DATA/applications" >/dev/null 2>&1
command -v gtk-update-icon-cache >/dev/null 2>&1 && gtk-update-icon-cache -q -t "$DATA/icons/hicolor" >/dev/null 2>&1

echo "  Done. Look for OpenAct in your applications menu."
echo "  To remove it later, run  $DEST/uninstall-openact.sh"
pause
