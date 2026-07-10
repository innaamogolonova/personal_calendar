import { useEffect, useRef } from 'react'
import {
  applyLineShortcut,
  wrapSelection,
} from '../../lib/markdownEditor'
import { MarkdownMirror } from './MarkdownMirror'

interface FormattedTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  minHeightClass?: string
}

const EDITOR_CLASS =
  'w-full resize-none overflow-hidden bg-transparent px-0 py-0 font-sans text-base leading-[1.625rem] whitespace-pre-wrap break-words text-transparent caret-neutral-900 focus:outline-none'

export function FormattedTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  minHeightClass = 'min-h-[calc(100vh-12rem)]',
}: FormattedTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const isComposing = useRef(false)

  const applyChange = (value: string, selectionStart?: number, selectionEnd?: number) => {
    onChange(value)
    if (selectionStart != null && selectionEnd != null) {
      requestAnimationFrame(() => {
        textareaRef.current?.setSelectionRange(selectionStart, selectionEnd)
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    const { selectionStart, selectionEnd, value } = textarea

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      const result = wrapSelection(value, selectionStart, selectionEnd, '**')
      applyChange(result.value, result.selectionStart, result.selectionEnd)
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault()
      const result = wrapSelection(value, selectionStart, selectionEnd, '*')
      applyChange(result.value, result.selectionStart, result.selectionEnd)
      return
    }

    if (e.key !== ' ' || isComposing.current) return

    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
    const linePrefix = value.slice(lineStart, selectionStart)
    const shortcut = applyLineShortcut(value, selectionStart, linePrefix)
    if (!shortcut) return

    e.preventDefault()
    applyChange(shortcut.value, shortcut.cursor, shortcut.cursor)
  }

  useEffect(() => {
    const textarea = textareaRef.current
    const mirror = mirrorRef.current
    if (!textarea || !mirror) return

    const syncScroll = () => {
      mirror.scrollTop = textarea.scrollTop
    }
    textarea.addEventListener('scroll', syncScroll)
    return () => textarea.removeEventListener('scroll', syncScroll)
  }, [])

  return (
    <div className={`relative ${minHeightClass}`}>
      <div
        ref={mirrorRef}
        className={`pointer-events-none overflow-hidden font-sans text-base leading-[1.625rem] ${minHeightClass}`}
        aria-hidden
      >
        {content ? (
          <MarkdownMirror content={content} />
        ) : (
          <p className="text-neutral-400">{placeholder}</p>
        )}
      </div>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => {
          isComposing.current = true
        }}
        onCompositionEnd={() => {
          isComposing.current = false
        }}
        placeholder={placeholder}
        spellCheck
        className={`absolute inset-0 ${EDITOR_CLASS} ${minHeightClass}`}
        style={{ WebkitTextFillColor: 'transparent' }}
      />
    </div>
  )
}
