import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getTaskById, clearTaskSchedule, updateTask } from '../../db/tasks'
import type { TaskPriority } from '../../db/types'
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../../lib/dates'
import { PRIORITY_OPTIONS } from '../../lib/taskLabels'
import { InlineLabelSelect } from './InlineLabelSelect'
import { InlineProjectSelect } from './InlineProjectSelect'

const PANEL_CLASSES =
  'absolute right-0 top-0 z-10 h-full w-96 overflow-y-auto rounded-r-lg border-l border-neutral-200 bg-white p-5 shadow-xl'

interface TaskEditPanelProps {
  taskId: string
  onClose: () => void
}

interface TaskFormState {
  completed: boolean
  title: string
  scheduledStart: string
  scheduledEnd: string
  priority: TaskPriority | ''
  projectId: string
  labelIds: string[]
}

function taskToFormState(
  task: NonNullable<Awaited<ReturnType<typeof getTaskById>>>,
): TaskFormState {
  return {
    completed: task.completed,
    title: task.title,
    scheduledStart: task.scheduledStart
      ? toDatetimeLocalValue(task.scheduledStart)
      : '',
    scheduledEnd: task.scheduledEnd ? toDatetimeLocalValue(task.scheduledEnd) : '',
    priority: task.priority ?? '',
    projectId: task.projectId ?? '',
    labelIds: task.labelIds ?? [],
  }
}

const fieldClass =
  'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none'

export function TaskEditPanel({ taskId, onClose }: TaskEditPanelProps) {
  const task = useLiveQuery(() => getTaskById(taskId), [taskId])
  const [form, setForm] = useState<TaskFormState | null>(null)
  const [titleError, setTitleError] = useState(false)

  useEffect(() => {
    setForm(null)
    setTitleError(false)
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
    if (!form.title.trim()) {
      setTitleError(true)
      return
    }

    await updateTask(taskId, {
      title: form.title,
      completed: form.completed,
      priority: form.priority || undefined,
      projectId: form.projectId || undefined,
      labelIds: form.labelIds,
    })

    if (form.scheduledStart && form.scheduledEnd) {
      await updateTask(taskId, {
        scheduledStart: fromDatetimeLocalValue(form.scheduledStart),
        scheduledEnd: fromDatetimeLocalValue(form.scheduledEnd),
      })
    } else {
      await clearTaskSchedule(taskId)
    }

    onClose()
  }

  return (
    <aside className={PANEL_CLASSES}>
      <div className="relative min-h-full">
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
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.completed}
            onChange={(e) => setForm({ ...form, completed: e.target.checked })}
            className="rounded border-neutral-300"
          />
          <span className="text-sm font-medium text-neutral-700">Completed</span>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">
            Task name <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value })
              if (titleError && e.target.value.trim()) setTitleError(false)
            }}
            className={`${fieldClass} ${titleError ? 'border-red-300' : ''}`}
          />
          {titleError && (
            <p className="mt-1 text-xs text-red-600">Task name is required</p>
          )}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">
              Start
            </span>
            <input
              type="datetime-local"
              value={form.scheduledStart}
              onChange={(e) => setForm({ ...form, scheduledStart: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">
              End
            </span>
            <input
              type="datetime-local"
              value={form.scheduledEnd}
              onChange={(e) => setForm({ ...form, scheduledEnd: e.target.value })}
              className={fieldClass}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">
            Priority
          </span>
          <select
            value={form.priority}
            onChange={(e) =>
              setForm({
                ...form,
                priority: e.target.value as TaskPriority | '',
              })
            }
            className={fieldClass}
          >
            <option value="">None</option>
            {PRIORITY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-2 block text-xs font-medium text-neutral-500">
            Project
          </span>
          <InlineProjectSelect
            value={form.projectId}
            onChange={(projectId) => setForm({ ...form, projectId })}
          />
        </div>

        <div>
          <span className="mb-2 block text-xs font-medium text-neutral-500">
            Labels
          </span>
          <InlineLabelSelect
            selectedIds={form.labelIds}
            onChange={(labelIds) => setForm({ ...form, labelIds })}
          />
        </div>

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
      </div>
    </aside>
  )
}
