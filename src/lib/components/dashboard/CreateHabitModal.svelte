<script lang="ts">
	import type { Habit } from '$lib/data-access/types';

	let { open = $bindable(false), onSuccess } = $props<{
		open: boolean;
		onSuccess: (habit: Habit) => void;
	}>();

	let title = $state('');
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let dialogRef = $state<HTMLDialogElement | null>(null);

	// Watch open state to show/close modal
	$effect(() => {
		if (open) {
			dialogRef?.showModal();
			title = ''; // Reset form on open
			error = null;
		} else {
			dialogRef?.close();
		}
	});

	function handleClose() {
		open = false;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!title.trim()) return;

		isLoading = true;
		error = null;

		try {
			const response = await fetch('/rest/v1/habits', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ title: title.trim() })
			});

			if (response.ok) {
				const newHabit = await response.json();
				onSuccess(newHabit);
				open = false;
			} else {
				const data = await response.json();
				error = data.message || 'Failed to create habit';
			}
		} catch (e) {
			console.error(e);
			error = 'An unexpected error occurred';
		} finally {
			isLoading = false;
		}
	}
</script>

<dialog
	bind:this={dialogRef}
	class="modal modal-bottom sm:modal-middle"
	onclose={handleClose}
	oncancel={handleClose}
>
	<div class="modal-box relative">
		<button
			class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
			onclick={handleClose}
			aria-label="Close"
		>
			✕
		</button>
		
		<h3 class="font-bold text-lg">Create New Habit</h3>
		<p class="py-2 text-base-content/70 text-sm">
			Start small. Consistent daily actions lead to big changes.
		</p>
		
		<form onsubmit={handleSubmit} class="mt-2 flex flex-col gap-4">
			<div class="form-control w-full">
				<label class="label" for="habit-title">
					<span class="label-text font-medium">What do you want to do?</span>
				</label>
				<input
					id="habit-title"
					type="text"
					placeholder="e.g., Drink 2L water"
					class="input input-bordered input-primary w-full"
					bind:value={title}
					disabled={isLoading}
				/>
				{#if error}
					<div class="label">
						<span class="label-text-alt text-error">{error}</span>
					</div>
				{/if}
			</div>

			<div class="modal-action">
				<button
					type="button"
					class="btn btn-ghost"
					onclick={handleClose}
					disabled={isLoading}
				>
					Cancel
				</button>
				<button
					type="submit"
					class="btn btn-primary min-w-[100px]"
					disabled={isLoading || !title.trim()}
				>
					{#if isLoading}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						Save
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={handleClose}>close</button>
	</form>
</dialog>
