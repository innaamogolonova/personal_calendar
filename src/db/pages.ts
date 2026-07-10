import { db } from './database'
import type { Page } from './types'

export async function getRootPages(projectId: string): Promise<Page[]> {
  const pages = await db.pages.where('projectId').equals(projectId).toArray()
  return pages
    .filter((p) => !p.parentPageId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
}

export async function getChildPages(parentPageId: string): Promise<Page[]> {
  const pages = await db.pages.where('parentPageId').equals(parentPageId).toArray()
  return pages.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
}

export async function getPageById(id: string): Promise<Page | undefined> {
  return db.pages.get(id)
}

export async function createPage(
  projectId: string,
  options: { parentPageId?: string; title?: string } = {},
): Promise<Page> {
  const now = new Date()
  const page: Page = {
    id: crypto.randomUUID(),
    projectId,
    parentPageId: options.parentPageId,
    title: options.title?.trim() || 'Untitled',
    content: '',
    sortOrder: Date.now(),
    createdAt: now,
    updatedAt: now,
  }
  await db.pages.add(page)
  return page
}

export async function updatePage(
  id: string,
  updates: Partial<Pick<Page, 'title' | 'content' | 'parentPageId' | 'sortOrder'>>,
): Promise<void> {
  await db.pages.update(id, {
    ...updates,
    ...(updates.title != null ? { title: updates.title.trim() || 'Untitled' } : {}),
    updatedAt: new Date(),
  })
}

async function deletePageDescendants(pageId: string): Promise<void> {
  const children = await db.pages.where('parentPageId').equals(pageId).toArray()
  for (const child of children) {
    await deletePageDescendants(child.id)
    await db.tasks.where('pageId').equals(child.id).modify((task) => {
      delete task.pageId
      task.updatedAt = new Date()
    })
    await db.pages.delete(child.id)
  }
}

export async function deletePage(id: string): Promise<void> {
  await db.transaction('rw', db.pages, db.tasks, async () => {
    await deletePageDescendants(id)
    await db.tasks.where('pageId').equals(id).modify((task) => {
      delete task.pageId
      task.updatedAt = new Date()
    })
    await db.pages.delete(id)
  })
}

export async function deletePagesByProject(projectId: string): Promise<void> {
  await db.pages.where('projectId').equals(projectId).delete()
}
