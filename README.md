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

## MCP and External Tool Integrations

FoodRescue's AI-assisted development workflow uses:

- **GitHub MCP** to connect the AI coding agent with the FoodRescue GitHub repository.
- **Atlassian Rovo MCP** to connect the AI coding agent with Jira.

The intended workflow is: Jira tasks are read by the AI agent; the agent follows the reusable FoodRescue Skill, makes focused code changes, and supports code review. Changes can then be committed and submitted as GitHub pull requests linked to their Jira task IDs.

The GitHub MCP and Atlassian Rovo MCP servers are configured locally through the VS Code MCP configuration file, `.vscode/mcp.json`. Authentication credentials must be supplied securely and must never be committed to GitHub. Appropriate account permissions are required for these integrations.

## Integration Limitations

- MCP access depends on valid authentication, account permissions, server availability, and compatible tool support.
- Jira and GitHub actions are limited by the permissions of the connected accounts.
- AI-generated code must be reviewed and tested by a human before use.
- Supabase features require correctly configured environment variables, database schema, RPC functions, Storage bucket, and access policies.
- Landing-page featured listings and impact figures include demonstration content; they are not live database records.
- Supabase-backed features require an internet connection and an available Supabase service.

## AI Agent Development Skill

FoodRescue includes a reusable [development Skill](.github/skills/foodrescue-development/SKILL.md) at `.github/skills/foodrescue-development/SKILL.md`. It guides agents through the project's architecture and React/TypeScript conventions, Supabase authentication and data workflows, security and privacy practices, error handling, and verification using the project's actual scripts.

The Skill gives future tasks a consistent set of project-specific instructions, reducing repeated prompts and explanations. Its guidance encourages focused changes, reliable error handling, and verification to support code quality and long-term maintainability. This Skill was used during FoodRescue development.
git add README.md