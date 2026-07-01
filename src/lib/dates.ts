import { format, isSameDay } from 'date-fns'

export function formatDateTime(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm')
}

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
