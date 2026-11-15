#!/bin/bash
DATA="${XDG_DATA_HOME:-$HOME/.local/share}"
echo
echo "  This removes OpenAct from this computer."
echo "  It also removes the scripts OpenAct kept inside its app window."
echo "  Scripts you saved as .openact files, or exported, are not touched."
echo "  If you have not saved a script to a file, open OpenAct first and use Save."
echo
read -r -p "  Remove OpenAct now? Type y and press Return: " a
if [ "$a" != "y" ] && [ "$a" != "Y" ]; then echo "  Nothing was removed."; exit 0; fi
rm -f "$DATA/applications/openact.desktop" "$DATA/icons/hicolor/512x512/apps/openact.png"
rm -rf "$DATA/openact"
echo "  OpenAct has been removed. Thank you for trying it."
