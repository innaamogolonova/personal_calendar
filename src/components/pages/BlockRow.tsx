import { useEffect, useRef } from 'react'
import type { Block } from '../../lib/markdownBlocks'
import {
  applyLineShortcutToBlock,
  exitListBlock,
  formatOrderedMarker,
  isListType,
} from '../../lib/markdownBlocks'
import { captureCursor, restoreCursor } from '../../lib/editorSelection'
import type { CursorSnapshot } from '../../lib/editorSelection'
import {
  htmlToInlineMarkdown,
  inlineMarkdownToHtml,
  toggleInlineFormat,
} from '../../lib/markdownInline'

const HEADING_CLASS: Record<string, string> = {
  h1: 'text-3xl font-bold leading-tight text-neutral-900',
  h2: 'text-2xl font-semibold leading-snug text-neutral-900',
  h3: 'text-xl font-semibold leading-snug text-neutral-800',
  blockquote: 'border-l-2 border-neutral-300 pl-3 italic text-neutral-600',
  paragraph: 'text-base leading-relaxed text-neutral-800',
}

interface BlockRowProps {
  block: Block
  placeholder?: string
  showPlaceholder: boolean
  outlineHeadingIndex?: number
  onChange: (block: Block, cursor: CursorSnapshot | null) => void
  onEnter: (cursor: CursorSnapshot | null) => void
  onBackspaceAtStart: () => void
  onTab: (cursor: CursorSnapshot | null) => void
  onShiftTab: (cursor: CursorSnapshot | null) => void
  onFocus: () => void
  onUndo: (cursor: CursorSnapshot | null) => void
  restoreCursor?: number
  onCursorRestored: () => void
  focusOnMount?: boolean
}

export function BlockRow({
  block,
  placeholder,
  showPlaceholder,
  outlineHeadingIndex,
  onChange,
  onEnter,
  onBackspaceAtStart,
  onTab,
  onShiftTab,
  onFocus,
  onUndo,
  restoreCursor: restoreCursorOffset,
  onCursorRestored,
  focusOnMount,
}: BlockRowProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isComposing = useRef(false)
  const lastContent = useRef(block.content)
  const skipSyncRef = useRef(false)

  const getCursor = (): CursorSnapshot | null => {
    const root = editorRef.current
    if (!root) return null
    return captureCursor(block.id, root)
  }

  const syncHtml = (content: string) => {
    const el = editorRef.current
    if (!el) return

    const html = inlineMarkdownToHtml(content)
    if (el.innerHTML !== html) {
      el.innerHTML = html
    }
  }

  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false
      return
    }
    if (restoreCursorOffset != null) return
    if (block.content !== lastContent.current) {
      syncHtml(block.content)
      lastContent.current = block.content
    }
  }, [block.content, block.type, block.checked, restoreCursorOffset])

  useEffect(() => {
    syncHtml(block.content)
    lastContent.current = block.content
  }, [block.id])

  useEffect(() => {
    if (focusOnMount) {
      editorRef.current?.focus()
    }
  }, [focusOnMount])

  useEffect(() => {
    if (restoreCursorOffset == null || !editorRef.current) return
    requestAnimationFrame(() => {
      const root = editorRef.current
      if (!root) return
      syncHtml(block.content)
      lastContent.current = block.content
      root.focus()
      restoreCursor(root, restoreCursorOffset)
      onCursorRestored()
    })
  }, [restoreCursorOffset, block.content, onCursorRestored])

  const readContent = (): string => {
    const el = editorRef.current
    if (!el) return ''
    return htmlToInlineMarkdown(el).replace(/\u200b/g, '')
  }

  const commitContent = (content: string, cursor?: CursorSnapshot | null) => {
    lastContent.current = content
    onChange({ ...block, content }, cursor ?? getCursor())
  }

  const handleInput = () => {
    if (isComposing.current) return
    commitContent(readContent())
  }

  const isAtStart = (): boolean => {
    const cursor = getCursor()
    return cursor?.offset === 0
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      onUndo(getCursor())
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      const root = editorRef.current
      if (root) {
        toggleInlineFormat(root, 'bold')
        skipSyncRef.current = true
        commitContent(readContent(), getCursor())
      }
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault()
      const root = editorRef.current
      if (root) {
        toggleInlineFormat(root, 'italic')
        skipSyncRef.current = true
        commitContent(readContent(), getCursor())
      }
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const cursor = getCursor()
      commitContent(readContent(), cursor)
      onEnter(cursor)
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const cursor = getCursor()
      commitContent(readContent(), cursor)
      if (e.shiftKey) onShiftTab(cursor)
      else onTab(cursor)
      return
    }

    if (e.key === 'Backspace') {
      const content = readContent()
      if (content === '' && isListType(block.type)) {
        e.preventDefault()
        onChange(exitListBlock(block), getCursor())
        return
      }
      if (content === '' || isAtStart()) {
        e.preventDefault()
        onBackspaceAtStart()
        return
      }
    }

    if (e.key === ' ' && !isComposing.current) {
      const content = readContent()
      const shortcut = applyLineShortcutToBlock(block, content)
      if (shortcut) {
        e.preventDefault()
        onChange(shortcut, { blockId: block.id, offset: 0 })
        lastContent.current = shortcut.content
        requestAnimationFrame(() => syncHtml(shortcut.content))
      }
    }
  }

  const contentClass = HEADING_CLASS[block.type] ?? HEADING_CLASS.paragraph
  const indentStyle = { marginLeft: block.indent * 16 }

  const prefix =
    block.type === 'bullet' ? (
      <span className="mt-0.5 w-5 shrink-0 text-neutral-400" style={indentStyle}>
        •
      </span>
    ) : block.type === 'ordered' ? (
      <span className="mt-0.5 w-6 shrink-0 text-neutral-500" style={indentStyle}>
        {formatOrderedMarker(block.order ?? 1, block.indent)}
      </span>
    ) : block.type === 'checkbox' ? (
      <button
        type="button"
        className="mt-0.5 w-5 shrink-0 text-neutral-500"
        style={indentStyle}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onChange({ ...block, checked: !block.checked }, getCursor())}
      >
        {block.checked ? '☑' : '☐'}
      </button>
    ) : null

  return (
    <div
      className="flex scroll-mt-6 items-start gap-1 py-0.5"
      data-outline-heading={
        outlineHeadingIndex != null ? String(outlineHeadingIndex) : undefined
      }
    >
      {prefix}
      <div className="relative min-w-0 flex-1">
        {showPlaceholder && !block.content && (
          <div className="pointer-events-none absolute inset-0 text-base text-neutral-400">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onCompositionStart={() => {
            isComposing.current = true
          }}
          onCompositionEnd={() => {
            isComposing.current = false
            handleInput()
          }}
          className={`min-h-[1.625rem] w-full outline-none ${contentClass} ${
            block.checked ? 'text-neutral-400 line-through' : ''
          }`}
        />
      </div>
    </div>
  )
}
