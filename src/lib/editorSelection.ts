export interface CursorSnapshot {
  blockId: string
  offset: number
}

export function captureCursor(blockId: string, root: HTMLElement): CursorSnapshot {
  const selection = window.getSelection()
  if (!selection?.rangeCount) {
    return { blockId, offset: 0 }
  }

  const range = selection.getRangeAt(0)
  if (!root.contains(range.startContainer)) {
    return { blockId, offset: 0 }
  }

  const pre = document.createRange()
  pre.selectNodeContents(root)
  pre.setEnd(range.startContainer, range.startOffset)
  return { blockId, offset: pre.toString().replace(/\u200b/g, '').length }
}

function rawOffsetAtCleanOffset(text: string, cleanOffset: number): number {
  let clean = 0
  for (let raw = 0; raw < text.length; raw += 1) {
    if (text[raw] === '\u200b') continue
    if (clean === cleanOffset) return raw
    clean += 1
  }
  return text.length
}

export function restoreCursor(root: HTMLElement, offset: number): void {
  const selection = window.getSelection()
  if (!selection) return

  let remaining = Math.max(0, offset)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode() as Text | null

  while (node) {
    const raw = node.textContent ?? ''
    let cleanLen = 0
    for (let i = 0; i < raw.length; i += 1) {
      if (raw[i] === '\u200b') continue
      cleanLen += 1
    }

    if (remaining <= cleanLen) {
      const range = document.createRange()
      range.setStart(node, rawOffsetAtCleanOffset(raw, remaining))
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      return
    }

    remaining -= cleanLen
    node = walker.nextNode() as Text | null
  }

  const range = document.createRange()
  range.selectNodeContents(root)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
}
