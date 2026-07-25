// Mirrors the backend API contract (see scratch/frontend_spec.md).

export type EngineId = 'supertonic' | 'silero' | 'mms' | 'espeak'

export interface Voice {
  id: string
  label: string
  gender: string
}

export interface Engine {
  id: EngineId
  label: string
  description: string
  voices: Voice[]
  default_voice: string | null
  default_speed: number
  speed_min: number
  speed_max: number
  available: boolean
  unavailable_reason: string | null
}

export interface EnginesResponse {
  engines: Engine[]
}

export interface EngineSelection {
  voice: string | null
  speed: number
}

// One selected engine+voice+speed combination ("variant").
// Several variants may share the same engine with different voices/speeds.
export interface Variant extends EngineSelection {
  id: string
  engine: EngineId
}

export type SelectionMap = Partial<Record<EngineId, EngineSelection>>

export interface GenerateEngineRequest {
  engine: EngineId
  voice?: string
  speed?: number
}

export interface GenerateRequest {
  text: string
  engines: GenerateEngineRequest[]
}

export interface GenerationResult {
  engine: EngineId
  voice: string | null
  ok: boolean
  error: string | null
  audio_url: string | null
  generation_ms: number | null
  audio_duration_sec: number | null
  sample_rate: number | null
}

export interface Generation {
  id: string
  text: string
  created_at: string
  results: GenerationResult[]
}

export interface HistoryResponse {
  items: Generation[]
}
