import { format } from 'date-fns'

export function formatDateTime(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm')
}

export function toDatetimeLocalValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function fromDatetimeLocalValue(value: string): Date {
  return new Date(value)
}
