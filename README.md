# personal_calendar

A personal organizer web app — like a simpler Notion, built around a calendar and task list.

I use Notion for organization, but wanted something more focused: a place to plan my day on a calendar, manage tasks with useful properties, and organize work by project. This app is that.

## What it does

- **Calendar** — day, week, and month views. Drag tasks onto your schedule and move them around as your day changes.
- **Tasks** — a task list where you can filter and edit properties (status, priority, due dates, and more).
- **Projects** — separate workspaces with nested pages, each with its own structure and tasks.

Everything stays in your browser. No account or server required.

## Status

Early development — basic calendar view is working. Task list and projects are next.

## Development

```bash
npm install
npm run dev
```


## Plan: 

### Current task:
> update with next step when current is completed

Project nested structure 

### MVP high level next steps: 
- [x] Figure out tech stack 
- [x] Start repo, create context page (AGENTS.md) and README.md
- [x] Create basic calendar view 
- [x] Calendar sync to task list functionality 
- [x] Project label for tasks 
- [ ] Project nested structure 
- [ ] Filtering for the task list 
- [ ] Have a daily display of some sort
- [ ] TBD 

### Next improvements after MVP: 
- [ ] Styling
    - colors for labels/projects
    - overall more sleek look 
    - the pop up screens are ugly and anchored to the top 
    - a lot of styling issues i would like to fix, but can't list all of them off the top of my head 
- [ ] Multiple select on tasks to allow for batch edits/deletions 
- [ ] Multiple view options on pages 
    - save views 
    - have a kanban board as an option 
- [ ] More reliable non-browser db (Django??)

### Nice haves: 
- [ ] Global search 
- [ ] keyboard commands 
- [ ] finding and linking an existing task on the calendar 

### Decisions, resolve later: 
- links between some tasks and pages