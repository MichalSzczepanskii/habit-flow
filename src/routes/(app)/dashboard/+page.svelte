<script lang="ts">
	import { HabitStore } from '$lib/stores/habit.store.svelte';
	import type { HabitWithStats } from '$lib/data-access/types';
	import { getLogicalDate } from '$lib/utils/date';

	import DateHeader from '$lib/components/dashboard/DateHeader.svelte';
	import DailyProgressBar from '$lib/components/dashboard/DailyProgressBar.svelte';
	import HabitList from '$lib/components/dashboard/HabitList.svelte';
	import ClientDayTimer from '$lib/components/dashboard/ClientDayTimer.svelte';
	import EmptyStateHero from '$lib/components/dashboard/EmptyStateHero.svelte';
	import CreateHabitModal from '$lib/components/dashboard/CreateHabitModal.svelte';
	import DeleteHabitModal from '$lib/components/dashboard/DeleteHabitModal.svelte';

	// Store
	const store = new HabitStore();

	// Local UI State
	let isCreateModalOpen = $state(false);
	let showDeleteModal = $state(false);
	let habitToDelete = $state<HabitWithStats | null>(null);

	// Load initial data
	$effect(() => {
		store.load();
	});

	function onDateChange() {
		store.setDate(getLogicalDate());
	}

	function openDeleteModal(id: string) {
		const habit = store.habits.find((h) => h.id === id);
		if (habit) {
			habitToDelete = habit;
			showDeleteModal = true;
		}
	}

	async function handleDelete() {
		if (!habitToDelete) return;
		await store.delete(habitToDelete.id);
		showDeleteModal = false;
		habitToDelete = null;
	}

	async function handleCreate(title: string) {
		await store.add(title);
	}
</script>

<div class="container mx-auto min-h-screen max-w-2xl px-4 py-8">
	<ClientDayTimer {onDateChange} />

	<DateHeader date={store.logicalDate} />

	{#if store.loading && store.habits.length === 0}
		<div class="flex animate-pulse flex-col gap-4">
			<div class="h-24 w-full rounded-box bg-base-200"></div>
			<div class="h-24 w-full rounded-box bg-base-200"></div>
			<div class="h-24 w-full rounded-box bg-base-200"></div>
		</div>
	{:else if store.habits.length === 0 && !store.loading}
		<EmptyStateHero onclick={() => (isCreateModalOpen = true)} />
	{:else}
		<!-- Error state could be shown here if store.error is set -->
		{#if store.error}
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
				<span>{store.error}</span>
			</div>
		{/if}

		<DailyProgressBar total={store.progress.total} completed={store.progress.completed} />
		<HabitList
			habits={store.habits}
			onDeleteHabit={openDeleteModal}
			onToggleHabit={(id) => store.toggle(id)}
			onUpdateHabit={(id, title) => store.update(id, title)}
		/>

		<button
			class="btn mt-4 btn-block border-2 btn-outline btn-primary"
			onclick={() => (isCreateModalOpen = true)}
			data-test-id="create-new-habit-btn"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="size-5"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
			Create new habit
		</button>
	{/if}

	<CreateHabitModal bind:open={isCreateModalOpen} onSubmit={handleCreate} />
	<DeleteHabitModal
		bind:isOpen={showDeleteModal}
		habitTitle={habitToDelete?.title ?? ''}
		onConfirm={handleDelete}
	/>
</div>
