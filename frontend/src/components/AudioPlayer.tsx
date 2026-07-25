import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import type { EngineId } from '../types'
import { ENGINE_COLORS, formatTime } from '../engines'
import { DownloadIcon, PauseIcon, PlayIcon } from '../icons'

interface AudioPlayerProps {
  engine: EngineId
  audioUrl: string
}

export function AudioPlayer({ engine, audioUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const color = ENGINE_COLORS[engine]
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => {
      setPlaying(false)
      setCurrentTime(0)
    }
    const onPause = () => setPlaying(false)
    const onPlay = () => setPlaying(true)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('play', onPlay)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('play', onPlay)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      void audio.play()
    }
  }

  const seek = (event: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || duration <= 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * duration
    setCurrentTime(audio.currentTime)
  }

  return (
    <div className="flex items-center gap-[12px]">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'Пауза' : 'Відтворити'}
        className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition-all duration-150 hover:brightness-105 active:scale-95"
      >
        {playing ? <PauseIcon /> : <PlayIcon className="ml-[1px]" />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
        <div
          role="slider"
          aria-label="Позиція відтворення"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(currentTime)}
          tabIndex={0}
          onClick={seek}
          onKeyDown={(event) => {
            const audio = audioRef.current
            if (!audio || duration <= 0) return
            if (event.key === 'ArrowRight') audio.currentTime = Math.min(duration, audio.currentTime + 1)
            if (event.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 1)
          }}
          className="group relative h-[14px] w-full cursor-pointer"
        >
          <div className="absolute top-1/2 h-[4px] w-full -translate-y-1/2 overflow-hidden rounded-full bg-bg-sunken">
            <div
              className="h-full rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between font-mono text-[12px] tabular-nums text-text-tertiary">
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      <a
        href={audioUrl}
        download
        aria-label="Завантажити"
        className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[10px] border border-transparent text-text-secondary transition-colors duration-150 hover:border-border-emphasis hover:text-text-primary"
      >
        <DownloadIcon />
      </a>
    </div>
  )
}
