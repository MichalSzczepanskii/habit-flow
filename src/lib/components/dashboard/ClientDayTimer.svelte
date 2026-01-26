<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getLogicalDateString } from '$lib/utils/date';

	let { onDateChange }: { onDateChange: (newDate: string) => void } = $props();

	let intervalId: ReturnType<typeof setInterval>;
	let lastKnownDate = getLogicalDateString();

	function checkDate() {
		const currentDate = getLogicalDateString();
		if (currentDate !== lastKnownDate) {
			lastKnownDate = currentDate;
			onDateChange(currentDate);
		}
	}

	onMount(() => {
		// Check every minute
		intervalId = setInterval(checkDate, 60 * 1000);
		// Also check immediately on visibility change if possible, but interval is fine for now
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>
