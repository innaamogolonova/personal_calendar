import { create } from 'zustand'

interface SidebarState {
  expandedProjects: Record<string, boolean>
  expandedPages: Record<string, boolean>
  toggleProject: (projectId: string) => void
  togglePage: (pageId: string) => void
  expandProject: (projectId: string) => void
  expandPage: (pageId: string) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  expandedProjects: {},
  expandedPages: {},

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
}))
