# ResolveAI

I spent a few years in tech support at redBus. Tickets come in messy. Someone’s payment went through but the booking didn’t. Another person just writes “urgent help”. You open the ticket, read it twice, guess the priority, then write a reply that doesn’t sound robotic.

ResolveAI is the inbox I wished we had. Login, see tickets, filter by status, open one, and let Gemini help with the three things that eat time: summarize, triage, draft a reply. I still apply the labels and send the message — AI is a helper, not the agent.

---

## What it does

- **Login** — email + password through Supabase Auth. Refresh the page and you’re still signed in.
- **Inbox** — tickets from Postgres, filtered by Open / In Progress / Resolved.
- **Ticket page** — change status, priority, category, write a reply, save.
- **New ticket** — form with React Hook Form so empty fields don’t sneak through.
- **AI panel** — Summarize / Triage / Draft. If Gemini is down, it falls back to simple keyword logic so the demo still works.
- **Dark mode** — toggle in the header.

---

## Stack

React 18, Vite, React Router, TanStack Query, React Hook Form, Tailwind.

Backend is Supabase (Postgres + Auth). Gemini runs on the server — Vite middleware while you develop, a Vercel function when you deploy. The API key is `GEMINI_KEY`, not `VITE_…`, so it doesn’t land in the browser bundle.

---

## How the folders are laid out

```
src/
  api/        tickets CRUD + the frontend call to /api/assist
  context/    AuthContext, ThemeContext
  pages/      login, inbox, ticket detail, new ticket
  lib/        Supabase client
server/
  runGeminiAssist.js   prompts + model fallback
api/
  assist.js            Vercel handler for /api/assist
```

Click Summarize → browser POSTs to `/api/assist` → server talks to Gemini → JSON comes back into the panel. That’s it.

---

## Run it locally

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
GEMINI_KEY=
```

Don’t put `VITE_` in front of the Gemini key. Vite would ship it to the client.

```bash
npm run dev
```

---

## Demo

**Live:** https://resolveai-ten-amber.vercel.app

**Login:** `agent@resolveai.com` / `demo1234`

Walkthrough I use when showing this:

1. Sign in → inbox
2. Filter **Open**, open a ticket
3. **Summarize**
4. **Triage** → **Apply** (priority / category update)
5. **Draft** → **Insert**, change one line, save / resolve
6. Back to inbox — ticket should sit under Resolved

---

## What I actually learned

Putting ticket logic in `src/api/tickets.js` instead of inside the page. That made swapping localStorage for Supabase a small change, not a rewrite.

TanStack Query for anything that comes from the server. `useState` for the form and the filter. Mixing those two was the part I kept getting wrong at first.

Auth isn’t “save an email in localStorage”. It’s a session from Supabase, a loading state so protected routes don’t flicker, and a listener you unsubscribe when the app unmounts.

And the AI key stays off the client. That’s the difference between a demo and something you’d actually ship.

---

## Resume line

Built a React support inbox with Supabase Auth, TanStack Query, and a server-side Gemini assist panel (summarize, triage, draft) with a heuristic fallback.
