<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();
	let isLoading = $state(false);
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<h1 class="mb-6 text-2xl font-bold">Settings</h1>

	{#if form?.message}
		<div role="alert" class="mb-6 alert alert-info">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="h-6 w-6 shrink-0 stroke-current"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path></svg
			>
			<span>{form.message}</span>
		</div>
	{/if}

	<div class="card mb-8 bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Update Password</h2>
			<form
				method="POST"
				action="?/updatePassword"
				use:enhance={() => {
					isLoading = true;
					return async ({ update }) => {
						isLoading = false;
						await update();
					};
				}}
				class="flex flex-col gap-4"
			>
				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">New Password</span>
					</label>
					<input
						type="password"
						name="password"
						id="password"
						placeholder="••••••••"
						class="input-bordered input input-primary"
						required
						minlength="6"
					/>
				</div>
				<div class="card-actions justify-end">
					<button class="btn btn-primary" disabled={isLoading}>Update Password</button>
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

			<form
				method="POST"
				action="?/deleteAccount"
				use:enhance={() => {
					return async ({ update }) => {
						if (
							confirm('Are you sure you want to delete your account? This action cannot be undone.')
						) {
							await update();
						}
					};
				}}
			>
				<div class="mt-4 card-actions justify-end">
					<button class="btn btn-outline btn-error">Delete Account</button>
				</div>
			</form>
		</div>
	</div>
</div>
