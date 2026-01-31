import { type Locator, type Page } from '@playwright/test';

export class HabitCard {
	readonly page: Page;
	readonly card: Locator;
	readonly title: Locator;
	readonly toggleButton: Locator;
	readonly optionsButton: Locator;
	readonly renameButton: Locator;
	readonly deleteButton: Locator;

	constructor(page: Page, root: Locator) {
		this.page = page;
		this.card = root;
		this.title = root.getByTestId('habit-title');
		this.toggleButton = root.getByTestId('habit-toggle-btn');
		this.optionsButton = root.getByTestId('habit-options-btn');
		// Note: Rename and Delete buttons are inside the dropdown, so they might not be visible immediately.
		// They are global to the page when the dropdown opens if not scoped correctly,
		// but here we scope them to the card if they are DOM children.
		// In Svelte/DaisyUI dropdowns, the content is usually a sibling or child.
		// Based on the code: <div class="dropdown">...<ul class="dropdown-content">...<button>...
		// So scoping to `root` (the card) is correct.
		this.renameButton = root.getByTestId('habit-rename-btn');
		this.deleteButton = root.getByTestId('habit-delete-btn');
	}

	async getTitle(): Promise<string> {
		return (await this.title.textContent()) || '';
	}

	async toggle() {
		await this.toggleButton.click();
	}

	async openOptions() {
		await this.optionsButton.click();
	}

	async clickRename() {
		await this.openOptions();
		await this.renameButton.click();
	}

	async clickDelete() {
		await this.openOptions();
		await this.deleteButton.click();
	}
}
