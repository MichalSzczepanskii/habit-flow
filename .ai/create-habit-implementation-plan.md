---
<analysis>
1. **Summary**: The goal is to implement a `POST` endpoint at `/rest/v1/habits` to allow authenticated users to create a new habit.
2. **Parameters**: The endpoint requires a JSON body with a `title` (string).
3. **DTOs/Types**:
    - Input: `CreateHabitCommand` ({ title: string }).
    - Output: `Habit` (Database row including id, dates, etc.).
    - Both are available in `src/lib/data-access/types.ts`.
4. **Logic Location**: The logic will reside in a new SvelteKit server route: `src/routes/rest/v1/habits/+server.ts`.
5. **Validation**:
    - Authentication: Must be logged in (checked via `locals.safeGetSession`).
    - Input: `title` must be a non-empty string. Max length 255 is enforced by DB, but we should probably catch it early or let DB throw. Native JS checks will be used as no validation library is present.
6. **Error Logging**: Console error logging for server-side issues (500s).
7. **Security**:
    - **Authentication**: Strict check for valid session.
    - **Authorization**: Users can only create habits for themselves. `user_id` must be derived from the session, NOT the request body.
8. **Error Scenarios**:
    - 401: No active session.
    - 400: Missing/invalid `title`.
    - 500: Database insertion failed.
</analysis>
---

# API Endpoint Implementation Plan: Create Habit

## 1. Endpoint Overview

This endpoint allows an authenticated user to create a new habit definition by providing a title. The system assigns the habit to the current user and persists it in the database.

## 2. Request Details

- **HTTP Method:** `POST`
- **URL Structure:** `/rest/v1/habits`
- **Parameters:** None (path/query)
- **Request Body:** JSON

  ```json
  {
   "title": "Read 10 pages"
  }
  ```

  - `title` (Required, String): The name of the habit.

## 3. Used Types

From `@src/lib/data-access/types.ts`:

- **Input:** `CreateHabitCommand`
- **Output:** `Habit`

## 3. Response Details

- **Success (201 Created):**
  - Returns the created `Habit` object in JSON format.

  ```json
  {
   "id": "...",
   "user_id": "...",
   "title": "Read 10 pages",
   "created_at": "...",
   "updated_at": "..."
  }
  ```

- **Error Codes:**
  - `400 Bad Request`: Invalid input (e.g., missing title).
  - `401 Unauthorized`: User is not logged in.
  - `500 Internal Server Error`: Database or server failure.

## 4. Data Flow

1. **Client** sends `POST` request with JSON body.
2. **Server (`+server.ts`)** validates the user's session using `locals.safeGetSession()`.
3. **Server** validates the request body (checks `title`).
4. **Server** calls Supabase to insert the new row into `public.habits`, setting `user_id` from the session.
5. **Database** returns the created row.
6. **Server** returns the row as JSON with status 201.

## 5. Security Considerations

- **Authentication**: Strict session validation is required. If `session` or `user` is null, reject immediately with 401.
- **Data Integrity**: The `user_id` for the new habit MUST be taken from the authenticated user's session (`user.id`). Never trust a `user_id` sent in the request body (if any).
- **Input Validation**: Ensure `title` is a string and not empty to prevent inserting bad data.

## 6. Error Handling

- **401 Unauthorized**:
  - Condition: `session` is null.
  - Action: Return JSON `{ error: 'Unauthorized' }`.
- **400 Bad Request**:
  - Condition: Body parsing fails, `title` is missing, or `title` is not a string.
  - Action: Return JSON `{ error: 'Title is required' }`.
- **500 Internal Server Error**:
  - Condition: Supabase returns an error (e.g., connection issue).
  - Action: Log the actual error to console; return generic JSON `{ error: 'Internal Server Error' }`.

## 7. Performance Considerations

- The operation involves a single database write.
- Using `select().single()` ensures we get the created record back immediately without a separate read query.

## 8. Implementation Steps

1. **Create File**: Create `src/routes/rest/v1/habits/+server.ts`.
2. **Define POST Handler**: Export a `POST` function satisfying the `RequestHandler` interface.
3. **Auth Check**:
    - Destructure `safeGetSession` from `locals`.
    - Await session retrieval.
    - If no session, return `json({ error: 'Unauthorized' }, { status: 401 })`.
4. **Parse & Validate Input**:
    - Await `request.json()`.
    - Check if `title` exists and is a string.
    - If invalid, return `json({ error: 'Invalid input' }, { status: 400 })`.
5. **Perform Insert**:
    - Use `locals.supabase.from('habits')`.
    - Insert `{ title, user_id: session.user.id }`.
    - Chain `.select().single()`.
6. **Handle DB Result**:
    - If `error`, log it and return 500.
    - If `data`, return `json(data, { status: 201 })`.
