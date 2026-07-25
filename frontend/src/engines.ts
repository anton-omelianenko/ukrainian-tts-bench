import type { EngineId } from './types'

export const ENGINE_ORDER: EngineId[] = ['supertonic', 'silero', 'mms', 'espeak']

export const ENGINE_COLORS: Record<EngineId, string> = {
  supertonic: 'var(--color-engine-supertonic)',
  silero: 'var(--color-engine-silero)',
  mms: 'var(--color-engine-mms)',
  espeak: 'var(--color-engine-espeak)',
}

export const ENGINE_MONOGRAMS: Record<EngineId, string> = {
  supertonic: 'ST',
  silero: 'SL',
  mms: 'MM',
  espeak: 'ES',
}

let variantCounter = 0
export function newVariantId(): string {
  variantCounter += 1
  return `v${variantCounter}-${Math.random().toString(36).slice(2, 8)}`
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${minutes}:${rest.toString().padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day}.${month} ${hours}:${minutes}`
}
