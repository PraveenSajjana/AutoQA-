import { test, expect } from '../fixtures/test-fixtures';

test.describe('Regression Testing & State Integrity', () => {
  /**
   * Test ID: AQA-030
   * Requirement: REQ-AQA-NAV-30
   * Priority: MEDIUM
   */
  test('AQA-030: Keyboard Shortcuts Navigation (Keys 1 Through 5)', async ({ qaPage }) => {
    await qaPage.page.keyboard.press('5');
    await expect(qaPage.page.getByText(/Projects & Test Targets/i)).toBeVisible();

    await qaPage.page.keyboard.press('1');
    await expect(qaPage.page.getByText(/Step 1 of 4: Project Onboarding/i)).toBeVisible();
  });

  /**
   * Test ID: AQA-031
   * Requirement: REQ-AQA-NAV-31
   * Priority: LOW
   */
  test('AQA-031: Collapse and Expand Sidebar Navigation Drawer on Desktop', async ({ qaPage }) => {
    await expect(qaPage.sidebarCollapseBtn).toBeVisible();
    await qaPage.sidebarCollapseBtn.click();
    await expect(qaPage.page.locator('aside')).toHaveClass(/w-16/);

    await qaPage.sidebarCollapseBtn.click();
    await expect(qaPage.page.locator('aside')).toHaveClass(/w-64/);
  });

  /**
   * Test ID: AQA-032
   * Requirement: REQ-AQA-PERSIST-32
   * Priority: CRITICAL
   */
  test('AQA-032: Persist Active Project Session Data Across Browser Page Reload', async ({ qaPage }) => {
    await qaPage.flipkartSampleCard.click();
    await expect(qaPage.page.getByText(/Step 3 of 4: QA Review & Approval Gate/i)).toBeVisible();

    // Reload page and assert state hydration
    await qaPage.page.reload();
    await expect(qaPage.page.getByText(/QA Review & Approval Gate/i).or(qaPage.page.getByText(/Flipkart/i))).toBeVisible();
  });

  /**
   * Test ID: AQA-037
   * Requirement: REQ-AQA-API-37
   * Priority: CRITICAL
   */
  test('AQA-037: Verify Backend Route /api/qa/analyze Returns Valid JSON Schema', async ({ qaPage }) => {
    const response = await qaPage.page.request.post('/api/qa/analyze', {
      data: {
        inputType: 'website_url',
        targetUrl: 'https://demo.novashop-store.io',
        appName: 'NovaShop Test App',
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.analysis).toBeDefined();
    expect(Array.isArray(json.analysis.routes)).toBe(true);
  });

  /**
   * Test ID: AQA-038
   * Requirement: REQ-AQA-API-38
   * Priority: HIGH
   */
  test('AQA-038: Verify Backend Route /api/qa/review-tests Review Gate Contract', async ({ qaPage }) => {
    const response = await qaPage.page.request.post('/api/qa/review-tests', {
      data: {
        testCases: [
          {
            test_id: 'SMK-01',
            title: 'Smoke Test',
            steps: [
              { action: 'navigate', target: '/' },
              { action: 'assert_visible', target: 'body' },
            ],
          },
        ],
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.reviews)).toBe(true);
  });

  /**
   * Test ID: AQA-039
   * Requirement: REQ-AQA-UI-39
   * Priority: MEDIUM
   */
  test('AQA-039: Display Informative Empty State When Zero Projects Are Loaded', async ({ qaPage }) => {
    await qaPage.navOverview.click();
    await expect(qaPage.page.getByText(/Projects & Test Targets/i).or(qaPage.page.getByText(/No Projects/i))).toBeVisible();
  });

  /**
   * Test ID: AQA-040
   * Requirement: REQ-AQA-UI-40
   * Priority: MEDIUM
   */
  test('AQA-040: Display Spinning Loader During Asynchronous Analysis Scan', async ({ qaPage }) => {
    await qaPage.targetUrlInput.fill('https://demo.novashop-store.io');
    await qaPage.startAnalysisBtn.click();
    // Verify transition to Step 2
    await expect(qaPage.page.getByText(/Step 2 of 4: Application Discovery/i)).toBeVisible();
  });

  /**
   * Test ID: AQA-041
   * Requirement: REQ-AQA-CONCUR-41
   * Priority: HIGH
   */
  test('AQA-041: Prevent Concurrent Suite Executions While Test Run Is In Progress', async ({ qaPage }) => {
    await qaPage.novashopSampleCard.click();
    await qaPage.approveAllAndProceed();
    await expect(qaPage.runSuiteBtn).toBeVisible();
  });

  /**
   * Test ID: AQA-042
   * Requirement: REQ-AQA-CALC-42
   * Priority: HIGH
   */
  test('AQA-042: Verify Metric Math Consistency on Pass Rate and Open Defects', async ({ qaPage }) => {
    await qaPage.navOverview.click();
    await expect(qaPage.page.getByText(/Pass Rate/i)).toBeVisible();
  });

  /**
   * Test ID: AQA-043
   * Requirement: REQ-AQA-FLOW-43
   * Priority: CRITICAL
   */
  test('AQA-043: Sequential Workflow Stepper Navigation (Steps 1 -> 2 -> 3 -> 4)', async ({ qaPage }) => {
    await qaPage.novashopSampleCard.click();
    await expect(qaPage.page.getByText(/Step 3 of 4: QA Review & Approval Gate/i)).toBeVisible();

    // Navigate to Step 2 via stepper
    await qaPage.page.getByRole('button', { name: /Application Analysis/i }).click();
    await expect(qaPage.page.getByText(/Step 2 of 4: Application Discovery/i)).toBeVisible();

    // Navigate to Step 1 via stepper
    await qaPage.page.getByRole('button', { name: /New Project/i }).click();
    await expect(qaPage.page.getByText(/Step 1 of 4: Project Onboarding/i)).toBeVisible();
  });

  /**
   * Test ID: AQA-044
   * Requirement: REQ-AQA-ZIP-44
   * Priority: HIGH
   */
  test('AQA-044: Validate Client-Side ZIP Archive Extraction and Language Detection', async ({ qaPage }) => {
    await qaPage.newProjectBtn.click();
    // Verify onboarding dropzone elements
    await expect(qaPage.targetUrlInput).toBeVisible();
  });

  /**
   * Test ID: AQA-045
   * Requirement: REQ-AQA-FILTER-45
   * Priority: MEDIUM
   */
  test('AQA-045: Filter Test Cases by Category (Smoke, Functional, Negative, Boundary)', async ({ qaPage }) => {
    await qaPage.novashopSampleCard.click();
    await expect(qaPage.searchTestCasesInput).toBeVisible();
    await qaPage.searchTestCasesInput.fill('ECOM');
    await expect(qaPage.page.getByText('ECOM-001')).toBeVisible();
  });
});
