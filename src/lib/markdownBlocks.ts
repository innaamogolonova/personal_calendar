export type BlockType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bullet'
  | 'ordered'
  | 'checkbox'
  | 'blockquote'

export interface Block {
  id: string
  type: BlockType
  content: string
  indent: number
  order?: number
  checked?: boolean
}

const INDENT_SIZE = 2

export function createBlockId(): string {
  return crypto.randomUUID()
}

export function createEmptyBlock(): Block {
  return { id: createBlockId(), type: 'paragraph', content: '', indent: 0 }
}

export function parseLine(raw: string): Block {
  const id = createBlockId()
  const indentMatch = raw.match(/^( *)/)
  const indent = indentMatch ? Math.floor(indentMatch[1].length / INDENT_SIZE) : 0
  const trimmed = raw.trimStart()

  if (trimmed.startsWith('### ')) {
    return { id, type: 'h3', content: trimmed.slice(4), indent: 0 }
  }
  if (trimmed.startsWith('## ')) {
    return { id, type: 'h2', content: trimmed.slice(3), indent: 0 }
  }
  if (trimmed.startsWith('# ')) {
    return { id, type: 'h1', content: trimmed.slice(2), indent: 0 }
  }
  if (trimmed.startsWith('> ')) {
    return { id, type: 'blockquote', content: trimmed.slice(2), indent: 0 }
  }

  const checkboxMatch = trimmed.match(/^- \[([ xX])\] (.*)$/)
  if (checkboxMatch) {
    return {
      id,
      type: 'checkbox',
      content: checkboxMatch[2],
      indent,
      checked: checkboxMatch[1].toLowerCase() === 'x',
    }
  }

  const orderedNumberMatch = trimmed.match(/^(\d+)\. (.*)$/)
  if (orderedNumberMatch) {
    return {
      id,
      type: 'ordered',
      content: orderedNumberMatch[2],
      indent,
      order: Number(orderedNumberMatch[1]),
    }
  }

  const orderedLetterMatch = trimmed.match(/^([a-z])\. (.*)$/i)
  if (orderedLetterMatch) {
    return {
      id,
      type: 'ordered',
      content: orderedLetterMatch[2],
      indent,
      order: orderedLetterMatch[1].toLowerCase().charCodeAt(0) - 96,
    }
  }

  const bulletMatch = trimmed.match(/^[-*] (.*)$/)
  if (bulletMatch) {
    return { id, type: 'bullet', content: bulletMatch[1], indent }
  }

  return { id, type: 'paragraph', content: raw, indent: 0 }
}

export function markdownToBlocks(content: string): Block[] {
  if (!content) return [createEmptyBlock()]
  const lines = content.split('\n')
  return lines.map(parseLine)
}

export function usesLetterOrderedList(indent: number): boolean {
  return indent % 2 === 1
}

export function formatOrderedMarker(order: number, indent: number): string {
  if (usesLetterOrderedList(indent)) {
    return `${String.fromCharCode(96 + order)}.`
  }
  return `${order}.`
}

export function blockToMarkdown(block: Block): string {
  const indent = ' '.repeat(block.indent * INDENT_SIZE)

  switch (block.type) {
    case 'h1':
      return `# ${block.content}`
    case 'h2':
      return `## ${block.content}`
    case 'h3':
      return `### ${block.content}`
    case 'blockquote':
      return `> ${block.content}`
    case 'bullet':
      return `${indent}- ${block.content}`
    case 'ordered':
      return `${indent}${formatOrderedMarker(block.order ?? 1, block.indent)} ${block.content}`
    case 'checkbox':
      return `${indent}- [${block.checked ? 'x' : ' '}] ${block.content}`
    default:
      return block.content
  }
}

export function blocksToMarkdown(blocks: Block[]): string {
  return blocks.map(blockToMarkdown).join('\n')
}

export function isListType(type: BlockType): boolean {
  return type === 'bullet' || type === 'ordered' || type === 'checkbox'
}

export function continueBlockOnEnter(block: Block): Block | null {
  if (block.type === 'paragraph' || block.type === 'blockquote') {
    return createEmptyBlock()
  }

  if (block.content.trim() === '') {
    return { ...createEmptyBlock(), id: block.id }
  }

  if (block.type === 'bullet') {
    return {
      id: createBlockId(),
      type: 'bullet',
      content: '',
      indent: block.indent,
    }
  }

  if (block.type === 'checkbox') {
    return {
      id: createBlockId(),
      type: 'checkbox',
      content: '',
      indent: block.indent,
      checked: false,
    }
  }

  if (block.type === 'ordered') {
    return {
      id: createBlockId(),
      type: 'ordered',
      content: '',
      indent: block.indent,
      order: (block.order ?? 1) + 1,
    }
  }

  if (block.type === 'h1' || block.type === 'h2' || block.type === 'h3') {
    return createEmptyBlock()
  }

  return createEmptyBlock()
}

export function exitListBlock(block: Block): Block {
  return { ...createEmptyBlock(), id: block.id }
}

export function indentBlock(block: Block): Block {
  if (!isListType(block.type)) return block
  return { ...block, indent: block.indent + 1 }
}

export function outdentBlock(block: Block): Block {
  if (!isListType(block.type) || block.indent === 0) return block
  return { ...block, indent: block.indent - 1 }
}

export function applyLineShortcutToBlock(block: Block, prefix: string): Block | null {
  const shortcuts: Record<string, BlockType | 'checkbox'> = {
    '#': 'h1',
    '##': 'h2',
    '###': 'h3',
    '-': 'bullet',
    '*': 'bullet',
    '>': 'blockquote',
    '1.': 'ordered',
    '[]': 'checkbox',
  }

  const nextType = shortcuts[prefix]
  if (!nextType || block.type !== 'paragraph') return null

  if (nextType === 'checkbox') {
    return {
      ...block,
      type: 'checkbox',
      content: '',
      checked: false,
      indent: 0,
    }
  }

  if (nextType === 'ordered') {
    return {
      ...block,
      type: 'ordered',
      content: '',
      order: 1,
      indent: 0,
    }
  }

  if (nextType === 'bullet') {
    return { ...block, type: 'bullet', content: '', indent: 0 }
  }

  return { ...block, type: nextType, content: '' }
}

export function renumberOrderedLists(blocks: Block[]): Block[] {
  const counters = new Map<string, number>()

  return blocks.map((block) => {
    if (block.type !== 'ordered') return block
    const key = `${block.indent}`
    const next = (counters.get(key) ?? 0) + 1
    counters.set(key, next)
    return { ...block, order: next }
  })
}
