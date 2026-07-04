import { useLiveQuery } from 'dexie-react-hooks'
import { getAllLabels } from '../../db/labels'
import { getAllProjects } from '../../db/projects'
import {
  deleteTask,
  getAllTasks,
  updateTaskCompleted,
} from '../../db/tasks'
import type { Label, Project, Task } from '../../db/types'
import { formatScheduledRange } from '../../lib/dates'
import { PRIORITY_LABELS } from '../../lib/taskLabels'

interface TaskListProps {
  onSelectTask: (taskId: string) => void
}

function formatScheduled(task: Task): string {
  if (task.scheduledStart && task.scheduledEnd) {
    return formatScheduledRange(task.scheduledStart, task.scheduledEnd)
  }
  return '—'
}

function projectDisplay(projects: Project[], projectId?: string) {
  if (!projectId) return '—'
  const project = projects.find((p) => p.id === projectId)
  if (!project) return '—'
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: project.color }}
      />
      {project.name}
    </span>
  )
}

function labelsDisplay(labels: Label[], labelIds: string[]) {
  if (!labelIds.length) return '—'
  const matched = labels.filter((l) => labelIds.includes(l.id))
  if (!matched.length) return '—'
  return (
    <span className="flex flex-wrap gap-1">
      {matched.map((label) => (
        <span
          key={label.id}
          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-1.5 py-0.5 text-xs"
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: label.color }}
          />
          {label.name}
        </span>
      ))}
    </span>
  )
}

export function TaskList({ onSelectTask }: TaskListProps) {
  const tasks = useLiveQuery(getAllTasks, []) ?? []
  const projects = useLiveQuery(getAllProjects, []) ?? []
  const labels = useLiveQuery(getAllLabels, []) ?? []

  const handleToggleCompleted = async (
    e: React.ChangeEvent<HTMLInputElement>,
    taskId: string,
    completed: boolean,
  ) => {
    e.stopPropagation()
    await updateTaskCompleted(taskId, completed)
  }

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
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500">
          <tr>
            <th className="w-10 px-4 py-3" />
            <th className="px-4 py-3">Task name</th>
            <th className="px-4 py-3">Scheduled</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3">Labels</th>
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
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) =>
                    handleToggleCompleted(e, task.id, e.target.checked)
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-neutral-300"
                  aria-label={`Mark "${task.title || 'Untitled'}" as completed`}
                />
              </td>
              <td
                className={`px-4 py-3 font-medium ${
                  task.completed
                    ? 'text-neutral-400 line-through'
                    : 'text-neutral-900'
                }`}
              >
                {task.title || 'Untitled'}
              </td>
              <td className="px-4 py-3 text-neutral-600">{formatScheduled(task)}</td>
              <td className="px-4 py-3 text-neutral-600">
                {task.priority ? PRIORITY_LABELS[task.priority] : '—'}
              </td>
              <td className="px-4 py-3 text-neutral-600">
                {projectDisplay(projects, task.projectId)}
              </td>
              <td className="px-4 py-3 text-neutral-600">
                {labelsDisplay(labels, task.labelIds)}
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
