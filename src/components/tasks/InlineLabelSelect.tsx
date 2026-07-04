import { useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  deleteLabel,
  getAllLabels,
  getOrCreateLabel,
  updateLabel,
} from '../../db/labels'
import type { Label } from '../../db/types'
import { EntityEditPopover } from '../shared/EntityEditPopover'

interface InlineLabelSelectProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

export function InlineLabelSelect({ selectedIds, onChange }: InlineLabelSelectProps) {
  const labels = useLiveQuery(getAllLabels, []) ?? []
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState<Label | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedLabels = labels.filter((l) => selectedIds.includes(l.id))

  const filtered = useMemo(() => {
    const query = inputValue.trim().toLowerCase()
    if (!query) return labels
    return labels.filter((l) => l.name.toLowerCase().includes(query))
  }, [labels, inputValue])

  const addLabel = (labelId: string) => {
    if (!selectedIds.includes(labelId)) {
      onChange([...selectedIds, labelId])
    }
    setInputValue('')
    setIsOpen(false)
  }

  const removeLabel = (labelId: string) => {
    onChange(selectedIds.filter((id) => id !== labelId))
  }

  const commitInput = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const label = await getOrCreateLabel(trimmed)
    addLabel(label.id)
  }

  return (
    <div className="relative space-y-2">
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-2 py-1 text-sm"
            >
              <ColorDot color={label.color} />
              {label.name}
              <button
                type="button"
                onClick={() => removeLabel(label.id)}
                className="text-neutral-400 hover:text-neutral-600"
                aria-label={`Remove ${label.name}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          placeholder="Type label name, press Enter"
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 150)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void commitInput()
            }
            if (e.key === 'Escape') {
              setInputValue('')
              setIsOpen(false)
            }
          }}
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
        />

        {isOpen && (inputValue.trim() || filtered.length > 0) && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
            {filtered.map((label) => (
              <li key={label.id} className="flex items-center gap-1 px-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addLabel(label.id)}
                  className={`flex flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-neutral-50 ${
                    selectedIds.includes(label.id) ? 'bg-neutral-50 font-medium' : ''
                  }`}
                >
                  <ColorDot color={label.color} />
                  {label.name}
                  {selectedIds.includes(label.id) && (
                    <span className="text-xs text-neutral-400">Selected</span>
                  )}
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setEditingLabel(label)}
                  className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                >
                  Edit
                </button>
              </li>
            ))}
            {inputValue.trim() &&
              !filtered.some(
                (l) => l.name.toLowerCase() === inputValue.trim().toLowerCase(),
              ) && (
                <li>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => void commitInput()}
                    className="w-full px-3 py-1.5 text-left text-sm text-neutral-600 hover:bg-neutral-50"
                  >
                    Create &quot;{inputValue.trim()}&quot;
                  </button>
                </li>
              )}
          </ul>
        )}
      </div>

      {labels.length > 0 && (
        <div className="pt-1">
          <p className="mb-2 text-xs font-medium text-neutral-500">All labels</p>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <span key={label.id} className="inline-flex items-center gap-1 text-sm">
                <button
                  type="button"
                  onClick={() => addLabel(label.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 hover:bg-neutral-50 ${
                    selectedIds.includes(label.id)
                      ? 'border-neutral-400 bg-neutral-50'
                      : 'border-neutral-200'
                  }`}
                >
                  <ColorDot color={label.color} />
                  {label.name}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLabel(label)}
                  className="text-xs text-neutral-400 hover:text-neutral-700"
                >
                  Edit
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {editingLabel && (
        <EntityEditPopover
          entityType="label"
          name={editingLabel.name}
          color={editingLabel.color}
          onSave={async (name, color) => {
            await updateLabel(editingLabel.id, { name, color })
          }}
          onDelete={async () => {
            await deleteLabel(editingLabel.id)
            onChange(selectedIds.filter((id) => id !== editingLabel.id))
          }}
          onClose={() => setEditingLabel(null)}
        />
      )}
    </div>
  )
}
