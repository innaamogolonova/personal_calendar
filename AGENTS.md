# AGENTS.md

Quick context for agents working on this repo.

## What this is

A local-first personal organizer — a simpler alternative to Notion focused on scheduling and task management. Data lives in the browser (IndexedDB); no backend in v1.

Tasks are a **single source of truth**: scheduling on the calendar updates the same task records shown in the task list and project views.

## Core features

- **Calendar** (`/calendar`) — day, week, and month views. Week view is an hourly time grid (Google Calendar style). Drag-and-drop to schedule and reschedule tasks. Week starts on Monday.
- **Tasks** (`/tasks`) — global task list with inline editing (title, priority, labels, project, schedule).
- **Projects** (`/projects`) — list of all projects with rename/color edit and delete.
  - **Project page** (`/projects/:projectId`) — project landing with a block markdown editor for overview notes.
  - **Subpages** (`/projects/:projectId/pages/:pageId`) — nested pages with title + block editor; sidebar tree supports add/delete at any depth.
  - Projects appear in the sidebar when created (e.g. via task project picker). Sidebar shows an expandable page tree per project.

## Tech stack

| Tool | Role |
|---|---|
| Vite + React + TypeScript | App framework |
| React Router | Multi-page routing (app shell + nested routes) |
| Dexie.js | IndexedDB storage; `dexie-react-hooks` for reactive `useLiveQuery` |
| Zustand | Ephemeral UI state (`calendarStore`, `sidebarStore`) |
| FullCalendar | Calendar UI (day / week / month) |
| Tailwind CSS v4 | Styling (`@import 'tailwindcss'` in `index.css`) |
| date-fns | Date formatting and comparisons |

## Project structure

```
src/
├── App.tsx                 # Route definitions
├── layouts/AppShell.tsx    # Sidebar nav + <Outlet /> for pages
├── pages/                  # Route-level screens (thin; compose components)
├── components/
│   ├── calendar/           # FullCalendar wrapper + event rendering
│   ├── pages/              # BlockTextEditor, BlockRow (project/subpage editors)
│   ├── sidebar/            # Project/page tree (ProjectSidebarNode, PageSidebarNode)
│   ├── tasks/              # Task list, edit panel, popovers, inline selects
│   └── shared/             # EntityEditPopover, ColorPicker
├── db/
│   ├── types.ts            # Shared TypeScript interfaces
│   ├── database.ts         # Dexie schema + version migrations
│   ├── tasks.ts            # Task CRUD
│   ├── projects.ts         # Project CRUD (+ cascade delete pages)
│   ├── pages.ts            # Page CRUD (+ cascade delete children)
│   └── labels.ts           # Label CRUD
├── lib/                    # Pure helpers (no React)
│   ├── markdownBlocks.ts   # Block model: parse/serialize markdown, lists, shortcuts
│   ├── markdownInline.ts   # Inline HTML ↔ markdown; bold/italic via execCommand
│   ├── editorSelection.ts  # Cursor capture/restore for contenteditable + undo
│   ├── taskEvents.ts       # Task[] → FullCalendar EventInput[]
│   ├── dates.ts            # Scheduled range formatting
│   ├── colors.ts           # Preset colors for projects/labels
│   ├── taskLabels.ts       # Priority labels/options
│   └── popoverPosition.ts  # Anchored popover positioning (calendar events)
├── stores/                 # Zustand (not persisted)
└── types/                  # Small shared types (e.g. TaskSelection)
```

### Routes

| Path | Page component |
|---|---|
| `/` | Redirects to `/calendar` |
| `/calendar` | `CalendarPage` |
| `/tasks` | `TasksPage` |
| `/projects` | `ProjectsPage` |
| `/projects/:projectId` | `ProjectPage` |
| `/projects/:projectId/pages/:pageId` | `ProjectSubpagePage` |

## Data model

Defined in `src/db/types.ts`. Persisted in IndexedDB via Dexie (`src/db/database.ts`, currently **v5**).

- **projects** — `id`, `name`, `color`, `content` (markdown), `sortOrder`, `createdAt`
- **pages** — `id`, `projectId`, `parentPageId?`, `title`, `content` (markdown), `sortOrder`, `createdAt`, `updatedAt`
- **labels** — `id`, `name`, `color`
- **tasks** — `id`, `completed`, `title`, `scheduledStart?`, `scheduledEnd?`, `priority?`, `projectId?`, `pageId?`, `labelIds[]`, `sortOrder`, `createdAt`, `updatedAt`

**DB conventions:** Add a new `db.version(N)` in `database.ts` for schema changes; put query/mutation helpers in the matching `db/*.ts` file, not in components.

## Block editor (projects & pages)

Project and subpage content uses `BlockTextEditor` → `BlockRow` (one contenteditable per line/block).

- **Storage format:** markdown string in `project.content` / `page.content`
- **Block types:** paragraph, h1–h3, bullet, ordered, checkbox, blockquote
- **Line shortcuts** (type at line start + space): `#`, `##`, `###`, `-`, `>`, `1.`, `[]`
- **Keyboard:** ⌘B/⌘I (native bold/italic via `execCommand`), ⌘Z undo (debounced history), Enter continues lists, Tab/Shift+Tab indent/outdent lists
- **Ordered sublists:** alternate number (`1. 2.`) and letter (`a. b.`) markers by indent depth

Key files: `components/pages/BlockTextEditor.tsx`, `BlockRow.tsx`, `lib/markdownBlocks.ts`, `lib/markdownInline.ts`, `lib/editorSelection.ts`.

**Editor conventions:** Do not re-sync `innerHTML` from markdown after format toggles (`skipSyncRef` in `BlockRow`). Serialize DOM → markdown on input; deserialize markdown → HTML only on load, undo, or external content change.

## UI state vs persisted state

| Concern | Where |
|---|---|
| Tasks, projects, pages, labels | Dexie / IndexedDB |
| Calendar view + current date | `stores/calendarStore.ts` |
| Sidebar tree expand + width/collapsed (persisted in `localStorage`) | `stores/sidebarStore.ts` |
| Editor undo stack, focus block | Local React state in `BlockTextEditor` |

Page saves are debounced (~400ms) in `ProjectPage` / `ProjectSubpagePage`.

## Conventions

- Prefer simple, mainstream solutions over niche libraries.
- Keep diffs focused; match existing patterns in the codebase.
- Local-first: assume offline, single-browser use unless explicitly adding sync.
- Components read data via `useLiveQuery`; mutations go through `db/*.ts` helpers.
- Use `EntityEditPopover` + `ColorPicker` for inline rename/color edits on projects and labels.

## Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # tsc + vite production build
npm run lint     # oxlint
```
