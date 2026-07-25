"""Engine discovery + registry.

Imports each engine module; a module that fails to import yields an
EngineInfo with available=False rather than breaking the whole registry.
"""

from __future__ import annotations

from .engines.base import EngineInfo, TTSEngine, VoiceInfo


def _build_unavailable(engine_id: str, label: str, reason: str) -> EngineInfo:
    return EngineInfo(
        id=engine_id,
        label=label,
        description="(failed to load)",
        voices=[],
        default_voice="",
        default_speed=1.0,
        available=False,
        unavailable_reason=reason,
    )


def _load_engines() -> dict[str, TTSEngine | None]:
    engines: dict[str, TTSEngine | None] = {}

    try:
        from .engines.supertonic_engine import SupertonicEngine

        engines["supertonic"] = SupertonicEngine()
    except Exception as exc:  # noqa: BLE001
        engines["supertonic"] = None
        _IMPORT_ERRORS["supertonic"] = f"{type(exc).__name__}: {exc}"

    try:
        from .engines.silero_engine import SileroEngine

        engines["silero"] = SileroEngine()
    except Exception as exc:  # noqa: BLE001
        engines["silero"] = None
        _IMPORT_ERRORS["silero"] = f"{type(exc).__name__}: {exc}"

    try:
        from .engines.mms_engine import MmsEngine

        engines["mms"] = MmsEngine()
    except Exception as exc:  # noqa: BLE001
        engines["mms"] = None
        _IMPORT_ERRORS["mms"] = f"{type(exc).__name__}: {exc}"

    try:
        from .engines.espeak_engine import EspeakEngine

        engines["espeak"] = EspeakEngine()
    except Exception as exc:  # noqa: BLE001
        engines["espeak"] = None
        _IMPORT_ERRORS["espeak"] = f"{type(exc).__name__}: {exc}"

    return engines


_IMPORT_ERRORS: dict[str, str] = {}

_ENGINES: dict[str, TTSEngine | None] = _load_engines()

# Engines that are importable but must not be instantiated/used from the API
# are simply absent here; ENGINES maps id -> engine (or None on import error).
ENGINES: dict[str, TTSEngine] = {
    engine_id: engine for engine_id, engine in _ENGINES.items() if engine is not None
}

_LABELS = {
    "supertonic": "Supertonic 3",
    "silero": "Silero v4 UA",
    "mms": "MMS (VITS)",
    "espeak": "eSpeak NG",
}


def get_engines() -> list[EngineInfo]:
    infos: list[EngineInfo] = []
    for engine_id, engine in _ENGINES.items():
        if engine is not None:
            infos.append(engine.info)
        else:
            infos.append(
                _build_unavailable(
                    engine_id, _LABELS.get(engine_id, engine_id), _IMPORT_ERRORS[engine_id]
                )
            )
    return infos


def get_engine(engine_id: str) -> TTSEngine | None:
    return ENGINES.get(engine_id)
