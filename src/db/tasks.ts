import { db } from './database'
import type { Task, TaskPriority, TaskStatus } from './types'

function now() {
  return new Date()
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
  scheduledStart: Date
  scheduledEnd: Date
  status?: TaskStatus
  priority?: TaskPriority
  projectId?: string
  pageId?: string
}): Promise<Task> {
  const timestamp = now()
  const task: Task = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    projectId: input.projectId,
    pageId: input.pageId,
    status: input.status ?? 'todo',
    priority: input.priority ?? 'medium',
    scheduledStart: input.scheduledStart,
    scheduledEnd: input.scheduledEnd,
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
      | 'status'
      | 'priority'
      | 'scheduledStart'
      | 'scheduledEnd'
      | 'dueDate'
      | 'notes'
      | 'projectId'
      | 'pageId'
    >
  >,
): Promise<void> {
  await db.tasks.update(id, {
    ...updates,
    ...(updates.title != null ? { title: updates.title.trim() } : {}),
    updatedAt: now(),
  })
}

export async function updateTaskTitle(id: string, title: string): Promise<void> {
  await db.tasks.update(id, {
    title: title.trim(),
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
