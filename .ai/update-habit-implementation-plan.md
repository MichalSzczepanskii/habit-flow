# API Endpoint Implementation Plan: Update Habit Title

## 1. Endpoint Overview

This endpoint allows an authenticated user to rename an existing habit. It accepts the habit's ID as a query parameter and the new title in the request body. It ensures that users can only update habits they own via Row-Level Security (RLS).

## 2. Request Details

- **HTTP Method:** `PATCH`
- **URL Structure:** `/rest/v1/habits?id=eq.{id}`
  - _Note: The `id` parameter uses a PostgREST-style filter syntax `eq.{uuid}`. The handler must extract the UUID._
- **Parameters:**
  - **Required:** `id` (Query parameter) - The UUID of the habit to update.
- **Request Body:** JSON
  ```json
  {
  	"title": "New Habit Title"
  }
  ```

## 3. Used Types

- **Command Model (Input):** `UpdateHabitCommand`
  - Defined in `src/lib/data-access/types.ts`.
  - Structure: `{ title: string }`.
- **DTO (Output):** `Habit`
  - Defined in `src/lib/data-access/types.ts`.
  - Represents the full habit entity.

## 3. Response Details

- **Success (200 OK):** Returns the updated `Habit` object in JSON format.
- **Error Codes:**
  - `400 Bad Request`: Invalid ID format or invalid/missing title.
  - `401 Unauthorized`: User is not authenticated.
  - `404 Not Found`: Habit does not exist or belongs to another user.
  - `500 Internal Server Error`: Database or server error.

## 4. Data Flow

1.  **Client** sends `PATCH` request to `/rest/v1/habits`.
2.  **Server (+server.ts)**:
    - Authenticates the user via SvelteKit `locals`.
    - Parses and validates the `id` from the query string (stripping "eq." prefix).
    - Parses and validates the `title` from the request body.
    - Invokes **Supabase Client** to update the `habits` table.
3.  **Database (Supabase)**:
    - Applies **RLS Policy** (`auth.uid() = user_id`) to ensure ownership.
    - Updates the record if found and owned.
    - Returns the updated record.
4.  **Server**: Returns the updated record to the client.

## 5. Security Considerations

- **Authentication:** Strict check for a valid user session. Returns 401 if missing.
- **Authorization:** Relies on Supabase RLS. The query will implicitly fail (return 0 rows) if the user tries to update a habit they do not own.
- **Input Validation:**
  - `id`: Must be a valid UUID.
  - `title`: Must be a non-empty string, max 255 characters (DB constraint).
- **Type Safety:** Uses strict TypeScript types (`UpdateHabitCommand`, `Habit`) derived from the database schema.

## 6. Error Handling

- **Invalid UUID:** If the extracted ID is not a valid UUID, return 400.
- **Validation Failure:** If `title` is empty or too long, return 400 with a descriptive message.
- **Supabase Error:** Catch errors from the `supabase.from(...).update(...)` call.
- **Not Found/No Permission:** If the update operation returns no data (but no DB error), treat it as a 404 (Resource not found or access denied).

## 7. Performance Considerations

- **Indexing:** The update targets the `id` column (Primary Key), ensuring O(1) lookup.
- **Single Round Trip:** The update query uses `.select()` to return the modified row immediately, avoiding a separate GET request.

## 8. Implementation Steps

1.  **Open `src/routes/rest/v1/habits/+server.ts`**:
    - This file likely already exists (based on folder structure). If not, create it.
2.  **Define `PATCH` Handler**:
    - Export a `PATCH` function satisfying `RequestHandler`.
3.  **Authentication Check**:
    - Verify `locals.user` or `locals.safeGetSession()`. Return 401 if null.
4.  **Extract and Validate ID**:
    - Read `url.searchParams.get('id')`.
    - Strip "eq." prefix if present (to handle `id=eq.{uuid}`).
    - Validate the remaining string is a valid UUID. Return 400 if invalid.
5.  **Parse and Validate Body**:
    - read `request.json()`.
    - Cast to `UpdateHabitCommand` (partial).
    - Check if `title` exists, is a string, `trim().length > 0`, and length <= 255.
6.  **Execute Update**:
    - Call `await locals.supabase.from('habits').update({ title }).eq('id', id).select().single()`.
    - Handle the response:
      - If `error`, log it and return 500.
      - If `data` is null (and no error), return 404 (Habit not found or not owned).
7.  **Return Response**:
    - Return `json(data)` with status 200.
