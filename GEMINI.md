# Weekly Flow - Project Overview

Weekly Flow is a modern, responsive web application built with React and TypeScript, designed to help students manage their courses, schedules, resources, and tasks in one place. It features a dashboard for course overview, detailed course management, and a drag-and-drop weekly schedule.

## Tech Stack

- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite
- **Routing:** React Router 7
- **Backend:** Node.js, Express, PostgreSQL (Aiven)
- **State Management:** Custom hooks (`useCourseData`) with optimistic updates and PostgreSQL persistence.
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Drag & Drop:** @dnd-kit
- **Styling:** Vanilla CSS (via `index.css` and scoped styles within components).

## Project Structure

- `src/components/`: UI components (Layout, Dashboard, WeeklyBoard, etc.).
- `src/hooks/`: Custom React hooks for data management and API interaction.
- `server/`: Express backend server and database configuration.
- `src/assets/`: Static assets like images and SVG icons.
- `src/types.ts`: TypeScript interfaces and shared constants.
- `public/`: Public static assets.

## Key Features

- **Course Dashboard:** View all enrolled courses with progress tracking and filtering by category.
- **Weekly Schedule:** A visual board of the week's activities with drag-and-drop support.
- **Real-time Persistence:** Data is stored in a PostgreSQL database with optimistic UI updates for speed.
- **Categorization:** Organize courses into groups (Facultad, Extras, etc.).

## Building and Running

### Database Initialization
Before running for the first time, initialize the database tables:
```bash
npm run server-init (TODO: add this script)
```

### Development
To start both the frontend and the backend server:
1. Start backend: `npm run server`
2. Start frontend: `npm run dev`

### Build
To create a production-ready build:
```bash
npm run build
```

### Linting
To run the linter:
```bash
npm run lint
```

### Preview
To preview the production build locally:
```bash
npm run preview
```

## Development Conventions

- **Components:** Functional components using TypeScript.
- **Styling:** Prefers scoped CSS within component files using template literals for component-specific styles, while global variables and base styles are in `src/index.css`.
- **Data Management:** All course data operations should go through the `useCourseData` hook to ensure consistency and persistence.
- **Naming:** Follows standard React/TypeScript naming conventions (PascalCase for components, camelCase for variables/functions).
- **Types:** Strictly type all data structures and component props using the definitions in `src/types.ts`.
