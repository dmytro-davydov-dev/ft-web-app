#!/usr/bin/env bash
# deploy-dev.sh — build ft-web-app and deploy to Firebase Hosting (flowterra-dev)
# Usage: bash deploy-dev.sh
set -euo pipefail

cd "$(dirname "$0")"

echo "▶ Installing / checking dependencies..."
yarn install --frozen-lockfile

echo "▶ Type-checking + building..."
yarn build

echo "▶ Deploying to Firebase Hosting (flowterra-dev)..."
npx firebase-tools deploy --only hosting --project flowterra-dev

echo "✅ Done — https://flowterra-dev.web.app"
