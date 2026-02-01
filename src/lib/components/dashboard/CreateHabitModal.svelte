<script lang="ts">
	let { open = $bindable(false), onSubmit } = $props<{
		open: boolean;
		onSubmit: (title: string) => Promise<void>;
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
			await onSubmit(title.trim());
			open = false;
		} catch (err) {
			console.error(err);
			if (err instanceof Error) {
				error = err.message;
			} else if (typeof err === 'object' && err !== null && 'message' in err) {
				error = (err as { message: string }).message;
			} else {
				error = 'Failed to create habit';
			}
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
	data-test-id="create-habit-modal"
>
	<div class="relative modal-box">
		<button
			class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm"
			onclick={handleClose}
			aria-label="Close"
		>
			✕
		</button>

		<h3 class="text-lg font-bold">Create New Habit</h3>
		<p class="py-2 text-sm text-base-content/70">
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
					class="input-bordered input w-full input-primary"
					bind:value={title}
					disabled={isLoading}
					data-test-id="habit-title-input"
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
					data-test-id="cancel-habit-btn"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="btn min-w-[100px] btn-primary"
					disabled={isLoading || !title.trim()}
					data-test-id="save-habit-btn"
				>
					{#if isLoading}
						<span class="loading loading-sm loading-spinner"></span>
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
