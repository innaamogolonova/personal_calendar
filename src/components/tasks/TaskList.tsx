import { useLiveQuery } from 'dexie-react-hooks'
import { deleteTask, getAllTasks } from '../../db/tasks'
import type { Task } from '../../db/types'
import { formatScheduledRange } from '../../lib/dates'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../lib/taskLabels'

interface TaskListProps {
  onSelectTask: (taskId: string) => void
}

function formatScheduled(task: Task): string {
  if (task.scheduledStart && task.scheduledEnd) {
    return formatScheduledRange(task.scheduledStart, task.scheduledEnd)
  }
  return '—'
}

export function TaskList({ onSelectTask }: TaskListProps) {
  const tasks = useLiveQuery(getAllTasks, []) ?? []

  const handleDelete = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    const confirmed = window.confirm('Delete this task?')
    if (!confirmed) return
    await deleteTask(taskId)
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-12 text-center text-neutral-500">
        No tasks yet. Create one on the calendar.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Scheduled</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {tasks.map((task) => (
            <tr
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className="cursor-pointer hover:bg-neutral-50"
            >
              <td className="px-4 py-3 font-medium text-neutral-900">
                {task.title || 'Untitled'}
              </td>
              <td className="px-4 py-3 text-neutral-600">{formatScheduled(task)}</td>
              <td className="px-4 py-3 text-neutral-600">
                {STATUS_LABELS[task.status]}
              </td>
              <td className="px-4 py-3 text-neutral-600">
                {PRIORITY_LABELS[task.priority]}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, task.id)}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
