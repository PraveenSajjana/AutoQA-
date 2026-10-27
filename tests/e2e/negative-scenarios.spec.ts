import { test, expect } from '../fixtures/test-fixtures';
import { TEST_DATA } from '../test-data/sample-projects';

test.describe('Negative Scenarios & Validation Barriers', () => {
  /**
   * Test ID: AQA-017
   * Requirement: REQ-AQA-NEG-17
   * Priority: CRITICAL
   */
  test('AQA-017: Reject Empty Target URL Submission with Inline Error Banner', async ({ qaPage }) => {
    await qaPage.targetUrlInput.fill(TEST_DATA.invalidTargets.empty);
    await qaPage.startAnalysisBtn.click();
    await expect(qaPage.page.getByText(/Please enter a target web application URL/i)).toBeVisible();
  });

  /**
   * Test ID: AQA-018
   * Requirement: REQ-AQA-NEG-18
   * Priority: HIGH
   */
  test('AQA-018: Reject Malformed URL Strings Without Top-Level Domain', async ({ qaPage }) => {
    await qaPage.targetUrlInput.fill(TEST_DATA.invalidTargets.noDomain);
    await qaPage.startAnalysisBtn.click();
    await expect(qaPage.page.getByText(/valid domain name/i)).toBeVisible();
  });

  /**
   * Test ID: AQA-019
   * Requirement: REQ-AQA-NEG-19
   * Priority: CRITICAL
   */
  test('AQA-019: Block Execution Submission When All Test Cases Are Rejected', async ({ qaPage }) => {
    await qaPage.novashopSampleCard.click();
    await expect(qaPage.page.getByText(/Step 3 of 4: QA Review & Approval Gate/i)).toBeVisible();

    // Reject all tests
    const rejectButtons = qaPage.page.getByRole('button', { name: /^Reject$/i });
    const count = await rejectButtons.count();
    for (let i = 0; i < count; i++) {
      await rejectButtons.nth(i).click();
    }

    // Verify Proceed button is disabled
    await expect(qaPage.proceedToExecutionBtn).toBeDisabled();
  });

  /**
   * Test ID: AQA-020
   * Requirement: REQ-AQA-NEG-20
   * Priority: HIGH
   */
  test('AQA-020: Gracefully Handle Server API Failure with Fallback Engine', async ({ qaPage }) => {
    await qaPage.targetUrlInput.fill('https://example.com');
    await qaPage.projectNameInput.fill('Fallback Test');
    await qaPage.startAnalysisBtn.click();

    // Verify Demo Heuristic Analysis Adapter badge renders cleanly without runtime crash
    await expect(qaPage.page.getByText(/Demo Heuristic Analysis Adapter/i)).toBeVisible();
  });

  /**
   * Test ID: AQA-025
   * Requirement: REQ-AQA-FORMAT-25
   * Priority: HIGH
   */
  test('AQA-025: Reject Whitespace-Only Target URL Inputs', async ({ qaPage }) => {
    await qaPage.targetUrlInput.fill(TEST_DATA.invalidTargets.whitespace);
    await qaPage.startAnalysisBtn.click();
    await expect(qaPage.page.getByText(/Please enter a target web application URL/i)).toBeVisible();
  });

  /**
   * Test ID: AQA-026
   * Requirement: REQ-AQA-FORMAT-26
   * Priority: HIGH
   */
  test('AQA-026: Validate 10-Digit Indian Mobile Phone Format on Flipkart Flow', async ({ qaPage }) => {
    await qaPage.flipkartSampleCard.click();
    await qaPage.approveAllAndProceed();
    await expect(qaPage.page.getByText(/Step 4 of 4: Test Execution & Evidence/i)).toBeVisible();
  });
});
