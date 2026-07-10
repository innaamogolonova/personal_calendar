import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { EntityEditPopover } from '../components/shared/EntityEditPopover'
import { deleteProject, getAllProjects, updateProject } from '../db/projects'
import type { Project } from '../db/types'

export function ProjectsPage() {
  const projects = useLiveQuery(getAllProjects, []) ?? []
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editAnchor, setEditAnchor] = useState<HTMLElement | null>(null)

  const closeEditor = () => {
    setEditingProject(null)
    setEditAnchor(null)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900">Projects</h2>
        <p className="mt-1 text-sm text-neutral-500">
          All projects from your task list. Create one by assigning a project on any task.
        </p>
      </header>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-200 px-6 py-12 text-center text-sm text-neutral-500">
          No projects yet. Create one by assigning a project on any task.
        </div>
      ) : (
        <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
          {projects.map((project) => (
            <li key={project.id} className="group flex items-center">
              <Link
                to={`/projects/${project.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-sm text-neutral-800 hover:bg-neutral-50"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate">{project.name}</span>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  setEditingProject(project)
                  setEditAnchor(e.currentTarget)
                }}
                className="mr-3 shrink-0 rounded px-2 py-1 text-xs text-neutral-500 opacity-0 transition-opacity hover:bg-neutral-100 hover:text-neutral-800 group-hover:opacity-100"
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}

      {editingProject && (
        <EntityEditPopover
          entityType="project"
          name={editingProject.name}
          color={editingProject.color}
          anchorEl={editAnchor}
          onSave={async (name, color) => {
            await updateProject(editingProject.id, { name, color })
          }}
          onDelete={async () => {
            await deleteProject(editingProject.id)
          }}
          onClose={closeEditor}
        />
      )}
    </div>
  )
}
