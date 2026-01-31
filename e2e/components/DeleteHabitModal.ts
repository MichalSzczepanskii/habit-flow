import { type Locator, type Page, expect } from '@playwright/test';

export class DeleteHabitModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByTestId('delete-habit-modal');
    this.confirmButton = page.getByTestId('delete-habit-confirm-btn');
    this.cancelButton = page.getByTestId('delete-habit-cancel-btn');
  }

  async confirm() {
    await this.confirmButton.click();
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
