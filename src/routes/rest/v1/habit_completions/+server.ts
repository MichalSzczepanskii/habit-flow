import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Regex for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidUUID(uuid: unknown): uuid is string {
	return typeof uuid === 'string' && UUID_REGEX.test(uuid);
}

function isValidDate(date: unknown): date is string {
	return typeof date === 'string' && DATE_REGEX.test(date);
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { habit_id, completed_date } = body;

	if (!isValidUUID(habit_id)) {
		return json({ error: 'Invalid habit_id format' }, { status: 400 });
	}

	if (!isValidDate(completed_date)) {
		return json({ error: 'Invalid completed_date format. Expected YYYY-MM-DD' }, { status: 400 });
	}

	const { data, error } = await locals.supabase
		.from('habit_completions')
		.insert({
			habit_id,
			completed_date
		})
		.select()
		.single();

	if (error) {
		if (error.code === '23505') {
			return json({ error: 'Habit already completed on this date' }, { status: 409 });
		}
		console.error('Error creating habit completion:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}

	return json(data, { status: 201 });
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const habit_id = url.searchParams.get('habit_id');
	const completed_date = url.searchParams.get('completed_date');

	if (!isValidUUID(habit_id)) {
		return json({ error: 'Invalid or missing habit_id' }, { status: 400 });
	}

	if (!isValidDate(completed_date)) {
		return json(
			{ error: 'Invalid or missing completed_date. Expected YYYY-MM-DD' },
			{ status: 400 }
		);
	}

	// We use .select() to check if a row was actually deleted.
	// Supabase delete returns the deleted rows if .select() is chained.
	const { data, error } = await locals.supabase
		.from('habit_completions')
		.delete()
		.eq('habit_id', habit_id)
		.eq('completed_date', completed_date)
		.select()
		.maybeSingle();

	if (error) {
		console.error('Error deleting habit completion:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}

	if (!data) {
		return json({ error: 'Completion not found' }, { status: 404 });
	}

	return new Response(null, { status: 204 });
};
