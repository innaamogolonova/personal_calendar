import { db } from './database'
import { deletePagesByProject } from './pages'
import type { Project } from './types'
import { DEFAULT_PROJECT_COLOR } from '../lib/colors'

export async function getAllProjects(): Promise<Project[]> {
  const projects = await db.projects.toArray()
  return projects.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return db.projects.get(id)
}

export async function findProjectByName(name: string): Promise<Project | undefined> {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return undefined
  const projects = await db.projects.toArray()
  return projects.find((p) => p.name.toLowerCase() === normalized)
}

export async function createProject(
  name: string,
  color: string = DEFAULT_PROJECT_COLOR,
): Promise<Project> {
  const project: Project = {
    id: crypto.randomUUID(),
    name: name.trim(),
    color,
    content: '',
    sortOrder: Date.now(),
    createdAt: new Date(),
  }
  await db.projects.add(project)
  return project
}

export async function getOrCreateProject(name: string): Promise<Project> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Project name is required')
  const existing = await findProjectByName(trimmed)
  if (existing) return existing
  return createProject(trimmed)
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'name' | 'color' | 'content'>>,
): Promise<void> {
  if (updates.name != null && !updates.name.trim()) {
    throw new Error('Project name is required')
  }
  await db.projects.update(id, {
    ...updates,
    ...(updates.name != null ? { name: updates.name.trim() } : {}),
  })
}

export async function deleteProject(id: string): Promise<void> {
  await db.transaction('rw', db.tasks, db.projects, db.pages, async () => {
    await db.tasks.where('projectId').equals(id).modify((task) => {
      delete task.projectId
      delete task.pageId
      task.updatedAt = new Date()
    })
    await deletePagesByProject(id)
    await db.projects.delete(id)
  })
}
