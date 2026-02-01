import { createClient } from '@supabase/supabase-js';

import { test as teardown } from '@playwright/test';

teardown('delete database', async () => {
	console.log('Global teardown: Cleaning up database...');

	const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
	const email = process.env.E2E_USERNAME;
	const password = process.env.E2E_PASSWORD;

	if (!supabaseUrl || !supabaseKey || !email || !password) {
		console.warn('Skipping Supabase cleanup: Missing environment variables.');
		return;
	}

	const supabase = createClient(supabaseUrl, supabaseKey);

	const {
		data: { session },
		error: signInError
	} = await supabase.auth.signInWithPassword({
		email,
		password
	});

	if (signInError || !session) {
		throw new Error(`Cleanup failed: Could not sign in. ${signInError?.message}`);
	}

	const { error } = await supabase
		.from('habits')
		.delete()
		.eq('user_id', process.env.E2E_USERNAME_ID);

	if (error) {
		console.error('Error deleting habits:', error);
		throw error;
	}
});
