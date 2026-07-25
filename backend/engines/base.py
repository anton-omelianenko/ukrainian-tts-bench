"""Base types for TTS engines."""

from __future__ import annotations

import threading
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class VoiceInfo:
    id: str
    label: str
    gender: str  # 'female' | 'male' | 'neutral'


@dataclass
class EngineInfo:
    id: str
    label: str
    description: str
    voices: list[VoiceInfo]
    default_voice: str
    default_speed: float
    speed_min: float = 0.5
    speed_max: float = 2.0
    available: bool = True
    unavailable_reason: str | None = None


class TTSEngine(ABC):
    """A TTS engine: lazy model loading + synthesis to a WAV file.

    Implementations must be safe to call from multiple threads through the
    public ``run`` wrapper; engines whose backends are not thread-safe guard
    inference with ``self._infer_lock``.
    """

    info: EngineInfo

    def __init__(self) -> None:
        self._load_lock = threading.Lock()
        self._infer_lock = threading.Lock()
        self._loaded = False

    def ensure_loaded(self) -> None:
        """Lazy load, idempotent, thread-safe. Raises on failure."""
        if self._loaded:
            return
        with self._load_lock:
            if self._loaded:
                return
            self._load()
            self._loaded = True

    def _load(self) -> None:
        """Subclass hook: actually load the model. Default: nothing."""

    @abstractmethod
    def synthesize(self, text: str, voice: str, speed: float, out_path: Path) -> dict:
        """Synthesize ``text`` to ``out_path`` (WAV).

        Returns ``{'sample_rate': int}``; raises on failure.
        """

    def resolve_voice(self, voice: str | None) -> str:
        if voice:
            return voice
        return self.info.default_voice

    def clamp_speed(self, speed: float | None) -> float:
        if speed is None:
            return self.info.default_speed
        return max(self.info.speed_min, min(self.info.speed_max, speed))
