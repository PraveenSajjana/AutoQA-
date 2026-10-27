import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for AutoQA Studio Application Shell & Workflow Screens
 * Uses stable web-first locators (getByRole, getByPlaceholder, getByLabel)
 */
export class AutoQAPage {
  readonly page: Page;

  // Header & Navigation locators
  readonly logo: Locator;
  readonly newProjectBtn: Locator;
  readonly globalSearchBtn: Locator;
  readonly themeToggleBtn: Locator;
  readonly notificationsBtn: Locator;
  readonly sidebarCollapseBtn: Locator;

  // Sidebar Nav Links
  readonly navOverview: Locator;
  readonly navWorkflow: Locator;
  readonly navProjects: Locator;
  readonly navTestSuites: Locator;
  readonly navTestRuns: Locator;
  readonly navDefects: Locator;
  readonly navRequirements: Locator;
  readonly navReports: Locator;
  readonly navIntegrations: Locator;
  readonly navSettings: Locator;

  // Step 1: Onboarding form locators
  readonly targetUrlInput: Locator;
  readonly projectNameInput: Locator;
  readonly environmentSelect: Locator;
  readonly credentialsCheckbox: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly startAnalysisBtn: Locator;
  readonly flipkartSampleCard: Locator;
  readonly novashopSampleCard: Locator;
  readonly observeSampleCard: Locator;

  // Step 2: Application Analysis locators
  readonly generateTestCasesBtn: Locator;
  readonly reanalyzeBtn: Locator;
  readonly addCustomRouteBtn: Locator;

  // Step 3: Test Case Review Gate locators
  readonly searchTestCasesInput: Locator;
  readonly approveAllBtn: Locator;
  readonly proceedToExecutionBtn: Locator;
  readonly bulkApproveCheckmark: Locator;

  // Step 4: Test Execution workspace locators
  readonly runSuiteBtn: Locator;
  readonly exportJsonBtn: Locator;
  readonly exportHtmlBtn: Locator;
  readonly defectModeSelect: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation & Shell
    this.logo = page.locator('span.font-bold:has-text("QA-Agent")');
    this.newProjectBtn = page.getByRole('button', { name: 'New Project' }).first();
    this.globalSearchBtn = page.getByTitle(/Search/i);
    this.themeToggleBtn = page.getByRole('button', { name: /Switch to (light|dark) mode/i });
    this.notificationsBtn = page.getByRole('button', { name: /View notifications/i });
    this.sidebarCollapseBtn = page.getByRole('button', { name: /(Collapse|Expand) sidebar/i });

    // Sidebar items
    this.navOverview = page.getByRole('button', { name: 'Overview' });
    this.navWorkflow = page.getByRole('button', { name: 'End-to-End QA' });
    this.navProjects = page.getByRole('button', { name: /Projects/i });
    this.navTestSuites = page.getByRole('button', { name: /Test Suites/i });
    this.navTestRuns = page.getByRole('button', { name: 'Test Runs' });
    this.navDefects = page.getByRole('button', { name: /Defects/i });
    this.navRequirements = page.getByRole('button', { name: 'Requirements' });
    this.navReports = page.getByRole('button', { name: 'Reports' });
    this.navIntegrations = page.getByRole('button', { name: 'Integrations' });
    this.navSettings = page.getByRole('button', { name: 'Settings' });

    // Step 1: Onboarding
    this.targetUrlInput = page.locator('#target-url-input');
    this.projectNameInput = page.locator('#project-name-input');
    this.environmentSelect = page.locator('#environment-select');
    this.credentialsCheckbox = page.getByRole('checkbox', { name: /Include Test Credentials/i });
    this.usernameInput = page.getByPlaceholder(/Test Email \/ Username/i);
    this.passwordInput = page.getByPlaceholder(/Test Password/i);
    this.startAnalysisBtn = page.getByRole('button', { name: /Start Application Analysis/i });
    this.flipkartSampleCard = page.locator('div:has-text("Flipkart E-Commerce")').last();
    this.novashopSampleCard = page.locator('div:has-text("NovaShop Modern Store")').last();
    this.observeSampleCard = page.locator('div:has-text("Observe.ai Speech QA")').last();

    // Step 2: Analysis
    this.generateTestCasesBtn = page.getByRole('button', { name: /Generate Test Cases/i });
    this.reanalyzeBtn = page.getByRole('button', { name: /Re-analyze/i });
    this.addCustomRouteBtn = page.getByRole('button', { name: /Add Custom Route/i });

    // Step 3: Review
    this.searchTestCasesInput = page.getByPlaceholder(/Search test cases/i);
    this.approveAllBtn = page.getByRole('button', { name: /Approve All/i });
    this.proceedToExecutionBtn = page.getByRole('button', { name: /Proceed to Execution/i });
    this.bulkApproveCheckmark = page.locator('svg.lucide-check-check');

    // Step 4: Execution
    this.runSuiteBtn = page.getByRole('button', { name: /Run Test Suite/i });
    this.exportJsonBtn = page.getByRole('button', { name: /Export JSON Report/i });
    this.exportHtmlBtn = page.getByRole('button', { name: /Export HTML Report/i });
    this.defectModeSelect = page.locator('select').first();
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.logo).toBeVisible();
  }

  async onboardNewProject(url: string, name: string) {
    await this.targetUrlInput.fill(url);
    await this.projectNameInput.fill(name);
    await this.startAnalysisBtn.click();
  }

  async approveAllAndProceed() {
    await expect(this.approveAllBtn).toBeVisible();
    await this.approveAllBtn.click();
    await expect(this.proceedToExecutionBtn).toBeEnabled();
    await this.proceedToExecutionBtn.click();
  }
}
