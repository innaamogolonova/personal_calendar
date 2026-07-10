import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Project } from '../../db/types'
import { createPage, getRootPages } from '../../db/pages'
import { useSidebarStore } from '../../stores/sidebarStore'
import { PageSidebarNode } from './PageSidebarNode'
import { PROJECT_ROW_PADDING } from './constants'
import { ChevronIcon, MoreIcon } from './icons'

const projectNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-w-0 flex-1 items-center gap-2 rounded-md py-1.5 pr-1 text-sm transition-colors ${
    isActive
      ? 'bg-neutral-100 font-medium text-neutral-700'
      : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600'
  }`

interface ProjectSidebarNodeProps {
  project: Project
}

export function ProjectSidebarNode({ project }: ProjectSidebarNodeProps) {
  const navigate = useNavigate()
  const pages = useLiveQuery(() => getRootPages(project.id), [project.id]) ?? []
  const expandedProjects = useSidebarStore((s) => s.expandedProjects)
  const toggleProject = useSidebarStore((s) => s.toggleProject)
  const expandProject = useSidebarStore((s) => s.expandProject)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const projectPath = `/projects/${project.id}`
  const isExpanded = expandedProjects[project.id] ?? false

  const handleAddPage = async () => {
    const page = await createPage(project.id)
    expandProject(project.id)
    setShowAddMenu(false)
    navigate(`/projects/${project.id}/pages/${page.id}`)
  }

  return (
    <div className="group/project">
      <div className="flex items-center pr-1" style={{ paddingLeft: PROJECT_ROW_PADDING }}>
        <button
          type="button"
          onClick={() => toggleProject(project.id)}
          className="mr-0.5 flex h-6 w-4 shrink-0 items-center justify-center rounded hover:bg-neutral-100"
          aria-label={isExpanded ? 'Collapse project' : 'Expand project'}
        >
          <ChevronIcon expanded={isExpanded} />
        </button>

        <NavLink to={projectPath} className={projectNavLinkClass}>
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full opacity-70"
            style={{ backgroundColor: project.color }}
          />
          <span className="truncate">{project.name}</span>
        </NavLink>

        <div className="relative shrink-0 opacity-0 transition-opacity group-hover/project:opacity-100">
          <button
            type="button"
            onClick={() => setShowAddMenu((v) => !v)}
            className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Add page"
          >
            <MoreIcon />
          </button>
          {showAddMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => void handleAddPage()}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-50"
                >
                  Add page
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isExpanded &&
        pages.map((page) => (
          <PageSidebarNode key={page.id} page={page} projectId={project.id} depth={0} />
        ))}
    </div>
  )
}
