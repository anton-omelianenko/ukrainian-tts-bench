import type { Engine, Generation, Rating, RatingFilter } from '../types'
import { ENGINE_COLORS, formatDate } from '../engines'
import { ResultCard } from './ResultCard'
import { HistoryIcon, ThumbDownIcon, ThumbUpIcon } from '../icons'

interface HistoryListProps {
  items: Generation[]
  engines: Engine[]
  expandedId: string | null
  filter: RatingFilter
  onFilterChange: (filter: RatingFilter) => void
  onToggleExpand: (id: string) => void
  onRate: (generationId: string, index: number, rating: Rating) => void
}

function truncate(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max)}…` : flat
}

const FILTERS: { id: RatingFilter; label: string }[] = [
  { id: 'all', label: 'Усі' },
  { id: 'liked', label: 'Сподобались' },
  { id: 'disliked', label: 'Не сподобались' },
]

export function HistoryList({
  items,
  engines,
  expandedId,
  filter,
  onFilterChange,
  onToggleExpand,
  onRate,
}: HistoryListProps) {
  const labelFor = (engineId: string): string =>
    engines.find((engine) => engine.id === engineId)?.label ?? engineId

  // Filtering keeps only results matching the chosen rating, and drops
  // generations left with nothing to show. `indexes` maps each kept result
  // back to its slot in the original generation, so rating writes land right.
  type VisibleItem = Generation & { indexes: number[] }

  const visible: VisibleItem[] = items
    .map((item): VisibleItem | null => {
      const all = item.results.map((result, index) => ({ result, index }))
      const kept =
        filter === 'all'
          ? all
          : all.filter(({ result }) => (result.rating ?? 0) === (filter === 'liked' ? 1 : -1))
      if (kept.length === 0) return null
      return {
        ...item,
        results: kept.map(({ result }) => result),
        indexes: kept.map(({ index }) => index),
      }
    })
    .filter((item): item is VisibleItem => item !== null)

  if (items.length === 0) return null

  return (
    <section className="mt-[36px]">
      <header className="mb-[12px] flex items-center gap-[12px]">
        <div className="flex items-center gap-[8px] text-text-tertiary">
          <HistoryIcon />
          <h2 className="text-[12px] font-medium uppercase tracking-[0.08em]">Історія</h2>
        </div>

        {/* rating filter */}
        <div className="ml-auto flex items-center gap-[4px] rounded-[10px] border border-border-default bg-bg-base p-[3px]">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onFilterChange(option.id)}
              aria-pressed={filter === option.id}
              className={[
                'flex items-center gap-[5px] rounded-[7px] px-[9px] py-[4px] text-[12px] transition-colors duration-150',
                filter === option.id
                  ? 'bg-accent text-accent-ink'
                  : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {option.id === 'liked' && <ThumbUpIcon />}
              {option.id === 'disliked' && <ThumbDownIcon />}
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {visible.length === 0 ? (
        <p className="rounded-[14px] border border-border-default bg-bg-base px-[16px] py-[18px] text-center text-[13px] text-text-secondary">
          {filter === 'liked'
            ? 'Ще немає результатів, які вам сподобались.'
            : 'Ще немає результатів, які вам не сподобались.'}
        </p>
      ) : (
        <div className="flex flex-col gap-[8px]">
          {visible.map((item) => {
            const expanded = expandedId === item.id
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-[14px] border border-border-default bg-bg-elevated transition-colors duration-150"
              >
                <button
                  type="button"
                  onClick={() => onToggleExpand(item.id)}
                  className="flex w-full items-center gap-[12px] px-[16px] py-[12px] text-left transition-colors duration-150 hover:bg-bg-base"
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] text-text-primary">
                    {truncate(item.text, 80)}
                  </span>
                  <span className="flex shrink-0 items-center gap-[6px]">
                    {item.results.map((result, index) => {
                      const rating = result.rating ?? 0
                      return (
                        <span
                          key={`${result.engine}-${index}`}
                          className="flex items-center gap-[3px] rounded-[6px] px-[6px] py-[2px] font-mono text-[10px] leading-tight"
                          style={{
                            color: ENGINE_COLORS[result.engine],
                            backgroundColor: `color-mix(in srgb, ${ENGINE_COLORS[result.engine]} 12%, transparent)`,
                          }}
                        >
                          {result.voice ? `${result.engine}:${result.voice}` : result.engine}
                          {rating === 1 && <span className="text-success">👍</span>}
                          {rating === -1 && <span className="text-error">👎</span>}
                        </span>
                      )
                    })}
                  </span>
                  <span className="shrink-0 font-mono text-[12px] tabular-nums text-text-tertiary">
                    {formatDate(item.created_at)}
                  </span>
                </button>

                {expanded && (
                  <div className="flex flex-col gap-[10px] border-t border-border-default p-[14px]">
                    {item.results.map((result, index) => (
                      <ResultCard
                        key={`${result.engine}-${index}`}
                        result={result}
                        engineLabel={labelFor(result.engine)}
                        staggerIndex={index}
                        onRate={(rating) => onRate(item.id, item.indexes[index], rating)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
