# API Endpoint Implementation Plan: Delete Habit

## 1. Endpoint Overview

This endpoint allows a user to permanently delete a specific habit. Due to the database's cascading delete configuration, deleting a habit will automatically remove all associated completion history (streak data) for that habit. This action is irreversible.

## 2. Request Details

- **HTTP Method:** `DELETE`
- **URL Structure:** `/rest/v1/habits`
- **Parameters:**
  - **Required (Query):** `id`
    - **Format:** UUID string, optionally prefixed with `eq.` to match PostgREST/Supabase syntax (e.g., `eq.550e8400-e29b-41d4-a716-446655440000` or just `550e8400-e29b-41d4-a716-446655440000`).
- **Request Body:** None.

## 3. Used Types

- **DTOs:** None (Response body is empty).
- **Command Models:** None (ID is passed via query params).

## 4. Response Details

- **Success (204 No Content):** The habit was successfully deleted. No body returned.
- **Client Error (400 Bad Request):** Missing `id` parameter or invalid UUID format.
- **Unauthorized (401 Unauthorized):** User is not logged in.
- **Not Found (404 Not Found):** The habit with the specified ID does not exist or does not belong to the authenticated user.
- **Server Error (500 Internal Server Error):** Unexpected database or server error.

## 5. Data Flow

1.  **Client** sends `DELETE` request with `id` query parameter.
2.  **Server (`+server.ts`)** authenticates the user via `locals.safeGetSession()`.
3.  **Server** validates the `id` format (stripping `eq.` prefix if present).
4.  **Server** executes Supabase query: `delete` on `habits` table, matching `id` and implicitly filtered by RLS (user_id).
    - `select()` is chained to confirm if a row was actually deleted.
5.  **Database** enforces `ON DELETE CASCADE` to remove related `habit_completions`.
6.  **Server** checks if a row was returned.
    - If yes: Returns 204.
    - If no: Returns 404.

## 6. Security Considerations

- **Authentication:** Strict check for `session` existence.
- **Authorization (RLS):** The database RLS policy (`auth.uid() = user_id`) prevents users from deleting habits they do not own. The server code does not need manual ownership checks beyond handling the "0 rows deleted" case.
- **Input Validation:** Strict Regex validation for UUID format prevents SQL injection or malformed query errors.

## 7. Error Handling

- **Missing/Invalid ID:** Return 400 with a clear error message.
- **Unauthorized:** Return 401 immediately.
- **Not Found:** If the Supabase delete operation returns no rows (meaning the ID didn't exist or wasn't owned by the user), return 404. This provides better feedback than a silent 204.
- **Database Errors:** Catch generic errors and log them to the console; return 500 to the client.

## 8. Implementation Steps

1.  **Modify `src/routes/rest/v1/habits/+server.ts`**:
    - Add the `DELETE` export to the existing file.
    - Copy the Authentication logic from `GET`/`PATCH`.
    - Implement ID extraction logic (reuse or refactor from `PATCH`).
      - Check for `id` param.
      - Handle `eq.` prefix.
      - Validate UUID regex.
    - Call Supabase:
      ```typescript
      const { data, error } = await locals.supabase
      	.from('habits')
      	.delete()
      	.eq('id', id)
      	.select()
      	.single();
      ```
    - Handle `error`:
      - If `error.code === 'PGRST116'`, return 404 (Not Found).
      - Else, log error and return 500.
    - Return `new Response(null, { status: 204 })` on success.

<analysis>
1.  **Summary:** The goal is to implement a DELETE endpoint for habits.
2.  **Parameters:** `id` (Query, required).
3.  **Types:** No specific DTOs needed for the response (empty).
4.  **Service Extraction:** Logic will reside in `+server.ts` following existing pattern. ID validation could be refactored if strictly necessary, but duplication is minimal for now.
5.  **Validation:** UUID regex check is crucial.
6.  **Logging:** `console.error` for 500s.
7.  **Security:** RLS is the primary defense. Auth check ensures `auth.uid()` is available.
8.  **Errors:** 400 (Bad ID), 401 (No Auth), 404 (Not Found), 500 (Server).

Refined the plan to be explicit about `select().single()` usage to detect 404s, aligning with the `PATCH` implementation style.
</analysis>
