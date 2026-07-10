export function wrapSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  wrap: string,
): { value: string; selectionStart: number; selectionEnd: number } {
  const selected = value.slice(selectionStart, selectionEnd)
  const before = value.slice(0, selectionStart)
  const after = value.slice(selectionEnd)
  const newValue = before + wrap + selected + wrap + after
  const newStart = selectionStart + wrap.length
  const newEnd = newStart + selected.length
  return { value: newValue, selectionStart: newStart, selectionEnd: newEnd }
}

const LINE_SHORTCUTS: Record<string, string> = {
  '#': '# ',
  '##': '## ',
  '###': '### ',
  '-': '- ',
  '*': '- ',
  '>': '> ',
  '1.': '1. ',
  '[]': '- [ ] ',
}

export function applyLineShortcut(
  value: string,
  selectionStart: number,
  linePrefix: string,
): { value: string; cursor: number } | null {
  const replacement = LINE_SHORTCUTS[linePrefix]
  if (!replacement) return null

  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const before = value.slice(0, lineStart)
  const after = value.slice(selectionStart)
  const newValue = before + replacement + after
  const cursor = lineStart + replacement.length
  return { value: newValue, cursor }
}

export function toggleCheckboxAtLine(value: string, lineIndex: number): string {
  const lines = value.split('\n')
  const line = lines[lineIndex]
  if (!line) return value

  const unchecked = line.replace(/^(\s*-\s+)\[ \](\s+)/, '$1[x]$2')
  if (unchecked !== line) {
    lines[lineIndex] = unchecked
    return lines.join('\n')
  }

  const checked = line.replace(/^(\s*-\s+)\[x\](\s+)/i, '$1[ ]$2')
  if (checked !== line) {
    lines[lineIndex] = checked
    return lines.join('\n')
  }

  return value
}

export function getLineIndexAtPosition(value: string, position: number): number {
  return value.slice(0, position).split('\n').length - 1
}
