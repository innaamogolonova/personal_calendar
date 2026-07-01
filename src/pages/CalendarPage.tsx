import { CalendarView } from '../components/calendar/CalendarView'

export function CalendarPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900">Calendar</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Click and drag on the calendar to create a task. Drag events to
          reschedule.
        </p>
      </header>
      <CalendarView />
    </div>
  )
}
