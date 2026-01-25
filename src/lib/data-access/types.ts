import type { Database, Tables, TablesInsert, TablesUpdate } from './database.types';

/**
 * ==========================================
 * Domain Transfer Objects (DTOs)
 * ==========================================
 * These types represent the shape of data returned by the API.
 * They are strictly typed against the Supabase database schema.
 */

/**
 * Represents a standard Habit entity.
 * Used in responses for Create/Update operations.
 */
export type Habit = Tables<'habits'>;

/**
 * Represents a Habit Completion record.
 * Used in responses for Mark Complete operations.
 */
export type HabitCompletion = Tables<'habit_completions'>;

/**
 * Represents a Habit with calculated statistics (Dashboard view).
 * Derived from the 'get_habits_with_stats' RPC function return type.
 */
type GetHabitsWithStatsResponse = Database['public']['Functions']['get_habits_with_stats']['Returns'];
export type HabitWithStats = GetHabitsWithStatsResponse extends (infer U)[] ? U : never;

/**
 * ==========================================
 * Command Models (Write Models)
 * ==========================================
 * These types represent the payloads sent to the API to perform actions.
 * They are derived from the Database Insert/Update types but narrowed
 * to only include fields exposed by the API contract.
 */

/**
 * Payload for creating a new habit.
 * API Endpoint: POST /rest/v1/habits
 */
export type CreateHabitCommand = Pick<TablesInsert<'habits'>, 'title'>;

/**
 * Payload for updating an existing habit's title.
 * API Endpoint: PATCH /rest/v1/habits?id=eq.{id}
 */
export type UpdateHabitCommand = Pick<TablesUpdate<'habits'>, 'title'>;

/**
 * Payload for marking a habit as complete.
 * API Endpoint: POST /rest/v1/habit_completions
 */
export type MarkHabitCompleteCommand = Pick<TablesInsert<'habit_completions'>, 'habit_id' | 'completed_date'>;
