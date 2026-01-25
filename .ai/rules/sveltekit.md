## FRONTEND

### Guidelines for SVELTE

#### SVELTE_KIT

- Use server-side load functions to fetch data before rendering pages
- Implement form actions for handling form submissions with progressive enhancement
- Use page stores ($page) to access route parameters and other page data
- Leverage SvelteKit's server-only modules for sensitive operations
- Implement +error.svelte files for custom error handling at the route level
- Use the enhance function for progressive enhancement of forms
- Leverage SvelteKit hooks for global middleware functionality
- Implement route groups (folders with parentheses) for logical organization without URL impact
- Use the new Embedded SvelteKit plugin system
- Implement content negotiation with accept header in load functions

#### SVELTE_CODING_STANDARDS

- Use runes for $state, $effect and $props management instead of the $ prefix
- Use the $ prefix for reactive store values instead of manual store subscription
- Use slot props for better component composition
- Leverage the :global() modifier sparingly for global CSS
- Implement Svelte transitions and animations for smooth UI changes
- Use $effect rune for derived state
- Use simple callback props instead of createEventDispatcher
- Use lifecycle functions (onMount, onDestroy) for setup and cleanup
- Leverage special elements like <svelte:window> and <svelte:component> for dynamic behavior
