import { type Locator, type Page, expect } from '@playwright/test';

export class CreateHabitModal {
	readonly page: Page;
	readonly modal: Locator;
	readonly titleInput: Locator;
	readonly saveButton: Locator;
	readonly cancelButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.modal = page.getByTestId('create-habit-modal');
		this.titleInput = page.getByTestId('habit-title-input');
		this.saveButton = page.getByTestId('save-habit-btn');
		this.cancelButton = page.getByTestId('cancel-habit-btn');
	}

	async fillTitle(title: string) {
		await this.titleInput.fill(title);
	}

	async save() {
		await this.saveButton.click();
	}

	async cancel() {
		await this.cancelButton.click();
	}

	async expectVisible() {
		await expect(this.modal).toBeVisible();
	}

	async expectHidden() {
		await expect(this.modal).toBeHidden();
	}
}
