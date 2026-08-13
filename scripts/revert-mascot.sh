#!/usr/bin/env bash
# Script to revert Mascot SVG and Item Catalog changes back to pre-revamp state

echo "Reverting Mascot SVG and Item Catalog files to 'pre-mascot-revamp' tag..."

git checkout pre-mascot-revamp -- \
  src/components/Mascot.jsx \
  src/utils/itemsCatalog.js \
  src/components/WorkshopModal.jsx

echo "Done! Restored Mascot.jsx, itemsCatalog.js, and WorkshopModal.jsx to pre-mascot-revamp state."
