# Database Schema - HabitFlow

This schema is designed for PostgreSQL (Supabase) to support the HabitFlow MVP. It leverages `auth.users` for identity, strict Row-Level Security (RLS) for data protection, and normalized tables for habit tracking.

## 1. Tables

### `public.habits`

Stores the definition of habits created by users.

| Column       | Data Type     | Constraints                                     | Description                        |
| :----------- | :------------ | :---------------------------------------------- | :--------------------------------- |
| `id`         | `UUID`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`      | Unique identifier for the habit.   |
| `user_id`    | `UUID`        | `NOT NULL`, `REFERENCES auth.users(id)`         | Foreign key to Supabase Auth user. |
| `title`      | `TEXT`        | `NOT NULL`, `CHECK (char_length(title) <= 255)` | The name/goal of the habit.        |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()`                     | Creation timestamp.                |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()`                     | Last update timestamp.             |

### `public.habit_completions`

Logs daily completions for habits.

| Column           | Data Type     | Constraints                                | Description                                                                             |
| :--------------- | :------------ | :----------------------------------------- | :-------------------------------------------------------------------------------------- |
| `id`             | `UUID`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the completion record.                                            |
| `habit_id`       | `UUID`        | `NOT NULL`, `REFERENCES public.habits(id)` | Foreign key to the parent habit.                                                        |
| `completed_date` | `DATE`        | `NOT NULL`                                 | The "Logical Date" of completion (calculated by client/API to account for 3 AM offset). |
| `created_at`     | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()`                | Audit timestamp of when the button was clicked (real time).                             |

**Table Constraints:**

- **Unique Completion:** `UNIQUE (habit_id, completed_date)` - Prevents multiple check-ins for the same habit on the same logical day.

## 2. Relationships

| Source Table               | Source Column | Target Table    | Target Column | Cardinality | Delete Behavior                                            |
| :------------------------- | :------------ | :-------------- | :------------ | :---------- | :--------------------------------------------------------- |
| `public.habits`            | `user_id`     | `auth.users`    | `id`          | Many-to-One | `ON DELETE CASCADE` (Deleting a user deletes their habits) |
| `public.habit_completions` | `habit_id`    | `public.habits` | `id`          | Many-to-One | `ON DELETE CASCADE` (Deleting a habit deletes its history) |

## 3. Indexes

To ensure performance for dashboard loading and streak calculations:

- **`habits_user_id_created_at_idx`**:
  - **On:** `public.habits (user_id, created_at)`
  - **Purpose:** Optimizes fetching a user's list of habits, sorted by creation time.
- **`habit_completions_habit_id_completed_date_idx`**:
  - **On:** `public.habit_completions (habit_id, completed_date DESC)`
  - **Purpose:** Critical for efficient streak calculation queries which often look for the most recent dates first.

## 4. PostgreSQL Policies (Row-Level Security)

RLS is enabled on all public tables to ensure strict data isolation.

### `public.habits`

- **Enable RLS:** `ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;`
- **Policy: Users can only manage their own habits**
  - **Action:** `ALL` (SELECT, INSERT, UPDATE, DELETE)
  - **Using/Check:** `auth.uid() = user_id`

### `public.habit_completions`

- **Enable RLS:** `ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;`
- **Policy: Users can only manage completions for their own habits**
  - **Action:** `ALL`
  - **Using/Check:**
    ```sql
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE id = habit_completions.habit_id
      AND user_id = auth.uid()
    )
    ```

## 5. Functions & Logic

### Streak Calculation (RPC)

A database function will be used to fetch habits with their current computed streaks to avoid complex N+1 queries on the client.

**Function Signature (Conceptual):**

```sql
FUNCTION get_habits_with_stats(target_date DATE)
RETURNS TABLE (
  id UUID,
  title TEXT,
  created_at TIMESTAMPTZ,
  streak_count INT,
  completed_today BOOLEAN
)
```

**Logic:**

1. Joins `habits` with `habit_completions`.
2. Calculates `completed_today`: True if a record exists for `habit_id` and `target_date`.
3. Calculates `streak_count`: Counts contiguous `completed_date` records working backwards from `target_date`.
   - If `completed_today` is true, streak includes today.
   - If not, check if completed yesterday (`target_date - 1`). If yes, streak continues from there.
   - If neither, streak is 0.

## 6. Design Notes

- **Date Handling:** The database stores `DATE` types for `completed_date`. The application logic (Client/API) is responsible for determining _which_ date to send based on the user's local time and the 3:00 AM grace period rule. The DB does not perform timezone conversions.
- **Performance:** Denormalization (storing a current `streak` integer on the `habits` table) was considered but rejected for the MVP in favor of accurate on-the-fly calculation to prevent sync issues. The index on `completed_date` ensures this calculation remains fast.
- **Scalability:** The schema relies on standard UUIDs and indexed foreign keys, making it suitable for standard partitioning or sharding strategies if the user base grows significantly, though that is out of scope for MVP.
