import Dexie, { type EntityTable } from 'dexie'
import type { Label, Project, Task } from './types'

const db = new Dexie('PersonalCalendar') as Dexie & {
  tasks: EntityTable<Task, 'id'>
  projects: EntityTable<Project, 'id'>
  labels: EntityTable<Label, 'id'>
}

db.version(1).stores({
  tasks: 'id, projectId, pageId, status, scheduledStart, dueDate, sortOrder',
})

db.version(2)
  .stores({
    tasks: 'id, projectId, completed, scheduledStart, sortOrder',
    projects: 'id, name, sortOrder',
    labels: 'id, name',
  })
  .upgrade(async (tx) => {
    await tx
      .table('tasks')
      .toCollection()
      .modify((task: Record<string, unknown>) => {
        task.completed = task.status === 'done'
        task.labelIds = []
        delete task.status
        delete task.dueDate
        delete task.notes
      })
  })

db.version(3).upgrade(async (tx) => {
  await tx.table('projects').toCollection().modify((project: Record<string, unknown>) => {
    if (!project.color) project.color = '#6366f1'
  })
  await tx.table('labels').toCollection().modify((label: Record<string, unknown>) => {
    if (!label.color) label.color = '#64748b'
  })
})

db.version(4).upgrade(async (tx) => {
  await tx.table('projects').toCollection().modify((project: Record<string, unknown>) => {
    if (project.content == null) project.content = ''
  })
})

export { db }
