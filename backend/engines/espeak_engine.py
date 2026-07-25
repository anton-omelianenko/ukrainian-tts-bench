"""espeak-ng formant synthesis engine (subprocess CLI)."""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from .base import EngineInfo, TTSEngine, VoiceInfo

SAMPLE_RATE = 22050

_VOICES = [
    VoiceInfo(id="uk", label="Ukrainian", gender="neutral"),
    VoiceInfo(id="uk+m1", label="Ukrainian male 1", gender="male"),
    VoiceInfo(id="uk+m2", label="Ukrainian male 2", gender="male"),
    VoiceInfo(id="uk+m3", label="Ukrainian male 3", gender="male"),
    VoiceInfo(id="uk+f1", label="Ukrainian female 1", gender="female"),
    VoiceInfo(id="uk+f2", label="Ukrainian female 2", gender="female"),
    VoiceInfo(id="uk+f3", label="Ukrainian female 3", gender="female"),
]


def _available() -> tuple[bool, str | None]:
    if shutil.which("espeak-ng") is None:
        return False, "espeak-ng binary not found on PATH"
    return True, None


class EspeakEngine(TTSEngine):
    available, _reason = _available()
    info = EngineInfo(
        id="espeak",
        label="eSpeak NG",
        description="Formant synthesizer (subprocess), 22.05 kHz. Robotic but instant.",
        voices=_VOICES,
        default_voice="uk",
        default_speed=1.0,
        speed_min=0.5,
        speed_max=2.0,
        available=available,
        unavailable_reason=_reason,
    )

    def synthesize(self, text: str, voice: str, speed: float, out_path: Path) -> dict:
        if not self.info.available:
            raise RuntimeError(self.info.unavailable_reason or "espeak-ng unavailable")
        wpm = max(80, min(450, int(175 * speed)))
        result = subprocess.run(
            ["espeak-ng", "-v", voice, "-s", str(wpm), "-w", str(out_path), "--", text],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if result.returncode != 0:
            raise RuntimeError(f"espeak-ng failed: {result.stderr.strip()[:300]}")
        if not out_path.exists():
            raise RuntimeError("espeak-ng did not produce an output file")
        return {"sample_rate": SAMPLE_RATE}
