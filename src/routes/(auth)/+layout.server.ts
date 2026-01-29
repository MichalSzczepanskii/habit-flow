import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { session } = await locals.safeGetSession();
	if (session && url.pathname !== '/update-password') {
		throw redirect(303, '/dashboard');
	}
};
