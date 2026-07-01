import { useState } from 'react'
import { CalendarView } from '../components/calendar/CalendarView'
import { TaskEditPanel } from '../components/tasks/TaskEditPanel'
import { TaskEventPopover } from '../components/tasks/TaskEventPopover'
import type { TaskSelection } from '../types/taskSelection'

export function CalendarPage() {
  const [selection, setSelection] = useState<TaskSelection | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const handleEdit = () => {
    if (!selection) return
    setEditingTaskId(selection.taskId)
    setSelection(null)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900">Calendar</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Drag on the calendar to create a task. Click an event to view details.
        </p>
      </header>
      <div className="relative">
        <CalendarView onSelectTask={setSelection} />
        {selection && !editingTaskId && (
          <TaskEventPopover
            taskId={selection.taskId}
            anchorEl={selection.anchorEl}
            onClose={() => setSelection(null)}
            onEdit={handleEdit}
          />
        )}
        {editingTaskId && (
          <TaskEditPanel
            taskId={editingTaskId}
            onClose={() => setEditingTaskId(null)}
          />
        )}
      </div>
    </div>
  )
}
