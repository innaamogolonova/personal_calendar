import { useCallback, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type {
  DateSelectArg,
  DatesSetArg,
  EventChangeArg,
  EventContentArg,
  EventDropArg,
} from '@fullcalendar/core'
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
import type { CalendarView } from '../../db/types'

const viewMap: Record<string, CalendarView> = {
  dayGridMonth: 'dayGridMonth',
  timeGridWeek: 'timeGridWeek',
  timeGridDay: 'timeGridDay',
}

export function CalendarView() {
  const { view, currentDate, setView, setCurrentDate } = useCalendarStore()
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const tasks = useLiveQuery(getScheduledTasks, []) ?? []
  const events = tasksToEvents(tasks)

  const handleDatesSet = useCallback(
    (info: DatesSetArg) => {
      setCurrentDate(info.view.currentStart)
      const nextView = viewMap[info.view.type]
      if (nextView) setView(nextView)
    },
    [setCurrentDate, setView],
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
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        initialDate={currentDate}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
        }}
        height="auto"
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
        datesSet={handleDatesSet}
        select={handleSelect}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
      />
    </div>
  )
}
