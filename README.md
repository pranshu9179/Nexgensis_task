# Product Admin Dashboard

A fully responsive admin dashboard for managing products, built with **React 19 + Vite + Tailwind CSS v4 + Axios** against the free [DummyJSON](https://dummyjson.com) API.

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd <project-folder>
npm install

# 2. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Test Credentials

| Username | Password     |
|----------|-------------|
| `emilys` | `emilyspass` |

## Tech Stack

- **React 19** + **Vite** — fast dev server, no CRA
- **react-router-dom v7** — client-side routing with URL-driven state
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- **Axios** — sole HTTP client, shared instance with interceptors
- **lucide-react** — icons (cosmetic only)
- Plain React state (`useState`, `useEffect`, Context) — no Redux/Zustand/React Query

## Features Checklist

- [x] **Auth** — Login / logout with token persistence in localStorage
- [x] **Protected routes** — router-level guard redirects to `/login`
- [x] **Product list** — table (desktop) + cards (mobile), same data source
- [x] **Pagination** — URL-synced page/pageSize, smart truncation, range text
- [x] **Search** — debounced (400ms) with AbortController race-condition fix
- [x] **Filter by category** — dropdown populated from API, mutually exclusive with search
- [x] **Sort** — by price/rating/title, asc/desc toggle
- [x] **URL is source of truth** — page, pageSize, q, category, sortBy, order all in query string
- [x] **Product details** — image gallery, description, reviews, Not Found handling
- [x] **Add product** — validated form, POST to API, local-state overlay
- [x] **Edit product** — same form pre-populated, PUT to API, local-state overlay
- [x] **Delete product** — custom confirm modal, DELETE to API, local removal
- [x] **Loading / empty / error states** — reusable components everywhere
- [x] **Defensive URL parsing** — bad `?page=abc` or `?page=999` handled gracefully
- [x] **Double-submit guard** — login + save buttons disable during request
- [x] **Responsive** — mobile-first, hamburger nav, touch-friendly targets (≥44px)

## Project Structure

```
src/
  api/           → Axios instance + API service functions
  components/    → Reusable UI (layout, products, ui)
  context/       → AuthContext
  hooks/         → useDebounce, useProductsQuery
  pages/         → Route-level page components
  utils/         → Validators, URL param helpers
```

See `NOTES.md` for design decisions and known limitations.
