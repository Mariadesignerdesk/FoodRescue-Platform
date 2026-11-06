# FoodRescue

**Good food deserves a second chance.**

FoodRescue connects restaurants, bakeries, grocery stores, and other food donors with charities and food receivers. Donors publish surplus food with pickup details; receivers browse available listings and reserve food for pickup. The platform helps redirect usable food to communities instead of letting it go to waste.

## Technology

- React 19, TypeScript, and Vite
- Tailwind CSS v4
- React Router
- Lucide React icons
- Recharts
- Supabase Auth and Postgres-backed data

## Getting started

### Prerequisites

Install Node.js and npm. Use a Node.js release supported by the Vite version in this project.

### Install dependencies

From the project directory, run:

```bash
npm ci
```

### Configure Supabase

Create a `.env.local` file in the project root and configure these variable names with values from your Supabase project:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Use the project URL and a browser-safe publishable/anon key. Do not put a service-role key, password, or other secret in a `VITE_` variable: Vite exposes these values to client-side code. Keep `.env.local` out of commits. The app expects the Supabase database configuration and RPC functions used by the features below to be deployed.

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Run TypeScript project checks and create a production build |
| `npm run preview` | Preview the production build locally |

## Application routes

| Route | Page |
| --- | --- |
| `/` | Landing page |
| `/auth` | Sign up and sign in |
| `/dashboard` | Platform-wide impact dashboard |
| `/browse` | Search and filter available food |
| `/donate` | Create a food donation listing |
| `/my-donations` | View your donations and reservation history |

Unknown routes redirect to `/`.

## What uses Supabase

The application uses the configured Supabase client for authentication and these live features:

- Sign up, sign in, sign out, and session restoration through Supabase Auth.
- Creating donation listings and loading available listings.
- Loading a donor's donations and reservation history for the signed-in donor or receiver.
- Creating reservations, cancelling a receiver's reservation, and recording a donor's pickup completion through database RPCs.
- Loading platform-wide dashboard metrics, weekly impact, and recent activity through the authenticated `get_dashboard_aggregate` RPC.

The dashboard RPC requires an authenticated session. Supabase access also depends on the project's database schema, deployed RPC functions, and access policies being configured correctly.

## Demonstration content

Some parts of the interface still use local sample data and are not saved to Supabase. The landing page's featured donations and impact figures are demonstrations. The demo data module and demo session context also retain sample listings for demonstration use. These samples should not be treated as live platform records. The dashboard, Browse Food, donation submission, My Donations, and reservation workflows described above use Supabase.

## Project structure

```text
src/
  components/   Shared food and layout UI
  context/      Authentication and demo-session contexts
  data/         Demonstration data
  lib/          Supabase client, data helpers, and utilities
  pages/        Route-level pages
  types/        Shared TypeScript domain types
```

## AI Agent Development Skill

FoodRescue includes reusable AI agent development instructions in the [FoodRescue development Skill](.github/skills/foodrescue-development/SKILL.md). It guides agents on project architecture, Supabase workflows, coding practices, and verification.
