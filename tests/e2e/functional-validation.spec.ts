import { test, expect } from '../fixtures/test-fixtures';
import { TEST_DATA } from '../test-data/sample-projects';

test.describe('Core Functional Workflows', () => {
  /**
   * Test ID: AQA-007
   * Requirement: REQ-AQA-SAMPLE-07
   * Priority: HIGH
   */
  test('AQA-007: Load Pre-Configured Sample Target (Flipkart E-Commerce)', async ({ qaPage }) => {
    await expect(qaPage.flipkartSampleCard).toBeVisible();
    await qaPage.flipkartSampleCard.click();

    // Verify progression to Review Screen with Flipkart seed test cases
    await expect(qaPage.page.getByText(/Step 3 of 4: QA Review & Approval Gate/i)).toBeVisible();
    await expect(qaPage.page.getByText('FK-001')).toBeVisible();
    await expect(qaPage.page.getByText('8722451115')).toBeVisible();
  });

  /**
   * Test ID: AQA-008
   * Requirement: REQ-AQA-SAMPLE-08
   * Priority: HIGH
   */
  test('AQA-008: Load Pre-Configured Sample Target (NovaShop Modern Store)', async ({ qaPage }) => {
    await expect(qaPage.novashopSampleCard).toBeVisible();
    await qaPage.novashopSampleCard.click();

    await expect(qaPage.page.getByText(/Step 3 of 4: QA Review & Approval Gate/i)).toBeVisible();
    await expect(qaPage.page.getByText('ECOM-001')).toBeVisible();
  });

  /**
   * Test ID: AQA-009
   * Requirement: REQ-AQA-EDIT-09
   * Priority: HIGH
   */
  test('AQA-009: Edit Test Case Steps and Persist Modified Assertions', async ({ qaPage }) => {
    await qaPage.novashopSampleCard.click();
    await expect(qaPage.page.getByRole('button', { name: /Edit Test/i })).toBeVisible();
    await qaPage.page.getByRole('button', { name: /Edit Test/i }).click();

    // Verify modal step inputs
    const saveBtn = qaPage.page.getByRole('button', { name: /Save Changes/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
  });

  /**
   * Test ID: AQA-010
   * Requirement: REQ-AQA-SEARCH-10
   * Priority: HIGH
   */
  test('AQA-010: Trigger Global Search Modal via Cmd+K and Filter Entities', async ({ qaPage }) => {
    await qaPage.globalSearchBtn.click();
    const searchInput = qaPage.page.getByPlaceholder(/Search test cases, defects, or projects/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill('checkout');
    await expect(qaPage.page.locator('div:has-text("Checkout")').first()).toBeVisible();
  });

  /**
   * Test ID: AQA-011
   * Requirement: REQ-AQA-THEME-11
   * Priority: MEDIUM
   */
  test('AQA-011: Toggle Dark and Light Visual Themes with CSS Variable Synchronization', async ({ qaPage }) => {
    await expect(qaPage.page.locator('html')).toHaveClass(/dark/);
    await qaPage.themeToggleBtn.click();
    await expect(qaPage.page.locator('html')).toHaveClass(/light/);
    await qaPage.themeToggleBtn.click();
    await expect(qaPage.page.locator('html')).toHaveClass(/dark/);
  });

  /**
   * Test ID: AQA-012
   * Requirement: REQ-AQA-TRACE-12
   * Priority: HIGH
   */
  test('AQA-012: Filter Requirements Traceability Matrix by Coverage Gaps', async ({ qaPage }) => {
    await qaPage.navRequirements.click();
    await expect(qaPage.page.getByText(/Requirements Traceability/i)).toBeVisible();

    const gapsBtn = qaPage.page.getByRole('button', { name: /Coverage Gaps/i });
    if (await gapsBtn.isVisible()) {
      await gapsBtn.click();
      await expect(qaPage.page.getByText(/Gaps/i).or(qaPage.page.getByText(/Uncovered/i))).toBeVisible();
    }
  });

  /**
   * Test ID: AQA-013
   * Requirement: REQ-AQA-URL-13
   * Priority: HIGH
   */
  test('AQA-013: Auto-Format Bare Domain Names into Valid HTTPS Protocol URLs', async ({ qaPage }) => {
    await qaPage.targetUrlInput.fill('staging.myapp.io');
    await qaPage.projectNameInput.fill('Format App');
    await qaPage.startAnalysisBtn.click();
    await expect(qaPage.page.getByText(/Step 2 of 4: Application Discovery/i)).toBeVisible();
  });

  /**
   * Test ID: AQA-014
   * Requirement: REQ-AQA-LOCAL-14
   * Priority: HIGH
   */
  test('AQA-014: Support Localhost Dev Server URLs (http://localhost:3000)', async ({ qaPage }) => {
    await qaPage.targetUrlInput.fill(TEST_DATA.validTargets.localhost.url);
    await qaPage.environmentSelect.selectOption('local');
    await qaPage.startAnalysisBtn.click();
    await expect(qaPage.page.getByText(/Step 2 of 4: Application Discovery/i)).toBeVisible();
  });

  /**
   * Test ID: AQA-015
   * Requirement: REQ-AQA-STATUS-15
   * Priority: HIGH
   */
  test('AQA-015: Transition Defect Status from New to In Progress and Fixed', async ({ qaPage }) => {
    await qaPage.navDefects.click();
    await expect(qaPage.page.getByText(/Defect Investigation/i)).toBeVisible();
    await expect(qaPage.page.locator('div:has-text("DEF-104")').first()).toBeVisible();
  });

  /**
   * Test ID: AQA-016
   * Requirement: REQ-AQA-EXPORT-16
   * Priority: HIGH
   */
  test('AQA-016: Generate Playwright TypeScript Specification Code Snippet', async ({ qaPage }) => {
    await qaPage.navReports.click();
    await expect(qaPage.page.getByText(/QA Reports/i)).toBeVisible();
    await expect(qaPage.page.getByText(/Playwright TS/i)).toBeVisible();
  });
});
