#!/bin/bash
DATA="$HOME/Library/Application Support/OpenAct"
APP="$HOME/Applications/OpenAct.app"
echo
echo "  This removes OpenAct from this Mac."
echo "  It also removes the scripts OpenAct kept inside its app window."
echo "  Scripts you saved as .openact files, or exported, are not touched."
echo "  If you have not saved a script to a file, open OpenAct first and use Save."
echo
read -r -p "  Remove OpenAct now? Type y and press Return: " a
if [ "$a" != "y" ] && [ "$a" != "Y" ]; then echo "  Nothing was removed."; exit 0; fi
rm -rf "$APP"
rm -rf "$DATA"
echo "  OpenAct has been removed. Thank you for trying it."
read -r -p "  Press Return to close. " _
