import { useState } from 'react'
import { TaskEditPanel } from '../components/tasks/TaskEditPanel'
import { TaskList } from '../components/tasks/TaskList'

export function TasksPage() {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900">Tasks</h2>
        <p className="mt-1 text-sm text-neutral-500">
          All tasks from your calendar and task list. Changes sync automatically.
        </p>
      </header>
      <div className="relative">
        <TaskList onSelectTask={setEditingTaskId} />
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
