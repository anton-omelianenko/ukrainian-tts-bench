import { useRef } from 'react'
import { SpinnerIcon } from '../icons'

export const MAX_TEXT_LENGTH = 1500
const WARNING_THRESHOLD = 1350

const SAMPLE_CHIPS = [
  'Привіт! Як справи?',
  'Слава Україні — героям слава!',
  'Сьогодні чудова погода для прогулянки містом.',
  "Один, два, три, чотири, п'ять — рахуємо разом.",
]

interface ComposerProps {
  text: string
  generating: boolean
  canGenerate: boolean
  onTextChange: (text: string) => void
  onGenerate: () => void
}

export function Composer({ text, generating, canGenerate, onTextChange, onGenerate }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const length = text.length
  const counterColor =
    length >= MAX_TEXT_LENGTH
      ? 'text-error'
      : length > WARNING_THRESHOLD
        ? 'text-warning'
        : 'text-text-tertiary'

  const disabled = generating || !canGenerate || length === 0

  return (
    <div>
      {/* sample chips */}
      <div className="mb-[10px] flex flex-wrap gap-[8px]">
        {SAMPLE_CHIPS.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => {
              onTextChange(sample)
              textareaRef.current?.focus()
            }}
            className="rounded-[10px] border border-border-default bg-bg-base px-[10px] py-[5px] text-[12px] text-text-secondary transition-colors duration-150 hover:border-text-tertiary hover:text-text-primary"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* textarea */}
      <div className="relative rounded-[14px] border border-border-default bg-bg-base transition-shadow duration-150 focus-within:border-accent focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_8%,transparent)]">
        <textarea
          ref={textareaRef}
          value={text}
          maxLength={MAX_TEXT_LENGTH}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !disabled) {
              event.preventDefault()
              onGenerate()
            }
          }}
          placeholder="Введіть український текст для синтезу…"
          className="min-h-[140px] w-full resize-y rounded-[14px] bg-transparent p-[18px] pb-[30px] text-[14px] leading-relaxed text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
        <span
          className={`pointer-events-none absolute bottom-[12px] right-[16px] font-mono text-[12px] tabular-nums ${counterColor}`}
        >
          {length} / {MAX_TEXT_LENGTH}
        </span>
      </div>

      {/* generate button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled}
        className={[
          'mt-[12px] flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[10px]',
          'bg-accent text-[14px] font-semibold text-accent-ink transition-all duration-150',
          'hover:brightness-105 active:scale-[0.99]',
          disabled ? 'cursor-not-allowed opacity-40 hover:brightness-100 active:scale-100' : '',
        ].join(' ')}
      >
        {generating ? (
          <>
            <SpinnerIcon />
            <span>Синтезую…</span>
          </>
        ) : (
          <>
            <span>Синтезувати мовлення</span>
            <kbd className="ml-auto hidden rounded-[6px] border border-accent-ink/25 px-[6px] py-[2px] font-mono text-[11px] font-medium text-accent-ink/70 sm:block">
              ⌘↵
            </kbd>
          </>
        )}
      </button>
    </div>
  )
}
