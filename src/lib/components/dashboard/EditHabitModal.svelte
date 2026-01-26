<script lang="ts">
	let {
		open = $bindable(false),
		habit,
		onSave
	}: {
		open: boolean;
		habit: { id: string; title: string } | null;
		onSave: (id: string, newTitle: string) => Promise<void>;
	} = $props();

	let title = $state('');
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let dialogRef = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (open) {
			dialogRef?.showModal();
			if (habit) {
				title = habit.title;
			}
			error = null;
		} else {
			dialogRef?.close();
		}
	});

	function handleClose() {
		open = false;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!habit) return;

		const newTitle = title.trim();

		if (newTitle.length === 0) {
			return; // Button should be disabled
		}

		if (newTitle.length > 255) {
			error = 'Title must be 255 characters or less.';
			return;
		}

		isLoading = true;
		error = null;

		try {
			await onSave(habit.id, newTitle);
			open = false;
		} catch (e) {
			console.error('Failed to save habit title:', e);
			error = 'Failed to rename habit. Please try again.';
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
	<div class="relative modal-box">
		<button
			class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm"
			onclick={handleClose}
			aria-label="Close"
		>
			✕
		</button>

		<h3 class="text-lg font-bold">Rename Habit</h3>

		<form onsubmit={handleSubmit} class="mt-4 flex flex-col gap-4">
			<div class="form-control w-full">
				<label class="label" for="edit-habit-title">
					<span class="label-text font-medium">Title</span>
				</label>
				<input
					id="edit-habit-title"
					type="text"
					bind:value={title}
					placeholder="Type here"
					class="input-bordered input w-full input-primary"
					maxlength="255"
					disabled={isLoading}
				/>
				<div class="label">
					{#if error}
						<span class="label-text-alt text-error">{error}</span>
					{:else}
						<span class="label-text-alt text-base-content/60">{title.length}/255</span>
					{/if}
				</div>
			</div>

			<div class="modal-action">
				<button type="button" class="btn btn-ghost" onclick={handleClose} disabled={isLoading}>
					Cancel
				</button>
				<button
					type="submit"
					class="btn min-w-[100px] btn-primary"
					disabled={isLoading || title.trim().length === 0 || title.trim() === habit?.title}
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
