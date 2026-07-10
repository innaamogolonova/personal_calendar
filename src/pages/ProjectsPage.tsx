import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getAllProjects } from '../db/projects'

export function ProjectsPage() {
  const projects = useLiveQuery(getAllProjects, []) ?? []

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
            <li key={project.id}>
              <Link
                to={`/projects/${project.id}`}
                className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-800 hover:bg-neutral-50"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
