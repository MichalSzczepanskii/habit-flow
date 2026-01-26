<script lang="ts">
	import { onMount } from 'svelte';
	import { getLogicalDate, formatLogicalDate } from '$lib/utils/date';
	import type { HabitWithStats } from '$lib/data-access/types';

	import DateHeader from '$lib/components/dashboard/DateHeader.svelte';
	import DailyProgressBar from '$lib/components/dashboard/DailyProgressBar.svelte';
	import HabitList from '$lib/components/dashboard/HabitList.svelte';
	import ClientDayTimer from '$lib/components/dashboard/ClientDayTimer.svelte';

	// State
	let habits = $state<HabitWithStats[]>([]);
	let logicalDate = $state<Date>(getLogicalDate());
	let isLoading = $state(true);

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

	function handleDateChange(newDateString: string) {
		// Update logical date to trigger re-fetch and UI update
		logicalDate = getLogicalDate();
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
	{:else}
		<DailyProgressBar total={progress.total} completed={progress.completed} />
		<HabitList {habits} />
	{/if}
</div>
