import type { EventInput } from '@fullcalendar/core'
import type { Task } from '../db/types'

export function tasksToEvents(tasks: Task[]): EventInput[] {
  return tasks
    .filter((task) => task.scheduledStart && task.scheduledEnd)
    .map((task) => ({
      id: task.id,
      title: task.title,
      start: task.scheduledStart!,
      end: task.scheduledEnd!,
    }))
}
