#!/usr/bin/env bash
# Ukrainian TTS Bench — one-shot setup + run.
set -euo pipefail
cd "$(dirname "$0")"

VENV=.venv
PORT="${PORT:-8320}"

if ! command -v espeak-ng >/dev/null 2>&1; then
  echo "▸ installing espeak-ng (system package)"
  sudo apt-get install -y espeak-ng
fi

if [ ! -d "$VENV" ]; then
  echo "▸ creating venv"
  python3 -m venv "$VENV"
fi

echo "▸ installing backend deps"
"$VENV/bin/pip" install -q -r backend/requirements.txt

echo "▸ ensuring TTS models are downloaded (first run ~150MB)"
"$VENV/bin/python" scripts/download_models.py

if [ ! -d frontend/dist ]; then
  echo "▸ building frontend"
  (cd frontend && (pnpm install --silent || npm install --silent) && (pnpm build || npm run build))
fi

echo "▸ serving on http://localhost:${PORT}"
exec "$VENV/bin/uvicorn" backend.main:app --host 0.0.0.0 --port "$PORT"
