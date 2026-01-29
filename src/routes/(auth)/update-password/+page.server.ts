import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) {
		throw redirect(303, '/login');
	}
};

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!password || !confirmPassword) {
			return fail(400, { message: 'Please provide both password and confirmation.' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match.' });
		}

		const { error } = await locals.supabase.auth.updateUser({
			password: password
		});

		if (error) {
			return fail(500, { message: 'Failed to update password. Please try again later.' });
		}

		throw redirect(303, '/dashboard');
	}
} satisfies Actions;
