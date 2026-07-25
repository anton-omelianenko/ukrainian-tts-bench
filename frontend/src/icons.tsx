import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function PlayIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M4.5 2.9v10.2c0 .8.9 1.3 1.6.9l7.6-5.1c.6-.4.6-1.4 0-1.8L6.1 2c-.7-.4-1.6.1-1.6.9Z" fill="currentColor" />
    </svg>
  )
}

export function PauseIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <rect x="3.5" y="2.5" width="3.2" height="11" rx="1" fill="currentColor" />
      <rect x="9.3" y="2.5" width="3.2" height="11" rx="1" fill="currentColor" />
    </svg>
  )
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8 2v7.5m0 0L5 6.7M8 9.5l3-2.8M3 11.5v1.2c0 .7.6 1.3 1.3 1.3h7.4c.7 0 1.3-.6 1.3-1.3v-1.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GithubIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.48 2 12.02c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.35-3.37-1.35-.45-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.03 10.03 0 0 0 22 12.02C22 6.48 17.52 2 12 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function HistoryIcon(props: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2.5 8a5.5 5.5 0 1 1 1.61 3.89M2.5 8H1m1.5 0L4 6.5M8 5v3.2l2.2 1.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="m3 8.5 3.2 3.2L13 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SpinnerIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="animate-spin" {...props}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function XIcon(props: IconProps) {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="m3.5 3.5 9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function ThumbUpIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 14V6.6l2.7-4.3c.2-.3.6-.4.9-.2.5.2.8.8.7 1.3L9 6.2h3.6c.9 0 1.6.8 1.4 1.7l-.9 4.7c-.1.7-.7 1.2-1.4 1.2H5Zm0 0H2.6c-.3 0-.6-.3-.6-.6V7.2c0-.3.3-.6.6-.6H5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
        fillOpacity={filled ? 0.18 : 0}
      />
    </svg>
  )
}

export function ThumbDownIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M11 2v7.4l-2.7 4.3c-.2.3-.6.4-.9.2-.5-.2-.8-.8-.7-1.3L7 9.8H3.4C2.5 9.8 1.8 9 2 8.1l.9-4.7C3 2.7 3.6 2.2 4.3 2.2H11Zm0 0h2.4c.3 0 .6.3.6.6v5.6c0 .3-.3.6-.6.6H11"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
        fillOpacity={filled ? 0.18 : 0}
      />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
