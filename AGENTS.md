# AGENTS.md

Quick context for agents working on this repo.

## What this is

A local-first personal organizer — a simpler alternative to Notion focused on scheduling and task management. Data lives in the browser (IndexedDB); no backend in v1.

## Core features

- **Calendar** (`/calendar`) — day, week, and month views. Week view is an hourly time grid (Google Calendar style). Drag-and-drop to schedule and reschedule tasks.
- **Tasks** (`/tasks`) — global task list with filters (project, status, priority, dates).
- **Projects** (`/projects/:id/pages/:pageId`) — workspaces with a nested page tree (think of a file system). Tasks can belong to a project and optionally a page within it. Some tasks are pages, some are not. The project landing page will contain the overview of the project. 

Tasks are a **single source of truth**: scheduling on the calendar updates the same task records shown in the task list and project views.

## Tech stack

| Tool | Role |
|---|---|
| Vite + React + TypeScript | App framework |
| React Router | Multi-page routing (app shell + nested routes) |
| Dexie.js | IndexedDB storage and reactive queries (`liveQuery`) |
| Zustand | UI state (calendar view/date, filters, sidebar) |
| FullCalendar | Calendar UI (day / week / month) |
| @dnd-kit | Drag-and-drop in task lists and boards |
| Tailwind CSS | Styling |
| date-fns | Date utilities |
| JSON export/import | Backup and restore (v1); cloud sync deferred |

## Data model

- **projects** — top-level workspaces
- **pages** — nested tree within a project (`parentPageId`)
- **tasks** — shared across calendar, task list, and project views (`scheduledStart` / `scheduledEnd` for calendar placement)

## Conventions

- Prefer simple, mainstream solutions over niche libraries.
- Keep diffs focused; match existing patterns in the codebase.
- Local-first: assume offline, single-browser use unless explicitly adding sync.

## Current task 
> update with next step when current is completed

Create basic calendar view 

## MVP high level next steps: 
- [x] Figure out tech stack 
- [x] Start repo, create context page (AGENTS.md) and README.md
- [ ] Create basic calendar view 
- [ ] Calendar sync to task list functionality 
- [ ] Project label for tasks 
- [ ] Project nested structure 
- [ ] Properties and filtering for task list 
- [ ] TBD 