#!/usr/bin/env bash
#
# assemble.sh – combine the web, bot/worker and shared/infra packages into a
# unified monorepo.
#
# It supports either:
#   1. already-extracted folders:
#      freeagentsltd-web/
#      freeagentsltd-bot-worker/
#      freeagentsltd-shared-infra/
#
#   2. zip files in the same directory as this script:
#      freeagentsltd-web.zip
#      freeagentsltd-bot-worker.zip
#      freeagentsltd-shared-infra.zip
#
# It creates:
#   freeagentsltd/
#     apps/web
#     apps/bot-worker
#     packages/shared
#     scripts
#     package.json
#     pnpm-workspace.yaml
#     turbo.json
#     README.md
#     .env.example
#     render-web.yaml
#     render-bot-worker.yaml
#     assemble.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
TARGET_DIR="$ROOT_DIR/freeagentsltd"

WEB_DIR="$ROOT_DIR/freeagentsltd-web"
BOT_DIR="$ROOT_DIR/freeagentsltd-bot-worker"
INFRA_DIR="$ROOT_DIR/freeagentsltd-shared-infra"

WEB_ZIP="$ROOT_DIR/freeagentsltd-web.zip"
BOT_ZIP="$ROOT_DIR/freeagentsltd-bot-worker.zip"
INFRA_ZIP="$ROOT_DIR/freeagentsltd-shared-infra.zip"

FORCE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)
      FORCE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Error: required command '$1' is not installed."
    exit 1
  }
}

extract_if_needed() {
  local dir="$1"
  local zip="$2"
  local label="$3"

  if [[ -d "$dir" ]]; then
    echo "$label directory already exists: $dir"
    return
  fi

  if [[ -f "$zip" ]]; then
    need_cmd unzip
    echo "Extracting $zip ..."
    unzip -q "$zip" -d "$ROOT_DIR"
  fi

  if [[ ! -d "$dir" ]]; then
    echo "Error: expected directory $dir not found."
    echo "Make sure $label is present as either:"
    echo "  - extracted folder: $(basename "$dir")/"
    echo "  - zip file: $(basename "$zip")"
    exit 1
  fi
}

copy_dir_contents() {
  local src="$1"
  local dest="$2"
  mkdir -p "$dest"
  cp -R "$src"/. "$dest"/
}

echo "Assembling FreeAgentsLTD monorepo..."

extract_if_needed "$WEB_DIR" "$WEB_ZIP" "web"
extract_if_needed "$BOT_DIR" "$BOT_ZIP" "bot-worker"
extract_if_needed "$INFRA_DIR" "$INFRA_ZIP" "shared-infra"

if [[ -d "$TARGET_DIR" ]]; then
  if [[ "$FORCE" == "false" ]]; then
    echo "Error: directory $TARGET_DIR already exists. Use --force to overwrite."
    exit 1
  fi
  echo "Removing existing $TARGET_DIR..."
  rm -rf "$TARGET_DIR"
fi

mkdir -p "$TARGET_DIR/apps/web"
mkdir -p "$TARGET_DIR/apps/bot-worker"
mkdir -p "$TARGET_DIR/packages/shared"
mkdir -p "$TARGET_DIR/scripts"

echo "Copying web application..."
copy_dir_contents "$WEB_DIR" "$TARGET_DIR/apps/web"

echo "Copying bot/worker application..."
copy_dir_contents "$BOT_DIR" "$TARGET_DIR/apps/bot-worker"

echo "Copying shared package..."
copy_dir_contents "$INFRA_DIR/packages/shared" "$TARGET_DIR/packages/shared"

echo "Copying root configuration..."
cp "$INFRA_DIR/package.json" "$TARGET_DIR/package.json"
cp "$INFRA_DIR/pnpm-workspace.yaml" "$TARGET_DIR/pnpm-workspace.yaml"
cp "$INFRA_DIR/turbo.json" "$TARGET_DIR/turbo.json"
cp "$INFRA_DIR/README.md" "$TARGET_DIR/README.md"
cp "$INFRA_DIR/.env.example" "$TARGET_DIR/.env.example"
cp "$INFRA_DIR/render-web.yaml" "$TARGET_DIR/render-web.yaml"
cp "$INFRA_DIR/render-bot-worker.yaml" "$TARGET_DIR/render-bot-worker.yaml"
cp "$0" "$TARGET_DIR/assemble.sh"

echo "Copying helper scripts..."
copy_dir_contents "$INFRA_DIR/scripts" "$TARGET_DIR/scripts"

chmod +x "$TARGET_DIR/assemble.sh" || true
chmod +x "$TARGET_DIR/scripts"/*.sh || true

echo
echo "FreeAgentsLTD monorepo assembled successfully at:"
echo "  $TARGET_DIR"
echo
echo "Next steps:"
echo "  cd \"$TARGET_DIR\""
echo "  cp .env.example .env"
echo "  pnpm install"
echo "  ./scripts/dev-all.sh"