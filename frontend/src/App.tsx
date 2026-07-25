import { useCallback, useEffect, useState } from 'react'
import type { Engine, EngineId, Generation, SelectionMap } from './types'
import { fetchEngines, fetchHistory, postGenerate } from './api'
import { Sidebar } from './components/Sidebar'
import { Composer } from './components/Composer'
import { ResultCard } from './components/ResultCard'
import { HistoryList } from './components/HistoryList'
import { EmptyState } from './components/EmptyState'
import { GithubIcon } from './icons'

const DEFAULT_SELECTED: EngineId[] = ['supertonic', 'silero']

function buildDefaultSelection(engines: Engine[]): SelectionMap {
  const available = new Set(engines.filter((engine) => engine.available).map((engine) => engine.id))
  const selection: SelectionMap = {}
  for (const engine of engines) {
    if (!DEFAULT_SELECTED.includes(engine.id) || !available.has(engine.id)) continue
    selection[engine.id] = { voice: engine.default_voice, speed: engine.default_speed }
  }
  // fall back to the first available engine if neither default is usable
  if (Object.keys(selection).length === 0) {
    const first = engines.find((engine) => engine.available)
    if (first) selection[first.id] = { voice: first.default_voice, speed: first.default_speed }
  }
  return selection
}

export default function App() {
  const [engines, setEngines] = useState<Engine[]>([])
  const [enginesLoading, setEnginesLoading] = useState(true)
  const [selection, setSelection] = useState<SelectionMap>({})
  const [text, setText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<Generation | null>(null)
  const [history, setHistory] = useState<Generation[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const refreshHistory = useCallback(async () => {
    try {
      const response = await fetchHistory()
      setHistory(response.items)
    } catch {
      // history is non-critical — keep the previous list
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const response = await fetchEngines()
        if (cancelled) return
        setEngines(response.engines)
        setSelection(buildDefaultSelection(response.engines))
      } catch {
        // engines failing to load leaves the sidebar in its loading skeleton
      } finally {
        if (!cancelled) setEnginesLoading(false)
      }
    })()
    void refreshHistory()
    return () => {
      cancelled = true
    }
  }, [refreshHistory])

  const toggleEngine = (id: EngineId) => {
    setSelection((previous) => {
      const next = { ...previous }
      if (next[id]) {
        delete next[id]
      } else {
        const engine = engines.find((candidate) => candidate.id === id)
        if (!engine) return previous
        next[id] = { voice: engine.default_voice, speed: engine.default_speed }
      }
      return next
    })
  }

  const updateVoice = (id: EngineId, voice: string) => {
    setSelection((previous) =>
      previous[id] ? { ...previous, [id]: { ...previous[id], voice } } : previous,
    )
  }

  const updateSpeed = (id: EngineId, speed: number) => {
    setSelection((previous) =>
      previous[id] ? { ...previous, [id]: { ...previous[id], speed } } : previous,
    )
  }

  const selectedIds = engines.filter((engine) => selection[engine.id]).map((engine) => engine.id)

  const generate = async () => {
    const trimmed = text.trim()
    if (!trimmed || selectedIds.length === 0 || generating) return
    setGenerating(true)
    setGenerateError(null)
    try {
      const generation = await postGenerate({
        text: trimmed,
        engines: selectedIds.map((id) => {
          const current = selection[id]
          return current?.voice
            ? { engine: id, voice: current.voice, speed: current.speed }
            : { engine: id, speed: current?.speed ?? 1 }
        }),
      })
      setResults(generation)
      void refreshHistory()
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Помилка з’єднання')
    } finally {
      setGenerating(false)
    }
  }

  const labelFor = (engineId: string): string =>
    engines.find((engine) => engine.id === engineId)?.label ?? engineId

  const showEmpty = !generating && results === null && generateError === null

  return (
    <div className="flex h-full flex-col min-[1024px]:flex-row">
      <Sidebar
        engines={engines}
        selection={selection}
        generating={generating}
        loading={enginesLoading}
        onToggle={toggleEngine}
        onVoiceChange={updateVoice}
        onSpeedChange={updateSpeed}
      />

      <main className="flex min-h-0 flex-1 flex-col">
        {/* top bar */}
        <header className="flex h-[56px] shrink-0 items-center justify-between border-b border-border-default px-[24px]">
          <h1 className="text-[15px] font-semibold text-text-primary">Порівняння рушіїв українського TTS</h1>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] border border-transparent text-text-secondary transition-colors duration-150 hover:border-border-emphasis hover:text-text-primary"
          >
            <GithubIcon />
          </a>
        </header>

        {/* content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[860px] px-[24px] py-[32px]">
            <Composer
              text={text}
              generating={generating}
              canGenerate={selectedIds.length > 0}
              onTextChange={setText}
              onGenerate={() => void generate()}
            />

            {/* results region */}
            <div className="mt-[24px]">
              {showEmpty && <EmptyState />}

              {generateError && (
                <div className="rounded-[14px] border border-error/40 bg-bg-elevated p-[18px] text-[13px] text-error">
                  {generateError}
                </div>
              )}

              {generating && (
                <div className="flex flex-col gap-[12px]">
                  {selectedIds.map((id) => (
                    <div
                      key={id}
                      className="h-[104px] animate-pulse-soft rounded-[14px] border border-border-default bg-bg-elevated"
                    />
                  ))}
                </div>
              )}

              {!generating && results !== null && (
                <div className="flex flex-col gap-[12px]">
                  {results.results.map((result, index) => (
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

            <HistoryList
              items={history}
              engines={engines}
              expandedId={expandedId}
              onToggleExpand={(id) => setExpandedId((previous) => (previous === id ? null : id))}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
