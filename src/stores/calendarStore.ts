import { create } from 'zustand'
import type { CalendarView } from '../db/types'

interface CalendarState {
  view: CalendarView
  currentDate: Date
  setView: (view: CalendarView) => void
  setCurrentDate: (date: Date) => void
}

export const useCalendarStore = create<CalendarState>((set) => ({
  view: 'timeGridWeek',
  currentDate: new Date(),
  setView: (view) => set({ view }),
  setCurrentDate: (currentDate) => set({ currentDate }),
}))
