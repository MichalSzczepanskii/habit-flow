import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { CreateHabitCommand, HabitWithStats } from '$lib/data-access/types';

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
	// const { session, user } = await locals.safeGetSession();

	// if (!session || !user) {
	//     return json({ error: 'Unauthorized' }, { status: 401 });
	// }

	// DEBUG: Default User ID for testing.
	// WARNING: This user_id MUST exist in auth.users for the foreign key constraint.
	// WARNING: RLS policies on the 'habits' table might block this insert if you are using the anon client.
	const DEFAULT_USER_ID = '134c647c-f70b-4d2b-8838-ffb33b3a71de';

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
			user_id: DEFAULT_USER_ID
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
