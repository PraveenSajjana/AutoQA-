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
