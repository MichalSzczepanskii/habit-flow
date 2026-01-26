<script lang="ts">
	let { total, completed }: { total: number; completed: number } = $props();

	let percentage = $derived(total > 0 ? Math.round((completed / total) * 100) : 0);
</script>

<div class="mb-10 w-full rounded-box border border-base-200 bg-base-100 p-6 shadow-sm">
	<div class="mb-3 flex items-end justify-between">
		<div>
			<h2 class="text-sm font-semibold tracking-wider text-base-content/50 uppercase">
				Daily Goal
			</h2>
			<div class="mt-1 flex items-baseline gap-2">
				<span class="text-3xl font-black text-primary">{percentage}%</span>
				<span class="text-sm font-medium text-base-content/60">completed</span>
			</div>
		</div>
		<div class="text-right">
			<span class="badge badge-lg font-bold badge-neutral">{completed} / {total}</span>
		</div>
	</div>

	<div class="h-4 w-full overflow-hidden rounded-full bg-base-200">
		<div
			class="h-4 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--p),0.5)] transition-all duration-500 ease-out"
			style="width: {percentage}%"
		></div>
	</div>
</div>
