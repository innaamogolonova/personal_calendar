import type { Task, TaskPriority } from '../db/types'
import { taskOverlapsDay } from './dates'

export type TaskStatusFilter = 'all' | 'active' | 'completed'
export type TaskPriorityFilter = 'all' | TaskPriority | 'none'
export type TaskSortField = 'updated' | 'title' | 'scheduled' | 'priority' | 'project'
export type TaskSortDirection = 'asc' | 'desc'

export interface TaskListQuery {
  search: string
  status: TaskStatusFilter
  priority: TaskPriorityFilter
  projectId: string // '' = all, 'none' = no project, else project id
  labelId: string // '' = all, else label id
  sortField: TaskSortField
  sortDirection: TaskSortDirection
}

export const DEFAULT_TASK_LIST_QUERY: TaskListQuery = {
  search: '',
  status: 'all',
  priority: 'all',
  projectId: '',
  labelId: '',
  sortField: 'updated',
  sortDirection: 'desc',
}

const PRIORITY_RANK: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

export function filterTasks(
  tasks: Task[],
  query: TaskListQuery,
  options: { date?: Date } = {},
): Task[] {
  const search = query.search.trim().toLowerCase()

  return tasks.filter((task) => {
    if (options.date && !taskOverlapsDay(task, options.date)) return false

    if (query.status === 'active' && task.completed) return false
    if (query.status === 'completed' && !task.completed) return false

    if (query.priority === 'none' && task.priority != null) return false
    if (
      query.priority !== 'all' &&
      query.priority !== 'none' &&
      task.priority !== query.priority
    ) {
      return false
    }

    if (query.projectId === 'none' && task.projectId != null) return false
    if (
      query.projectId &&
      query.projectId !== 'none' &&
      task.projectId !== query.projectId
    ) {
      return false
    }

    if (query.labelId && !task.labelIds.includes(query.labelId)) return false

    if (search && !(task.title || '').toLowerCase().includes(search)) return false

    return true
  })
}

function compareNullableDates(
  a: Date | undefined,
  b: Date | undefined,
  direction: TaskSortDirection,
): number {
  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1
  const diff = a.getTime() - b.getTime()
  return direction === 'asc' ? diff : -diff
}

function comparePriority(
  a: TaskPriority | undefined,
  b: TaskPriority | undefined,
  direction: TaskSortDirection,
): number {
  const rankA = a ? PRIORITY_RANK[a] : 0
  const rankB = b ? PRIORITY_RANK[b] : 0
  const diff = rankA - rankB
  return direction === 'asc' ? diff : -diff
}

export function sortTasks(
  tasks: Task[],
  query: TaskListQuery,
  projectNameById: Map<string, string>,
): Task[] {
  const { sortField, sortDirection } = query
  const sorted = [...tasks]

  sorted.sort((a, b) => {
    let result = 0

    switch (sortField) {
      case 'title':
        result = (a.title || '').localeCompare(b.title || '', undefined, {
          sensitivity: 'base',
        })
        if (sortDirection === 'desc') result = -result
        break
      case 'scheduled':
        result = compareNullableDates(a.scheduledStart, b.scheduledStart, sortDirection)
        break
      case 'priority':
        result = comparePriority(a.priority, b.priority, sortDirection)
        break
      case 'project': {
        const nameA = a.projectId ? (projectNameById.get(a.projectId) ?? '') : ''
        const nameB = b.projectId ? (projectNameById.get(b.projectId) ?? '') : ''
        if (!nameA && !nameB) result = 0
        else if (!nameA) result = 1
        else if (!nameB) result = -1
        else {
          result = nameA.localeCompare(nameB, undefined, { sensitivity: 'base' })
          if (sortDirection === 'desc') result = -result
        }
        break
      }
      case 'updated':
      default:
        result = a.updatedAt.getTime() - b.updatedAt.getTime()
        if (sortDirection === 'desc') result = -result
        break
    }

    if (result !== 0) return result
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })

  return sorted
}

export function queryTasks(
  tasks: Task[],
  query: TaskListQuery,
  projectNameById: Map<string, string>,
  options: { date?: Date } = {},
): Task[] {
  return sortTasks(filterTasks(tasks, query, options), query, projectNameById)
}

export function isDefaultTaskListQuery(query: TaskListQuery): boolean {
  return (
    query.search === DEFAULT_TASK_LIST_QUERY.search &&
    query.status === DEFAULT_TASK_LIST_QUERY.status &&
    query.priority === DEFAULT_TASK_LIST_QUERY.priority &&
    query.projectId === DEFAULT_TASK_LIST_QUERY.projectId &&
    query.labelId === DEFAULT_TASK_LIST_QUERY.labelId &&
    query.sortField === DEFAULT_TASK_LIST_QUERY.sortField &&
    query.sortDirection === DEFAULT_TASK_LIST_QUERY.sortDirection
  )
}
