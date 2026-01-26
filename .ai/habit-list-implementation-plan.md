# API Endpoint Implementation Plan: List Habits (Dashboard)

## 1. Endpoint Overview

This endpoint retrieves a list of active habits for the currently authenticated user. It enriches the basic habit data with calculated statistics (streak count and daily completion status) specific to a requested `target_date`. It leverages the Supabase RPC function `get_habits_with_stats` for performant, server-side calculation.

## 2. Request Details

- **HTTP Method:** `GET`
- **URL Structure:** `/rest/v1/habits`
- **Parameters:**
  - **Required (Query Param):** `target_date` - The logical date to check status against (Format: `YYYY-MM-DD`).
- **Request Body:** None.

## 3. Used Types

- **Response DTO:** `HabitWithStats` (from `$lib/data-access/types`)
- **Database RPC:** `get_habits_with_stats` (from `Database` definitions)

## 4. Response Details

- **Success (200 OK):** JSON array of habit objects with statistics.
  ```json
  [
  	{
  		"id": "uuid",
  		"title": "Habit Title",
  		"created_at": "timestamp",
  		"streak_count": 5,
  		"completed_today": true
  	}
  ]
  ```
- **Error Codes:**
  - `400 Bad Request`: Missing or invalid `target_date` format.
  - `401 Unauthorized`: User is not authenticated.
  - `500 Internal Server Error`: Database or RPC failure.

## 5. Data Flow

1.  **Client** sends GET request with `target_date`.
2.  **Server (+server.ts)** validates the session and input parameters.
3.  **Server** invokes `locals.supabase.rpc('get_habits_with_stats', { target_date })`.
4.  **Supabase** executes the SQL function, using the authenticated user's context (`auth.uid()`) to filter habits and calculate stats.
5.  **Server** returns the result as JSON.

## 6. Security Considerations

- **Authentication:** The RPC function implicitly relies on the executing user's identity (`auth.uid()`). Therefore, `locals.safeGetSession()` must successfully return a session. Unlike the `POST` handler (which might have temporary testing bypasses), this endpoint _cannot_ function correctly without a real user session.
- **Input Validation:** `target_date` must be validated to ensure it is a valid date string to prevent potential SQL issues or logic errors in the RPC.

## 7. Error Handling

- **Validation Errors:** Return 400 immediately with a clear message (e.g., "Invalid target_date format").
- **Auth Errors:** Return 401 if `session` is null.
- **RPC Errors:** Log the specific error to the server console and return a generic 500 message to the client.

## 8. Implementation Steps

### Step 1: Open Server File

Edit `src/routes/rest/v1/habits/+server.ts`.

### Step 2: Import Dependencies

Ensure `HabitWithStats` is imported (if needed for type assertion, though usually RPC return types are sufficient) and `json` from `@sveltejs/kit`.

### Step 3: Implement GET Handler

Create an exported `GET` function:

```typescript
export const GET: RequestHandler = async ({ url, locals }) => { ... }
```

### Step 4: Validate Session

Call `await locals.safeGetSession()`. If no session/user, return 401.

### Step 5: Extract and Validate Parameter

1.  Get `target_date` from `url.searchParams`.
2.  Check if it exists.
3.  Validate format using a Regex (e.g., `/^\d{4}-\d{2}-\d{2}$/`) and optionally check if it's a valid calendar date.
4.  Return 400 if invalid.

### Step 6: Call Supabase RPC

Call the RPC function:

```typescript
const { data, error } = await locals.supabase.rpc('get_habits_with_stats', { target_date });
```

### Step 7: Handle RPC Response

- If `error`: Log it and return 500.
- If `data`: Return `json(data)` with 200 status.
