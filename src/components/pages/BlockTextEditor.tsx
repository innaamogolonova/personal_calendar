import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type Block,
  blocksToMarkdown,
  continueBlockOnEnter,
  createEmptyBlock,
  indentBlock,
  isHeadingBlockType,
  isListType,
  markdownToBlocks,
  outlineHeadingText,
  outdentBlock,
  renumberOrderedLists,
} from '../../lib/markdownBlocks'
import type { CursorSnapshot } from '../../lib/editorSelection'
import { BlockRow } from './BlockRow'

interface BlockTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  minHeightClass?: string
}

interface HistoryEntry {
  blocks: Block[]
  cursor: CursorSnapshot | null
}

const MAX_HISTORY = 50
const HISTORY_DEBOUNCE_MS = 400

function cloneBlocks(blocks: Block[]): Block[] {
  return blocks.map((block) => ({ ...block }))
}

export function BlockTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  minHeightClass = 'min-h-[calc(100vh-12rem)]',
}: BlockTextEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => markdownToBlocks(content))
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null)
  const [cursorRestore, setCursorRestore] = useState<CursorSnapshot | null>(null)
  const contentRef = useRef(content)
  const isInternalChange = useRef(false)
  const historyRef = useRef<HistoryEntry[]>([])
  const historyIndexRef = useRef(-1)
  const skipHistoryPush = useRef(false)
  const historyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingHistoryRef = useRef<{ blocks: Block[]; cursor: CursorSnapshot | null } | null>(
    null,
  )
  const blocksRef = useRef(blocks)
  blocksRef.current = blocks

  const pushHistory = useCallback((snapshot: Block[], cursor: CursorSnapshot | null) => {
    const cloned = cloneBlocks(snapshot)
    const history = historyRef.current.slice(0, historyIndexRef.current + 1)
    const last = history[history.length - 1]
    const markdown = blocksToMarkdown(cloned)
    if (last && blocksToMarkdown(last.blocks) === markdown) return

    history.push({ blocks: cloned, cursor })
    if (history.length > MAX_HISTORY) history.shift()
    historyRef.current = history
    historyIndexRef.current = history.length - 1
  }, [])

  const clearPendingHistory = useCallback(() => {
    if (historyDebounceRef.current) {
      clearTimeout(historyDebounceRef.current)
      historyDebounceRef.current = null
    }
    pendingHistoryRef.current = null
  }, [])

  const flushPendingHistory = useCallback(() => {
    if (historyDebounceRef.current) {
      clearTimeout(historyDebounceRef.current)
      historyDebounceRef.current = null
    }
    if (pendingHistoryRef.current) {
      pushHistory(pendingHistoryRef.current.blocks, pendingHistoryRef.current.cursor)
      pendingHistoryRef.current = null
    }
  }, [pushHistory])

  useEffect(() => {
    const initial = markdownToBlocks(content)
    const firstBlockId = initial[0]?.id ?? ''
    historyRef.current = [
      { blocks: cloneBlocks(initial), cursor: { blockId: firstBlockId, offset: 0 } },
    ]
    historyIndexRef.current = 0
    return () => clearPendingHistory()
  }, [clearPendingHistory])

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }
    if (content !== contentRef.current) {
      const next = markdownToBlocks(content)
      setBlocks(next)
      contentRef.current = content
      pushHistory(next, null)
    }
  }, [content, pushHistory])

  const applyBlocks = (
    nextBlocks: Block[],
    options: {
      recordHistory?: boolean
      debounceHistory?: boolean
      cursor?: CursorSnapshot | null
    },
  ) => {
    const normalized = renumberOrderedLists(nextBlocks)
    setBlocks(normalized)
    const markdown = blocksToMarkdown(normalized)
    contentRef.current = markdown
    isInternalChange.current = true
    onChange(markdown)

    if (!options.recordHistory || skipHistoryPush.current) {
      skipHistoryPush.current = false
      return
    }

    const cursor = options.cursor ?? null
    if (options.debounceHistory) {
      pendingHistoryRef.current = { blocks: normalized, cursor }
      if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current)
      historyDebounceRef.current = setTimeout(() => {
        flushPendingHistory()
      }, HISTORY_DEBOUNCE_MS)
      return
    }

    flushPendingHistory()
    pushHistory(normalized, cursor)
  }

  const commitBlocks = (
    nextBlocks: Block[],
    options: { debounceHistory?: boolean; cursor?: CursorSnapshot | null } = {},
  ) => {
    applyBlocks(nextBlocks, { recordHistory: true, ...options })
  }

  const undo = (cursorBeforeUndo: CursorSnapshot | null) => {
    clearPendingHistory()
    if (historyIndexRef.current <= 0) return

    historyIndexRef.current -= 1
    const entry = historyRef.current[historyIndexRef.current]
    skipHistoryPush.current = true
    const restore = entry.cursor ?? cursorBeforeUndo
    setCursorRestore(restore)
    setFocusBlockId(restore?.blockId ?? null)
    applyBlocks(cloneBlocks(entry.blocks), { recordHistory: false })
  }

  const updateBlock = (index: number, block: Block, cursor?: CursorSnapshot | null) => {
    const next = [...blocksRef.current]
    next[index] = block
    commitBlocks(next, { debounceHistory: true, cursor: cursor ?? null })
  }

  const insertBlockAfter = (index: number, block: Block, cursor?: CursorSnapshot | null) => {
    const next = [...blocksRef.current]
    next.splice(index + 1, 0, block)
    setFocusBlockId(block.id)
    commitBlocks(next, { cursor: cursor ?? null })
  }

  const handleEnter = (index: number, cursor?: CursorSnapshot | null) => {
    flushPendingHistory()
    const current = blocksRef.current[index]

    if (isListType(current.type) && current.content.trim() === '') {
      const next = [...blocksRef.current]
      next[index] = { ...createEmptyBlock(), id: current.id }
      setFocusBlockId(current.id)
      setCursorRestore({ blockId: current.id, offset: 0 })
      commitBlocks(next, { cursor: { blockId: current.id, offset: 0 } })
      return
    }

    const newBlock = continueBlockOnEnter(current)
    if (!newBlock) return

    if (newBlock.id === current.id) {
      const next = [...blocksRef.current]
      next[index] = newBlock
      setFocusBlockId(newBlock.id)
      setCursorRestore({ blockId: newBlock.id, offset: 0 })
      commitBlocks(next, { cursor: { blockId: newBlock.id, offset: 0 } })
      return
    }

    insertBlockAfter(index, newBlock, cursor)
  }

  const handleBackspaceAtStart = (index: number) => {
    flushPendingHistory()
    if (index === 0) return
    const prev = blocksRef.current[index - 1]
    const current = blocksRef.current[index]
    const mergedContent = prev.content + current.content
    const offset = prev.content.length
    const next = [...blocksRef.current]
    next[index - 1] = { ...prev, content: mergedContent }
    next.splice(index, 1)
    setFocusBlockId(prev.id)
    setCursorRestore({ blockId: prev.id, offset })
    commitBlocks(next, { cursor: { blockId: prev.id, offset } })
  }

  const handleTab = (index: number, cursor?: CursorSnapshot | null) => {
    flushPendingHistory()
    const current = blocksRef.current[index]
    const indented = indentBlock(current)
    if (indented === current) return
    const next = [...blocksRef.current]
    next[index] = indented
    setFocusBlockId(current.id)
    commitBlocks(next, { cursor: cursor ?? null })
  }

  const handleShiftTab = (index: number, cursor?: CursorSnapshot | null) => {
    flushPendingHistory()
    const current = blocksRef.current[index]
    const outdented = outdentBlock(current)
    if (outdented === current) return
    const next = [...blocksRef.current]
    next[index] = outdented
    setFocusBlockId(current.id)
    commitBlocks(next, { cursor: cursor ?? null })
  }

  const clearCursorRestore = useCallback(() => {
    setCursorRestore(null)
  }, [])

  return (
    <div className={minHeightClass}>
      {(() => {
        let headingIndex = 0
        return blocks.map((block, index) => {
          const outlineHeadingIndex =
            isHeadingBlockType(block.type) && outlineHeadingText(block.content)
              ? headingIndex++
              : undefined
          return (
            <BlockRow
              key={block.id}
              block={block}
              placeholder={placeholder}
              showPlaceholder={index === 0 && blocks.length === 1}
              outlineHeadingIndex={outlineHeadingIndex}
              focusOnMount={focusBlockId === block.id}
              restoreCursor={
                cursorRestore?.blockId === block.id ? cursorRestore.offset : undefined
              }
              onCursorRestored={clearCursorRestore}
              onChange={(updated, cursor) => updateBlock(index, updated, cursor)}
              onEnter={(cursor) => handleEnter(index, cursor)}
              onBackspaceAtStart={() => handleBackspaceAtStart(index)}
              onTab={(cursor) => handleTab(index, cursor)}
              onShiftTab={(cursor) => handleShiftTab(index, cursor)}
              onFocus={() => setFocusBlockId(null)}
              onUndo={(cursor) => undo(cursor)}
            />
          )
        })
      })()}
    </div>
  )
}
