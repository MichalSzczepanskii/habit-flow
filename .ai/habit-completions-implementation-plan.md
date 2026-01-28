# API Endpoint Implementation Plan: Habit Completions (Check-in)

## 1. Endpoint Overview

This plan covers the `habit_completions` resource, providing endpoints to toggle the completion status of a habit for a specific date. This directly implements "US-009 Daily Check-in".

- **POST /rest/v1/habit_completions**: Marks a habit as complete.
- **DELETE /rest/v1/habit_completions**: Removes the completion mark.

## 2. Request Details

### POST (Mark Complete)

- **Method**: `POST`
- **URL**: `/rest/v1/habit_completions`
- **Headers**: `Content-Type: application/json`
- **Body**:

  ```json
  {
  	"habit_id": "uuid-string",
  	"completed_date": "YYYY-MM-DD"
  }
  ```

### DELETE (Unmark)

- **Method**: `DELETE`
- **URL**: `/rest/v1/habit_completions`
- **Query Parameters**:
  - `habit_id`: UUID of the habit.
  - `completed_date`: YYYY-MM-DD date of completion to remove.

## 3. Used Types

- **MarkHabitCompleteCommand**: `{ habit_id: string; completed_date: string; }`
- **HabitCompletion**: Database row shape.

## 4. Response Details

### POST Success (201 Created)

Returns the created completion record.

```json
{
	"id": "uuid",
	"habit_id": "uuid",
	"completed_date": "2026-01-28",
	"created_at": "timestamp"
}
```

### DELETE Success (204 No Content)

Empty body.

### Error Responses

- **400 Bad Request**: `{ "error": "Invalid format..." }`
- **401 Unauthorized**: `{ "error": "Unauthorized" }`
- **409 Conflict**: `{ "error": "Habit already completed on this date" }` (POST only)
- **404 Not Found**: `{ "error": "Completion not found" }` (DELETE only)
- **500 Internal Server Error**: `{ "error": "Internal Server Error" }`

## 5. Data Flow

1. **Client Request**: SvelteKit receives request at `+server.ts`.
2. **Auth Check**: Server validates session via `locals.safeGetSession`.
3. **Validation**: Server validates UUID and Date formats.
4. **Database Interaction**:
   - **POST**: Calls `supabase.from('habit_completions').insert(...)`.
   - **DELETE**: Calls `supabase.from('habit_completions').delete().eq(...).eq(...)`.
5. **RLS Enforcement**: Supabase Postgres ensures user owns the related `habit`.
6. **Response**: Server returns JSON result or Error.

## 6. Security Considerations

- **Authentication**: Strict check for active session before processing.
- **Authorization**: Relies on Row-Level Security (RLS) policies defined in `db-plan.md`. Users can only insert/delete completions for habits they own (`habit.user_id = auth.uid()`).
- **Input Validation**: Strict regex validation for UUIDs and Dates to prevent invalid data reaching the DB.

## 7. Error Handling

- **Duplicate Check-in**: Catch Postgres error code `23505` (Unique Violation) on POST and return `409 Conflict`.
- **Invalid Data**: Return `400` immediately if validation fails.
- **Silent Failures**: For DELETE, if the record doesn't exist, Supabase might return success (0 rows deleted) or error depending on configuration. We should check if a row was actually deleted (using `.select()`) and return `404` if not found, to be explicit.

## 8. Implementation Steps

1. **Create Directory**: Ensure `src/routes/rest/v1/habit_completions` exists.
2. **Create Server File**: Create `src/routes/rest/v1/habit_completions/+server.ts`.
3. **Implement POST**:
   - Add auth check.
   - Parse and validate JSON body (`habit_id`, `completed_date`).
   - Perform `insert` via Supabase client.
   - Handle unique constraint error (409).
   - Return 201 with data.
4. **Implement DELETE**:
   - Add auth check.
   - Parse and validate query params.
   - Perform `delete` via Supabase client matching both `habit_id` and `completed_date`.
   - Check if a row was returned/deleted. If not, return 404.
   - Return 204.
5. **Manual Verification**: Use `curl` or Postman to test both endpoints.
