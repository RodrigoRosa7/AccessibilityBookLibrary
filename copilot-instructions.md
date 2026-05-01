# Copilot Instructions

## Project Context

- This repository is an academic demo of an accessible online Library bookstore.
- Frontend only: React + Vite.
- Main goals: accessibility, voice interaction (Web Speech API), mocked data with MSW.

## Tech Stack

- React 19
- React Router (`createBrowserRouter`, protected routes)
- Primer React (`@primer/react`)
- MSW for mock API
- Context API for auth and cart

## Architecture and Folders

- `src/app/router/router.jsx`: route definitions and auth guard (`RequireAuth`).
- `src/app/providers/AuthProvider.jsx`: auth state and persistence (`localStorage`).
- `src/app/providers/CartProvider.jsx`: cart state and actions.
- `src/features/*`: feature pages, services, and voice modules.
- `src/services/apiClient.js`: central HTTP helpers (`apiGet`, `apiPost`).
- `src/mocks/*`: MSW handlers and mock datasets.
- `src/components/*`: shared UI and layout components.

## Routing Rules

- Public route: `/login`.
- Protected routes under `Layout`: `/home`, `/books`, `/books/:id`, `/cart`, `/checkout`.
- If unauthenticated, always redirect to `/login`.

## Voice Interaction Rules

- Use existing pipeline:
  - `useSpeechRecognition` -> `parseVoiceIntent` -> `handleVoiceCommand` -> UI action
- Keep voice language in `pt-BR`.
- Add new intents in `src/features/voice/intentParser.js` and map them in `src/features/voice/voiceCommands.js`.
- Prefer contextual feedback text suitable for text-to-speech.
- Avoid claiming success when an action is not available in the current page context.

## Speech Synthesis Rules

- Use `useSpeechSynthesis` for spoken feedback.
- Keep messages short and explicit.
- For status updates, also provide non-audio feedback (`aria-live`).

## Accessibility Rules

- Preserve semantic HTML (`main`, `section`, `nav`, `header`, etc.).
- Maintain keyboard-first interaction.
- Add/keep `aria-label` for actionable controls.
- Keep `aria-live` regions for command feedback and order status.

## Primer React Usage Rules

- Use Primer components already present in the project (`Button`, `Text`, `Heading`, `TextInput`, `ActionList`, `Dialog`, `PageLayout`, `ThemeProvider`, `BaseStyles`).
- Important: current `@primer/react` version in this project does not export `Box` and `Card`.
- For containers and layout wrappers, use semantic HTML (`div`, `section`, `header`) with simple inline styles when needed.

## Data and API Rules

- Do not introduce a backend.
- API calls must use `src/services/apiClient.js`.
- Mock endpoints must be defined in `src/mocks/handlers.js`.
- Keep API base path as `/api`.
- Start MSW only in dev through `src/main.tsx`.

## State Management Rules

- Auth state source of truth: `AuthProvider`.
- Cart state source of truth: `CartProvider`.
- Do not duplicate cart/auth state in page-local state when not necessary.

## Coding Style Rules

- Match existing file style:
  - Functional components.
  - Named exports for most feature/components.
  - Double quotes in JS/JSX files.
- Prefer small, focused functions.
- Reuse existing utilities and services before creating new ones.

## When Adding New Features

1. Add service call in feature service file.
2. Add or update MSW handler and mock data if needed.
3. Connect UI to providers/services.
4. Add voice command support when the action is user-facing.
5. Add accessibility attributes and `aria-live` feedback where applicable.
6. Ensure route protection remains intact.

## Validation Checklist

- Run `npm run build`.
- Run `npm run lint`.
- Ignore `public/mockServiceWorker.js` lint warning if it is the only warning and no app code warnings/errors exist.
