#!/bin/sh
# Mac: double-click this file (or run it in Terminal) to start the shop.
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Is computer par Node.js nahi hai. https://nodejs.org se LTS version install karo, phir ye file dobara kholo."
  read -r _; exit 1
fi
if [ ! -f node_modules/express/package.json ]; then
  echo "Pehli baar: shop ke zaroori parts download ho rahe hain. Is step ke liye internet chahiye..."
  npm ci --omit=dev --no-audit --no-fund || { echo "Download nahi hua. Internet check karke dobara kholo."; read -r _; exit 1; }
fi
node setup.js || { read -r _; exit 1; }
node server.js --open
