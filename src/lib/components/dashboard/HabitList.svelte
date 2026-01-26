<script lang="ts">
	import type { HabitWithStats } from '$lib/data-access/types';
	import HabitCard from './HabitCard.svelte';
	import EmptyStateHero from './EmptyStateHero.svelte';

	let { habits }: { habits: HabitWithStats[] } = $props();
</script>

<div class="flex w-full flex-col pb-20">
	<!-- pb-20 for bottom nav if exists -->
	{#if habits.length === 0}
		<EmptyStateHero />
	{:else}
		{#each habits as habit (habit.id)}
			<HabitCard {habit} />
		{/each}
	{/if}
</div>
