import type { CSSProperties } from 'react'
import type { Engine, EngineSelection } from '../types'
import { ENGINE_COLORS, ENGINE_MONOGRAMS } from '../engines'

interface EngineCardProps {
  engine: Engine
  selected: boolean
  selection: EngineSelection | undefined
  generating: boolean
  compact?: boolean
  onToggle: () => void
  onVoiceChange: (voice: string) => void
  onSpeedChange: (speed: number) => void
}

export function EngineCard({
  engine,
  selected,
  selection,
  generating,
  compact = false,
  onToggle,
  onVoiceChange,
  onSpeedChange,
}: EngineCardProps) {
  const color = ENGINE_COLORS[engine.id]
  const speed = selection?.speed ?? engine.default_speed
  const speedPercent =
    engine.speed_max > engine.speed_min
      ? ((speed - engine.speed_min) / (engine.speed_max - engine.speed_min)) * 100
      : 50

  const cardStyle: CSSProperties = selected
    ? {
        borderColor: color,
        backgroundColor: `color-mix(in srgb, ${color} 6%, var(--bg-base))`,
      }
    : {}

  return (
    <div
      role="button"
      tabIndex={engine.available ? 0 : -1}
      aria-pressed={selected}
      aria-disabled={!engine.available}
      title={engine.available ? undefined : (engine.unavailable_reason ?? 'Недоступний')}
      onClick={() => {
        if (engine.available) onToggle()
      }}
      onKeyDown={(event) => {
        if (engine.available && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          onToggle()
        }
      }}
      className={[
        'relative rounded-[14px] border border-border-default bg-bg-base p-[14px] transition-colors duration-150',
        engine.available ? 'cursor-pointer hover:border-border-emphasis' : 'cursor-not-allowed opacity-50',
        compact ? 'min-w-[220px] shrink-0' : '',
      ].join(' ')}
      style={cardStyle}
    >
      {/* left accent bar when selected */}
      {selected && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-[14px] bottom-[14px] w-[2px] rounded-full"
          style={{ backgroundColor: color }}
        />
      )}

      <div className="flex items-start gap-[10px]">
        {/* monogram tile */}
        <span
          aria-hidden="true"
          className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] text-[11px] font-semibold"
          style={{
            color,
            backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
          }}
        >
          {ENGINE_MONOGRAMS[engine.id]}
        </span>

        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-tight text-text-primary">{engine.label}</div>
          <div className="mt-[2px] truncate text-[11px] leading-tight text-text-tertiary">{engine.description}</div>
        </div>

        {/* status dot */}
        <span
          aria-hidden="true"
          className={[
            'mt-[3px] h-[8px] w-[8px] shrink-0 rounded-full',
            generating && selected ? 'animate-pulse-soft' : '',
          ].join(' ')}
          style={{ backgroundColor: engine.available ? 'var(--success)' : 'var(--error)' }}
        />
      </div>

      {/* voice + speed controls, only when selected */}
      {selected && selection && !compact && (
        <div
          className="mt-[12px] flex flex-col gap-[10px] border-t border-border-default pt-[12px]"
          onClick={(event) => event.stopPropagation()}
        >
          <label className="flex items-center justify-between gap-[10px]">
            <span className="text-[12px] text-text-secondary">Голос</span>
            <select
              className="dark-select max-w-[150px]"
              value={selection.voice ?? engine.default_voice ?? ''}
              onChange={(event) => onVoiceChange(event.target.value)}
            >
              {engine.voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-[10px]">
            <span className="shrink-0 text-[12px] text-text-secondary">Швидкість</span>
            <input
              type="range"
              className="speed-range min-w-0 flex-1"
              min={engine.speed_min}
              max={engine.speed_max}
              step={0.05}
              value={speed}
              style={{ '--fill': `${speedPercent}%` } as CSSProperties}
              onChange={(event) => onSpeedChange(Number(event.target.value))}
            />
            <span className="w-[42px] shrink-0 text-right font-mono text-[12px] tabular-nums text-text-tertiary">
              {speed.toFixed(2)}×
            </span>
          </label>
        </div>
      )}
    </div>
  )
}
