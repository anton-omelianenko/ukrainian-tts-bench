"""Prefetch all TTS models. Idempotent; exits non-zero on failure."""

from __future__ import annotations

import shutil
import subprocess
import sys


def step(label: str) -> None:
    print(f"\n=== {label} ===", flush=True)


def download_supertonic() -> None:
    step("supertonic (supertonic-3)")
    from supertonic import TTS

    tts = TTS()  # auto-downloads to ~/.cache/supertonic3
    print(f"  ok — sample_rate={tts.sample_rate}")


def download_silero() -> None:
    step("silero (v4_ua)")
    import torch

    model, _example = torch.hub.load(
        "snakers4/silero-models",
        "silero_tts",
        language="ua",
        speaker="v4_ua",
        trust_repo=True,
    )
    del model
    print("  ok")


def download_mms() -> None:
    step("mms (facebook/mms-tts-ukr)")
    from transformers import AutoTokenizer, VitsModel

    AutoTokenizer.from_pretrained("facebook/mms-tts-ukr")
    model = VitsModel.from_pretrained("facebook/mms-tts-ukr")
    print(f"  ok — sampling_rate={model.config.sampling_rate}")


def check_espeak() -> None:
    step("espeak-ng")
    binary = shutil.which("espeak-ng")
    if binary is None:
        raise RuntimeError("espeak-ng binary not found on PATH")
    result = subprocess.run(
        [binary, "--version"], capture_output=True, text=True, check=True
    )
    print(f"  ok — {result.stdout.strip().splitlines()[0]}")


def main() -> int:
    failures: list[str] = []
    for name, fn in [
        ("supertonic", download_supertonic),
        ("silero", download_silero),
        ("mms", download_mms),
        ("espeak", check_espeak),
    ]:
        try:
            fn()
        except Exception as exc:  # noqa: BLE001
            print(f"  FAILED: {type(exc).__name__}: {exc}", flush=True)
            failures.append(name)

    if failures:
        print(f"\nFAILED steps: {', '.join(failures)}", flush=True)
        return 1
    print("\nAll models ready.", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
