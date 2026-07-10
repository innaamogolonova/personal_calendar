import { NavLink, Outlet } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getAllProjects } from '../db/projects'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-neutral-900 text-white'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
  }`

const projectNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md py-1.5 pl-6 pr-3 text-sm transition-colors ${
    isActive
      ? 'bg-neutral-100 font-medium text-neutral-700'
      : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600'
  }`

export function AppShell() {
  const projects = useLiveQuery(getAllProjects, []) ?? []

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-6">
        <h1 className="mb-6 px-3 text-lg font-semibold text-neutral-900">
          Personal Calendar
        </h1>
        <nav className="flex flex-col gap-1">
          <NavLink to="/calendar" className={navLinkClass}>
            Calendar
          </NavLink>
          <NavLink to="/tasks" className={navLinkClass}>
            Tasks
          </NavLink>
          <NavLink to="/projects" end className={navLinkClass}>
            Projects
          </NavLink>
          {projects.length === 0 ? (
            <p className="px-3 py-1 pl-6 text-xs text-neutral-400">No projects yet</p>
          ) : (
            projects.map((project) => (
              <NavLink
                key={project.id}
                to={`/projects/${project.id}`}
                className={projectNavLinkClass}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full opacity-70"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </span>
              </NavLink>
            ))
          )}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
