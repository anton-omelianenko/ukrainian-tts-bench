"""FastAPI app for Ukrainian TTS Bench."""

from __future__ import annotations

import json
import re
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import soundfile as sf
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .registry import get_engine, get_engines

REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUTS_DIR = REPO_ROOT / "outputs"
FRONTEND_DIST = REPO_ROOT / "frontend" / "dist"

MAX_TEXT_LEN = 1500
MAX_ENGINES_PER_REQUEST = 12  # variants: same engine may repeat with different voices
HISTORY_LIMIT = 50

app = FastAPI(title="Ukrainian TTS Bench")

_executor = ThreadPoolExecutor(max_workers=4)


# ---------------------------------------------------------------------------
# Models


class EngineRequest(BaseModel):
    engine: str
    voice: str | None = None
    speed: float | None = None


class GenerateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=MAX_TEXT_LEN)
    engines: list[EngineRequest] = Field(min_length=1, max_length=MAX_ENGINES_PER_REQUEST)


class RateRequest(BaseModel):
    """Rate one result of a generation: 1 = like, -1 = dislike, 0 = clear."""

    index: int = Field(ge=0)
    rating: int = Field(ge=-1, le=1)


# ---------------------------------------------------------------------------
# Synthesis


def _run_one(engine_id: str, voice: str | None, speed: float | None, text: str, gen_id: str, index: int) -> dict[str, Any]:
    """Run one engine; never raises — errors are returned in the result dict."""
    engine = get_engine(engine_id)
    if engine is None:
        return {
            "engine": engine_id,
            "voice": voice or "",
            "ok": False,
            "error": "engine not available",
            "audio_url": None,
            "generation_ms": 0,
            "audio_duration_sec": 0.0,
            "sample_rate": 0,
            "rating": 0,
        }

    resolved_voice = engine.resolve_voice(voice)
    resolved_speed = engine.clamp_speed(speed)
    # index in the filename keeps duplicate engine+voice variants from clobbering each other
    out_path = OUTPUTS_DIR / f"{gen_id}-{index}-{engine_id}.wav"

    started = time.perf_counter()
    try:
        engine.ensure_loaded()
        meta = engine.synthesize(text, resolved_voice, resolved_speed, out_path)
        generation_ms = int((time.perf_counter() - started) * 1000)
        audio_info = sf.info(str(out_path))
        return {
            "engine": engine_id,
            "voice": resolved_voice,
            "ok": True,
            "error": None,
            "audio_url": f"/api/audio/{out_path.name}",
            "generation_ms": generation_ms,
            "audio_duration_sec": round(audio_info.frames / audio_info.samplerate, 3),
            "sample_rate": meta["sample_rate"],
            "rating": 0,
        }
    except Exception as exc:  # noqa: BLE001 — per-engine isolation
        out_path.unlink(missing_ok=True)
        generation_ms = int((time.perf_counter() - started) * 1000)
        return {
            "engine": engine_id,
            "voice": resolved_voice,
            "ok": False,
            "error": f"{type(exc).__name__}: {exc}",
            "audio_url": None,
            "generation_ms": generation_ms,
            "audio_duration_sec": 0.0,
            "sample_rate": 0,
            "rating": 0,
        }


# ---------------------------------------------------------------------------
# Routes


@app.get("/api/engines")
def api_engines() -> dict[str, Any]:
    infos = get_engines()
    return {
        "engines": [
            {
                "id": info.id,
                "label": info.label,
                "description": info.description,
                "voices": [
                    {"id": voice.id, "label": voice.label, "gender": voice.gender}
                    for voice in info.voices
                ],
                "default_voice": info.default_voice,
                "default_speed": info.default_speed,
                "speed_min": info.speed_min,
                "speed_max": info.speed_max,
                "available": info.available,
                "unavailable_reason": info.unavailable_reason,
            }
            for info in infos
        ]
    }


@app.post("/api/generate")
def api_generate(request: GenerateRequest) -> dict[str, Any]:
    for engine_request in request.engines:
        if engine_request.engine not in {info.id for info in get_engines()}:
            raise HTTPException(
                status_code=422, detail=f"unknown engine: {engine_request.engine!r}"
            )

    gen_id = uuid.uuid4().hex
    created_at = datetime.now(timezone.utc).isoformat()

    futures = [
        _executor.submit(
            _run_one, engine_request.engine, engine_request.voice, engine_request.speed,
            request.text, gen_id, index,
        )
        for index, engine_request in enumerate(request.engines)
    ]
    results = [future.result() for future in futures]

    response = {
        "id": gen_id,
        "text": request.text,
        "created_at": created_at,
        "results": results,
    }

    sidecar = OUTPUTS_DIR / f"{gen_id}.json"
    sidecar.write_text(json.dumps(response, ensure_ascii=False, indent=2), encoding="utf-8")

    return response


_UUID_FILE_RE = re.compile(r"^[0-9a-f]{32}(?:-[0-9a-z]+)*\.wav$")


@app.get("/api/audio/{filename}")
def api_audio(filename: str) -> FileResponse:
    # Path-traversal guard: only plain flat uuid[-index-engine].wav names.
    if not _UUID_FILE_RE.match(filename):
        raise HTTPException(status_code=404, detail="not found")
    path = OUTPUTS_DIR / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="not found")
    return FileResponse(str(path), media_type="audio/wav", filename=filename)


def _load_generations() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for sidecar in OUTPUTS_DIR.glob("*.json"):
        try:
            items.append(json.loads(sidecar.read_text(encoding="utf-8")))
        except (json.JSONDecodeError, OSError):
            continue
    items.sort(key=lambda item: item.get("created_at", ""), reverse=True)
    return items


@app.get("/api/history")
def api_history() -> dict[str, Any]:
    return {"items": _load_generations()[:HISTORY_LIMIT]}


@app.post("/api/generations/{gen_id}/rate")
def api_rate(gen_id: str, request: RateRequest) -> dict[str, Any]:
    """Like (1) / dislike (-1) / clear (0) one result of a generation."""
    if not re.fullmatch(r"[0-9a-f]{32}", gen_id):
        raise HTTPException(status_code=404, detail="not found")
    sidecar = OUTPUTS_DIR / f"{gen_id}.json"
    if not sidecar.is_file():
        raise HTTPException(status_code=404, detail="not found")

    try:
        generation = json.loads(sidecar.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        raise HTTPException(status_code=500, detail="corrupt generation record") from exc

    results = generation.get("results", [])
    if request.index >= len(results):
        raise HTTPException(status_code=422, detail="result index out of range")

    results[request.index]["rating"] = request.rating
    sidecar.write_text(json.dumps(generation, ensure_ascii=False, indent=2), encoding="utf-8")
    return generation


@app.get("/api/ratings")
def api_ratings() -> dict[str, Any]:
    """Aggregate likes/dislikes per engine and per engine+voice across all generations."""
    by_engine: dict[str, dict[str, int]] = {}
    by_voice: dict[str, dict[str, Any]] = {}

    for generation in _load_generations():
        for result in generation.get("results", []):
            rating = result.get("rating", 0)
            if rating == 0:
                continue
            engine_id = result.get("engine", "")
            voice = result.get("voice") or ""
            key = f"{engine_id}:{voice}"
            engine_stats = by_engine.setdefault(engine_id, {"likes": 0, "dislikes": 0})
            voice_stats = by_voice.setdefault(
                key, {"engine": engine_id, "voice": voice, "likes": 0, "dislikes": 0}
            )
            bucket = "likes" if rating > 0 else "dislikes"
            engine_stats[bucket] += 1
            voice_stats[bucket] += 1

    return {
        "by_engine": [{"engine": engine, **stats} for engine, stats in by_engine.items()],
        "by_voice": list(by_voice.values()),
    }


# ---------------------------------------------------------------------------
# Startup + static frontend


@app.on_event("startup")
def _startup() -> None:
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)


if FRONTEND_DIST.is_dir():
    index_html = FRONTEND_DIST / "index.html"

    # Serve built assets (vite: /assets/*) as static files.
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str) -> FileResponse:
        # Let /api/* 404 naturally if unmatched; everything else is the SPA.
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="not found")
        candidate = FRONTEND_DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(str(candidate))
        return FileResponse(str(index_html))
