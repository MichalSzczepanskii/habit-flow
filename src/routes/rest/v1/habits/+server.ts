import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type {
	CreateHabitCommand,
	HabitWithStats,
	UpdateHabitCommand
} from '$lib/data-access/types';

/**
 * GET /rest/v1/habits
 *
 * Retrieves a list of active habits for the authenticated user,
 * enriched with statistics (streak, completion status) for a specific date.
 *
 * Query Parameters:
 * - target_date: string (YYYY-MM-DD) - Required. The reference date for stats.
 *
 * Response:
 * - 200 OK: Array of HabitWithStats objects.
 * - 400 Bad Request: Missing or invalid target_date.
 * - 401 Unauthorized: User is not logged in.
 * - 500 Internal Server Error: Database or RPC failure.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	// 1. Authentication Check
	const { session } = await locals.safeGetSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// 2. Validate and Extract Parameters
	const targetDate = url.searchParams.get('target_date');

	if (!targetDate) {
		return json({ error: 'Missing target_date parameter' }, { status: 400 });
	}

	// Regex for YYYY-MM-DD format
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(targetDate)) {
		return json({ error: 'Invalid target_date format. Expected YYYY-MM-DD' }, { status: 400 });
	}

	// Validate that it is a real date
	const date = new Date(targetDate);
	if (isNaN(date.getTime())) {
		return json({ error: 'Invalid date value' }, { status: 400 });
	}

	// 3. Call Supabase RPC
	const { data, error } = await locals.supabase.rpc('get_habits_with_stats', {
		target_date: targetDate
	});

	// 4. Handle Errors
	if (error) {
		console.error('Error fetching habits with stats:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}

	// 5. Success Response
	return json(data as HabitWithStats[]);
};

/**
 * POST /rest/v1/habits
 *
 * Creates a new habit for the authenticated user.
 *
 * Request Body:
 * {
 *   "title": "Habit Title"
 * }
 *
 * Response:
 * - 201 Created: The created habit object.
 * - 400 Bad Request: If title is missing or invalid.
 * - 401 Unauthorized: If the user is not logged in.
 * - 500 Internal Server Error: If the database operation fails.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// 1. Authentication Check (BYPASSED FOR TESTING)
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// 2. Input Parsing and Validation
	let body: CreateHabitCommand;
	try {
		body = await request.json();
	} catch {
		// Handle malformed JSON
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { title } = body;

	// Validate that title is a non-empty string
	if (!title || typeof title !== 'string' || title.trim() === '') {
		return json({ error: 'Title is required' }, { status: 400 });
	}

	// 3. Database Insertion
	// We explicitly set the user_id from the default ID.
	const { data, error } = await locals.supabase
		.from('habits')
		.insert({
			title: title.trim(),
			user_id: user.id
		})
		.select()
		.single();

	// 4. Error Handling
	if (error) {
		// Log the actual error for server-side debugging
		console.error('Error creating habit in database:', error);

		// Return a generic error message to the client
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}

	// 5. Success Response
	return json(data, { status: 201 });
};

/**
 * PATCH /rest/v1/habits?id=eq.{id}
 *
 * Updates an existing habit's title.
 *
 * Request Body:
 * {
 *   "title": "New Habit Title"
 * }
 *
 * Query Parameters:
 * - id: string (UUID) - Required. Format: 'eq.{uuid}' or just '{uuid}'.
 *
 * Response:
 * - 200 OK: The updated habit object.
 * - 400 Bad Request: Invalid ID or title.
 * - 401 Unauthorized: User is not logged in.
 * - 404 Not Found: Habit does not exist or user is not the owner.
 * - 500 Internal Server Error: Database failure.
 */
export const PATCH: RequestHandler = async ({ url, request, locals }) => {
	// 1. Authentication Check
	const { session } = await locals.safeGetSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// 2. Extract and Validate ID
	const idParam = url.searchParams.get('id');

	if (!idParam) {
		return json({ error: 'Missing id parameter' }, { status: 400 });
	}

	// Strip "eq." prefix if present
	let id = idParam;
	if (id.startsWith('eq.')) {
		id = id.slice(3);
	}

	// Validate UUID format
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(id)) {
		return json({ error: 'Invalid ID format' }, { status: 400 });
	}

	// 3. Parse and Validate Body
	let body: UpdateHabitCommand;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { title } = body;

	// Validate title
	if (!title || typeof title !== 'string' || title.trim().length === 0) {
		return json({ error: 'Title is required' }, { status: 400 });
	}
	if (title.length > 255) {
		return json({ error: 'Title must be 255 characters or less' }, { status: 400 });
	}

	// 4. Execute Update
	// RLS ensures users can only update their own habits
	const { data, error } = await locals.supabase
		.from('habits')
		.update({ title: title.trim() })
		.eq('id', id)
		.select()
		.single();

	// 5. Handle Errors
	if (error) {
		// PGRST116: JSON object requested, multiple (or no) rows returned
		// In this context (update .eq().single()), it implies no row was found/updated.
		if (error.code === 'PGRST116') {
			return json({ error: 'Habit not found or not owned by user' }, { status: 404 });
		}

		console.error('Error updating habit:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}

	// 6. Success Response
	return json(data);
};

/**
 * DELETE /rest/v1/habits
 *
 * Deletes a specific habit.
 *
 * Query Parameters:
 * - id: string (UUID) - Required. Format: 'eq.{uuid}' or just '{uuid}'.
 *
 * Response:
 * - 204 No Content: Habit successfully deleted.
 * - 400 Bad Request: Missing or invalid ID.
 * - 401 Unauthorized: User is not logged in.
 * - 404 Not Found: Habit does not exist or user is not the owner.
 * - 500 Internal Server Error: Database failure.
 */
export const DELETE: RequestHandler = async ({ url, locals }) => {
	// 1. Authentication Check
	const { session } = await locals.safeGetSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// 2. Extract and Validate ID
	const idParam = url.searchParams.get('id');

	if (!idParam) {
		return json({ error: 'Missing id parameter' }, { status: 400 });
	}

	// Strip "eq." prefix if present
	let id = idParam;
	if (id.startsWith('eq.')) {
		id = id.slice(3);
	}

	// Validate UUID format
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(id)) {
		return json({ error: 'Invalid ID format' }, { status: 400 });
	}

	// 3. Execute Delete
	const { error } = await locals.supabase.from('habits').delete().eq('id', id).select().single();

	// 4. Handle Errors
	if (error) {
		// PGRST116: JSON object requested, multiple (or no) rows returned
		// In this context (delete .eq().single()), it implies no row was found/deleted.
		if (error.code === 'PGRST116') {
			return json({ error: 'Habit not found or not owned by user' }, { status: 404 });
		}

		console.error('Error deleting habit:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}

	// 5. Success Response
	return new Response(null, { status: 204 });
};
