import { endOfDay, format, isSameDay, startOfDay } from 'date-fns'
import type { Task } from '../db/types'

const SCHEDULED_DATE_TIME = 'EEE MM/dd HH:mm'

export function formatScheduledRange(start: Date, end: Date): string {
  if (isSameDay(start, end)) {
    return `${format(start, SCHEDULED_DATE_TIME)} – ${format(end, 'HH:mm')}`
  }
  return `${format(start, SCHEDULED_DATE_TIME)} – ${format(end, SCHEDULED_DATE_TIME)}`
}

export function toDatetimeLocalValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function fromDatetimeLocalValue(value: string): Date {
  return new Date(value)
}

export function toDateInputValue(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function fromDateInputValue(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** True if the task's schedule overlaps the given calendar day. */
export function taskOverlapsDay(task: Task, day: Date): boolean {
  if (!task.scheduledStart) return false
  const rangeStart = task.scheduledStart
  const rangeEnd = task.scheduledEnd ?? task.scheduledStart
  return rangeStart <= endOfDay(day) && rangeEnd >= startOfDay(day)
}
