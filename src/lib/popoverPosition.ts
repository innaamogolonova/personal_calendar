export const POPOVER_WIDTH = 288
const GAP = 8
const EDGE_PADDING = 8

export function getScrollTargets(el: HTMLElement): Array<HTMLElement | Window> {
  const targets: Array<HTMLElement | Window> = [window]
  let current: HTMLElement | null = el.parentElement
  while (current) {
    const { overflowY, overflowX } = getComputedStyle(current)
    if (
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowX === 'auto' ||
      overflowX === 'scroll'
    ) {
      targets.push(current)
    }
    current = current.parentElement
  }
  return targets
}

export function findCalendarScrollContainer(el: HTMLElement): HTMLElement {
  let current: HTMLElement | null = el
  while (current) {
    if (current.classList.contains('fc-scroller')) return current
    current = current.parentElement
  }
  return el.closest('.fc') ?? document.body
}

export function getAnchoredPopoverPosition(
  anchorEl: HTMLElement,
  container: HTMLElement,
): { top: number; left: number; width: number } | null {
  if (!anchorEl.isConnected) return null

  const containerRect = container.getBoundingClientRect()
  const anchorRect = anchorEl.getBoundingClientRect()

  const top = anchorRect.top - containerRect.top + container.scrollTop

  let left = anchorRect.right - containerRect.left + container.scrollLeft + GAP
  const visibleRight = container.scrollLeft + container.clientWidth - EDGE_PADDING

  if (left + POPOVER_WIDTH > visibleRight) {
    left =
      anchorRect.left -
      containerRect.left +
      container.scrollLeft -
      POPOVER_WIDTH -
      GAP
  }

  left = Math.max(container.scrollLeft + EDGE_PADDING, left)

  return { top, left, width: POPOVER_WIDTH }
}
