export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  projectId?: string
  pageId?: string
  status: TaskStatus
  priority: TaskPriority
  scheduledStart?: Date
  scheduledEnd?: Date
  dueDate?: Date
  notes?: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
