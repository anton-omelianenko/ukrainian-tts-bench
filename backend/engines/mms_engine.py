"""Meta MMS TTS (facebook/mms-tts-ukr) engine."""

from __future__ import annotations

import os
import threading
from pathlib import Path

import soundfile as sf
import torch

torch.set_num_threads(max(1, (os.cpu_count() or 2) // 2))

from .base import EngineInfo, TTSEngine, VoiceInfo

MODEL_ID = "facebook/mms-tts-ukr"

_VOICES = [
    VoiceInfo(id="default", label="Default", gender="neutral"),
]


class MmsEngine(TTSEngine):
    info = EngineInfo(
        id="mms",
        label="MMS (VITS)",
        description="Meta Massively Multilingual Speech, facebook/mms-tts-ukr, 16 kHz.",
        voices=_VOICES,
        default_voice="default",
        default_speed=1.0,
        speed_min=0.5,
        speed_max=2.0,
    )

    def __init__(self) -> None:
        super().__init__()
        self._model = None
        self._tokenizer = None

    def _load(self) -> None:
        from transformers import AutoTokenizer, VitsModel

        self._tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
        self._model = VitsModel.from_pretrained(MODEL_ID)
        self._model.eval()

    def synthesize(self, text: str, voice: str, speed: float, out_path: Path) -> dict:
        assert self._model is not None and self._tokenizer is not None, (
            "ensure_loaded() must be called first"
        )
        # MMS inference is NOT thread-safe.
        with self._infer_lock:
            with torch.no_grad():
                inputs = self._tokenizer(text, return_tensors="pt")
                waveform = self._model(**inputs).waveform
        audio = waveform[0].cpu().numpy()
        sample_rate = int(self._model.config.sampling_rate)
        sf.write(str(out_path), audio, sample_rate)
        return {"sample_rate": sample_rate}
