const LINE_STYLE =
  'min-h-[1.625rem] whitespace-pre-wrap break-words text-base leading-[1.625rem]'

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-neutral-900">
          {part}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={i}>{part}</em>
    }
    return part
  })
}

function renderStyledLine(line: string): React.ReactNode {
  if (!line) return '\u00a0'

  const headerMatch = line.match(/^(#{1,3}\s+)(.*)$/)
  if (headerMatch) {
    const level = headerMatch[1].trim().length
    const weight =
      level === 1 ? 'font-bold' : level === 2 ? 'font-semibold' : 'font-medium'
    return (
      <>
        <span className="text-neutral-400">{headerMatch[1]}</span>
        <span className={weight}>{renderBold(headerMatch[2])}</span>
      </>
    )
  }

  const blockquoteMatch = line.match(/^(>\s+)(.*)$/)
  if (blockquoteMatch) {
    return (
      <span className="border-l-2 border-neutral-300 pl-2 text-neutral-600 italic">
        <span className="text-neutral-400">{blockquoteMatch[1]}</span>
        {renderBold(blockquoteMatch[2])}
      </span>
    )
  }

  const orderedMatch = line.match(/^(\d+\.\s+)(.*)$/)
  if (orderedMatch) {
    return (
      <>
        <span className="text-neutral-400">{orderedMatch[1]}</span>
        {renderBold(orderedMatch[2])}
      </>
    )
  }

  const checkboxMatch = line.match(/^(- \[[ xX]\]\s+)(.*)$/)
  if (checkboxMatch) {
    const checked = checkboxMatch[1].includes('x') || checkboxMatch[1].includes('X')
    return (
      <>
        <span className="text-neutral-400">{checkboxMatch[1]}</span>
        <span className={checked ? 'text-neutral-400 line-through' : undefined}>
          {renderBold(checkboxMatch[2])}
        </span>
      </>
    )
  }

  const listMatch = line.match(/^(-\s+)(.*)$/)
  if (listMatch) {
    return (
      <>
        <span className="text-neutral-400">{listMatch[1]}</span>
        {renderBold(listMatch[2])}
      </>
    )
  }

  return <span className="text-neutral-700">{renderBold(line)}</span>
}

interface MarkdownMirrorProps {
  content: string
}

export function MarkdownMirror({ content }: MarkdownMirrorProps) {
  const lines = content.split('\n')

  return (
    <>
      {lines.map((line, index) => (
        <div key={index} className={LINE_STYLE}>
          {renderStyledLine(line)}
        </div>
      ))}
    </>
  )
}
