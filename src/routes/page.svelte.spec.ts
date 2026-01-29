import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render loading spinner', async () => {
		render(Page);

		const spinner = page.getByRole('status');
		await expect.element(spinner).toBeInTheDocument();
	});
});
