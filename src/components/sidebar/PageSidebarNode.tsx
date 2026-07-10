import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Page } from '../../db/types'
import { createPage, deletePage, getChildPages } from '../../db/pages'
import { useSidebarStore } from '../../stores/sidebarStore'
import { pagePaddingLeft } from './constants'
import { ChevronIcon, MoreIcon, PageIcon } from './icons'

const pageNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-w-0 flex-1 items-center gap-2 rounded-md py-1.5 pr-1 text-sm transition-colors ${
    isActive
      ? 'bg-blue-50 font-medium text-blue-700'
      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
  }`

interface PageSidebarNodeProps {
  page: Page
  projectId: string
  depth: number
}

export function PageSidebarNode({ page, projectId, depth }: PageSidebarNodeProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const children = useLiveQuery(() => getChildPages(page.id), [page.id]) ?? []
  const expandedPages = useSidebarStore((s) => s.expandedPages)
  const togglePage = useSidebarStore((s) => s.togglePage)
  const expandPage = useSidebarStore((s) => s.expandPage)
  const [showMenu, setShowMenu] = useState(false)

  const pagePath = `/projects/${projectId}/pages/${page.id}`
  const isExpanded = expandedPages[page.id] ?? false
  const hasChildren = children.length > 0
  const paddingLeft = pagePaddingLeft(depth)

  const handleAddSubpage = async () => {
    const newPage = await createPage(projectId, { parentPageId: page.id })
    expandPage(page.id)
    setShowMenu(false)
    navigate(`/projects/${projectId}/pages/${newPage.id}`)
  }

  const handleDelete = async () => {
    setShowMenu(false)
    const message = hasChildren
      ? `Delete "${page.title}" and all its subpages?`
      : `Delete "${page.title}"?`
    if (!window.confirm(message)) return

    const isViewing = location.pathname === pagePath
    await deletePage(page.id)
    if (isViewing) {
      navigate(`/projects/${projectId}`)
    }
  }

  return (
    <div className="group/page">
      <div className="flex items-center pr-1" style={{ paddingLeft }}>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => togglePage(page.id)}
            className="mr-0.5 flex h-6 w-4 shrink-0 items-center justify-center rounded hover:bg-neutral-100"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronIcon expanded={isExpanded} />
          </button>
        ) : (
          <span className="mr-0.5 w-4 shrink-0" />
        )}

        <NavLink to={pagePath} className={pageNavLinkClass}>
          <PageIcon />
          <span className="min-w-0 truncate">{page.title}</span>
        </NavLink>

        <div className="relative shrink-0 opacity-0 transition-opacity group-hover/page:opacity-100">
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Page options"
          >
            <MoreIcon />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => void handleAddSubpage()}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-50"
                >
                  Add subpage
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isExpanded &&
        hasChildren &&
        children.map((child) => (
          <PageSidebarNode key={child.id} page={child} projectId={projectId} depth={depth + 1} />
        ))}
    </div>
  )
}
