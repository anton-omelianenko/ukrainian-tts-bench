"""Supertonic TTS engine (ONNX, Ukrainian via supertonic-3)."""

from __future__ import annotations

import threading
from pathlib import Path

import soundfile as sf

from .base import EngineInfo, TTSEngine, VoiceInfo

_VOICES = [
    VoiceInfo(id="F1", label="Female 1", gender="female"),
    VoiceInfo(id="F2", label="Female 2", gender="female"),
    VoiceInfo(id="F3", label="Female 3", gender="female"),
    VoiceInfo(id="F4", label="Female 4", gender="female"),
    VoiceInfo(id="F5", label="Female 5", gender="female"),
    VoiceInfo(id="M1", label="Male 1", gender="male"),
    VoiceInfo(id="M2", label="Male 2", gender="male"),
    VoiceInfo(id="M3", label="Male 3", gender="male"),
    VoiceInfo(id="M4", label="Male 4", gender="male"),
]


class SupertonicEngine(TTSEngine):
    info = EngineInfo(
        id="supertonic",
        label="Supertonic 3",
        description="ONNX-based multilingual TTS (supertonic-3), 9 voices, 44.1 kHz.",
        voices=_VOICES,
        default_voice="F1",
        default_speed=1.0,
        speed_min=0.5,
        speed_max=2.0,
    )

    def __init__(self) -> None:
        super().__init__()
        self._tts = None

    def _load(self) -> None:
        from supertonic import TTS

        self._tts = TTS()  # supertonic-3, auto-downloads to ~/.cache/supertonic3

    def synthesize(self, text: str, voice: str, speed: float, out_path: Path) -> dict:
        assert self._tts is not None, "ensure_loaded() must be called first"
        tts = self._tts
        style = tts.get_voice_style(voice)
        # ONNX runtime releases the GIL, but keep a lock anyway: supertonic's
        # internal sessions are not documented as thread-safe.
        with self._infer_lock:
            audio, _duration = tts.synthesize(
                text, style, speed=speed, lang="uk"
            )
        waveform = audio[0] if getattr(audio, "ndim", 1) > 1 else audio
        sf.write(str(out_path), waveform, tts.sample_rate)
        return {"sample_rate": int(tts.sample_rate)}
