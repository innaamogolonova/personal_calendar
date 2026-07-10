import { useLocation, useNavigate } from 'react-router-dom'
import {
  extractDocumentOutline,
  scrollToOutlineHeading,
} from '../../lib/markdownBlocks'
import { useSidebarStore } from '../../stores/sidebarStore'
import { pagePaddingLeft } from './constants'

const LEVEL_INDENT = 10

interface PageDocumentOutlineProps {
  content: string
  depth: number
  pageId: string
  projectId: string
}

export function PageDocumentOutline({
  content,
  depth,
  pageId,
  projectId,
}: PageDocumentOutlineProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const setPendingOutlineScroll = useSidebarStore((s) => s.setPendingOutlineScroll)
  const headings = extractDocumentOutline(content)
  const basePadding = pagePaddingLeft(depth) + 20
  const pagePath = `/projects/${projectId}/pages/${pageId}`

  const handleHeadingClick = (headingIndex: number) => {
    if (location.pathname === pagePath) {
      scrollToOutlineHeading(headingIndex)
      return
    }
    setPendingOutlineScroll({ pageId, headingIndex })
    navigate(pagePath)
  }

  if (headings.length === 0) {
    return (
      <p
        className="py-1 pr-2 text-xs text-neutral-400"
        style={{ paddingLeft: basePadding + LEVEL_INDENT }}
      >
        No headings
      </p>
    )
  }

  return (
    <ul className="mb-1 space-y-0.5 py-0.5">
      {headings.map((heading) => (
        <li
          key={`${heading.level}-${heading.index}-${heading.text}`}
          style={{ paddingLeft: basePadding + heading.level * LEVEL_INDENT }}
        >
          <button
            type="button"
            onClick={() => handleHeadingClick(heading.index)}
            className="block w-full truncate pr-2 text-left text-xs leading-5 text-neutral-400 hover:text-neutral-700"
            title={heading.text}
          >
            {heading.text}
          </button>
        </li>
      ))}
    </ul>
  )
}
