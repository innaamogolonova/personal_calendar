export function inlineMarkdownToHtml(text: string): string {
  if (!text) return '<br>'

  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

export function htmlToInlineMarkdown(element: HTMLElement): string {
  let result = ''

  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? ''
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return

    const el = node as HTMLElement
    const inner = htmlToInlineMarkdown(el)

    if (el.tagName === 'STRONG' || el.tagName === 'B') {
      if (!inner) return
      result += `**${inner}**`
    } else if (el.tagName === 'EM' || el.tagName === 'I') {
      if (!inner) return
      result += `*${inner}*`
    } else if (el.tagName === 'BR') {
      return
    } else {
      result += inner
    }
  })

  return result
}

/** Native bold/italic toggle — matches standard editor behavior (Docs, Notion, etc.). */
export function toggleInlineFormat(root: HTMLElement, format: 'bold' | 'italic'): void {
  const selection = window.getSelection()
  if (!selection?.rangeCount) return

  const range = selection.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return

  root.focus()
  document.execCommand('styleWithCSS', false, 'false')
  document.execCommand(format, false)
}

export function isFormatActive(format: 'bold' | 'italic'): boolean {
  try {
    return document.queryCommandState(format)
  } catch {
    return false
  }
}
