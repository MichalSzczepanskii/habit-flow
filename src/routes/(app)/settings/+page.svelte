<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();
	let isLoading = $state(false);
	let isDeleting = $state(false);
	let isDeleteModalOpen = $state(false);

	function closeDeleteModal() {
		if (!isDeleting) {
			isDeleteModalOpen = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<h1 class="mb-6 text-2xl font-bold">Settings</h1>

	{#if form?.message && !form?.isDeleteAccountError}
		<div
			role="alert"
			class="mb-6 alert {form?.message === 'Password updated successfully.'
				? 'alert-success'
				: 'alert-error'}"
		>
			{#if form?.message === 'Password updated successfully.'}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
			{/if}
			<span>{form.message}</span>
		</div>
	{/if}

	<div class="card mb-8 bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Update Password</h2>
			<form
				method="POST"
				action="?/updatePassword"
				use:enhance={({ formElement }) => {
					isLoading = true;
					return async ({ result, update }) => {
						isLoading = false;
						await update();
						if (result.type === 'failure') {
							formElement.reset();
						}
					};
				}}
				class="flex flex-col gap-4"
			>
				<div class="form-control">
					<label class="label" for="currentPassword">
						<span class="label-text">Current Password</span>
					</label>
					<input
						type="password"
						name="currentPassword"
						id="currentPassword"
						placeholder="••••••••"
						class="input-bordered input w-full input-primary"
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="newPassword">
						<span class="label-text">New Password</span>
					</label>
					<input
						type="password"
						name="newPassword"
						id="newPassword"
						placeholder="••••••••"
						class="input-bordered input w-full input-primary"
						required
						minlength="6"
					/>
				</div>

				<div class="form-control">
					<label class="label" for="confirmNewPassword">
						<span class="label-text">Confirm New Password</span>
					</label>
					<input
						type="password"
						name="confirmNewPassword"
						id="confirmNewPassword"
						placeholder="••••••••"
						class="input-bordered input w-full input-primary"
						required
						minlength="6"
					/>
				</div>

				<div class="card-actions justify-end">
					<button class="btn btn-primary" disabled={isLoading}>
						{#if isLoading}
							<span class="loading loading-spinner"></span>
						{/if}
						Update Password
					</button>
				</div>
			</form>
		</div>
	</div>

	<div class="card border-2 border-error/20 bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-6 w-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
					/>
				</svg>
				Danger Zone
			</h2>
			<p class="text-base-content/70">
				Once you delete your account, there is no going back. Please be certain.
			</p>

			<div class="mt-4 card-actions justify-end">
				<button class="btn btn-outline btn-error" onclick={() => (isDeleteModalOpen = true)}>
					Delete Account
				</button>
			</div>
		</div>
	</div>
</div>

<dialog class="modal modal-bottom sm:modal-middle" class:modal-open={isDeleteModalOpen}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">Delete Account</h3>
		<p class="py-4">
			Are you sure you want to delete your account? This action <span class="font-bold"
				>cannot be undone</span
			>
			and will permanently remove all your habits and streak history.
		</p>
		<div class="modal-action">
			<form method="dialog" class="flex gap-2">
				<button
					class="btn btn-ghost"
					type="button"
					onclick={closeDeleteModal}
					disabled={isDeleting}
				>
					Cancel
				</button>
			</form>
			<form
				method="POST"
				action="?/deleteAccount"
				use:enhance={() => {
					isDeleting = true;
					return async ({ update }) => {
						isDeleting = false;
						await update();
					};
				}}
			>
				<button class="btn text-error-content btn-error" disabled={isDeleting}>
					{#if isDeleting}
						<span class="loading loading-spinner"></span>
					{/if}
					Delete Account
				</button>
			</form>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={closeDeleteModal} type="button" disabled={isDeleting}>close</button>
	</form>
</dialog>

{#if form?.message && form?.isDeleteAccountError}
	<div class="toast toast-end toast-bottom">
		<div class="alert alert-error">
			<span>{form.message}</span>
		</div>
	</div>
{/if}
