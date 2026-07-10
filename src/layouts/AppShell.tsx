import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getAllProjects } from '../db/projects'
import { ProjectSidebarNode } from '../components/sidebar/ProjectSidebarNode'
import { useSidebarStore } from '../stores/sidebarStore'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-neutral-900 text-white'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
  }`

export function AppShell() {
  const projects = useLiveQuery(getAllProjects, []) ?? []
  const location = useLocation()
  const expandProject = useSidebarStore((s) => s.expandProject)

  useEffect(() => {
    const match = location.pathname.match(/^\/projects\/([^/]+)/)
    if (match) expandProject(match[1])
  }, [location.pathname, expandProject])

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
            <p className="px-3 py-1 pl-4 text-xs text-neutral-400">No projects yet</p>
          ) : (
            projects.map((project) => (
              <ProjectSidebarNode key={project.id} project={project} />
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
