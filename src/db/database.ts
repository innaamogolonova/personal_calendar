import Dexie, { type EntityTable } from 'dexie'
import type { Task } from './types'

const db = new Dexie('PersonalCalendar') as Dexie & {
  tasks: EntityTable<Task, 'id'>
}

db.version(1).stores({
  tasks: 'id, projectId, pageId, status, scheduledStart, dueDate, sortOrder',
})

export { db }
