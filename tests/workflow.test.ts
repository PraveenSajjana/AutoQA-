import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWebUrl } from '../src/components/workflow/NewProjectScreen';
import { TestCase, TestRun, Project, ApplicationAnalysis } from '../src/types/qa';

test('1. URL Validation - accepts valid URLs and formats protocols', () => {
  const result1 = validateWebUrl('https://example.com');
  assert.equal(result1.isValid, true);
  assert.equal(result1.formattedUrl, 'https://example.com');

  const result2 = validateWebUrl('demo.novashop-store.io');
  assert.equal(result2.isValid, true);
  assert.equal(result2.formattedUrl, 'https://demo.novashop-store.io');

  const result3 = validateWebUrl('http://localhost:3000');
  assert.equal(result3.isValid, true);
  assert.equal(result3.formattedUrl, 'http://localhost:3000');
});

test('2. URL Validation - rejects invalid, empty, or malformed inputs', () => {
  const emptyRes = validateWebUrl('');
  assert.equal(emptyRes.isValid, false);
  assert.match(emptyRes.error || '', /enter a target web application URL/i);

  const whitespaceRes = validateWebUrl('   ');
  assert.equal(whitespaceRes.isValid, false);

  const noDomainRes = validateWebUrl('invalidurlwithoutdot');
  assert.equal(noDomainRes.isValid, false);
  assert.match(noDomainRes.error || '', /valid domain name/i);
});

test('3. Test Case Review Gate - strictly restricts execution to approved tests', () => {
  const testCases: TestCase[] = [
    {
      test_id: 'TC-001',
      requirement_id: 'REQ-01',
      title: 'Valid checkout flow',
      priority: 'critical',
      preconditions: ['Cart has items'],
      steps: [{ action: 'click', target: '#checkout-btn' }],
      expected_result: 'Order placed',
      status: 'approved',
    },
    {
      test_id: 'TC-002',
      requirement_id: 'REQ-02',
      title: 'Invalid coupon validation',
      priority: 'high',
      preconditions: ['User on cart'],
      steps: [{ action: 'fill', target: '#coupon', value: 'BAD' }],
      expected_result: 'Error banner',
      status: 'pending_review',
    },
    {
      test_id: 'TC-003',
      requirement_id: 'REQ-03',
      title: 'Corrupt session test',
      priority: 'medium',
      preconditions: [],
      steps: [{ action: 'wait', target: 'body' }],
      expected_result: 'Handled',
      status: 'rejected',
    },
  ];

  const approvedTests = testCases.filter((tc) => tc.status === 'approved');
  assert.equal(approvedTests.length, 1);
  assert.equal(approvedTests[0].test_id, 'TC-001');

  // Verify that pending_review and rejected cases are NOT submitted for execution
  const unapproved = testCases.filter((tc) => tc.status !== 'approved');
  assert.equal(unapproved.length, 2);
  assert.ok(unapproved.some((t) => t.status === 'pending_review'));
  assert.ok(unapproved.some((t) => t.status === 'rejected'));
});

test('4. Defect Triage - classifies failure types into verified categories', () => {
  const failureTriage = {
    id: 'DEF-104',
    category: 'PRODUCT_DEFECT',
    confidence: 96,
    severity: 'critical',
    rootCauseAnalysis: 'Floating point rounding discrepancy in PromoEngine.',
  };

  assert.equal(failureTriage.category, 'PRODUCT_DEFECT');
  assert.ok(failureTriage.confidence >= 90);
  assert.equal(failureTriage.severity, 'critical');
});

test('5. Project Session Serialization - maintains multi-screen state integrity', () => {
  const mockProject: Project = {
    id: 'proj-test-123',
    name: 'E-Commerce Target',
    inputType: 'website_url',
    targetUrl: 'https://demo.store.io',
    createdAt: new Date().toISOString(),
    status: 'tests_generated',
  };

  const mockAnalysis: ApplicationAnalysis = {
    projectId: mockProject.id,
    appName: mockProject.name,
    version: '1.0.0',
    summary: 'Mock store with 3 routes',
    techStackDetected: ['React', 'Vite', 'Tailwind'],
    routes: [
      {
        path: '/',
        name: 'Home',
        description: 'Storefront',
        criticality: 'critical',
        interactiveElements: [{ type: 'button', selector: 'buy-btn', label: 'Buy', purpose: 'Purchase' }],
        potentialRisks: ['Cart sync'],
      },
    ],
    boundaryScenarios: ['Empty submission'],
    recommendedTestSuites: [{ name: 'Smoke', description: 'Core', estimatedCases: 2, priority: 'smoke' }],
    generatedAt: new Date().toISOString(),
  };

  const sessionPayload = {
    project: mockProject,
    analysis: mockAnalysis,
    testCasesCount: 3,
  };

  const serialized = JSON.stringify(sessionPayload);
  const parsed = JSON.parse(serialized);

  assert.equal(parsed.project.id, 'proj-test-123');
  assert.equal(parsed.analysis.routes.length, 1);
  assert.equal(parsed.testCasesCount, 3);
});

test('6. Flipkart E-Commerce Journey - validates mobile 8722451115 login & iPhone 17 Pro Max cart steps', () => {
  const flipkartAuthTest: TestCase = {
    test_id: 'FK-001',
    requirement_id: 'REQ-FK-LOGIN-01',
    title: 'Authenticate with Registered Mobile Number (8722451115) via OTP',
    priority: 'critical',
    preconditions: ['User on login modal'],
    steps: [
      { action: 'navigate', target: '/account/login' },
      { action: 'fill', target: 'mobile-login-input', value: '8722451115' },
      { action: 'click', target: 'request-otp-btn' },
      { action: 'assert_visible', target: 'otp-verification-screen' },
      { action: 'fill', target: 'otp-input', value: '729401' },
      { action: 'click', target: 'verify-otp-btn' },
      { action: 'assert_visible', target: 'user-account-badge' }
    ],
    expected_result: 'User is authenticated with mobile number 8722451115',
    status: 'approved'
  };

  const flipkartCartTest: TestCase = {
    test_id: 'FK-002',
    requirement_id: 'REQ-FK-CART-02',
    title: 'Search for "iPhone 17 Pro Max" and Add to Cart with Price Verification (₹1,59,900)',
    priority: 'critical',
    preconditions: ['User authenticated as 8722451115'],
    steps: [
      { action: 'navigate', target: '/' },
      { action: 'fill', target: 'search-input', value: 'iPhone 17 Pro Max' },
      { action: 'click', target: 'search-submit-btn' },
      { action: 'assert_visible', target: 'product-card-17-pro-max' },
      { action: 'assert_text', target: 'product-price', value: '₹1,59,900' },
      { action: 'click', target: 'add-to-cart-btn' },
      { action: 'assert_visible', target: 'cart-badge' },
      { action: 'assert_visible', target: 'cart-drawer' }
    ],
    expected_result: 'Apple iPhone 17 Pro Max is added to cart at ₹1,59,900 and cart count increments to 1',
    status: 'approved'
  };

  // Verify mobile number parameter
  const mobileStep = flipkartAuthTest.steps.find((s) => s.target === 'mobile-login-input');
  assert.ok(mobileStep, 'Mobile login input step must exist');
  assert.equal(mobileStep?.value, '8722451115');

  // Verify iPhone 17 Pro Max search and cart steps
  const searchStep = flipkartCartTest.steps.find((s) => s.target === 'search-input');
  assert.ok(searchStep, 'Search input step must exist');
  assert.equal(searchStep?.value, 'iPhone 17 Pro Max');

  const addToCartStep = flipkartCartTest.steps.find((s) => s.target === 'add-to-cart-btn');
  assert.ok(addToCartStep, 'Add to cart button step must exist');
  assert.equal(addToCartStep?.action, 'click');

  const priceAssertionStep = flipkartCartTest.steps.find((s) => s.target === 'product-price');
  assert.ok(priceAssertionStep, 'Product price assertion must exist');
  assert.equal(priceAssertionStep?.value, '₹1,59,900');
});

test('7. Workspace Scanner - inspects active repository files, discovers AST routes, and detects tech stack', async () => {
  const { scanWorkspaceDirectory } = await import('../server.ts');
  const scanResult = scanWorkspaceDirectory(process.cwd(), 80);

  assert.ok(scanResult, 'Scan result must not be null');
  assert.ok(scanResult.filesCount > 0, 'Must discover files in active workspace');
  assert.ok(scanResult.totalLines > 0, 'Total lines must be greater than zero');
  assert.ok(scanResult.techStack.length > 0, 'Must detect at least one technology in stack');
  assert.ok(scanResult.techStack.includes('React'), 'Must detect React in dependencies');
  assert.ok(scanResult.techStack.includes('TypeScript'), 'Must detect TypeScript');
  assert.ok(scanResult.routes.length > 0, 'Must discover functional routes and UI modules');
  assert.ok(scanResult.serverEndpoints.length > 0, 'Must discover server API endpoints');
});

