import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { CreateHabitCommand } from '$lib/data-access/types';

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
