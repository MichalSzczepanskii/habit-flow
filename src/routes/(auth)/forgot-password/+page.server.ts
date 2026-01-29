import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email) {
			return fail(400, { email, message: 'Please provide your email address.' });
		}

		const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${url.origin}/auth/callback?next=/update-password`
		});

		if (error) {
			return fail(500, { email, message: 'Something went wrong. Please try again later.' });
		}

		return { success: true, email };
	}
} satisfies Actions;
