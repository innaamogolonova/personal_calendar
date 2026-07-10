import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { deletePage, getChildPages, getPageById, updatePage } from '../db/pages'
import { getProjectById } from '../db/projects'
import { useSidebarStore } from '../stores/sidebarStore'

async function expandAncestorPages(
  pageId: string,
  expandPage: (id: string) => void,
): Promise<void> {
  let page = await getPageById(pageId)
  while (page?.parentPageId) {
    expandPage(page.parentPageId)
    page = await getPageById(page.parentPageId)
  }
}

export function ProjectSubpagePage() {
  const { projectId, pageId } = useParams<{ projectId: string; pageId: string }>()
  const navigate = useNavigate()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const expandProject = useSidebarStore((s) => s.expandProject)
  const expandPage = useSidebarStore((s) => s.expandPage)

  const project = useLiveQuery(
    () => (projectId ? getProjectById(projectId) : undefined),
    [projectId],
  )
  const page = useLiveQuery(() => (pageId ? getPageById(pageId) : undefined), [pageId])

  useEffect(() => {
    if (projectId) expandProject(projectId)
  }, [projectId, expandProject])

  useEffect(() => {
    if (!page) return
    setContent(page.content ?? '')
    setTitle(page.title)
    void expandAncestorPages(page.id, expandPage)
  }, [page?.id, expandPage])

  const scheduleSave = useCallback(
    (updates: { content?: string; title?: string }) => {
      if (!pageId) return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        void updatePage(pageId, updates)
      }, 400)
    },
    [pageId],
  )

  const handleDelete = async () => {
    if (!pageId || !projectId || !page) return
    const children = await getChildPages(pageId)
    const message =
      children.length > 0
        ? `Delete "${page.title}" and all its subpages?`
        : `Delete "${page.title}"?`
    if (!window.confirm(message)) return
    await deletePage(pageId)
    navigate(`/projects/${projectId}`)
  }

  if (!projectId || !pageId) return null

  if (project === undefined || page === undefined) {
    return <p className="text-neutral-500">Loading...</p>
  }

  if (!project || !page || page.projectId !== projectId) {
    return <p className="text-neutral-500">Page not found.</p>
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        {project.name}
      </div>

      <div className="mb-4 flex items-start justify-between gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            scheduleSave({ title: e.target.value })
          }}
          className="w-full border-0 bg-transparent p-0 text-2xl font-semibold text-neutral-900 focus:outline-none focus:ring-0"
          aria-label="Page title"
        />
        <button
          type="button"
          onClick={() => void handleDelete()}
          className="shrink-0 text-sm text-red-600 hover:text-red-700"
        >
          Delete
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          scheduleSave({ content: e.target.value })
        }}
        placeholder="Start writing..."
        spellCheck
        className="block min-h-[calc(100vh-14rem)] w-full resize-none border-0 bg-transparent p-0 text-base leading-relaxed text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
      />
    </div>
  )
}
