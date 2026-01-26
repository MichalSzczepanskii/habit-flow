<script lang="ts">
	import { formatDateForDisplay, getDateLabel } from '$lib/utils/date';

	let { date }: { date: Date } = $props();
</script>

<div class="mt-2 mb-8">
	<h1 class="text-4xl font-extrabold tracking-tight text-base-content">{getDateLabel(date)}</h1>
	<p class="mt-1 text-lg font-medium text-base-content/60">{formatDateForDisplay(date)}</p>
</div>
