# Notes Application – Frontend

Modern Next.js 16 (App Router) interface for the Notes platform. It uses shadcn/ui for consistent UI primitives, TailwindCSS for styling, and a lightweight Fetch wrapper that handles session-based JWT storage.

---

## UX Features

### Public Experience

- Landing page with marketing hero, theme toggle, and CTA buttons
- `/signin` + `/signup` forms (name/email/password). Already-authenticated users are auto-redirected to the dashboard
- Theme toggle available on every public page (stored in `localStorage`)

### User Workspace

- `/dashboard`: table of notes with:
  - Markdown preview (react-markdown + remark-gfm)
  - Multi-tag add/select (popover)
  - Attachments list (links rendered inline + preview in modal)
  - Pinned/favorite badges & toggles
  - Filters section (keyword, date range via shadcn calendar, tag filters, pinned/favorite view modes)
  - Filter banner so users know when they’re looking at a filtered subset
  - Delete + edit modals, view modal for attachments
- `/analytics`: personal analytics (tag distribution & weekly activity)
- `/profile`: email + password update forms with inline errors, plus account metadata
- Session handling:
  - Tokens stored in `sessionStorage`
  - `AuthContext` auto-refreshes current user on reload
  - 401 responses automatically clear token + redirect to `/signin`

### Admin Experience

- Admins see analytics-only dashboards: no ability to read notes
- `/dashboard` & `/profile` show the same `AdminOverview` component with:
  - Summary cards for notes/users
  - Toggleable charts (weekly/monthly/yearly) for note creation & new users
  - Tag distribution, top users (via API)
  - User directory table (email, created, last login, monthly/annual active flags, note counts)
- Navbar for admins contains only the theme toggle + red sign out button

### Shared UI/UX

- `ProtectedNav` ensures consistent theming controls/sign-out handling
- All pages respect light/dark theme tokens coming from Tailwind/shadcn
- `AdminOverview` lives in `components/admin/` and is reused in multiple places

---

## Tech Stack

| Area        | Tooling                                                       |
| ----------- | ------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, React 19)                             |
| Components  | shadcn/ui (button, card, dialog, etc.)                        |
| Styling     | TailwindCSS + CSS variables                                   |
| Icons       | lucide-react                                                  |
| Charts      | recharts + shadcn chart container                             |
| State       | React Context (Auth + Theme)                                  |
| HTTP Client | Fetch wrapper in `lib/api.ts` with sessionStorage JWT support |

---

## Setup

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run dev server:

```bash
npm run dev
```

Visit http://localhost:3000

---

## Project Structure (condensed)

```
frontend/
├── app/
│   ├── (auth)/signin & signup
│   ├── dashboard/page.tsx        # Notes or admin analytics (role-aware)
│   ├── analytics/page.tsx        # Personal analytics (users)
│   ├── profile/page.tsx          # User settings or admin analytics view
│   ├── page.tsx                  # Landing
│   └── globals.css
├── components/
│   ├── admin/AdminOverview.tsx   # Shared admin analytics UI
│   ├── protected/ProtectedNav.tsx
│   ├── ui/…                      # shadcn components
├── context/
│   ├── AuthContext.tsx           # sessionStorage JWT handling
│   └── ThemeContext.tsx          # light/dark state
├── lib/api.ts                    # fetch wrapper + API helpers
├── types/index.ts                # Shared TypeScript interfaces
└── public/
```

---

## Available Scripts

- `npm run dev` – start dev server
- `npm run build` – build for production
- `npm run start` – start production server
- `npm run lint` – run ESLint

---

## UX Notes

- JWT stored in `sessionStorage` to reduce persistent sessions on shared devices
- `AuthContext` proactively refreshes `/api/auth/me` on load; 401s force signout
- Date filters use shadcn `Popover + Calendar`
- Filtering state is mirrored in query params when calling the API (see `notesApi.getAll`)
- Analytics charts rely on backend `notes_timeline` and `users_timeline`

---

## Deployment Considerations

- Set `NEXT_PUBLIC_API_URL` to your deployed FastAPI origin
- Ensure backend CORS includes the deployed frontend host
- Consider moving session tokens to secure cookies for production hardened deployments

---

## References

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com/docs)

MIT © Notes Application
