import type { Engine, EngineId, RatingsResponse, Variant } from '../types'
import { ENGINE_COLORS, ENGINE_MONOGRAMS } from '../engines'
import { EngineCard } from './EngineCard'
import { PlusIcon, ThumbDownIcon, ThumbUpIcon } from '../icons'

interface SidebarProps {
  engines: Engine[]
  variants: Variant[]
  generating: boolean
  loading: boolean
  ratings: RatingsResponse
  onAdd: (id: EngineId) => void
  onAddAll: () => void
  onAddAllVoices: (id: EngineId) => void
  onRemove: (variantId: string) => void
  onVoiceChange: (variantId: string, voice: string) => void
  onSpeedChange: (variantId: string, speed: number) => void
}

function Wordmark() {
  return (
    <div className="flex items-center gap-[10px] px-[14px]">
      <span className="text-[15px] font-semibold tracking-[-0.01em] text-text-primary">TTS Bench</span>
      <span className="rounded-[6px] bg-accent px-[6px] py-[2px] text-[10px] font-bold leading-none tracking-wide text-accent-ink">
        UA
      </span>
    </div>
  )
}

export function Sidebar({
  engines,
  variants,
  generating,
  loading,
  ratings,
  onAdd,
  onAddAll,
  onAddAllVoices,
  onRemove,
  onVoiceChange,
  onSpeedChange,
}: SidebarProps) {
  const engineFor = (id: EngineId): Engine | undefined => engines.find((engine) => engine.id === id)

  const variantCards = (
    <>
      {variants.map((variant) => {
        const engine = engineFor(variant.engine)
        if (!engine) return null
        return (
          <EngineCard
            key={variant.id}
            engine={engine}
            variant={variant}
            generating={generating}
            onRemove={() => onRemove(variant.id)}
            onVoiceChange={(voice) => onVoiceChange(variant.id, voice)}
            onSpeedChange={(speed) => onSpeedChange(variant.id, speed)}
          />
        )
      })}
      {loading && engines.length === 0 && (
        <div className="flex flex-col gap-[10px]">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-[64px] animate-pulse-soft rounded-[14px] border border-border-default bg-bg-base" />
          ))}
        </div>
      )}
    </>
  )

  // "add engine" picker: one tile per available engine, tap to append a variant
  const missingCount = engines.filter(
    (engine) => engine.available && !variants.some((variant) => variant.engine === engine.id),
  ).length

  const addPicker = (
    <div className="mt-[14px]">
      <div className="mb-[8px] flex items-center justify-between px-[2px]">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          Додати рушій
        </p>
        <button
          type="button"
          onClick={onAddAll}
          disabled={missingCount === 0}
          className="text-[11px] font-medium text-text-secondary underline decoration-border-default underline-offset-2 transition-colors duration-150 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
        >
          Обрати всі
        </button>
      </div>
      <div className="flex flex-col gap-[6px]">
        {engines
          .filter((engine) => engine.available)
          .map((engine) => {
            const color = ENGINE_COLORS[engine.id]
            const usedVoices = new Set(
              variants.filter((variant) => variant.engine === engine.id).map((variant) => variant.voice),
            )
            const missingVoices = engine.voices.filter((voice) => !usedVoices.has(voice.id)).length
            return (
              <div
                key={engine.id}
                className="flex items-center gap-[6px] rounded-[10px] border border-border-default bg-bg-base pl-[10px] pr-[6px] transition-colors duration-150 hover:border-text-tertiary"
              >
                <button
                  type="button"
                  onClick={() => onAdd(engine.id)}
                  aria-label={`Додати ${engine.label}`}
                  className="flex min-w-0 flex-1 items-center gap-[8px] py-[8px] text-left"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] text-[10px] font-semibold"
                    style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
                  >
                    {ENGINE_MONOGRAMS[engine.id]}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-text-secondary">
                    {engine.label}
                  </span>
                  <span className="shrink-0 text-text-tertiary">
                    <PlusIcon />
                  </span>
                </button>

                {/* add every remaining voice of this engine at once */}
                {engine.voices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onAddAllVoices(engine.id)}
                    disabled={missingVoices === 0}
                    title={`Додати всі голоси (${engine.voices.length})`}
                    aria-label={`Додати всі голоси ${engine.label}`}
                    className="shrink-0 rounded-[7px] border border-border-default px-[6px] py-[3px] font-mono text-[10px] text-text-secondary transition-colors duration-150 hover:border-text-tertiary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    +{engine.voices.length}
                  </button>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )

  // rating leaderboard: engine+voice combos the user rated, best first
  const rated = [...ratings.by_voice]
    .filter((stats) => stats.likes > 0 || stats.dislikes > 0)
    .sort((a, b) => b.likes - a.likes - (b.dislikes - a.dislikes))

  const ratingsPanel = rated.length > 0 && (
    <div className="mt-[18px] border-t border-border-default pt-[14px]">
      <p className="mb-[8px] px-[2px] text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
        Мої оцінки
      </p>
      <div className="flex flex-col gap-[4px]">
        {rated.map((stats) => {
          const color = ENGINE_COLORS[stats.engine]
          return (
            <div
              key={`${stats.engine}:${stats.voice}`}
              className="flex items-center gap-[8px] rounded-[8px] px-[6px] py-[4px] text-[11px]"
            >
              <span
                aria-hidden="true"
                className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] text-[9px] font-semibold"
                style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
              >
                {ENGINE_MONOGRAMS[stats.engine]}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-text-secondary">{stats.voice}</span>
              {stats.likes > 0 && (
                <span className="flex shrink-0 items-center gap-[3px] text-success">
                  <ThumbUpIcon />
                  {stats.likes}
                </span>
              )}
              {stats.dislikes > 0 && (
                <span className="flex shrink-0 items-center gap-[3px] text-error">
                  <ThumbDownIcon />
                  {stats.dislikes}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* desktop: fixed 300px sidebar */}
      <aside className="hidden h-full w-[300px] shrink-0 flex-col border-r border-border-default bg-bg-elevated min-[1024px]:flex">
        <header className="flex h-[56px] shrink-0 items-center border-b border-border-default">
          <Wordmark />
        </header>
        <div className="flex-1 overflow-y-auto px-[14px] py-[14px]">
          <p className="mb-[10px] px-[2px] text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Варіанти
          </p>
          <div className="flex flex-col gap-[10px]">{variantCards}</div>
          {addPicker}
          {ratingsPanel}
        </div>
      </aside>

      {/* mobile: horizontal scroll strip above the composer */}
      <div className="border-b border-border-default bg-bg-elevated min-[1024px]:hidden">
        <div className="flex h-[52px] items-center justify-between border-b border-border-default pr-[14px]">
          <Wordmark />
        </div>
        <div className="flex gap-[10px] overflow-x-auto px-[14px] py-[12px]">
          {variants.map((variant) => {
            const engine = engineFor(variant.engine)
            if (!engine) return null
            return (
              <EngineCard
                key={variant.id}
                engine={engine}
                variant={variant}
                generating={generating}
                compact
                onRemove={() => onRemove(variant.id)}
                onVoiceChange={(voice) => onVoiceChange(variant.id, voice)}
                onSpeedChange={(speed) => onSpeedChange(variant.id, speed)}
              />
            )
          })}
          {/* compact add buttons */}
          {engines
            .filter((engine) => engine.available)
            .map((engine) => {
              const color = ENGINE_COLORS[engine.id]
              return (
                <button
                  key={`add-${engine.id}`}
                  type="button"
                  onClick={() => onAdd(engine.id)}
                  aria-label={`Додати ${engine.label}`}
                  className="flex h-full min-h-[64px] w-[52px] shrink-0 flex-col items-center justify-center gap-[6px] rounded-[14px] border border-dashed border-border-default bg-bg-base text-text-tertiary transition-colors duration-150 hover:border-text-tertiary"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] text-[10px] font-semibold"
                    style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
                  >
                    {ENGINE_MONOGRAMS[engine.id]}
                  </span>
                  <PlusIcon />
                </button>
              )
            })}
        </div>
      </div>
    </>
  )
}
