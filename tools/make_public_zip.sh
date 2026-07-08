#!/usr/bin/env bash
set -euo pipefail

# Create a zip of tracked files excluding patterns in .notpublic and backend.zip
EXCLUDE_PATTERNS=("backend.zip")
if [ -f .notpublic ]; then
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    EXCLUDE_PATTERNS+=("$line")
  done < .notpublic
fi

TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE"' EXIT

git ls-files | while IFS= read -r f; do
  skip=false
  for p in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ "$f" == "$p" ]] || [[ "$f" == $p/* ]]; then
      skip=true
      break
    fi
  done
  if [ "$skip" = false ]; then
    echo "$f" >> "$TMPFILE"
  fi
done

OUT="public_export_$(date -u +%Y%m%d).zip"
if [ -s "$TMPFILE" ]; then
  zip -@ "$OUT" < "$TMPFILE"
  echo "Created $OUT"
else
  echo "No files to include. No archive created." >&2
  exit 1
fi
