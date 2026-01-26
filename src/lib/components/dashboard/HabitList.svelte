<script lang="ts">
	import type { HabitWithStats } from '$lib/data-access/types';
	import HabitCard from './HabitCard.svelte';
	import EditHabitModal from './EditHabitModal.svelte';

	let { habits }: { habits: HabitWithStats[] } = $props();

	let editingHabit = $state<{ id: string; title: string } | null>(null);
	let isEditModalOpen = $state(false);

	function openEditModal(habit: HabitWithStats) {
		editingHabit = habit;
		isEditModalOpen = true;
	}

	function closeEditModal() {
		isEditModalOpen = false;
		editingHabit = null;
	}

	async function handleSaveTitle(id: string, newTitle: string) {
		const response = await fetch(`/rest/v1/habits?id=eq.${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ title: newTitle })
		});

		if (!response.ok) {
			throw new Error('Failed to update habit title');
		}

		// Optimistic update / update local state
		// Since 'habits' contains state proxies (from parent), we can mutate directly
		const habit = habits.find((h) => h.id === id);
		if (habit) {
			habit.title = newTitle;
		}

		closeEditModal();
	}
</script>

<div class="flex w-full flex-col pb-20">
	<!-- pb-20 for bottom nav if exists -->
	{#each habits as habit (habit.id)}
		<HabitCard {habit} onedit={openEditModal} />
	{/each}
</div>

<EditHabitModal bind:open={isEditModalOpen} habit={editingHabit} onSave={handleSaveTitle} />
