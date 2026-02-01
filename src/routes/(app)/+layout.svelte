<script lang="ts">
	import { resolve } from '$app/paths';
	let { children, data } = $props();
</script>

<div class="drawer">
	<input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<!-- Navbar -->
		<div class="navbar w-full bg-base-300">
			<div class="flex-none lg:hidden">
				<label for="my-drawer-3" aria-label="open sidebar" class="btn btn-square btn-ghost">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block h-6 w-6 stroke-current"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						></path></svg
					>
				</label>
			</div>
			<div class="mx-2 flex flex-1 items-center gap-2 px-2 text-lg font-bold">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-6 w-6 text-primary"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
					/>
				</svg>
				Habit Flow
			</div>
			<div class="hidden flex-none lg:block">
				<ul class="menu menu-horizontal items-center">
					{#if data.user}
						<li class="px-4 text-sm opacity-70">{data.user.email}</li>
					{/if}
					<!-- Navbar menu content here -->
					<li><a href={resolve('/dashboard')}>Dashboard</a></li>
					<li><a href={resolve('/settings')}>Settings</a></li>
					<li>
						<form action={resolve('/logout')} method="POST">
							<button type="submit">Logout</button>
						</form>
					</li>
				</ul>
			</div>
		</div>
		<!-- Page content here -->
		{@render children()}
	</div>
	<div class="drawer-side z-50">
		<label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu min-h-full w-80 bg-base-200 p-4">
			{#if data.user}
				<li class="menu-title px-4">{data.user.email}</li>
			{/if}
			<!-- Sidebar content here -->
			<li><a href={resolve('/dashboard')}>Dashboard</a></li>
			<li><a href={resolve('/settings')}>Settings</a></li>
			<li>
				<form action={resolve('/logout')} method="POST">
					<button type="submit">Logout</button>
				</form>
			</li>
		</ul>
	</div>
</div>
