import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getTaskById, updateTask } from '../../db/tasks'
import type { TaskPriority, TaskStatus } from '../../db/types'
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../../lib/dates'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../lib/taskLabels'

const PANEL_CLASSES =
  'absolute right-0 top-0 z-10 h-full w-80 overflow-y-auto rounded-r-lg border-l border-neutral-200 bg-white p-5 shadow-xl'

interface TaskEditPanelProps {
  taskId: string
  onClose: () => void
}

interface TaskFormState {
  title: string
  status: TaskStatus
  priority: TaskPriority
  scheduledStart: string
  scheduledEnd: string
  notes: string
}

function taskToFormState(
  task: NonNullable<Awaited<ReturnType<typeof getTaskById>>>,
): TaskFormState {
  return {
    title: task.title,
    status: task.status,
    priority: task.priority,
    scheduledStart: task.scheduledStart
      ? toDatetimeLocalValue(task.scheduledStart)
      : '',
    scheduledEnd: task.scheduledEnd ? toDatetimeLocalValue(task.scheduledEnd) : '',
    notes: task.notes ?? '',
  }
}

export function TaskEditPanel({ taskId, onClose }: TaskEditPanelProps) {
  const task = useLiveQuery(() => getTaskById(taskId), [taskId])
  const [form, setForm] = useState<TaskFormState | null>(null)

  useEffect(() => {
    setForm(null)
  }, [taskId])

  useEffect(() => {
    if (task) setForm(taskToFormState(task))
  }, [task])

  if (task === undefined || !form) {
    return (
      <aside className={PANEL_CLASSES}>
        <p className="text-sm text-neutral-500">Loading...</p>
      </aside>
    )
  }

  if (!task) return null

  const handleSave = async () => {
    if (!form.title.trim()) return

    await updateTask(taskId, {
      title: form.title,
      status: form.status,
      priority: form.priority,
      notes: form.notes || undefined,
      ...(form.scheduledStart && form.scheduledEnd
        ? {
            scheduledStart: fromDatetimeLocalValue(form.scheduledStart),
            scheduledEnd: fromDatetimeLocalValue(form.scheduledEnd),
          }
        : {}),
    })
    onClose()
  }

  return (
    <aside className={PANEL_CLASSES}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-neutral-900">Edit task</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-neutral-400 hover:text-neutral-600"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">Title</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">Start</span>
          <input
            type="datetime-local"
            value={form.scheduledStart}
            onChange={(e) => setForm({ ...form, scheduledStart: e.target.value })}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">End</span>
          <input
            type="datetime-local"
            value={form.scheduledEnd}
            onChange={(e) => setForm({ ...form, scheduledEnd: e.target.value })}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">Status</span>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as TaskStatus })
            }
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">Priority</span>
          <select
            value={form.priority}
            onChange={(e) =>
              setForm({ ...form, priority: e.target.value as TaskPriority })
            }
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
          >
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">Notes</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
          />
        </label>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </aside>
  )
}
