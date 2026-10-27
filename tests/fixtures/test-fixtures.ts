import { test as base } from '@playwright/test';
import { AutoQAPage } from '../pages/AutoQAPage';

/**
 * Extended Playwright test fixtures providing pre-initialized Page Object
 */
export const test = base.extend<{
  qaPage: AutoQAPage;
}>({
  qaPage: async ({ page }, use) => {
    const qaPage = new AutoQAPage(page);
    await qaPage.goto();
    await use(qaPage);
  },
});

export { expect } from '@playwright/test';
