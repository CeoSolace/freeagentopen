#!/usr/bin/env bash
#
# dev-all.sh – start both the web and bot-worker applications in development
# mode concurrently.  This script should be run from the root of the
# assembled monorepo (`freeagentsltd/`).  It uses pnpm workspace filters
# to run the dev scripts defined in each package.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$ROOT_DIR"

echo "Starting web and bot-worker services in development mode..."

# Start the web dev server in the background
pnpm --filter web dev &
WEB_PID=$!

# Start the bot-worker dev server in the background
pnpm --filter bot-worker dev &
BOT_PID=$!

cleanup() {
  echo "\nStopping development servers..."
  kill "$WEB_PID" "$BOT_PID" 2>/dev/null || true
  wait "$WEB_PID" 2>/dev/null || true
  wait "$BOT_PID" 2>/dev/null || true
}

trap cleanup SIGINT SIGTERM

wait -n "$WEB_PID" "$BOT_PID"
cleanup