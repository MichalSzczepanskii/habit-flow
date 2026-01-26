<script lang="ts">
	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-base-200 p-4">
	<div class="mb-8 text-center">
		<div class="placeholder avatar mb-2 justify-center">
			<div
				class="flex w-16 items-center justify-center rounded-full bg-primary text-primary-content"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-10 w-10"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
					/>
				</svg>
			</div>
		</div>
		<h1 class="text-3xl font-bold text-base-content">Habit Flow</h1>
	</div>

	<div class="card w-full max-w-sm bg-base-100 shadow-2xl">
		<div class="card-body">
			{@render children()}
		</div>
	</div>
</div>
