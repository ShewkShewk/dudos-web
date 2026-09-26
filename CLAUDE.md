# CLAUDE.md

dudOS — an internal web app for the Dallas Urban Debate Alliance. It's a Next.js front end over a separate backend API that imports tournaments and serves pairings and school check-in status.

## Commands

Use **pnpm** (the repo has `pnpm-lock.yaml` and `pnpm-workspace.yaml`).

```bash
pnpm dev      # dev server on http://localhost:3000
pnpm build    # production build; also the main type check
pnpm lint     # eslint (next core-web-vitals + typescript)
```

There is no test suite. Check changes with `pnpm lint` and `pnpm build`.

## Stack

- Next.js 16 (App Router), React 19, TypeScript (strict)
- Auth.js / next-auth v5 beta with the Google provider (`auth.ts`)
- Tailwind CSS v4 (configured in `app/globals.css`; there is no tailwind config file)
- shadcn/ui (`components.json`, style `radix-vega`), Radix plus `@base-ui/react`, lucide icons, `sonner` toasts
- Path alias: `@/*` maps to the repo root

## Architecture

### Request flow

```
Browser (client component)
  └─ fetch("/api/...")  or  server action
       └─ Next route handler / action checks the session with auth()
            └─ app/lib/client.tsx  (typed backend calls)
                 └─ app/lib/auth.tsx apiRequest()  → backend at API_BASE_URL
                      (Google ID token from service account)
```

- `app/lib/auth.tsx`: the `server-only` HTTP helper. It uses `google-auth-library` to get an ID-token client for `API_BASE_URL` from `GOOGLE_SERVICE_ACCOUNT_JSON`. Every backend call goes through `apiRequest<T>()`.
- `app/lib/client.tsx`: one exported PascalCase function per backend endpoint (`GetTournaments`, `ImportTournament`, `GetLatestPairings`, `GetSchoolsStatus`, `GetSummary`, …). It is `server-only`, so never import it from client components.
- `app/lib/domain.tsx`: the shared TypeScript types that mirror backend responses. Keep them in sync with the backend.
- `app/api/**/route.ts`: thin GET proxies for client components. Each one calls `auth()`, returns 401 when there is no user, and then forwards to a `client.tsx` function.
- `app/tournaments/actions.tsx`: server actions (`"use server"`) for mutations. They call `requireSession()` from `app/session.tsx` and then `revalidatePath`.
- `app/api/[...nextauth]/route.ts`: the Auth.js handlers.

### Adding a backend-backed feature

The school check-ins commit (`4852c94`) is the reference example:
1. Add the types to `app/lib/domain.tsx`.
2. Add a fetch function to `app/lib/client.tsx`.
3. For reads from client components, add an auth-guarded route under `app/api/...`. For mutations, add a server action in `app/tournaments/actions.tsx`.
4. Add the page under `app/tournaments/<feature>/`.
5. Add a nav entry to `data.navMain` in `components/app-sidebar.tsx`.

### UI / state

- `app/layout.tsx` (root): calls `auth()`. With no session it renders `LoginPage` in place of the app. Otherwise it renders the sidebar shell and the `Toaster`. There is no middleware.
- `app/page.tsx`: a server component dashboard built from `GetSummary()`.
- `app/tournaments/layout.tsx` wraps its routes in `TournamentsDataProvider`. That client context holds the tournament list and exposes `refreshTournaments`, `importTournament` and `deleteTournament`, which show toasts. Get it with `useSharedTournaments()`.
- Tournament pages (`load`, `pairings`, `schools`) are client components. They fetch from `/api/...` and pick a tournament with `tournament-picker.tsx`. Only tournaments with `loaded: true` can be selected.
- `components/ui/*` are shadcn components and may be regenerated. `button.tsx` has a custom `refreshative` variant.

## Backend (dudosapi)

The backend lives in a separate repo: https://github.com/ShewkShewk/dudosapi. Changes to endpoints or response shapes are made there, and `app/lib/domain.tsx` / `app/lib/client.tsx` have to be updated to match.

- **Production:** runs on Google Cloud Run. `API_BASE_URL` is the Cloud Run service URL, and requests are authenticated with Google ID tokens from the service account.
- **Local:** the backend runs locally, and `.env.local` points `API_BASE_URL` at `http://localhost...`. The Cloud Run URL is kept commented out, so switching means swapping which line is commented. When the frontend fails to load data locally, first check that the local backend is running.

## Deployment & access

- **Frontend:** deployed to Vercel. Production env vars are set in the Vercel project, and there `API_BASE_URL` points at the Cloud Run backend.
- **Who can log in:** only Dallas Urban Debate Alliance Google accounts. `auth.ts` has no domain or allow-list check, so the restriction isn't enforced in this repo's code. Don't add changes that widen access, and treat that requirement as fixed.

## Environment

Set these in `.env.local` (never commit it or print its values):
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`: Auth.js Google OAuth
- `API_BASE_URL`: the backend base URL, also used as the ID-token audience
- `GOOGLE_SERVICE_ACCOUNT_JSON`: service account credentials as a single-line JSON string

## Conventions

- Indent with tabs. Use double quotes in most files. Semicolons are used inconsistently; follow the file you're editing.
- Server-only modules start with `import "server-only"`. Client components start with `"use client"`.
- Route handler `params` is a `Promise` (Next 15+): `const { id } = await params`.
- Use `@/` absolute imports rather than relative paths.
- Commit messages are short imperative sentences, e.g. "Add school check in functionality".
