<script lang="ts">
	import { getLogicalDate, formatLogicalDate } from '$lib/utils/date';
	import type { HabitWithStats, Habit } from '$lib/data-access/types';

	import DateHeader from '$lib/components/dashboard/DateHeader.svelte';
	import DailyProgressBar from '$lib/components/dashboard/DailyProgressBar.svelte';
	import HabitList from '$lib/components/dashboard/HabitList.svelte';
	import ClientDayTimer from '$lib/components/dashboard/ClientDayTimer.svelte';
	import EmptyStateHero from '$lib/components/dashboard/EmptyStateHero.svelte';
	import CreateHabitModal from '$lib/components/dashboard/CreateHabitModal.svelte';
	import DeleteHabitModal from '$lib/components/dashboard/DeleteHabitModal.svelte';

	// State
	let habits = $state<HabitWithStats[]>([]);
	let logicalDate = $state<Date>(getLogicalDate());
	let isLoading = $state(true);
	let isCreateModalOpen = $state(false);

	// Delete State
	let showDeleteModal = $state(false);
	let habitToDelete = $state<HabitWithStats | null>(null);

	// Derived
	let dateString = $derived(formatLogicalDate(logicalDate));

	let progress = $derived.by(() => {
		const total = habits.length;
		const completed = habits.filter((h) => h.completed_today).length;
		return { total, completed };
	});

	async function fetchHabits() {
		isLoading = true;
		try {
			const response = await fetch(`/rest/v1/habits?target_date=${dateString}`);
			if (response.ok) {
				habits = await response.json();
			} else {
				console.error('Failed to fetch habits', response.statusText);
				// In a real app, show toast
			}
		} catch (e) {
			console.error('Error fetching habits', e);
		} finally {
			isLoading = false;
		}
	}

	function handleDateChange() {
		// Update logical date to trigger re-fetch and UI update
		logicalDate = getLogicalDate();
	}

	function handleAddHabit(newHabit: Habit) {
		// Adapt the raw habit to the view model with default stats
		const habitWithStats: HabitWithStats = {
			...newHabit,
			streak_count: 0,
			completed_today: false
		} as unknown as HabitWithStats;

		habits = [...habits, habitWithStats];
	}

	function openDeleteModal(id: string) {
		const habit = habits.find((h) => h.id === id);
		if (habit) {
			habitToDelete = habit;
			showDeleteModal = true;
		}
	}

	async function handleDelete() {
		if (!habitToDelete) return;

		try {
			const response = await fetch(`/rest/v1/habits?id=eq.${habitToDelete.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete habit');
			}

			// Optimistic update
			habits = habits.filter((h) => h.id !== habitToDelete?.id);
			showDeleteModal = false;
			habitToDelete = null;
		} catch (e) {
			console.error('Error deleting habit', e);
			// In a real app, show toast
			alert('Failed to delete habit. Please try again.');
		}
	}

	async function handleToggleCompletion(id: string) {
		const habit = habits.find((h) => h.id === id);
		if (!habit) return;

		const wasCompleted = habit.completed_today;
		const method = wasCompleted ? 'DELETE' : 'POST';

		try {
			let url = '/rest/v1/habit_completions';
			let body = undefined;
			let headers = undefined;

			if (method === 'POST') {
				body = JSON.stringify({
					habit_id: id,
					completed_date: dateString
				});
				headers = { 'Content-Type': 'application/json' };
			} else {
				// DELETE requires query params
				url += `?habit_id=${id}&completed_date=${dateString}`;
			}

			const response = await fetch(url, { method, headers, body });

			if (response.ok || (method === 'POST' && response.status === 409)) {
				// Success (or duplicate check-in, which we treat as success)
				// Update state
				habit.completed_today = !wasCompleted;

				// Update streak
				// If we just completed it: streak + 1
				// If we just undid it: streak - 1
				if (!wasCompleted) {
					habit.streak_count += 1;
				} else {
					habit.streak_count = Math.max(0, habit.streak_count - 1);
				}
			} else {
				// Handle 404 for undoing non-existent (treat as success? Plan says yes)
				if (method === 'DELETE' && response.status === 404) {
					habit.completed_today = false;
					// Streak might already be correct if it wasn't counted, but decrementing safe if we thought it was done?
					// If UI said done, streak included it. So decrement.
					habit.streak_count = Math.max(0, habit.streak_count - 1);
				} else {
					throw new Error('Failed to update status');
				}
			}
		} catch (error) {
			console.error('Toggle error', error);
			alert('Failed to update habit status. Please try again.');
		}
	}

	// Effects
	$effect(() => {
		// Reactively fetch when dateString changes
		// This handles both initial load (if we call it) and updates.
		// However, onMount is preferred for initial fetch to avoid SSR double fetch issues if we were doing SSR,
		// but here we are client-side specific.
		// Using $effect with an async function is tricky if not careful.
		// Let's just use a watcher or call it explicitly.
		// Since dateString is derived, let's watch it.
		fetchHabits();
	});
</script>

<div class="container mx-auto min-h-screen max-w-2xl px-4 py-8">
	<ClientDayTimer onDateChange={handleDateChange} />

	<DateHeader date={logicalDate} />

	{#if isLoading}
		<div class="flex animate-pulse flex-col gap-4">
			<div class="h-24 w-full rounded-box bg-base-200"></div>
			<div class="h-24 w-full rounded-box bg-base-200"></div>
			<div class="h-24 w-full rounded-box bg-base-200"></div>
		</div>
	{:else if habits.length === 0}
		<EmptyStateHero onclick={() => (isCreateModalOpen = true)} />
	{:else}
		<DailyProgressBar total={progress.total} completed={progress.completed} />
		<HabitList {habits} onDeleteHabit={openDeleteModal} onToggleHabit={handleToggleCompletion} />

		<button
			class="btn mt-4 btn-block border-2 btn-outline btn-primary"
			onclick={() => (isCreateModalOpen = true)}
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

	<CreateHabitModal bind:open={isCreateModalOpen} onSuccess={handleAddHabit} />
	<DeleteHabitModal
		bind:isOpen={showDeleteModal}
		habitTitle={habitToDelete?.title ?? ''}
		onConfirm={handleDelete}
	/>
</div>
