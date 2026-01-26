# REST API Plan

## 1. Resources

| Resource        | Database Table             | Description                                                       |
| :-------------- | :------------------------- | :---------------------------------------------------------------- |
| **Auth**        | `auth.users`               | User identity and session management (handled via Supabase Auth). |
| **Habits**      | `public.habits`            | Core entity representing a daily goal.                            |
| **Completions** | `public.habit_completions` | Records of daily habit fulfillment.                               |

## 2. Endpoints

### 2.1 Habits

#### List Habits (Dashboard)

Retrieves all active habits for the current user, including calculated streak data and completion status for a specific target date. This endpoint utilizes the `get_habits_with_stats` database function to ensure performance.

- **HTTP Method:** `GET`
- **URL Path:** `/rest/v1/rpc/get_habits_with_stats` (Supabase RPC endpoint) or wrapped as `/api/habits`
- **Query Parameters:**
  - `target_date` (Required): The logical date (YYYY-MM-DD) to check completion status against (calculated by client respecting 3 AM rule).
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Drink 2L Water",
      "created_at": "2026-01-01T10:00:00Z",
      "streak_count": 5,
      "completed_today": true
    },
    ...
  ]
  ```

#### Create Habit

Creates a new habit definition.

- **HTTP Method:** `POST`
- **URL Path:** `/rest/v1/habits`
- **JSON Request Payload:**
  ```json
  {
  	"title": "Read 10 pages"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
  	"id": "550e8400-e29b-41d4-a716-446655440000",
  	"user_id": "user-uuid-123",
  	"title": "Read 10 pages",
  	"created_at": "2026-01-25T12:00:00Z",
  	"updated_at": "2026-01-25T12:00:00Z"
  }
  ```

#### Update Habit Title

Renames an existing habit.

- **HTTP Method:** `PATCH`
- **URL Path:** `/rest/v1/habits?id=eq.{id}`
- **JSON Request Payload:**
  ```json
  {
  	"title": "Read 15 pages"
  }
  ```
- **Success Response (200 OK):**
  - Returns the updated habit object.

#### Delete Habit

Permanently removes a habit and all its associated history (cascading delete).

- **HTTP Method:** `DELETE`
- **URL Path:** `/rest/v1/habits?id=eq.{id}`
- **Success Response (204 No Content):**
  - Empty body.

### 2.2 Completions

#### Mark Habit Complete (Check-in)

Logs a completion for a specific habit on a specific date.

- **HTTP Method:** `POST`
- **URL Path:** `/rest/v1/habit_completions`
- **JSON Request Payload:**
  ```json
  {
  	"habit_id": "550e8400-e29b-41d4-a716-446655440000",
  	"completed_date": "2026-01-25"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
  	"id": "completion-uuid-789",
  	"habit_id": "550e8400-e29b-41d4-a716-446655440000",
  	"completed_date": "2026-01-25",
  	"created_at": "2026-01-25T14:30:00Z"
  }
  ```
- **Error Responses:**
  - `409 Conflict`: If a completion already exists for this habit and date.

#### Unmark Habit (Undo Check-in)

Removes the completion record for a specific habit and date.

- **HTTP Method:** `DELETE`
- **URL Path:** `/rest/v1/habit_completions?habit_id=eq.{habit_id}&completed_date=eq.{date}`
- **Query Parameters:**
  - `habit_id`: UUID of the habit.
  - `completed_date`: YYYY-MM-DD date to remove.
- **Success Response (204 No Content):**
  - Empty body.

### 2.3 User Management

#### Delete Account

Triggers the deletion of the user account. This is typically handled via the Supabase Admin API (server-side) or a specific RPC if exposed, as standard clients cannot delete their own `auth.users` record directly without configuration. For this MVP, we will assume a server-side route.

- **HTTP Method:** `DELETE`
- **URL Path:** `/api/auth/user` (SvelteKit Server Route)
- **Description:** Server-side handler calls `supabase.auth.admin.deleteUser(id)`.
- **Success Response (200 OK):**
  ```json
  { "message": "Account deleted successfully." }
  ```

## 3. Authentication and Authorization

### Mechanism

- **Session Persistence (SvelteKit):** HTTP-only Cookies (handled by `@supabase/ssr`).
  - This is the primary authentication method for the SvelteKit application, allowing the server (SSR) to access user sessions and protect routes.
- **API Transport (Supabase):** JWT (JSON Web Tokens).
  - While the app uses cookies, the underlying Supabase API (PostgREST) requires a JWT.

### Implementation

- The **Supabase SDK** (`@supabase/ssr`) acts as the bridge:
  1.  It manages the session token inside an HTTP-only cookie.
  2.  For every request to the database, it automatically extracts the JWT from the cookie.
  3.  It sends the JWT in the `Authorization: Bearer <token>` header to Supabase.
- **Row-Level Security (RLS):** Policies rely on this JWT (`auth.uid()`) to validate access.

### Row-Level Security (RLS)

Database policies enforce authorization at the row level:

- **`habits`**: Users can only Select, Insert, Update, or Delete rows where `user_id` matches their auth UID.
- **`habit_completions`**: Users can only Insert or Delete rows where the linked `habit_id` belongs to them.

## 4. Validation and Business Logic

### Data Validation

- **Habit Title:**
  - Must not be empty.
  - Maximum length: 255 characters (enforced by DB check).
- **Date Format:**
  - Must be a valid `YYYY-MM-DD` string.
- **Duplicate Prevention:**
  - `habit_completions` table enforces `UNIQUE(habit_id, completed_date)` to prevent double-counting.

### Business Logic Implementation

1.  **Streak Calculation:**
    - **Where:** Database Level (PostgreSQL Function `get_habits_with_stats`).
    - **Logic:**
      - Input: `target_date`.
      - Algorithm: Checks if `completed_date` exists for `target_date`. If yes, streak starts counting backward from `target_date`. If no, checks `target_date - 1`. If that exists, counts backward from there. If neither, streak = 0.
    - **Benefit:** Eliminates N+1 query problem and ensures consistent calculation.

2.  **3:00 AM Grace Period:**
    - **Where:** Client-side & API Parameter.
    - **Logic:** The client determines the "Logical Date".
      - _Example:_ If user checks in at 2:00 AM on Jan 26th, client calculates `Logical Date = Jan 25th` and sends `2026-01-25` to the API.
    - **API Role:** The API blindly accepts the `completed_date` provided, assuming the client has applied the offset logic correctly.

3.  **Progress Bar:**
    - **Where:** Client-side.
    - **Logic:** Calculated from the response of `get_habits_with_stats`.
    - `Progress = (Count of habits with 'completed_today' == true) / (Total active habits) * 100`.
