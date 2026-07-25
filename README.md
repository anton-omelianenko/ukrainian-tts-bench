# Ukrainian TTS Bench 🇺🇦

Compare Ukrainian speech synthesis across four local TTS engines — side by side, one click.

| Engine | Model | Voices | Sample rate |
|---|---|---|---|
| **Supertonic 3** | Supertone ONNX (v1.3.1, `supertonic-3`) | F1–F5, M1–M4 | 24 kHz |
| **Silero** | `v4_ua` (PyTorch package) | mykyta, random | 8 / 24 / 48 kHz |
| **Meta MMS-TTS** | `facebook/mms-tts-ukr` (VITS) | single | 16 kHz |
| **espeak-ng** | formant synthesizer | uk | 22.05 kHz |

Dark, elevenlabs.io-inspired UI. Select multiple engines, type Ukrainian text, hit **Generate** — get one audio card per engine with generation time, audio duration, sample rate, playback and download. History of past generations included.

## Quick start

```bash
./start.sh
```

Then open **http://localhost:8320**.

`start.sh` creates a Python venv, installs backend deps, downloads the TTS models on first run (~150 MB total, cached afterwards), builds the frontend, and serves everything from one FastAPI process on port **8320**.

Requirements: Python 3.10+, Node 18+ (build only), `espeak-ng`, ~2 GB disk for deps + models.

## Development

```bash
# backend (hot reload)
source .venv/bin/activate
uvicorn backend.main:app --reload --port 8320

# frontend (Vite dev server with /api proxy to :8320)
cd frontend && pnpm dev
```

## API

| Endpoint | Description |
|---|---|
| `GET /api/engines` | Engine availability, voices, default params |
| `POST /api/generate` | `{text, engines: [{engine, voice?, speed?}]}` → per-engine audio results (engines run concurrently, per-engine errors isolated) |
| `GET /api/audio/{file}` | Stream a generated WAV |
| `GET /api/history` | Past generations, newest first |

## Layout

```
backend/            FastAPI app
  engines/          one adapter per TTS engine (drop-in registry)
frontend/           Vite + React + TypeScript + Tailwind v4
outputs/            generated WAVs + metadata sidecars (gitignored)
scripts/download_models.py   one-time model prefetch
start.sh            setup + run
```

## Notes

- All synthesis is local and CPU-only. No API keys, no cloud calls.
- Supertonic 3 natively supports Ukrainian (`lang='uk'`); Silero `v4_ua` and MMS-TTS `ukr` are Ukrainian-trained; espeak-ng is a formant synthesizer — included as a baseline.
- Generated audio is retained under `outputs/` — delete that folder to purge history.

## License

MIT (app code). Engine models have their own licenses: Supertonic (see model card), Silero (CC BY-NC-SA 4.0 — non-commercial), MMS-TTS (CC-BY-NC 4.0), espeak-ng (GPL v3).
