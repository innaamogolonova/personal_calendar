import { useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  deleteProject,
  getAllProjects,
  getOrCreateProject,
  updateProject,
} from '../../db/projects'
import type { Project } from '../../db/types'
import { EntityEditPopover } from '../shared/EntityEditPopover'

interface InlineProjectSelectProps {
  value: string
  onChange: (projectId: string) => void
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

export function InlineProjectSelect({ value, onChange }: InlineProjectSelectProps) {
  const projects = useLiveQuery(getAllProjects, []) ?? []
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = projects.find((p) => p.id === value)

  const filtered = useMemo(() => {
    const query = inputValue.trim().toLowerCase()
    if (!query) return projects
    return projects.filter((p) => p.name.toLowerCase().includes(query))
  }, [projects, inputValue])

  const commitInput = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const project = await getOrCreateProject(trimmed)
    onChange(project.id)
    setInputValue('')
    setIsOpen(false)
  }

  const handleSelect = (projectId: string) => {
    onChange(projectId)
    setInputValue('')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {selected && (
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-2 py-1 text-sm">
            <ColorDot color={selected.color} />
            {selected.name}
          </span>
          <button
            type="button"
            onClick={() => setEditingProject(selected)}
            className="text-xs text-neutral-500 hover:text-neutral-800"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-neutral-400 hover:text-neutral-600"
            aria-label="Clear project"
          >
            ✕
          </button>
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          placeholder={selected ? 'Change project...' : 'Type project name, press Enter'}
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
            {filtered.map((project) => (
              <li key={project.id} className="flex items-center gap-1 px-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(project.id)}
                  className="flex flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-neutral-50"
                >
                  <ColorDot color={project.color} />
                  {project.name}
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setEditingProject(project)}
                  className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                >
                  Edit
                </button>
              </li>
            ))}
            {inputValue.trim() &&
              !filtered.some(
                (p) => p.name.toLowerCase() === inputValue.trim().toLowerCase(),
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

      {editingProject && (
        <EntityEditPopover
          entityType="project"
          name={editingProject.name}
          color={editingProject.color}
          onSave={async (name, color) => {
            await updateProject(editingProject.id, { name, color })
          }}
          onDelete={async () => {
            await deleteProject(editingProject.id)
            if (value === editingProject.id) onChange('')
          }}
          onClose={() => setEditingProject(null)}
        />
      )}
    </div>
  )
}
