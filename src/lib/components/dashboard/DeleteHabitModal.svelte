<script lang="ts">
	let {
		isOpen = $bindable(false),
		habitTitle,
		onConfirm
	}: {
		isOpen: boolean;
		habitTitle: string;
		onConfirm: () => Promise<void>;
	} = $props();

	let isSubmitting = $state(false);

	async function handleConfirm() {
		isSubmitting = true;
		try {
			await onConfirm();
		} catch (error) {
			console.error('Error deleting habit:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		if (!isSubmitting) {
			isOpen = false;
		}
	}
</script>

<dialog class="modal modal-bottom sm:modal-middle" class:modal-open={isOpen}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">Delete Habit</h3>
		<p class="py-4">
			Are you sure you want to delete <span class="font-bold">{habitTitle}</span>? This action
			cannot be undone and will remove all streak history.
		</p>
		<div class="modal-action">
			<form method="dialog" class="flex gap-2">
				<!-- If there is a button in form, it will close the modal -->
				<button class="btn btn-ghost" type="button" onclick={handleClose} disabled={isSubmitting}>
					Cancel
				</button>
				<button
					class="btn text-error-content btn-error"
					type="button"
					onclick={handleConfirm}
					disabled={isSubmitting}
				>
					{#if isSubmitting}
						<span class="loading loading-spinner"></span>
					{/if}
					Delete
				</button>
			</form>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={handleClose} type="button" disabled={isSubmitting}>close</button>
	</form>
</dialog>
