<script lang="ts">
	import type { HabitWithStats } from '$lib/data-access/types';
	import HabitCard from './HabitCard.svelte';
	import EditHabitModal from './EditHabitModal.svelte';

	let {
		habits,
		onDeleteHabit,
		onToggleHabit,
		onUpdateHabit
	}: {
		habits: HabitWithStats[];
		onDeleteHabit?: (id: string) => void;
		onToggleHabit: (id: string) => Promise<void>;
		onUpdateHabit: (id: string, title: string) => Promise<void>;
	} = $props();

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
		try {
			await onUpdateHabit(id, newTitle);
			closeEditModal();
		} catch (error) {
			console.error('Failed to update habit title', error);
			throw error; // Let modal handle error display if it could (but Modal handles its own try/catch around onSave? Wait EditHabitModal catches errors from onSave)
		}
	}
</script>

<div class="flex w-full flex-col pb-20">
	<!-- pb-20 for bottom nav if exists -->
	{#each habits as habit (habit.id)}
		<HabitCard {habit} onedit={openEditModal} ondelete={onDeleteHabit} onToggle={onToggleHabit} />
	{/each}
</div>

<EditHabitModal bind:open={isEditModalOpen} habit={editingHabit} onSave={handleSaveTitle} />
