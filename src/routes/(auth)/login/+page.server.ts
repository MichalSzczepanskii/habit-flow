import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AuthApiError } from '@supabase/supabase-js';

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { email, message: 'Please provide both email and password.' });
		}

		const { error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, { email, message: 'Invalid email or password.' });
			}
			return fail(500, { email, message: 'Something went wrong. Please try again later.' });
		}

		throw redirect(303, '/dashboard');
	}
} satisfies Actions;
