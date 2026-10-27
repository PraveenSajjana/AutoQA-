import { test, expect } from '../fixtures/test-fixtures';
import { TEST_DATA } from '../test-data/sample-projects';

test.describe('Access Control & Human Signoff Gating', () => {
  /**
   * Test ID: AQA-033
   * Requirement: REQ-AQA-AUTH-33
   * Priority: HIGH
   */
  test('AQA-033: Toggle Test Credentials Form and Mask Password Values', async ({ qaPage }) => {
    await expect(qaPage.credentialsCheckbox).toBeVisible();
    await qaPage.credentialsCheckbox.check();

    await expect(qaPage.usernameInput).toBeVisible();
    await expect(qaPage.passwordInput).toBeVisible();
    await expect(qaPage.passwordInput).toHaveAttribute('type', 'password');

    await qaPage.usernameInput.fill(TEST_DATA.mockCredentials.validUser);
    await qaPage.passwordInput.fill(TEST_DATA.mockCredentials.validPass);
  });

  /**
   * Test ID: AQA-034
   * Requirement: REQ-AQA-AUTH-34
   * Priority: MEDIUM
   */
  test('AQA-034: Verify Security Disclosures Banner for Local Protected Execution', async ({ qaPage }) => {
    await expect(qaPage.page.getByText(/Safe Execution & Browser-Local Persistence/i)).toBeVisible();
    await expect(qaPage.page.getByText(/No untrusted server processes are spawned/i)).toBeVisible();
  });

  /**
   * Test ID: AQA-035
   * Requirement: REQ-AQA-GATE-35
   * Priority: HIGH
   */
  test('AQA-035: Individual Test Case Approval and Rejection State Transitions', async ({ qaPage }) => {
    await qaPage.novashopSampleCard.click();
    await expect(qaPage.page.getByText(/Step 3 of 4: QA Review & Approval Gate/i)).toBeVisible();

    const rejectBtn = qaPage.page.getByRole('button', { name: /^Reject$/i }).first();
    await rejectBtn.click();
    await expect(qaPage.page.getByText(/Rejected/i).first()).toBeVisible();

    const approveBtn = qaPage.page.getByRole('button', { name: /^Approve$/i }).first();
    await approveBtn.click();
    await expect(qaPage.page.getByText(/Approved/i).first()).toBeVisible();
  });

  /**
   * Test ID: AQA-036
   * Requirement: REQ-AQA-GATE-36
   * Priority: MEDIUM
   */
  test('AQA-036: Display Review Feedback Score and Assertion Rigor Badges', async ({ qaPage }) => {
    await qaPage.novashopSampleCard.click();
    await expect(qaPage.page.getByText(/Step 3 of 4: QA Review & Approval Gate/i)).toBeVisible();

    // Verify assertion rigor indicators
    await expect(qaPage.page.getByText(/Selector Stability/i).or(qaPage.page.getByText(/Assertion Rigor/i)).first()).toBeVisible();
  });
});
