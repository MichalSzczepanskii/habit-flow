import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	updatePassword: async ({ request }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;

		// Backend logic will be implemented later.
		return fail(501, { message: 'Update password logic not yet implemented.' });
	},
	deleteAccount: async ({ request }) => {
		// Backend logic will be implemented later.
		return fail(501, { message: 'Delete account logic not yet implemented.' });
	}
} satisfies Actions;
