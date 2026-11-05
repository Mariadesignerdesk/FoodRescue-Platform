---
name: foodrescue-development
description: Reusable guidance for developing, debugging, and documenting the FoodRescue React, TypeScript, and Supabase application. Use for changes to its routes, donation and reservation workflows, dashboard, authentication, UI, or project documentation.
---

# FoodRescue Development

## Project purpose

FoodRescue connects restaurants, bakeries, grocery stores, and other food donors with charities and food receivers. Donors publish surplus food with pickup details; receivers browse available listings and reserve food for pickup. The goal is to redirect usable food to communities and reduce waste.

## Architecture and technology

- React 19 with TypeScript, built by Vite.
- Tailwind CSS v4 for styling; React Router for routes.
- Lucide React for icons and Recharts for dashboard charts.
- Supabase JS client for authentication, database access, and RPC calls.
- `src/App.tsx` provides the application routes and wraps them in `AuthProvider` and `DemoSessionProvider`.
- Shared Supabase client: `src/lib/supabase.ts`.
- Feature/data helpers: `src/lib/`.
- Shared domain types: `src/types/`.
- Some presentation content remains demonstration data in `src/data/demo.ts` and `src/context/DemoSessionContext.tsx`.

## Project structure

```text
src/
  assets/       Images and static assets
  components/
    food/       Food cards and status badges
    layout/     App shell, navigation, footer, demo notice
  context/      Authentication and demo-session contexts
  data/         Demonstration data
  lib/          Supabase client, data helpers, formatting utilities
  pages/        Route-level pages
  types/        Shared TypeScript domain types
```

Important routes, defined in `src/App.tsx`:

- `/` — landing page
- `/auth` — sign up and sign in
- `/dashboard` — platform-wide aggregate dashboard
- `/browse` — browse available food and reserve listings
- `/donate` — create a donation listing
- `/my-donations` — donor listings and role-specific reservation history
- Unknown routes redirect to `/`.

## Supabase and data workflows

### Configuration and secrets

The Supabase client reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Vite environment configuration. A browser-exposed `VITE_` variable is not secret: never put a service-role key, password, or other privileged credential in it. Never print or copy values from `.env.local` or other environment files into source, logs, documentation, or commits. Do not commit `.env` files.

### Authentication

`src/context/AuthProvider.tsx` restores the Supabase session, subscribes to auth state changes, and exposes the current session/user and sign-up, sign-in, and sign-out actions through `useAuth()`. User role is read by pages from `user.user_metadata.role`. Preserve authenticated identity from the session; do not identify a user using demo constants or accept a client-supplied identity as authorization. Database policies and RPCs must enforce authorization server-side.

### Donations and reservations

`src/lib/donations.ts` contains the existing Supabase data operations. Current code:

- Inserts donation records into `donations`.
- Fetches available donation records for Browse Food and donor-owned records for My Donations.
- Fetches reservation history from `reservations`, scoped in application queries by receiver ID or by the donor's donation IDs.
- Uses the `reserve_food`, `cancel_reservation`, and `complete_pickup` RPCs for reservation creation, receiver cancellation, and donor pickup completion.
- Uses `get_reservation_counterparty` to retrieve authorized reservation counterpart display information.

Keep these operations in the existing helper layer and preserve their typed return models, error handling, and refresh behavior. Before changing queries, columns, RPC arguments/results, or authorization expectations, inspect the current helpers and types and verify against project-provided schema/RPC documentation. Do not infer database schema from UI labels or add unverified relationships. Never bypass RLS or move privileged keys to the browser.

### Dashboard

`src/lib/dashboard.ts` calls the authenticated `get_dashboard_aggregate` RPC and validates the response shape. It provides platform-wide totals, eight weekly impact records, and recent activity. The UI in `src/pages/DashboardPage.tsx` only displays generic activity types and PKT-formatted timestamps; do not expose donation titles or other private/user-entered information in global activity. Keep response validation strict: malformed or missing fields should surface an error, not be silently replaced with fabricated values.

### Demonstration data

Not every visual is live. `src/pages/LandingPage.tsx` uses sample donations and impact figures from `src/data/demo.ts`; `DemoSessionProvider` also assembles sample/session-only listing state. Preserve clear distinctions between these samples and persisted Supabase records. Do not describe demo data as saved or remotely synchronized, and do not replace backend functionality with LocalStorage.

## Development workflow and conventions

1. Inspect relevant source, types, routes, existing helpers, tests, and `AGENTS.md` before editing. Search for existing patterns before adding a new abstraction or dependency.
2. Make a focused change that meets the request while preserving existing UX and unrelated demo behavior. Avoid project rewrites, speculative schema changes, and unrelated refactoring.
3. Use TypeScript types and explicit input/response validation. Follow existing naming, formatting, component, and Tailwind patterns.
4. Keep forms accessible and validate user input. Keep loading, error/retry, empty, and success states consistent with neighboring pages.
5. Surface meaningful failures; do not silently swallow errors or use success-shaped fallback data.
6. Treat user data as private. Fetch only what is needed, respect role and authenticated user scope, and do not weaken RLS or RPC authorization.
7. Update directly related documentation when behavior or setup changes. Report the exact files changed and any limitations; do not claim browser or live-backend verification unless it was actually performed.

## Verification

Use the scripts defined in `package.json`:

```bash
npm run lint
npm run build
```

Run the smallest relevant checks during iteration, then run both commands for completed application changes when practical. `npm run build` runs TypeScript project checks and creates the Vite production build. Report command failures and warnings accurately; do not claim checks passed unless they were run.
