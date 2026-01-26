<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();
	let isLoading = $state(false);
</script>

<h2 class="mb-6 card-title justify-center">Create Account</h2>

{#if form?.message}
	<div role="alert" class="mb-4 alert alert-error">
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
		<span>{form.message}</span>
	</div>
{/if}

<form
	method="POST"
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
		<label class="label" for="email">
			<span class="label-text">Email</span>
		</label>
		<input
			type="email"
			name="email"
			id="email"
			placeholder="email@example.com"
			class="input-bordered input input-primary"
			required
			value={form?.email ?? ''}
		/>
	</div>

	<div class="form-control">
		<label class="label" for="password">
			<span class="label-text">Password</span>
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
		<label class="label">
			<span class="label-text-alt">Must be at least 6 characters</span>
		</label>
	</div>

	<div class="form-control">
		<label class="label" for="confirmPassword">
			<span class="label-text">Confirm Password</span>
		</label>
		<input
			type="password"
			name="confirmPassword"
			id="confirmPassword"
			placeholder="••••••••"
			class="input-bordered input input-primary"
		/>
	</div>

	<div class="form-control mt-6">
		<button class="btn w-full btn-primary" disabled={isLoading}>
			{#if isLoading}
				<span class="loading loading-spinner"></span>
			{/if}
			Sign Up
		</button>
	</div>
</form>

<div class="divider">OR</div>

<div class="text-center">
	<p>Already have an account? <a href="/login" class="link link-primary">Login</a></p>
</div>
