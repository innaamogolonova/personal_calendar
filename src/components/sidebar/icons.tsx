function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3 w-3 shrink-0 text-neutral-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
      fill="currentColor"
    >
      <path d="M6 4l4 4-4 4V4z" />
    </svg>
  )
}

function PageIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-neutral-400" fill="currentColor">
      <path d="M4 2.5A1.5 1.5 0 015.5 1h3.086a1.5 1.5 0 011.06.44l2.914 2.914A1.5 1.5 0 0113 5.414V12.5A1.5 1.5 0 0111.5 14h-7A1.5 1.5 0 013 12.5v-10z" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M8 3.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
    </svg>
  )
}

function PanelCollapseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M2.5 2A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14h11a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0013.5 2h-11zM2.5 3h3v10h-3V3zm4 0h7v10h-7V3z" />
      <path d="M9.5 5.5L7 8l2.5 2.5V5.5z" />
    </svg>
  )
}

function PanelExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M2.5 2A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14h11a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0013.5 2h-11zM2.5 3h3v10h-3V3zm4 0h7v10h-7V3z" />
      <path d="M6.5 5.5L9 8 6.5 10.5V5.5z" />
    </svg>
  )
}

export { ChevronIcon, PageIcon, MoreIcon, PanelCollapseIcon, PanelExpandIcon }
