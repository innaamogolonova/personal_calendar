import { useMemo, useState } from 'react'
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
import { PRIORITY_LABELS, PRIORITY_OPTIONS } from '../../lib/taskLabels'
import {
  DEFAULT_TASK_LIST_QUERY,
  isDefaultTaskListQuery,
  queryTasks,
  type TaskListQuery,
  type TaskPriorityFilter,
  type TaskSortDirection,
  type TaskSortField,
  type TaskStatusFilter,
} from '../../lib/taskQuery'

interface TaskListProps {
  onSelectTask: (taskId: string) => void
  /** When set, only show tasks scheduled on this calendar day. */
  date?: Date
}

const selectClass =
  'rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-800'

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

function TaskListToolbar({
  query,
  onChange,
  projects,
  labels,
  resultCount,
  totalCount,
}: {
  query: TaskListQuery
  onChange: (next: TaskListQuery) => void
  projects: Project[]
  labels: Label[]
  resultCount: number
  totalCount: number
}) {
  const patch = (partial: Partial<TaskListQuery>) => onChange({ ...query, ...partial })
  const showReset = !isDefaultTaskListQuery(query)

  return (
    <div className="mb-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query.search}
          onChange={(e) => patch({ search: e.target.value })}
          placeholder="Search tasks…"
          className="min-w-[12rem] flex-1 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-800 placeholder:text-neutral-400"
          aria-label="Search tasks"
        />

        <select
          value={query.status}
          onChange={(e) => patch({ status: e.target.value as TaskStatusFilter })}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={query.priority}
          onChange={(e) => patch({ priority: e.target.value as TaskPriorityFilter })}
          className={selectClass}
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          <option value="none">No priority</option>
        </select>

        <select
          value={query.projectId}
          onChange={(e) => patch({ projectId: e.target.value })}
          className={selectClass}
          aria-label="Filter by project"
        >
          <option value="">All projects</option>
          <option value="none">No project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          value={query.labelId}
          onChange={(e) => patch({ labelId: e.target.value })}
          className={selectClass}
          aria-label="Filter by label"
        >
          <option value="">All labels</option>
          {labels.map((label) => (
            <option key={label.id} value={label.id}>
              {label.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-sm text-neutral-600">
          Sort
          <select
            value={query.sortField}
            onChange={(e) => patch({ sortField: e.target.value as TaskSortField })}
            className={selectClass}
            aria-label="Sort by"
          >
            <option value="updated">Last updated</option>
            <option value="title">Name</option>
            <option value="scheduled">Scheduled</option>
            <option value="priority">Priority</option>
            <option value="project">Project</option>
          </select>
        </label>

        <select
          value={query.sortDirection}
          onChange={(e) =>
            patch({ sortDirection: e.target.value as TaskSortDirection })
          }
          className={selectClass}
          aria-label="Sort direction"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {showReset && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_TASK_LIST_QUERY)}
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            Reset
          </button>
        )}

        <span className="ml-auto text-xs text-neutral-400">
          {resultCount === totalCount
            ? `${resultCount} task${resultCount === 1 ? '' : 's'}`
            : `${resultCount} of ${totalCount}`}
        </span>
      </div>
    </div>
  )
}

export function TaskList({ onSelectTask, date }: TaskListProps) {
  const tasks = useLiveQuery(getAllTasks, []) ?? []
  const projects = useLiveQuery(getAllProjects, []) ?? []
  const labels = useLiveQuery(getAllLabels, []) ?? []
  const [query, setQuery] = useState<TaskListQuery>(DEFAULT_TASK_LIST_QUERY)

  const projectNameById = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  )

  const visibleTasks = useMemo(
    () => queryTasks(tasks, query, projectNameById, { date }),
    [tasks, query, projectNameById, date],
  )

  const totalInScope = useMemo(
    () =>
      queryTasks(tasks, DEFAULT_TASK_LIST_QUERY, projectNameById, { date }).length,
    [tasks, date, projectNameById],
  )

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

  const emptyMessage = date
    ? totalInScope === 0
      ? 'No tasks scheduled for this day.'
      : 'No tasks match these filters.'
    : tasks.length === 0
      ? 'No tasks yet. Create one on the calendar.'
      : 'No tasks match these filters.'

  return (
    <div>
      <TaskListToolbar
        query={query}
        onChange={setQuery}
        projects={projects}
        labels={labels}
        resultCount={visibleTasks.length}
        totalCount={totalInScope}
      />

      {visibleTasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-12 text-center text-neutral-500">
          {emptyMessage}
        </div>
      ) : (
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
              {visibleTasks.map((task) => (
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
                  <td className="px-4 py-3 text-neutral-600">
                    {formatScheduled(task)}
                  </td>
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
      )}
    </div>
  )
}
