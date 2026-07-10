import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ColorPicker } from './ColorPicker'

interface EntityEditPopoverProps {
  entityType: 'project' | 'label'
  name: string
  color: string
  onSave: (name: string, color: string) => Promise<void>
  onDelete: () => Promise<void>
  onClose: () => void
  anchorEl?: HTMLElement | null
}

function getAnchorStyle(anchorEl: HTMLElement): React.CSSProperties {
  const rect = anchorEl.getBoundingClientRect()
  return {
    position: 'fixed',
    top: rect.bottom + 4,
    right: window.innerWidth - rect.right,
  }
}

export function EntityEditPopover({
  entityType,
  name: initialName,
  color: initialColor,
  onSave,
  onDelete,
  onClose,
  anchorEl,
}: EntityEditPopoverProps) {
  const [name, setName] = useState(initialName)
  const [color, setColor] = useState(initialColor)
  const [nameError, setNameError] = useState(false)
  const [anchorStyle, setAnchorStyle] = useState<React.CSSProperties>({})

  useLayoutEffect(() => {
    if (!anchorEl) return

    const updatePosition = () => {
      setAnchorStyle(getAnchorStyle(anchorEl))
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [anchorEl])

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError(true)
      return
    }
    await onSave(name, color)
    onClose()
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete this ${entityType}?`)
    if (!confirmed) return
    await onDelete()
    onClose()
  }

  const panel = (
    <div className="w-72 rounded-lg border border-neutral-200 bg-white p-4 shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold capitalize text-neutral-900">
          Edit {entityType}
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError && e.target.value.trim()) setNameError(false)
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
              nameError ? 'border-red-300' : 'border-neutral-200 focus:border-neutral-400'
            }`}
          />
          {nameError && <p className="mt-1 text-xs text-red-600">Name is required</p>}
        </label>

        <div>
          <span className="mb-2 block text-xs font-medium text-neutral-500">Color</span>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )

  if (anchorEl) {
    return createPortal(
      <>
        <div className="fixed inset-0 z-40" onClick={onClose} />
        <div className="z-50" style={anchorStyle}>
          {panel}
        </div>
      </>,
      document.body,
    )
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 p-4">
      <div className="w-full max-w-sm">{panel}</div>
    </div>
  )
}
