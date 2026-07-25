import type { CSSProperties } from 'react'
import type { GenerationResult } from '../types'
import { ENGINE_COLORS, ENGINE_MONOGRAMS } from '../engines'
import { AudioPlayer } from './AudioPlayer'

const ENGINE_LABELS: Record<GenerationResult['engine'], string> = {
  supertonic: 'Supertonic',
  silero: 'Silero',
  mms: 'MMS',
  espeak: 'eSpeak',
}

interface ResultCardProps {
  result: GenerationResult
  engineLabel?: string
  staggerIndex?: number
}

export function ResultCard({ result, engineLabel, staggerIndex = 0 }: ResultCardProps) {
  const color = ENGINE_COLORS[result.engine]
  const label = engineLabel ?? ENGINE_LABELS[result.engine]

  const animationStyle: CSSProperties = {
    animationDelay: `${staggerIndex * 60}ms`,
  }

  if (!result.ok) {
    return (
      <div
        className="animate-card-in rounded-[14px] border border-error/40 bg-bg-elevated p-[18px]"
        style={animationStyle}
      >
        <div className="flex items-center gap-[10px]">
          <span
            aria-hidden="true"
            className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] text-[11px] font-semibold"
            style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
          >
            {ENGINE_MONOGRAMS[result.engine]}
          </span>
          <span className="text-[13px] font-semibold text-text-primary">{label}</span>
        </div>
        <p className="mt-[10px] text-[13px] text-error">{result.error ?? 'Помилка синтезу'}</p>
      </div>
    )
  }

  const metadata: string[] = []
  if (result.generation_ms != null) metadata.push(`${result.generation_ms} ms`)
  if (result.audio_duration_sec != null) metadata.push(`${result.audio_duration_sec.toFixed(1)}s`)
  if (result.sample_rate != null) metadata.push(`${(result.sample_rate / 1000).toFixed(1).replace(/\.0$/, '')} kHz`)

  return (
    <div
      className="animate-card-in rounded-[14px] border border-border-default bg-bg-elevated p-[18px]"
      style={animationStyle}
    >
      <div className="mb-[14px] flex items-center gap-[10px]">
        <span
          aria-hidden="true"
          className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] text-[11px] font-semibold"
          style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
        >
          {ENGINE_MONOGRAMS[result.engine]}
        </span>
        <div className="flex min-w-0 items-baseline gap-[8px]">
          <span className="text-[13px] font-semibold text-text-primary">{label}</span>
          {result.voice && (
            <span className="truncate font-mono text-[12px] text-text-tertiary">{result.voice}</span>
          )}
        </div>
        {metadata.length > 0 && (
          <span className="ml-auto shrink-0 font-mono text-[12px] tabular-nums text-text-tertiary">
            {metadata.join(' · ')}
          </span>
        )}
      </div>

      {result.audio_url && <AudioPlayer engine={result.engine} audioUrl={result.audio_url} />}
    </div>
  )
}
