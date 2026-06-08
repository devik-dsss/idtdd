# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start development server with Turbopack (http://localhost:3000)
bun run build    # Production build
bun start        # Start production server
```

No test or lint scripts are configured in this project.

## Architecture

This is a **Hostel Mess Food Review App** built with Next.js 16, React 19, Supabase, and the Untitled UI component library.

### Key Technologies
- **Supabase**: Authentication and PostgreSQL database via `@supabase/ssr`
- **React Aria Components**: Accessible interactive components
- **next-themes**: Theme switching (light/dark modes via CSS classes)
- **Tailwind CSS v4**: Styling via `@tailwindcss/postcss`

### Route Groups
- `(app)/` - Protected routes requiring authentication (home, menu, reviews, profile, admin)
- `(auth)/` - Public authentication routes (login, signup, forgot-password, verify-email)

### Authentication Flow
- `AuthGuard` component wraps all `(app)` routes, redirecting unauthenticated users to `/login`
- Supabase clients: `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (server components)
- Auth state changes trigger automatic redirects

### Database Schema (Supabase)
Four main tables defined in `src/lib/supabase/types.ts`:
- **profiles**: User data (full_name, username, usn, branch, hostel_location, is_admin, etc.)
- **menu_items**: Food items (name, description, is_veg)
- **daily_menu**: Scheduled meals (menu_item_id, date, meal_type, start_time, end_time)
- **reviews**: User reviews (user_id, menu_item_id, rating, comment, issue_type)

### Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Project Structure
```
src/
├── app/
│   ├── (app)/          # Protected routes (home, menu, reviews, profile, admin)
│   └── (auth)/         # Auth routes (login, signup, forgot-password)
├── components/
│   ├── auth/           # AuthGuard
│   ├── layout/         # AppShell, BottomNavigation
│   ├── application/    # Complex UI components
│   ├── base/           # UI primitives (buttons, inputs, badges)
│   └── foundations/    # Icons
├── lib/supabase/       # Supabase client setup and TypeScript types
├── providers/          # Theme, RouterProvider
└── utils/              # cx() for class merging
```

### Class Merging
Use `cx()` from `@/utils/cx` for combining Tailwind classes (wrapper around tailwind-merge).

### Path Aliases
- `@/*` maps to `./src/*`

### Prettier Config
- 160 character print width, 4-space tabs
- Import sorting: react → react-dom → external → @/ aliases → relative
