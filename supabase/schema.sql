-- Run in the Supabase SQL editor.
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null check (kind in ('focus','break')),
  duration_sec int not null check (duration_sec > 0),
  created_at timestamptz not null default now()
);
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);
create table public.habit_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  habit_id uuid not null references public.habits on delete cascade,
  day date not null,
  unique (habit_id, day)
);

alter table public.sessions enable row level security;
alter table public.habits enable row level security;
alter table public.habit_checks enable row level security;

create policy "own sessions" on public.sessions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own habits" on public.habits for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own checks" on public.habit_checks for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
