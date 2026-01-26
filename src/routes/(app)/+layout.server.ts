import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	// TODO: implementation of route protection
	// const { session } = await locals.safeGetSession();
	// if (!session) {
	//    throw redirect(303, '/login');
	// }
	return {};
}) satisfies LayoutServerLoad;
