import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        
        // Backend logic will be implemented later.
        return fail(501, { email, message: 'Password reset logic not yet implemented.' });
    }
} satisfies Actions;
