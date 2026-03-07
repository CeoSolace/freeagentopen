#!/usr/bin/env bash
#
# check-env.sh – verify that required environment variables are set.  This
# script compares the keys in `.env.example` against your local `.env` file.
# It ignores commented and empty lines.  It will report any keys that are
# missing or unset.  Run this from the root of the assembled monorepo.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
TEMPLATE="$ROOT_DIR/.env.example"
ENV_FILE="$ROOT_DIR/.env"

if [[ ! -f "$TEMPLATE" ]]; then
  echo "Error: .env.example not found at $TEMPLATE"
  exit 1
fi
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: .env not found at $ENV_FILE"
  exit 1
fi

missing=0
while IFS= read -r line; do
  # Skip comments and empty lines
  [[ -z "$line" || "$line" == \#* ]] && continue
  key="${line%%=*}"
  # Trim whitespace
  key="$(echo "$key" | xargs)"
  if [[ -z "$key" ]]; then
    continue
  fi
  # If key not present in .env or value is empty
  if ! grep -q "^${key}=" "$ENV_FILE"; then
    echo "Missing environment variable: $key"
    missing=$((missing+1))
  else
    value="$(grep -m1 "^${key}=" "$ENV_FILE" | cut -d '=' -f 2-)"
    if [[ -z "$value" ]]; then
      echo "Unset environment variable: $key"
      missing=$((missing+1))
    fi
  fi
done < "$TEMPLATE"

if [[ $missing -eq 0 ]]; then
  echo "All environment variables are present and non-empty."
else
  echo "Found $missing missing or unset environment variables."
  exit 1
fi