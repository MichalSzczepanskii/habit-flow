-- Migration: Create Habits Schema
-- Timestamp: 2026-01-24 10:00:00 UTC
-- Description: Sets up habits and habit_completions tables with RLS and specific indexes.
--              Also includes a helper function for fetching habits with calculated stats (streak, completion status).

-- Enable necessary extensions if not already available
create extension if not exists moddatetime schema extensions;

-- 1. Create public.habits table
-- Stores the definition of habits created by users.
create table public.habits (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null check (char_length(title) <= 255),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.habits is 'Stores the definition of habits created by users.';

-- Trigger to automatically update updated_at timestamp
create trigger handle_updated_at before update on public.habits
  for each row execute procedure moddatetime (updated_at);


-- 2. Create public.habit_completions table
-- Logs daily completions for habits.
create table public.habit_completions (
    id uuid primary key default gen_random_uuid(),
    habit_id uuid not null references public.habits(id) on delete cascade,
    completed_date date not null,
    created_at timestamptz not null default now(),
    unique (habit_id, completed_date) -- Prevents multiple check-ins for the same habit on the same logical day
);

comment on table public.habit_completions is 'Logs daily completions for habits.';


-- 3. Indexes
-- Optimizes fetching a user's list of habits, sorted by creation time.
create index habits_user_id_created_at_idx on public.habits (user_id, created_at);
-- Critical for efficient streak calculation queries which often look for the most recent dates first.
create index habit_completions_habit_id_completed_date_idx on public.habit_completions (habit_id, completed_date desc);


-- 4. RLS for public.habits
alter table public.habits enable row level security;

-- Policy: Select (Users see their own habits)
create policy "users can view their own habits"
on public.habits for select
to authenticated
using (auth.uid() = user_id);

-- Policy: Insert (Users create their own habits)
create policy "users can insert their own habits"
on public.habits for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy: Update (Users update their own habits)
create policy "users can update their own habits"
on public.habits for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy: Delete (Users delete their own habits)
create policy "users can delete their own habits"
on public.habits for delete
to authenticated
using (auth.uid() = user_id);


-- 5. RLS for public.habit_completions
alter table public.habit_completions enable row level security;

-- Policy: Select
-- Users can view completions if they own the parent habit
create policy "users can view completions for their habits"
on public.habit_completions for select
to authenticated
using (
    exists (
        select 1 from public.habits
        where habits.id = habit_completions.habit_id
        and habits.user_id = auth.uid()
    )
);

-- Policy: Insert
-- Users can insert completions if they own the parent habit
create policy "users can insert completions for their habits"
on public.habit_completions for insert
to authenticated
with check (
    exists (
        select 1 from public.habits
        where habits.id = habit_completions.habit_id
        and habits.user_id = auth.uid()
    )
);

-- Policy: Update
-- Users can update completions if they own the parent habit
create policy "users can update completions for their habits"
on public.habit_completions for update
to authenticated
using (
    exists (
        select 1 from public.habits
        where habits.id = habit_completions.habit_id
        and habits.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1 from public.habits
        where habits.id = habit_completions.habit_id
        and habits.user_id = auth.uid()
    )
);

-- Policy: Delete
-- Users can delete completions if they own the parent habit
create policy "users can delete completions for their habits"
on public.habit_completions for delete
to authenticated
using (
    exists (
        select 1 from public.habits
        where habits.id = habit_completions.habit_id
        and habits.user_id = auth.uid()
    )
);


-- 6. Functions

-- Function: get_habits_with_stats
-- Calculates streak and completion status for a given date.
-- This prevents N+1 queries on the client side.
create or replace function get_habits_with_stats(target_date date)
returns table (
    id uuid,
    title text,
    created_at timestamptz,
    streak_count int,
    completed_today boolean
)
language plpgsql
set search_path = public
as $$
begin
    return query
    with user_habits as (
        -- Select all habits for the current user
        select h.id, h.title, h.created_at
        from habits h
        where h.user_id = auth.uid()
    ),
    completions_cte as (
        -- Select relevant completions for these habits, up to the target date
        select hc.habit_id, hc.completed_date
        from habit_completions hc
        join user_habits uh on uh.id = hc.habit_id
        where hc.completed_date <= target_date
    ),
    -- Determine if completed today (target_date)
    today_status as (
        select habit_id, true as is_completed
        from completions_cte
        where completed_date = target_date
    ),
    -- Calculate streaks
    -- We want the contiguous block of completion dates ending at target_date or target_date - 1
    streak_groups as (
        select
            habit_id,
            completed_date,
            -- Grouping magic: date - row_number gives a constant date for a contiguous sequence
            -- If dates are 2023-01-01, 2023-01-02, 2023-01-03:
            -- 01-01 - 1 = 12-31
            -- 01-02 - 2 = 12-31
            -- 01-03 - 3 = 12-31  <- Same group
            completed_date - cast(row_number() over (partition by habit_id order by completed_date) as int) as grp
        from completions_cte
    ),
    streaks as (
        select
            habit_id,
            count(*) as len,
            max(completed_date) as max_date
        from streak_groups
        group by habit_id, grp
    ),
    current_streaks as (
        select
            habit_id,
            len
        from streaks
        -- A streak is active if it ended today (target_date) OR yesterday (target_date - 1)
        where max_date = target_date or max_date = target_date - 1
    )
    select
        uh.id,
        uh.title,
        uh.created_at,
        coalesce(cs.len, 0)::int as streak_count,
        coalesce(ts.is_completed, false) as completed_today
    from user_habits uh
    left join current_streaks cs on cs.habit_id = uh.id
    left join today_status ts on ts.habit_id = uh.id
    order by uh.created_at asc;
end;
$$;
