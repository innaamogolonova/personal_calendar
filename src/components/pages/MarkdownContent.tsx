function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const lines = content.split('\n')

  return (
    <div className="space-y-1">
      {lines.map((line, index) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={index} className="h-3" />

        const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)
        if (headerMatch) {
          const level = headerMatch[1].length
          const text = headerMatch[2]
          const className =
            level === 1
              ? 'text-2xl font-bold text-neutral-900'
              : level === 2
                ? 'text-xl font-semibold text-neutral-900'
                : 'text-lg font-semibold text-neutral-800'

          return (
            <div key={index} className={className}>
              {renderInline(text)}
            </div>
          )
        }

        const blockquoteMatch = trimmed.match(/^>\s+(.+)$/)
        if (blockquoteMatch) {
          return (
            <blockquote
              key={index}
              className="border-l-2 border-neutral-300 pl-3 text-neutral-600 italic"
            >
              {renderInline(blockquoteMatch[1])}
            </blockquote>
          )
        }

        const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/)
        if (orderedMatch) {
          return (
            <div key={index} className="flex gap-2 pl-2 text-neutral-700">
              <span className="text-neutral-400">{trimmed.match(/^\d+\./)?.[0]}</span>
              <span>{renderInline(orderedMatch[1])}</span>
            </div>
          )
        }

        const checkboxMatch = trimmed.match(/^- \[([ xX])\]\s+(.+)$/)
        if (checkboxMatch) {
          const checked = checkboxMatch[1].toLowerCase() === 'x'
          return (
            <div key={index} className="flex items-start gap-2 pl-2 text-neutral-700">
              <span className="mt-0.5 text-neutral-500">{checked ? '☑' : '☐'}</span>
              <span className={checked ? 'text-neutral-400 line-through' : undefined}>
                {renderInline(checkboxMatch[2])}
              </span>
            </div>
          )
        }

        const listMatch = trimmed.match(/^-\s+(.+)$/)
        if (listMatch) {
          return (
            <div key={index} className="flex gap-2 pl-2 text-neutral-700">
              <span className="text-neutral-400">•</span>
              <span>{renderInline(listMatch[1])}</span>
            </div>
          )
        }

        return (
          <p key={index} className="text-neutral-700">
            {renderInline(trimmed)}
          </p>
        )
      })}
    </div>
  )
}
