# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript check + Vite build (runs postbuild to create SPA fallback)
npm run lint         # ESLint (includes jsx-a11y)
npm run lint:types   # tsc --noEmit strict check
npm run test         # Vitest single run
npm run test:watch   # Vitest in watch mode
npm run deploy       # build + deploy to GitHub Pages
```

To run a single test file: `npx vitest run src/features/voice/intentParser.test.ts`

## Architecture

**Stack**: React 19, TypeScript (strict, 100% `.ts`/`.tsx`), Vite, React Router v7, `@primer/react` v38 for UI, Vitest + jsdom for tests, MSW for API mocking, `axe-core` + `eslint-plugin-jsx-a11y` for accessibility.

**Deployed** to GitHub Pages at base path `/AccessibilityBookLibrary/`. All API and asset paths must use `import.meta.env.BASE_URL` as prefix.

**No real backend** — all API calls are intercepted by MSW. Handlers are in `src/mocks/handlers.ts`. The mock endpoints are:
- `POST /api/auth/login` — credential check against `src/mocks/usersMock.ts`
- `GET /api/books?q=` — full-text search over `src/mocks/booksMock.ts`
- `GET /api/books/:id`
- `POST /api/checkout` — appends to an in-memory `ordersMock` array (resets on page reload)

**Order persistence**: completed orders → `localStorage` as `orderHistory`. Latest order summary → `sessionStorage` as `latestOrderSummary`.

**@primer/react v38 note**: `ThemeProvider` does NOT accept a `theme` prop (removed in v38). The `sx` prop causes TypeScript errors in strict `.tsx`; use `style` instead. Customisation is via CSS custom properties only.

## Folder structure

```
src/
  app/
    hooks/          # useDarkMode
    providers/      # AuthProvider, CartProvider (context + hooks)
    router/         # router.tsx with RequireAuth guard
  components/       # Global chrome: Layout, Navbar, GlobalVoiceAssistant,
                    # VoiceFeedbackBanner, VoiceHelpPanel, VoiceOnboardingDialog,
                    # RouteVoiceGuidance, VoiceButton
  features/
    auth/           # authService.ts
    books/          # BookCard, BookCardSkeleton, bookService.ts
    cart/           # cartService.ts (persistence + checkout API)
    contextual/     # pageVoiceGuidance.ts (per-route voice hints)
    onboarding/     # voiceOnboarding.ts (versioned localStorage key)
    voice/
      components/   # VoiceAssistantPanel
      domain/       # intents/ registry (types, parseIntent, patterns/)
      hooks/        # useVoiceAssistant, useVoiceCommands, useVoiceFeedback, useVoicePagination
      services/     # voiceEvents.ts (typed custom event bus)
      intentParser.ts         # thin re-export wrapping domain/intents/parseIntent
      voiceCommands.ts        # maps ParsedIntent → feedback string + side effect callbacks
      searchResultsSpeech.ts  # generates spoken summaries for search results
      useSpeechRecognition.ts # wraps browser SpeechRecognition (pt-BR, Space bar toggle)
      useSpeechSynthesis.ts   # wraps SpeechSynthesisUtterance
  pages/            # LoginPage, HomePage, BooksPage, BookDetailsPage, CartPage, CheckoutPage
  shared/
    lib/            # currency.ts, api/apiClient.ts
    ui/             # Accordion, AppButton (CSS Modules)
  styles/           # tokens.css, reset.css, typography.css, globals.css, components.css, index.css
  types/            # book.ts, user.ts, cart.ts, voice.ts, web-speech.d.ts
  mocks/            # MSW handlers, browser.ts, booksMock.ts, usersMock.ts
  test-setup.ts     # vitest: cleanup + window.matchMedia stub
```

## Voice pipeline

`Layout` mounts `<GlobalVoiceAssistant />`, which is a thin connector (~40 lines) that:

1. Calls `useVoiceAssistant` (`src/features/voice/hooks/useVoiceAssistant.ts`) — the orchestrator hook that composes:
   - `useSpeechRecognition` — browser `SpeechRecognition` API (Chrome/Edge only; blocked for Firefox). Space bar toggles listening except in text fields.
   - `useVoiceCommands` — calls `parseVoiceIntent` then `handleVoiceCommand`, returns feedback.
   - `useVoiceFeedback` — manages spoken feedback queue via `useSpeechSynthesis`.
   - `useVoicePagination` — tracks paginated search results state for "próximos"/"anteriores" commands.

2. Renders `<VoiceAssistantPanel />` with all state/callbacks as props.

**Intent parsing** lives in `src/features/voice/domain/intents/`:
- `parseIntent.ts` — runs all matchers in order, returns the first match or `UNKNOWN`.
- `patterns/*.ts` — one file per intent group (navigation, search, cart, checkout, help, onboarding, goBack).
- `normalize.ts` — strips Portuguese accents and lowercases before matching.
- `intentParser.ts` at the feature root re-exports `parseVoiceIntent` for backward compatibility.

**Custom event bus** — `src/features/voice/services/voiceEvents.ts` exports typed `emitVoiceEvent` / `subscribeVoiceEvent` using the `VOICE_EVENT` const enum. All cross-component communication goes through this bus (no raw `window.dispatchEvent`).

## State

- **Auth**: `src/app/providers/AuthProvider.tsx` — context + `useAuth()` hook. Exposes `{ user, isAuthenticated, login, logout, shouldPlayVoiceOnboarding, completeVoiceOnboarding }`. Not persisted across reloads.
- **Cart**: `src/app/providers/CartProvider.tsx` — context + `useCart()` hook. In-memory item list; persistence/checkout delegated to `src/features/cart/cartService.ts`.
- **Voice onboarding**: persisted to `localStorage` with versioned key `webspeech-voice-onboarding:<version>:<userId>`. Version in `src/features/onboarding/voiceOnboarding.ts`.
- **Dark mode**: `src/app/hooks/useDarkMode.ts` — persisted to `localStorage`; reads `prefers-color-scheme` on first load. Sets `data-theme="light"|"dark"` on `<html>`. CSS tokens use `:root:not([data-theme])` for the media query so the manual toggle always wins.

## Routing

All authenticated routes are wrapped in `RequireAuth` (redirects to `/login`). Router is defined in `src/app/router/router.tsx` with `basename: import.meta.env.BASE_URL`. Routes: `/home`, `/books`, `/books/:id`, `/cart`, `/checkout`. Unknown paths redirect to `/home`.

## Styling

- CSS custom properties in `src/styles/tokens.css` — warm brown palette + WCAG-compliant semantic tokens (`--color-danger: #b3261e`, contrast ≥ 4.5:1).
- Dark mode: same tokens redefined under `@media (prefers-color-scheme: dark) { :root:not([data-theme]) }` and `[data-theme="dark"]`.
- Component styles use **CSS Modules** (e.g. `AppButton.module.css`, `VoiceAssistantPanel.module.css`) — no `!important`.
- Typography: Inter (UI) + Lora (headings) loaded from Google Fonts in `index.html`.

## Tests

Unit tests live alongside the feature files they test (`.test.ts`). Accessibility tests live in `src/pages/` and `src/features/voice/components/` (`.test.tsx`).

Test suites:
- `intentParser.test.ts` — 47 tests covering normalisation and intent matching.
- `voiceCommands.test.ts` — 12 tests for the intent→action dispatcher.
- `searchResultsSpeech.test.ts` — spoken search summary messages.
- `pageVoiceGuidance.test.ts` — per-route guidance strings.
- `voiceOnboarding.test.ts` — versioned localStorage key and completion state.
- `VoiceAssistantPanel.test.tsx` — axe-core a11y (3 variants).
- `LoginPage.test.tsx`, `BooksPage.test.tsx`, `BookDetailsPage.test.tsx` — axe-core a11y.

Vitest is configured with `environment: "jsdom"` and `server.deps.inline: [/@primer\/react/]` (so Primer's CSS imports are processed through Vite rather than bare Node.js). `window.matchMedia` is stubbed in `src/test-setup.ts`.
