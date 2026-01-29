import { expect, test } from '@playwright/test';

test('home page redirects to login and has expected heading', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/.*login/);
	await expect(page.locator('h2')).toContainText('Sign In');
});
