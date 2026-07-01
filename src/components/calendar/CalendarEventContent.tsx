import { useEffect, useRef } from 'react'
import type { EventContentArg } from '@fullcalendar/core'

const MIN_DURATION_FOR_TIME_MS = 30 * 60 * 1000

interface CalendarEventContentProps {
  arg: EventContentArg
  editingTaskId: string | null
  onSaveTitle: (id: string, title: string) => void
  onCancelEdit: (id: string, currentTitle: string) => void
}

export function CalendarEventContent({
  arg,
  editingTaskId,
  onSaveTitle,
  onCancelEdit,
}: CalendarEventContentProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const committedRef = useRef(false)
  const isEditing = arg.event.id === editingTaskId
  const start = arg.event.start
  const end = arg.event.end
  const durationMs = start && end ? end.getTime() - start.getTime() : 0
  const showTime = !isEditing && durationMs >= MIN_DURATION_FOR_TIME_MS && arg.timeText

  useEffect(() => {
    if (!isEditing) return
    committedRef.current = false
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.select()
  }, [isEditing])

  const commitTitle = (value: string) => {
    if (committedRef.current) return
    committedRef.current = true
    onSaveTitle(arg.event.id, value)
  }

  if (isEditing) {
    return (
      <div className="event-content-stack">
        <input
          ref={inputRef}
          className="event-title-input"
          defaultValue={arg.event.title}
          placeholder="New task"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitTitle(e.currentTarget.value)
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              committedRef.current = true
              onCancelEdit(arg.event.id, arg.event.title)
            }
          }}
          onBlur={(e) => commitTitle(e.target.value)}
        />
      </div>
    )
  }

  return (
    <div className="event-content-stack">
      <div className="event-title">{arg.event.title || 'Untitled'}</div>
      {showTime ? (
        <div className="event-time-muted">{arg.timeText}</div>
      ) : null}
    </div>
  )
}
