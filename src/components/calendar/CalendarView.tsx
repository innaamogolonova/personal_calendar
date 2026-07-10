import { useCallback, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type {
  DateSelectArg,
  DatesSetArg,
  EventChangeArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
} from '@fullcalendar/core'
import { format } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  getScheduledTasks,
  createTask,
  updateTaskSchedule,
  updateTaskTitle,
  deleteTask,
} from '../../db/tasks'
import { tasksToEvents } from '../../lib/taskEvents'
import { useCalendarStore } from '../../stores/calendarStore'
import { CalendarEventContent } from './CalendarEventContent'
import type { CalendarView as CalendarViewType } from '../../db/types'
import type { TaskSelection } from '../../types/taskSelection'

const viewMap: Record<string, CalendarViewType> = {
  dayGridMonth: 'dayGridMonth',
  timeGridWeek: 'timeGridWeek',
  timeGridDay: 'timeGridDay',
}

interface CalendarViewProps {
  onSelectTask: (selection: TaskSelection | null) => void
  /** Day-only mode for the Daily page (no month/week switcher). */
  mode?: 'full' | 'day'
  /** Controlled date when `mode="day"`. */
  date?: Date
  onDateChange?: (date: Date) => void
}

export function CalendarView({
  onSelectTask,
  mode = 'full',
  date,
  onDateChange,
}: CalendarViewProps) {
  const { view, currentDate, setView, setCurrentDate } = useCalendarStore()
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const tasks = useLiveQuery(getScheduledTasks, []) ?? []
  const events = tasksToEvents(tasks)

  const isDayMode = mode === 'day'
  const activeDate = isDayMode && date ? date : currentDate
  const activeView = isDayMode ? 'timeGridDay' : view

  const handleDatesSet = useCallback(
    (info: DatesSetArg) => {
      if (isDayMode) {
        onDateChange?.(info.view.currentStart)
        return
      }
      setCurrentDate(info.view.currentStart)
      const nextView = viewMap[info.view.type]
      if (nextView) setView(nextView)
    },
    [isDayMode, onDateChange, setCurrentDate, setView],
  )

  const handleSelect = useCallback(async (info: DateSelectArg) => {
    const task = await createTask({
      title: '',
      scheduledStart: info.start,
      scheduledEnd: info.end,
    })
    setEditingTaskId(task.id)
    info.view.calendar.unselect()
  }, [])

  const handleSaveTitle = useCallback(async (id: string, title: string) => {
    setEditingTaskId((current) => (current === id ? null : current))
    const trimmed = title.trim()
    if (!trimmed) {
      await deleteTask(id)
    } else {
      await updateTaskTitle(id, trimmed)
    }
  }, [])

  const handleCancelEdit = useCallback(async (id: string, currentTitle: string) => {
    setEditingTaskId((current) => (current === id ? null : current))
    if (!currentTitle.trim()) {
      await deleteTask(id)
    }
  }, [])

  const handleEventDrop = useCallback(async (info: EventDropArg) => {
    if (!info.event.start || !info.event.end) return

    await updateTaskSchedule(info.event.id, info.event.start, info.event.end)
  }, [])

  const handleEventResize = useCallback(async (info: EventChangeArg) => {
    if (!info.event.start || !info.event.end) return

    await updateTaskSchedule(info.event.id, info.event.start, info.event.end)
  }, [])

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      if (editingTaskId === info.event.id) return
      onSelectTask({
        taskId: info.event.id,
        anchorEl: info.el,
      })
    },
    [editingTaskId, onSelectTask],
  )

  const renderEventContent = useCallback(
    (arg: EventContentArg) => (
      <CalendarEventContent
        arg={arg}
        editingTaskId={editingTaskId}
        onSaveTitle={handleSaveTitle}
        onCancelEdit={handleCancelEdit}
      />
    ),
    [editingTaskId, handleSaveTitle, handleCancelEdit],
  )

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <FullCalendar
        key={isDayMode ? format(activeDate, 'yyyy-MM-dd') : 'full'}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={activeView}
        initialDate={activeDate}
        headerToolbar={
          isDayMode
            ? {
                left: 'prev,next today',
                center: 'title',
                right: '',
              }
            : {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }
        }
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
        }}
        height="auto"
        firstDay={1}
        editable
        selectable
        selectMirror
        dayMaxEvents
        weekends
        allDaySlot={false}
        slotMinTime="05:00:00"
        slotMaxTime="24:00:00"
        slotDuration="01:00:00"
        snapDuration="00:15:00"
        slotLabelInterval="01:00"
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        displayEventEnd
        expandRows={false}
        nowIndicator
        events={events}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        select={handleSelect}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
      />
    </div>
  )
}
