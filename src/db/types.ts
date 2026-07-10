export type TaskPriority = 'low' | 'medium' | 'high'

export interface Project {
  id: string
  name: string
  color: string
  content: string
  sortOrder: number
  createdAt: Date
}

export interface Label {
  id: string
  name: string
  color: string
}

export interface Page {
  id: string
  projectId: string
  parentPageId?: string
  title: string
  content: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  completed: boolean
  title: string
  scheduledStart?: Date
  scheduledEnd?: Date
  priority?: TaskPriority
  projectId?: string
  labelIds: string[]
  pageId?: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
