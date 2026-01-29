import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AuthApiError } from '@supabase/supabase-js';

export const actions = {
	updatePassword: async ({ request, locals }) => {
		const formData = await request.formData();
		const currentPassword = formData.get('currentPassword') as string;
		const newPassword = formData.get('newPassword') as string;
		const confirmNewPassword = formData.get('confirmNewPassword') as string;

		if (!currentPassword || !newPassword || !confirmNewPassword) {
			return fail(400, { message: 'Please provide all password fields.' });
		}

		if (newPassword !== confirmNewPassword) {
			return fail(400, { message: 'New passwords do not match.' });
		}

		if (currentPassword === newPassword) {
			return fail(400, { message: 'New password must be different from the current password.' });
		}

		const { user } = await locals.safeGetSession();

		if (!user || !user.email) {
			// Should not happen in protected routes, but just in case
			return fail(401, { message: 'You must be logged in to update your password.' });
		}

		// Verify current password
		const { error: signInError } = await locals.supabase.auth.signInWithPassword({
			email: user.email,
			password: currentPassword
		});

		if (signInError) {
			if (signInError instanceof AuthApiError && signInError.status === 400) {
				return fail(400, { message: 'Incorrect current password.' });
			}
			return fail(500, { message: 'Error verifying current password.' });
		}

		// Update to new password
		const { error: updateError } = await locals.supabase.auth.updateUser({
			password: newPassword
		});

		if (updateError) {
			return fail(500, { message: 'Failed to update password. Please try again.' });
		}

		return { message: 'Password updated successfully.' };
	},

	deleteAccount: async ({ locals }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			return fail(401, {
				message: 'You must be logged in to delete your account.',
				isDeleteAccountError: true
			});
		}

		const { error } = await locals.supabase.rpc('delete_user');

		if (error) {
			console.error('Error deleting user:', error);
			return fail(500, {
				message: 'Failed to delete account. Please try again later.',
				isDeleteAccountError: true
			});
		}

		await locals.supabase.auth.signOut();
		throw redirect(303, '/');
	}
} satisfies Actions;
