import { create } from 'zustand'

const STORAGE_KEY = 'sidebar-layout'
export const SIDEBAR_DEFAULT_WIDTH = 224
export const SIDEBAR_MIN_WIDTH = 180
export const SIDEBAR_MAX_WIDTH = 480
/** Dragging below this snaps the sidebar closed. */
export const SIDEBAR_COLLAPSE_WIDTH = 120

interface PersistedLayout {
  width: number
  collapsed: boolean
}

function loadLayout(): PersistedLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { width: SIDEBAR_DEFAULT_WIDTH, collapsed: false }
    const parsed = JSON.parse(raw) as Partial<PersistedLayout>
    const width =
      typeof parsed.width === 'number'
        ? Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, parsed.width))
        : SIDEBAR_DEFAULT_WIDTH
    return { width, collapsed: Boolean(parsed.collapsed) }
  } catch {
    return { width: SIDEBAR_DEFAULT_WIDTH, collapsed: false }
  }
}

function saveLayout(layout: PersistedLayout): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
}

interface SidebarState {
  expandedProjects: Record<string, boolean>
  expandedPages: Record<string, boolean>
  outlinePages: Record<string, boolean>
  /** After navigating to a page, scroll to this outline heading index. */
  pendingOutlineScroll: { pageId: string; headingIndex: number } | null
  width: number
  collapsed: boolean
  toggleProject: (projectId: string) => void
  togglePage: (pageId: string) => void
  expandProject: (projectId: string) => void
  expandPage: (pageId: string) => void
  toggleOutline: (pageId: string) => void
  setPendingOutlineScroll: (target: { pageId: string; headingIndex: number } | null) => void
  setWidth: (width: number) => void
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
}

const initial = loadLayout()

export const useSidebarStore = create<SidebarState>((set, get) => ({
  expandedProjects: {},
  expandedPages: {},
  outlinePages: {},
  pendingOutlineScroll: null,
  width: initial.width,
  collapsed: initial.collapsed,

  toggleProject: (projectId) =>
    set((state) => ({
      expandedProjects: {
        ...state.expandedProjects,
        [projectId]: !state.expandedProjects[projectId],
      },
    })),

  togglePage: (pageId) =>
    set((state) => ({
      expandedPages: {
        ...state.expandedPages,
        [pageId]: !state.expandedPages[pageId],
      },
    })),

  expandProject: (projectId) =>
    set((state) => ({
      expandedProjects: { ...state.expandedProjects, [projectId]: true },
    })),

  expandPage: (pageId) =>
    set((state) => ({
      expandedPages: { ...state.expandedPages, [pageId]: true },
    })),

  toggleOutline: (pageId) =>
    set((state) => ({
      outlinePages: {
        ...state.outlinePages,
        [pageId]: !state.outlinePages[pageId],
      },
    })),

  setPendingOutlineScroll: (target) => set({ pendingOutlineScroll: target }),

  setWidth: (width) => {
    const next = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width))
    set({ width: next, collapsed: false })
    saveLayout({ width: next, collapsed: false })
  },

  setCollapsed: (collapsed) => {
    const { width } = get()
    set({ collapsed })
    saveLayout({ width, collapsed })
  },

  toggleCollapsed: () => {
    const { width, collapsed } = get()
    const next = !collapsed
    set({ collapsed: next })
    saveLayout({ width, collapsed: next })
  },
}))
