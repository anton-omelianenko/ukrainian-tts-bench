import { useCallback, useEffect, useState } from 'react'
import type { Engine, EngineId, Generation, Variant } from './types'
import { fetchEngines, fetchHistory, postGenerate } from './api'
import { newVariantId } from './engines'
import { Sidebar } from './components/Sidebar'
import { Composer } from './components/Composer'
import { ResultCard } from './components/ResultCard'
import { HistoryList } from './components/HistoryList'
import { EmptyState } from './components/EmptyState'
import { GithubIcon } from './icons'

const DEFAULT_SELECTED: EngineId[] = ['supertonic', 'silero']

function buildDefaultVariants(engines: Engine[]): Variant[] {
  const available = engines.filter((engine) => engine.available)
  const chosen = DEFAULT_SELECTED.map((id) => available.find((engine) => engine.id === id)).filter(
    (engine): engine is Engine => engine !== undefined,
  )
  const source = chosen.length > 0 ? chosen : available.slice(0, 1)
  return source.map((engine) => ({
    id: newVariantId(),
    engine: engine.id,
    voice: engine.default_voice,
    speed: engine.default_speed,
  }))
}

export default function App() {
  const [engines, setEngines] = useState<Engine[]>([])
  const [enginesLoading, setEnginesLoading] = useState(true)
  const [variants, setVariants] = useState<Variant[]>([])
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
        setVariants(buildDefaultVariants(response.engines))
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

  const addVariant = (id: EngineId) => {
    const engine = engines.find((candidate) => candidate.id === id)
    if (!engine || !engine.available) return
    setVariants((previous) => [
      ...previous,
      { id: newVariantId(), engine: id, voice: engine.default_voice, speed: engine.default_speed },
    ])
  }

  const removeVariant = (variantId: string) => {
    setVariants((previous) => {
      const target = previous.find((variant) => variant.id === variantId)
      if (!target) return previous
      // keep at least one variant per engine
      if (previous.filter((variant) => variant.engine === target.engine).length <= 1) return previous
      return previous.filter((variant) => variant.id !== variantId)
    })
  }

  const updateVariant = (variantId: string, patch: Partial<Pick<Variant, 'voice' | 'speed'>>) => {
    setVariants((previous) =>
      previous.map((variant) => (variant.id === variantId ? { ...variant, ...patch } : variant)),
    )
  }

  const generate = async () => {
    const trimmed = text.trim()
    if (!trimmed || variants.length === 0 || generating) return
    setGenerating(true)
    setGenerateError(null)
    try {
      const generation = await postGenerate({
        text: trimmed,
        engines: variants.map((variant) => ({
          engine: variant.engine,
          ...(variant.voice ? { voice: variant.voice } : {}),
          speed: variant.speed,
        })),
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
        variants={variants}
        generating={generating}
        loading={enginesLoading}
        onAdd={addVariant}
        onRemove={removeVariant}
        onVoiceChange={(variantId, voice) => updateVariant(variantId, { voice })}
        onSpeedChange={(variantId, speed) => updateVariant(variantId, { speed })}
      />

      <main className="flex min-h-0 flex-1 flex-col">
        {/* top bar */}
        <header className="flex h-[56px] shrink-0 items-center justify-between border-b border-border-default px-[24px]">
          <h1 className="text-[15px] font-semibold text-text-primary">Порівняння рушіїв українського TTS</h1>
          <a
            href="https://github.com/anton-omelianenko/ukrainian-tts-bench"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] border border-transparent text-text-secondary transition-colors duration-150 hover:border-text-tertiary hover:text-text-primary"
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
              canGenerate={variants.length > 0}
              onTextChange={setText}
              onGenerate={() => void generate()}
            />

            {/* results region */}
            <div className="mt-[24px]">
              {showEmpty && <EmptyState />}

              {generateError && (
                <div className="rounded-[14px] border border-error/40 bg-bg-base p-[18px] text-[13px] text-error">
                  {generateError}
                </div>
              )}

              {generating && (
                <div className="flex flex-col gap-[12px]">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="h-[104px] animate-pulse-soft rounded-[14px] border border-border-default bg-bg-elevated"
                    />
                  ))}
                </div>
              )}

              {!generating && results !== null && (
                <div className="flex flex-col gap-[12px]">
                  {results.results.map((result, index) => (
                    <ResultCard
                      key={`${result.engine}-${index}`}
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
