import type { Engine, EngineId, SelectionMap } from '../types'
import { EngineCard } from './EngineCard'

interface SidebarProps {
  engines: Engine[]
  selection: SelectionMap
  generating: boolean
  loading: boolean
  onToggle: (id: EngineId) => void
  onVoiceChange: (id: EngineId, voice: string) => void
  onSpeedChange: (id: EngineId, speed: number) => void
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
  selection,
  generating,
  loading,
  onToggle,
  onVoiceChange,
  onSpeedChange,
}: SidebarProps) {
  const cards = (
    <>
      {engines.map((engine) => (
        <EngineCard
          key={engine.id}
          engine={engine}
          selected={selection[engine.id] !== undefined}
          selection={selection[engine.id]}
          generating={generating}
          onToggle={() => onToggle(engine.id)}
          onVoiceChange={(voice) => onVoiceChange(engine.id, voice)}
          onSpeedChange={(speed) => onSpeedChange(engine.id, speed)}
        />
      ))}
      {loading && engines.length === 0 && (
        <div className="flex flex-col gap-[10px]">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-[64px] animate-pulse-soft rounded-[14px] border border-border-default bg-bg-base" />
          ))}
        </div>
      )}
    </>
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
            Рушії
          </p>
          <div className="flex flex-col gap-[10px]">{cards}</div>
        </div>
      </aside>

      {/* mobile: horizontal scroll strip above the composer */}
      <div className="border-b border-border-default bg-bg-elevated min-[1024px]:hidden">
        <div className="flex h-[52px] items-center justify-between border-b border-border-default pr-[14px]">
          <Wordmark />
        </div>
        <div className="flex gap-[10px] overflow-x-auto px-[14px] py-[12px]">
          {engines.map((engine) => (
            <EngineCard
              key={engine.id}
              engine={engine}
              compact
              selected={selection[engine.id] !== undefined}
              selection={selection[engine.id]}
              generating={generating}
              onToggle={() => onToggle(engine.id)}
              onVoiceChange={(voice) => onVoiceChange(engine.id, voice)}
              onSpeedChange={(speed) => onSpeedChange(engine.id, speed)}
            />
          ))}
        </div>
      </div>
    </>
  )
}
