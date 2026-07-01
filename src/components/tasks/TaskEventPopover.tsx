import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { deleteTask, getTaskById } from '../../db/tasks'
import { formatDateTime } from '../../lib/dates'
import {
  findCalendarScrollContainer,
  getAnchoredPopoverPosition,
  getScrollTargets,
} from '../../lib/popoverPosition'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../lib/taskLabels'

interface PopoverPosition {
  top: number
  left: number
  width: number
}

interface TaskEventPopoverProps {
  taskId: string
  anchorEl: HTMLElement
  onClose: () => void
  onEdit: () => void
}

export function TaskEventPopover({
  taskId,
  anchorEl,
  onClose,
  onEdit,
}: TaskEventPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const task = useLiveQuery(() => getTaskById(taskId), [taskId])
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [position, setPosition] = useState<PopoverPosition | null>(null)

  useEffect(() => {
    const container = findCalendarScrollContainer(anchorEl)
    setPortalTarget(container)

    const updatePosition = () => {
      const next = getAnchoredPopoverPosition(anchorEl, container)
      if (!next) {
        onClose()
        return
      }
      setPosition(next)
    }

    updatePosition()
    const scrollTargets = getScrollTargets(anchorEl)
    scrollTargets.forEach((target) => {
      target.addEventListener('scroll', updatePosition, { passive: true })
    })
    window.addEventListener('resize', updatePosition)

    return () => {
      scrollTargets.forEach((target) => {
        target.removeEventListener('scroll', updatePosition)
      })
      window.removeEventListener('resize', updatePosition)
    }
  }, [anchorEl, onClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !popoverRef.current?.contains(e.target as Node) &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    const timer = window.setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [anchorEl, onClose])

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this task?')
    if (!confirmed) return
    await deleteTask(taskId)
    onClose()
  }

  if (!portalTarget || !position) return null

  const popover = (
    <div
      ref={popoverRef}
      className="absolute z-50 rounded-lg border border-neutral-200 bg-white p-4 shadow-xl"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {task === undefined ? (
        <p className="text-sm text-neutral-500">Loading...</p>
      ) : !task ? null : (
        <>
          <div className="mb-3 flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-neutral-900">
              {task.title || 'Untitled'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <dl className="space-y-2 text-sm">
            {task.scheduledStart && task.scheduledEnd && (
              <div>
                <dt className="text-xs font-medium text-neutral-500">Scheduled</dt>
                <dd className="mt-0.5 text-neutral-700">
                  {formatDateTime(task.scheduledStart)} –{' '}
                  {formatDateTime(task.scheduledEnd)}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-neutral-500">Status</dt>
              <dd className="mt-0.5 text-neutral-700">{STATUS_LABELS[task.status]}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-neutral-500">Priority</dt>
              <dd className="mt-0.5 text-neutral-700">
                {PRIORITY_LABELS[task.priority]}
              </dd>
            </div>
            {task.notes && (
              <div>
                <dt className="text-xs font-medium text-neutral-500">Notes</dt>
                <dd className="mt-0.5 line-clamp-3 text-neutral-700">{task.notes}</dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )

  return createPortal(popover, portalTarget)
}
