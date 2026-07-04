import { db } from './database'
import type { Task, TaskPriority } from './types'

function now() {
  return new Date()
}

export function isValidTaskTitle(title: string): boolean {
  return title.trim().length > 0
}

export async function getAllTasks(): Promise<Task[]> {
  const tasks = await db.tasks.toArray()
  return tasks.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

export async function getScheduledTasks(): Promise<Task[]> {
  return db.tasks
    .filter((task) => task.scheduledStart != null && task.scheduledEnd != null)
    .toArray()
}

export async function createTask(input: {
  title: string
  completed?: boolean
  scheduledStart?: Date
  scheduledEnd?: Date
  priority?: TaskPriority
  projectId?: string
  labelIds?: string[]
  pageId?: string
}): Promise<Task> {
  const timestamp = now()
  const task: Task = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    completed: input.completed ?? false,
    projectId: input.projectId,
    pageId: input.pageId,
    priority: input.priority,
    scheduledStart: input.scheduledStart,
    scheduledEnd: input.scheduledEnd,
    labelIds: input.labelIds ?? [],
    sortOrder: Date.now(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await db.tasks.add(task)
  return task
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  return db.tasks.get(id)
}

export async function updateTask(
  id: string,
  updates: Partial<
    Pick<
      Task,
      | 'title'
      | 'completed'
      | 'priority'
      | 'scheduledStart'
      | 'scheduledEnd'
      | 'projectId'
      | 'labelIds'
      | 'pageId'
    >
  >,
): Promise<void> {
  if (updates.title != null && !isValidTaskTitle(updates.title)) {
    throw new Error('Task name is required')
  }

  await db.tasks.update(id, {
    ...updates,
    ...(updates.title != null ? { title: updates.title.trim() } : {}),
    updatedAt: now(),
  })
}

export async function updateTaskTitle(id: string, title: string): Promise<void> {
  if (!isValidTaskTitle(title)) return
  await db.tasks.update(id, {
    title: title.trim(),
    updatedAt: now(),
  })
}

export async function updateTaskCompleted(id: string, completed: boolean): Promise<void> {
  await db.tasks.update(id, {
    completed,
    updatedAt: now(),
  })
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id)
}

export async function updateTaskSchedule(
  id: string,
  scheduledStart: Date,
  scheduledEnd: Date,
): Promise<void> {
  await db.tasks.update(id, {
    scheduledStart,
    scheduledEnd,
    updatedAt: now(),
  })
}

export async function clearTaskSchedule(id: string): Promise<void> {
  await db.tasks.where('id').equals(id).modify((task) => {
    delete task.scheduledStart
    delete task.scheduledEnd
    task.updatedAt = now()
  })
}
