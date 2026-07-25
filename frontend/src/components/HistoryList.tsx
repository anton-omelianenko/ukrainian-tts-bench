import type { Engine, Generation } from '../types'
import { ENGINE_COLORS, formatDate } from '../engines'
import { ResultCard } from './ResultCard'
import { HistoryIcon } from '../icons'

interface HistoryListProps {
  items: Generation[]
  engines: Engine[]
  expandedId: string | null
  onToggleExpand: (id: string) => void
}

function truncate(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max)}…` : flat
}

export function HistoryList({ items, engines, expandedId, onToggleExpand }: HistoryListProps) {
  if (items.length === 0) return null

  const labelFor = (engineId: string): string =>
    engines.find((engine) => engine.id === engineId)?.label ?? engineId

  return (
    <section className="mt-[36px]">
      <header className="mb-[12px] flex items-center gap-[8px] text-text-tertiary">
        <HistoryIcon />
        <h2 className="text-[12px] font-medium uppercase tracking-[0.08em]">Історія</h2>
      </header>

      <div className="flex flex-col gap-[8px]">
        {items.map((item) => {
          const expanded = expandedId === item.id
          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-[14px] border border-border-default bg-bg-elevated transition-colors duration-150"
            >
              <button
                type="button"
                onClick={() => onToggleExpand(item.id)}
                className="flex w-full items-center gap-[12px] px-[16px] py-[12px] text-left transition-colors duration-150 hover:bg-bg-base/60"
              >
                <span className="min-w-0 flex-1 truncate text-[13px] text-text-primary">
                  {truncate(item.text, 80)}
                </span>
                <span className="flex shrink-0 items-center gap-[6px]">
                  {item.results.map((result) => (
                    <span
                      key={result.engine}
                      className="rounded-[6px] px-[6px] py-[2px] font-mono text-[10px] leading-tight"
                      style={{
                        color: ENGINE_COLORS[result.engine],
                        backgroundColor: `color-mix(in srgb, ${ENGINE_COLORS[result.engine]} 12%, transparent)`,
                      }}
                    >
                      {result.engine}
                    </span>
                  ))}
                </span>
                <span className="shrink-0 font-mono text-[12px] tabular-nums text-text-tertiary">
                  {formatDate(item.created_at)}
                </span>
              </button>

              {expanded && (
                <div className="flex flex-col gap-[10px] border-t border-border-default p-[14px]">
                  {item.results.map((result, index) => (
                    <ResultCard
                      key={result.engine}
                      result={result}
                      engineLabel={labelFor(result.engine)}
                      staggerIndex={index}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
