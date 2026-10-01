# Focus Log

Pomodoro timer + daily habit tracking with streaks.
Stack: React + TypeScript (Vite), TanStack Router, Tailwind CSS, Supabase (Auth, Postgres, RLS), WCAG 2.1 AA.

## Setup
1. `pnpm install`
2. Create a Supabase project, then run `supabase/schema.sql` in the SQL editor.
3. `cp .env.example .env` and fill in the project URL and anon key.
4. `pnpm dev`

## Features
- Configurable Pomodoro timer; completed sessions are logged to Supabase
- Daily habit checklist with streaks
- Weekly summary (focus minutes and habits per day)
- Supabase Auth; every table is protected by Row Level Security (`user_id = auth.uid()`)
