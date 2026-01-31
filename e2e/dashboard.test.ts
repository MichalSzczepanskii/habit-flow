import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Dashboard', () => {
	let loginPage: LoginPage;
	let dashboardPage: DashboardPage;

	test.beforeEach(async ({ page }) => {
		loginPage = new LoginPage(page);
		dashboardPage = new DashboardPage(page);

		await loginPage.goto();

		const email = process.env.E2E_USERNAME;
		const password = process.env.E2E_PASSWORD;

		if (!email || !password) {
			test.skip('E2E_USERNAME or E2E_PASSWORD not set');
			return;
		}

		await loginPage.login(email, password);
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test('should allow user to create their first habit', async () => {
		// The cleanup ensures we start fresh, so the "Create First Habit" button should be visible.
		await dashboardPage.clickCreateFirstHabitButton();
		await dashboardPage.createHabitModal.expectVisible();

		const habitTitle = `First Habit ${Date.now()}`;
		await dashboardPage.createHabitModal.fillTitle(habitTitle);
		await dashboardPage.createHabitModal.save();

		await dashboardPage.createHabitModal.expectHidden();

		const habitCard = dashboardPage.getHabitCard(habitTitle);
		await expect(habitCard.card).toBeVisible();
		expect(await habitCard.getTitle()).toBe(habitTitle);
	});

	test('should allow user to create a subsequent habit', async () => {
		await dashboardPage.clickCreateNewHabitButton();

		await dashboardPage.createHabitModal.expectVisible();

		const habitTitle = `Next Habit ${Date.now()}`;
		await dashboardPage.createHabitModal.fillTitle(habitTitle);
		await dashboardPage.createHabitModal.save();

		await dashboardPage.createHabitModal.expectHidden();

		const habitCard = dashboardPage.getHabitCard(habitTitle);
		await expect(habitCard.card).toBeVisible();
		expect(await habitCard.getTitle()).toBe(habitTitle);
	});

	test('should allow user to cancel creating a habit', async () => {
		await dashboardPage.clickCreateNewHabitButton();
		await dashboardPage.createHabitModal.expectVisible();

		const habitTitle = `Cancelled Habit ${Date.now()}`;
		await dashboardPage.createHabitModal.fillTitle(habitTitle);
		await dashboardPage.createHabitModal.cancel();

		await dashboardPage.createHabitModal.expectHidden();

		const habitCard = dashboardPage.getHabitCard(habitTitle);
		await expect(habitCard.card).toBeHidden();
	});

	test('should allow user to rename a habit', async () => {
		// Setup: Create a habit to rename
		const initialTitle = `Habit to Rename ${Date.now()}`;
		await dashboardPage.addHabit();
		await dashboardPage.createHabitModal.fillTitle(initialTitle);
		await dashboardPage.createHabitModal.save();
		await dashboardPage.createHabitModal.expectHidden();

		const habitCard = dashboardPage.getHabitCard(initialTitle);
		await expect(habitCard.card).toBeVisible();

		// Rename flow
		await habitCard.clickRename();
		await dashboardPage.editHabitModal.expectVisible();

		const newTitle = `Renamed Habit ${Date.now()}`;
		await dashboardPage.editHabitModal.fillTitle(newTitle);
		await dashboardPage.editHabitModal.save();

		await dashboardPage.editHabitModal.expectHidden();

		// Verify new title
		const renamedCard = dashboardPage.getHabitCard(newTitle);
		await expect(renamedCard.card).toBeVisible();
		expect(await renamedCard.getTitle()).toBe(newTitle);
	});

	test('should allow user to cancel editing a habit', async () => {
		// Setup: Create a habit to edit
		const originalTitle = `Original Title ${Date.now()}`;
		await dashboardPage.addHabit();
		await dashboardPage.createHabitModal.fillTitle(originalTitle);
		await dashboardPage.createHabitModal.save();
		await dashboardPage.createHabitModal.expectHidden();

		const habitCard = dashboardPage.getHabitCard(originalTitle);
		await expect(habitCard.card).toBeVisible();

		// Action: Open edit modal, change title, but cancel
		await habitCard.clickRename();
		await dashboardPage.editHabitModal.expectVisible();

		const newTitle = `Cancelled Rename ${Date.now()}`;
		await dashboardPage.editHabitModal.fillTitle(newTitle);
		await dashboardPage.editHabitModal.cancel();

		await dashboardPage.editHabitModal.expectHidden();

		// Verification: Ensure title is unchanged
		expect(await habitCard.getTitle()).toBe(originalTitle);
	});

	test('should allow user to delete a habit', async () => {
		// Setup: Create a habit to delete
		const habitTitle = `Habit to Delete ${Date.now()}`;
		await dashboardPage.addHabit();
		await dashboardPage.createHabitModal.fillTitle(habitTitle);
		await dashboardPage.createHabitModal.save();
		await dashboardPage.createHabitModal.expectHidden();

		// Verification: Ensure it exists
		const habitCard = dashboardPage.getHabitCard(habitTitle);
		await expect(habitCard.card).toBeVisible();

		// Action: Delete the habit
		await habitCard.clickDelete();
		await dashboardPage.deleteHabitModal.expectVisible();
		await dashboardPage.deleteHabitModal.confirm();
		await dashboardPage.deleteHabitModal.expectHidden();

		// Verification: Ensure it is gone
		await expect(habitCard.card).toBeHidden();
	});

	test('should allow user to cancel deletion', async () => {
		// Setup: Create a habit
		const habitTitle = `Habit to Keep ${Date.now()}`;
		await dashboardPage.addHabit();
		await dashboardPage.createHabitModal.fillTitle(habitTitle);
		await dashboardPage.createHabitModal.save();
		await dashboardPage.createHabitModal.expectHidden();

		// Action: Open delete modal but cancel
		const habitCard = dashboardPage.getHabitCard(habitTitle);
		await habitCard.clickDelete();
		await dashboardPage.deleteHabitModal.expectVisible();
		await dashboardPage.deleteHabitModal.cancel();
		await dashboardPage.deleteHabitModal.expectHidden();

		// Verification: Ensure it still exists
		await expect(habitCard.card).toBeVisible();
	});
});
