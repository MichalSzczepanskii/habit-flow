<script lang="ts">
	import type { HabitWithStats } from '$lib/data-access/types';

	let {
		habit,
		onToggle,
		onedit,
		ondelete
	}: {
		habit: HabitWithStats;
		onToggle: (habitId: string) => Promise<void>;
		onedit?: (habit: HabitWithStats) => void;
		ondelete?: (id: string) => void;
	} = $props();

	let isCompleted = $derived(habit.completed_today);
	let isToggling = $state(false);

	async function handleToggle() {
		if (isToggling) return;
		isToggling = true;
		try {
			await onToggle(habit.id);
		} finally {
			isToggling = false;
		}
	}
</script>

<div
	class="card-bordered card mb-4 w-full border-0 shadow-sm transition-colors duration-300"
	class:bg-emerald-500={isCompleted}
	class:text-white={isCompleted}
	class:bg-base-200={!isCompleted}
	class:text-base-content={!isCompleted}
	data-test-id="habit-card"
>
	<div class="card-body flex-row items-center justify-between p-6">
		<!-- Left: Status Icon & Title -->
		<div class="flex items-center gap-5 overflow-hidden">
			<!-- Checkbox/Action Button -->
			<button
				class="btn btn-circle border-2 transition-all duration-300 btn-lg hover:scale-105"
				class:btn-ghost={!isCompleted}
				class:bg-white={isCompleted}
				class:text-emerald-500={isCompleted}
				class:border-white={isCompleted}
				class:border-base-content={!isCompleted && !isToggling}
				class:border-opacity-20={!isCompleted}
				onclick={handleToggle}
				disabled={isToggling}
				aria-label={isCompleted
					? `Mark ${habit.title} as incomplete`
					: `Mark ${habit.title} as complete`}
				data-test-id="habit-toggle-btn"
			>
				{#if isToggling}
					<span class="loading loading-md loading-spinner"></span>
				{:else if isCompleted}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="3"
						stroke="currentColor"
						class="size-6"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
					</svg>
				{:else}
					<!-- Empty circle effect created by button border -->
				{/if}
			</button>

			<!-- Title -->
			<h3
				class="truncate text-xl font-semibold transition-colors"
				class:line-through={isCompleted}
				class:opacity-90={isCompleted}
				data-test-id="habit-title"
			>
				{habit.title}
			</h3>
		</div>

		<!-- Right: Streak Badge & Actions -->
		<div class="flex items-center gap-2">
			{#if habit.streak_count > 0}
				<div
					class="badge gap-1.5 border-0 py-4 badge-lg font-bold"
					class:bg-white={isCompleted}
					class:text-emerald-600={isCompleted}
					class:bg-base-300={!isCompleted}
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
					{habit.streak_count}
				</div>
			{/if}

			<div class="dropdown dropdown-end">
				<div
					tabindex="0"
					role="button"
					class="btn btn-circle btn-ghost btn-sm"
					class:text-white={isCompleted}
					class:hover:bg-white={isCompleted}
					class:hover:bg-opacity-20={isCompleted}
					aria-label="Habit options"
					data-test-id="habit-options-btn"
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
					class="dropdown-content menu z-[1] w-52 rounded-box border border-base-content/25 bg-base-100 p-2 text-base-content shadow-xl"
				>
					<li>
						<button onclick={() => onedit?.(habit)} data-test-id="habit-rename-btn">
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
					<li>
						<button
							class="text-error"
							onclick={() => ondelete?.(habit.id)}
							data-test-id="habit-delete-btn"
						>
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
									d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
								/>
							</svg>
							Delete
						</button>
					</li>
				</ul>
			</div>
		</div>
	</div>
</div>
