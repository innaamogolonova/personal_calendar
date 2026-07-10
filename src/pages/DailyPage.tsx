import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarView } from '../components/calendar/CalendarView'
import { TaskEditPanel } from '../components/tasks/TaskEditPanel'
import { TaskEventPopover } from '../components/tasks/TaskEventPopover'
import { TaskList } from '../components/tasks/TaskList'
import { fromDateInputValue, toDateInputValue } from '../lib/dates'
import type { TaskSelection } from '../types/taskSelection'

export function DailyPage() {
  const [date, setDate] = useState(() => new Date())
  const [selection, setSelection] = useState<TaskSelection | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const handleEdit = () => {
    if (!selection) return
    setEditingTaskId(selection.taskId)
    setSelection(null)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Daily</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <label className="flex flex-col gap-1 text-xs font-medium text-neutral-500">
          Date
          <input
            type="date"
            value={toDateInputValue(date)}
            onChange={(e) => {
              if (!e.target.value) return
              setDate(fromDateInputValue(e.target.value))
            }}
            className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900"
          />
        </label>
      </header>

      <section className="mb-8">
        <h3 className="mb-3 text-sm font-medium text-neutral-700">Tasks</h3>
        <TaskList date={date} onSelectTask={setEditingTaskId} />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-neutral-700">Schedule</h3>
        <div className="relative">
          <CalendarView
            mode="day"
            date={date}
            onDateChange={setDate}
            onSelectTask={setSelection}
          />
          {selection && !editingTaskId && (
            <TaskEventPopover
              taskId={selection.taskId}
              anchorEl={selection.anchorEl}
              onClose={() => setSelection(null)}
              onEdit={handleEdit}
            />
          )}
        </div>
      </section>

      {editingTaskId && (
        <TaskEditPanel
          taskId={editingTaskId}
          onClose={() => setEditingTaskId(null)}
        />
      )}
    </div>
  )
}
