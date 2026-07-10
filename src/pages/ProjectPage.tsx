import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getProjectById, updateProject } from '../db/projects'
import { FormattedTextEditor } from '../components/pages/FormattedTextEditor'

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [content, setContent] = useState('')

  const project = useLiveQuery(
    () => (projectId ? getProjectById(projectId) : undefined),
    [projectId],
  )

  useEffect(() => {
    if (project) setContent(project.content ?? '')
  }, [project?.id])

  const handleChange = useCallback(
    (nextContent: string) => {
      setContent(nextContent)
      if (!projectId) return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        void updateProject(projectId, { content: nextContent })
      }, 400)
    },
    [projectId],
  )

  if (!projectId) return null

  if (project === undefined) {
    return <p className="text-neutral-500">Loading...</p>
  }

  if (!project) {
    return <p className="text-neutral-500">Project not found.</p>
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <h1 className="text-2xl font-semibold text-neutral-900">{project.name}</h1>
      </div>

      <FormattedTextEditor
        content={content}
        onChange={handleChange}
        placeholder="Start writing... # heading, **bold**, *italic*, - list, > quote, - [ ] checklist"
      />
    </div>
  )
}
