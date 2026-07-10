import { useCallback, useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getAllProjects } from '../db/projects'
import { ProjectSidebarNode } from '../components/sidebar/ProjectSidebarNode'
import { PanelCollapseIcon, PanelExpandIcon } from '../components/sidebar/icons'
import {
  SIDEBAR_COLLAPSE_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  useSidebarStore,
} from '../stores/sidebarStore'

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
  const width = useSidebarStore((s) => s.width)
  const collapsed = useSidebarStore((s) => s.collapsed)
  const setWidth = useSidebarStore((s) => s.setWidth)
  const setCollapsed = useSidebarStore((s) => s.setCollapsed)
  const dragging = useRef(false)

  useEffect(() => {
    const match = location.pathname.match(/^\/projects\/([^/]+)/)
    if (match) expandProject(match[1])
  }, [location.pathname, expandProject])

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dragging.current = true
      const startX = e.clientX
      const startWidth = collapsed ? 0 : width

      const previousUserSelect = document.body.style.userSelect
      const previousCursor = document.body.style.cursor
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'

      const onMove = (moveEvent: MouseEvent) => {
        if (!dragging.current) return
        const next = startWidth + (moveEvent.clientX - startX)

        if (next < SIDEBAR_COLLAPSE_WIDTH) {
          setCollapsed(true)
          return
        }

        setWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, next)))
      }

      const onUp = () => {
        dragging.current = false
        document.body.style.userSelect = previousUserSelect
        document.body.style.cursor = previousCursor
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [collapsed, width, setWidth, setCollapsed],
  )

  return (
    <div className="flex min-h-screen">
      {collapsed ? (
        <div className="relative flex w-10 shrink-0 flex-col items-center border-r border-neutral-200 bg-white py-4">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelExpandIcon />
          </button>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            onMouseDown={onResizeStart}
            className="absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize hover:bg-neutral-300/60"
          />
        </div>
      ) : (
        <aside
          className="relative flex shrink-0 flex-col overflow-hidden border-r border-neutral-200 bg-white py-6"
          style={{ width }}
        >
          <div className="mb-6 flex items-start justify-between gap-2 px-4">
            <h1 className="min-w-0 truncate px-3 text-lg font-semibold text-neutral-900">
              Personal Calendar
            </h1>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="shrink-0 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelCollapseIcon />
            </button>
          </div>
          <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-4">
            <NavLink to="/calendar" className={navLinkClass}>
              Calendar
            </NavLink>
            <NavLink to="/daily" className={navLinkClass}>
              Daily
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
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            onMouseDown={onResizeStart}
            className="absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize hover:bg-neutral-300/60 active:bg-neutral-400/70"
          />
        </aside>
      )}
      <main className="min-w-0 flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
