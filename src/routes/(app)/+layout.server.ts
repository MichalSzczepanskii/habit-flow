import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session) {
		throw redirect(303, '/login');
	}
	return {
		user
	};
}) satisfies LayoutServerLoad;
