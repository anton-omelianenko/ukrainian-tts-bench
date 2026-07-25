import type {
  EnginesResponse,
  GenerateRequest,
  Generation,
  HistoryResponse,
  Rating,
  RatingsResponse,
} from './types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const body = (await response.json()) as { detail?: unknown }
      if (typeof body.detail === 'string') detail = body.detail
    } catch {
      // non-JSON error body — keep the status-based message
    }
    throw new Error(detail)
  }
  return (await response.json()) as T
}

export function fetchEngines(): Promise<EnginesResponse> {
  return request<EnginesResponse>('/api/engines')
}

export function fetchHistory(): Promise<HistoryResponse> {
  return request<HistoryResponse>('/api/history')
}

export function postGenerate(payload: GenerateRequest): Promise<Generation> {
  return request<Generation>('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function fetchRatings(): Promise<RatingsResponse> {
  return request<RatingsResponse>('/api/ratings')
}

export function postRating(generationId: string, index: number, rating: Rating): Promise<Generation> {
  return request<Generation>(`/api/generations/${generationId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index, rating }),
  })
}
