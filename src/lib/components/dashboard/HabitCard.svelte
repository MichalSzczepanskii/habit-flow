<script lang="ts">
	import type { HabitWithStats } from '$lib/data-access/types';

	let { habit, onedit }: { habit: HabitWithStats; onedit?: (habit: HabitWithStats) => void } =
		$props();

	let isCompleted = $derived(habit.completed_today);
</script>

<div
	class="card-bordered card mb-4 w-full border-2 border-base-content/25 bg-base-100 shadow-sm transition-all duration-200 hover:border-primary/60 hover:shadow-md"
	class:opacity-70={isCompleted}
	class:bg-base-200={isCompleted}
>
	<div class="card-body flex-row items-center justify-between p-6">
		<!-- Left: Status Icon & Title -->
		<div class="flex items-center gap-5 overflow-hidden">
			<!-- Checkbox visual (Read-only) -->
			<div
				class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 {isCompleted
					? 'scale-105 border-primary bg-primary shadow-lg shadow-primary/30'
					: 'border-base-content/50 hover:border-primary/50'}"
			>
				{#if isCompleted}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="3"
						stroke="currentColor"
						class="size-6 text-primary-content"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
					</svg>
				{/if}
			</div>

			<!-- Title -->
			<h3
				class="truncate text-xl font-semibold transition-colors {isCompleted
					? 'text-base-content/50 line-through'
					: 'text-base-content'}"
			>
				{habit.title}
			</h3>
		</div>

		<!-- Right: Streak Badge & Actions -->
		<div class="flex items-center gap-2">
			{#if habit.streak_count > 0}
				<div
					class="badge gap-1.5 border-0 bg-orange-100 py-4 badge-lg text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="size-5"
					>
						<path
							fill-rule="evenodd"
							d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
							clip-rule="evenodd"
						/>
					</svg>
					<span class="text-base font-bold">{habit.streak_count}</span>
				</div>
			{/if}

			<div class="dropdown dropdown-end">
				<div
					tabindex="0"
					role="button"
					class="btn btn-circle btn-ghost btn-sm"
					aria-label="Habit options"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
						/>
					</svg>
				</div>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<ul
					tabindex="0"
					class="dropdown-content menu z-[1] w-52 rounded-box border border-base-content/25 bg-base-100 p-2 shadow-xl"
				>
					<li>
						<button onclick={() => onedit?.(habit)}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-4"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
								/>
							</svg>
							Rename
						</button>
					</li>
				</ul>
			</div>
		</div>
	</div>
</div>
