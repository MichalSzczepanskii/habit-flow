import { type Locator, type Page } from '@playwright/test';
import { CreateHabitModal } from '../components/CreateHabitModal';
import { EditHabitModal } from '../components/EditHabitModal';
import { DeleteHabitModal } from '../components/DeleteHabitModal';
import { HabitCard } from '../components/HabitCard';

export class DashboardPage {
	readonly page: Page;
	readonly createFirstHabitButton: Locator;
	readonly createNewHabitButton: Locator;
	readonly createHabitModal: CreateHabitModal;
	readonly editHabitModal: EditHabitModal;
	readonly deleteHabitModal: DeleteHabitModal;

	constructor(page: Page) {
		this.page = page;
		this.createFirstHabitButton = page.getByTestId('create-first-habit-btn');
		this.createNewHabitButton = page.getByTestId('create-new-habit-btn');
		this.createHabitModal = new CreateHabitModal(page);
		this.editHabitModal = new EditHabitModal(page);
		this.deleteHabitModal = new DeleteHabitModal(page);
	}
	async goto() {
		await this.page.goto('/dashboard');
	}

	async clickCreateFirstHabitButton() {
		await this.createFirstHabitButton.click();
	}

	async clickCreateNewHabitButton() {
		await this.createNewHabitButton.click();
	}

	async addHabit() {
		if (!(await this.createFirstHabitButton.isVisible())) {
			await this.clickCreateNewHabitButton();
		} else {
			await this.clickCreateFirstHabitButton();
		}
	}

	getHabitCard(title: string): HabitCard {
		// Find the card that contains a title element with the specific text
		const cardLocator = this.page.getByTestId('habit-card').filter({
			has: this.page.getByTestId('habit-title').filter({ hasText: title })
		});
		return new HabitCard(this.page, cardLocator);
	}

	getHabitCardByIndex(index: number): HabitCard {
		const cardLocator = this.page.getByTestId('habit-card').nth(index);
		return new HabitCard(this.page, cardLocator);
	}
}
