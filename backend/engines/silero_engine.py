"""Silero v4_ua TTS engine (torch.hub)."""

from __future__ import annotations

import os
import threading
from pathlib import Path

import soundfile as sf
import torch

torch.set_num_threads(max(1, (os.cpu_count() or 2) // 2))

from .base import EngineInfo, TTSEngine, VoiceInfo

SAMPLE_RATE = 48000

_VOICES = [
    VoiceInfo(id="mykyta", label="Mykyta", gender="male"),
    VoiceInfo(id="random", label="Random", gender="neutral"),
]


class SileroEngine(TTSEngine):
    info = EngineInfo(
        id="silero",
        label="Silero v4 UA",
        description="Silero Models v4_ua (torch.hub), 48 kHz.",
        voices=_VOICES,
        default_voice="mykyta",
        default_speed=1.0,
        speed_min=0.5,
        speed_max=2.0,
    )

    def __init__(self) -> None:
        super().__init__()
        self._model = None

    def _load(self) -> None:
        model, _example = torch.hub.load(
            "snakers4/silero-models",
            "silero_tts",
            language="ua",
            speaker="v4_ua",
            trust_repo=True,
        )
        self._model = model

    def synthesize(self, text: str, voice: str, speed: float, out_path: Path) -> dict:
        assert self._model is not None, "ensure_loaded() must be called first"
        # Silero inference is NOT thread-safe.
        with self._infer_lock:
            audio = self._model.apply_tts(
                text=text, speaker=voice, sample_rate=SAMPLE_RATE
            )
        sf.write(str(out_path), audio, SAMPLE_RATE)
        return {"sample_rate": SAMPLE_RATE}
