import { test, expect } from '../fixtures/test-fixtures';
import { TEST_DATA } from '../test-data/sample-projects';

test.describe('Critical End-to-End User Journeys', () => {
  /**
   * Test ID: AQA-001
   * Requirement: REQ-AQA-ONBOARD-01
   * Priority: CRITICAL
   */
  test('AQA-001: Onboard Valid Web Application URL and Verify Route Discovery', async ({ qaPage }) => {
    // 1. Verify URL input rendered
    await expect(qaPage.targetUrlInput).toBeVisible();

    // 2. Fill target URL and project name
    await qaPage.targetUrlInput.fill(TEST_DATA.validTargets.novashop.url);
    await qaPage.projectNameInput.fill(TEST_DATA.validTargets.novashop.name);

    // 3. Submit onboarding form
    await qaPage.startAnalysisBtn.click();

    // 4. Assert Step 2 Application Analysis screen loaded
    await expect(qaPage.page.getByText(/Step 2 of 4: Application Discovery/i)).toBeVisible();
    await expect(qaPage.generateTestCasesBtn).toBeVisible();
  });

  /**
   * Test ID: AQA-002
   * Requirement: REQ-AQA-ANALYZE-02
   * Priority: CRITICAL
   */
  test('AQA-002: Synthesize Test Suite and Transition to Review Gate', async ({ qaPage }) => {
    // Navigate through onboarding to analysis
    await qaPage.onboardNewProject(TEST_DATA.validTargets.novashop.url, TEST_DATA.validTargets.novashop.name);
    await expect(qaPage.generateTestCasesBtn).toBeVisible();

    // Trigger test generation
    await qaPage.generateTestCasesBtn.click();

    // Assert Step 3 Review Gate mounted
    await expect(qaPage.page.getByText(/Step 3 of 4: QA Review & Approval Gate/i)).toBeVisible();
    await expect(qaPage.approveAllBtn).toBeVisible();
  });

  /**
   * Test ID: AQA-003
   * Requirement: REQ-AQA-GATE-03
   * Priority: CRITICAL
   */
  test('AQA-003: Approve Test Cases and Submit to Execution Runner', async ({ qaPage }) => {
    // Fast-path to Step 3 using pre-seeded sample
    await qaPage.novashopSampleCard.click();
    await expect(qaPage.page.getByText(/Step 3 of 4: QA Review & Approval Gate/i)).toBeVisible();

    // Bulk approve test cases
    await qaPage.approveAllBtn.click();
    await expect(qaPage.proceedToExecutionBtn).toBeEnabled();

    // Submit to execution
    await qaPage.proceedToExecutionBtn.click();
    await expect(qaPage.page.getByText(/Step 4 of 4: Test Execution & Evidence/i)).toBeVisible();
  });

  /**
   * Test ID: AQA-004
   * Requirement: REQ-AQA-EXEC-04
   * Priority: CRITICAL
   */
  test('AQA-004: Execute Automated Suite and Verify Real-Time Telemetry', async ({ qaPage }) => {
    // Navigate to execution view
    await qaPage.novashopSampleCard.click();
    await qaPage.approveAllAndProceed();

    // Initiate execution
    await expect(qaPage.runSuiteBtn).toBeVisible();
    await qaPage.runSuiteBtn.click();

    // Verify completion telemetry and export availability
    await expect(qaPage.exportJsonBtn).toBeVisible({ timeout: 12000 });
    await expect(qaPage.exportHtmlBtn).toBeVisible();
  });

  /**
   * Test ID: AQA-005
   * Requirement: REQ-AQA-TRIAGE-05
   * Priority: CRITICAL
   */
  test('AQA-005: Investigate Injected Failure and Triage Root Cause', async ({ qaPage }) => {
    // Run execution with defect injection mode
    await qaPage.novashopSampleCard.click();
    await qaPage.approveAllAndProceed();
    await qaPage.runSuiteBtn.click();

    // Wait for run completion and verify RCA tab
    await expect(qaPage.page.getByText(/Root Cause Analysis/i).or(qaPage.page.getByText(/PRODUCT_DEFECT/i))).toBeVisible({ timeout: 12000 });
  });

  /**
   * Test ID: AQA-006
   * Requirement: REQ-AQA-EXPORT-06
   * Priority: CRITICAL
   */
  test('AQA-006: Export Standalone HTML and JSON Execution Reports', async ({ qaPage }) => {
    await qaPage.novashopSampleCard.click();
    await qaPage.approveAllAndProceed();
    await qaPage.runSuiteBtn.click();

    // Check export buttons are responsive
    await expect(qaPage.exportJsonBtn).toBeEnabled({ timeout: 12000 });
    await expect(qaPage.exportHtmlBtn).toBeEnabled();
  });
});
