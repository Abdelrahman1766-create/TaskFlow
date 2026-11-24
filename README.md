# TASKFLOW

TASKFLOW is a local task planner with an editorial interface. It helps you capture work, keep track of due dates, and see progress without an account or server.

## Features

- Add, edit, complete, and delete tasks; undo an individual deletion.
- Add optional descriptions, priority, category, and due date.
- Search tasks, filter by status or category, and sort by creation date, due date, or priority.
- Browse due tasks in a monthly calendar and view completion statistics for the last seven days.
- Switch between English and Russian, and between light and dark themes. Preferences persist after reload.
- Use `/` to focus the task input, Enter to add a task, and Escape to clear the input or close a dialog.

## Stack

React 18, TypeScript, Vite 6, Framer Motion, and Lucide React. Playwright covers browser flows; ESLint and TypeScript check the source.

## Run locally

Use Node.js 18 or newer and npm:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. To run the checks and preview the production bundle:

```bash
npm run lint
npm run test:e2e
npm run build
npm run preview
```

The browser tests use installed Google Chrome. The production build writes static files to `dist/`, which Vercel can serve using the Vite preset; no environment variables or server routes are required.

## Project structure and storage

- `src/App.tsx` connects the task workspace, calendar, dialogs, and productivity panel.
- `src/components/` contains the interface; `src/hooks/` owns task and preference state.
- `src/i18n.ts` holds the English and Russian strings.
- `src/utils/storage.ts` validates and migrates saved tasks.
- `tests/` contains the browser tests.

Tasks are stored as JSON in this browser's LocalStorage under `taskflow.tasks.v1`. Language and theme use `taskflow.locale` and `taskflow.theme`. Data stays on this device. Older task records with a `text` field are read as titles. If stored task data is malformed, valid records are loaded where possible. The app attempts to keep a copy of the original data under `taskflow.tasks.invalid-backup` before any later edit replaces the task list.

## AI tools and demo

OpenAI Codex was used for the final code review, fixes, README update, and browser test creation. Earlier development tool use is not documented in this repository.

No verified live demo URL is available in the repository.
