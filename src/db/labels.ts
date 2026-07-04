import { db } from './database'
import type { Label } from './types'
import { DEFAULT_LABEL_COLOR } from '../lib/colors'

export async function getAllLabels(): Promise<Label[]> {
  const labels = await db.labels.toArray()
  return labels.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getLabelById(id: string): Promise<Label | undefined> {
  return db.labels.get(id)
}

export async function findLabelByName(name: string): Promise<Label | undefined> {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return undefined
  const labels = await db.labels.toArray()
  return labels.find((l) => l.name.toLowerCase() === normalized)
}

export async function createLabel(
  name: string,
  color: string = DEFAULT_LABEL_COLOR,
): Promise<Label> {
  const label: Label = {
    id: crypto.randomUUID(),
    name: name.trim(),
    color,
  }
  await db.labels.add(label)
  return label
}

export async function getOrCreateLabel(name: string): Promise<Label> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Label name is required')
  const existing = await findLabelByName(trimmed)
  if (existing) return existing
  return createLabel(trimmed)
}

export async function updateLabel(
  id: string,
  updates: Partial<Pick<Label, 'name' | 'color'>>,
): Promise<void> {
  if (updates.name != null && !updates.name.trim()) {
    throw new Error('Label name is required')
  }
  await db.labels.update(id, {
    ...updates,
    ...(updates.name != null ? { name: updates.name.trim() } : {}),
  })
}

export async function deleteLabel(id: string): Promise<void> {
  await db.transaction('rw', db.tasks, db.labels, async () => {
    const tasks = await db.tasks.filter((task) => task.labelIds.includes(id)).toArray()
    await Promise.all(
      tasks.map((task) =>
        db.tasks.update(task.id, {
          labelIds: task.labelIds.filter((labelId) => labelId !== id),
          updatedAt: new Date(),
        }),
      ),
    )
    await db.labels.delete(id)
  })
}
