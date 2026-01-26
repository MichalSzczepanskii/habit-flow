import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) {
		throw redirect(303, '/login');
	}
	return {};
}) satisfies LayoutServerLoad;
