/**
 * Core Type Definitions for AutoQA Studio
 * Strictly conforms to the JSON test case specification and 5-agent architecture.
 */

export type ProjectInputType = 'website_url' | 'git_repo' | 'local_folder' | 'spec_upload' | 'sandbox_app' | 'pasted_code' | 'zip_upload';

export interface PastedSourceFile {
  id: string;
  name: string;
  path?: string;
  content: string;
  language: string;
  sizeBytes: number;
  lineCount: number;
}

export interface Project {
  id: string;
  name: string;
  inputType: ProjectInputType;
  targetUrl?: string;
  repositoryUrl?: string;
  localFolderPath?: string;
  localFilesCount?: number;
  localFilesList?: string[];
  detectedFramework?: string;
  packageJsonData?: any;
  localDevUrl?: string;
  specDocument?: string;
  pastedFiles?: PastedSourceFile[];
  zipFileName?: string;
  codebaseCoverageNotes?: string;
  createdAt: string;
  status: 'draft' | 'analyzed' | 'tests_generated' | 'running' | 'completed';
  sampleAppId?: string;
}

export interface RouteMetadata {
  path: string;
  name: string;
  description: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  interactiveElements: {
    type: 'button' | 'input' | 'select' | 'form' | 'link' | 'modal';
    selector: string;
    label: string;
    purpose: string;
  }[];
  potentialRisks: string[];
}

export interface ApplicationAnalysis {
  projectId: string;
  appName: string;
  version: string;
  summary: string;
  techStackDetected: string[];
  routes: RouteMetadata[];
  boundaryScenarios: string[];
  recommendedTestSuites: {
    name: string;
    description: string;
    estimatedCases: number;
    priority: 'smoke' | 'critical-path' | 'regression' | 'edge-cases' | 'functional' | 'boundary' | 'negative';
  }[];
  generatedAt: string;
}

export interface UserStoryItem {
  id: string;
  title: string;
  role: string;
  action: string;
  benefit: string;
  acceptanceCriteria: string[];
}

export interface RequirementsAnalysisResult {
  appName: string;
  summary: string;
  userStories: UserStoryItem[];
  acceptanceCriteriaCount: number;
  identifiedRisks: string[];
  boundaryScenarios: string[];
  testCases: TestCase[];
  generatedAt: string;
}

export type TestActionType =
  | 'navigate'
  | 'fill'
  | 'click'
  | 'assert_visible'
  | 'assert_text'
  | 'assert_value'
  | 'select'
  | 'wait'
  | 'screenshot';

export interface TestStep {
  action: TestActionType;
  target: string;
  value?: string;
  description?: string;
  timeoutMs?: number;
}

export type TestPriority = 'critical' | 'high' | 'medium' | 'low';

export type TestCaseStatus = 'pending_review' | 'approved' | 'rejected' | 'draft';

export interface TestCase {
  test_id: string;
  requirement_id: string;
  title: string;
  module?: string;
  priority: TestPriority;
  preconditions: string[];
  steps: TestStep[];
  expected_result: string;
  status: TestCaseStatus;
  category?: 'smoke' | 'functional' | 'boundary' | 'negative' | 'regression' | 'critical-path' | 'edge-cases';
  automation_feasibility?: 'automated_playwright' | 'manual_verification_required' | 'api_mock_required';
  uncertainAssumptions?: string[];
  reviewNotes?: string;
}

export interface TestReviewFeedback {
  testId: string;
  verdict: 'approved' | 'needs_revision' | 'rejected';
  score: number; // 0 - 100
  notes: string[];
  selectorStabilityScore: 'high' | 'medium' | 'fragile';
  assertionRigor: 'strong' | 'acceptable' | 'weak';
}

export type TriageCategory = 'PRODUCT_DEFECT' | 'TEST_SCRIPT_ISSUE' | 'ENVIRONMENT_ISSUE';

export interface StepExecutionRecord {
  stepIndex: number;
  action: TestActionType;
  target: string;
  value?: string;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  durationMs: number;
  screenshotUrl?: string;
  domSnapshot?: string;
  logMessage?: string;
  errorMessage?: string;
}

export interface DefectTriage {
  id: string;
  testId: string;
  testTitle: string;
  category: TriageCategory;
  confidence: number; // 0 - 100
  severity: 'critical' | 'major' | 'minor';
  rootCauseAnalysis: string;
  failedStep: TestStep;
  actualBehavior: string;
  expectedBehavior: string;
  suggestedFix: string;
  codeSnippet?: string;
}

export interface TestResult {
  testId: string;
  testTitle: string;
  priority: TestPriority;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  stepRecords: StepExecutionRecord[];
  defect?: DefectTriage;
  logs: string[];
  executedAt: string;
}

export interface TestRun {
  id: string;
  projectId: string;
  projectName: string;
  target: string;
  startedAt: string;
  completedAt?: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  totalTests: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  durationMs: number;
  results: TestResult[];
  defects: DefectTriage[];
  browser: 'Playwright Chromium' | 'Playwright Firefox' | 'Playwright WebKit';
  environment: 'Headless Sandbox' | 'Docker Runner' | 'Staging URL';
}

export interface QASummaryReport {
  runId: string;
  projectName: string;
  target: string;
  executionTimestamp: string;
  passRate: number; // percentage
  releaseVerdict: 'GO_FOR_RELEASE' | 'CONDITIONAL_APPROVAL' | 'NO_GO_BLOCKERS_FOUND';
  verdictReason: string;
  executiveSummary: string;
  keyFindings: string[];
  coverageMatrix: {
    feature: string;
    totalTests: number;
    passedTests: number;
    status: 'pass' | 'fail' | 'warn';
  }[];
  criticalDefects: DefectTriage[];
  actionItems: string[];
}

export interface AgentActivity {
  agentNumber: 1 | 2 | 3 | 4 | 5;
  agentName: string;
  status: 'idle' | 'working' | 'completed' | 'warning';
  message: string;
  timestamp: string;
}

export interface BRDObjective {
  id: string;
  category: 'Business' | 'User Experience' | 'Technical' | 'Compliance';
  statement: string;
  metric: string;
}

export interface BRDStakeholder {
  role: string;
  nameOrTeam: string;
  responsibility: string;
  influence: 'High' | 'Medium' | 'Low';
}

export interface BRDEpic {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  inScope: boolean;
}

export interface BRDUserStory {
  id: string;
  epicId?: string;
  title: string;
  role: string;
  action: string;
  benefit: string;
  acceptanceCriteria: {
    id: string;
    title: string;
    given: string;
    when: string;
    then: string;
  }[];
}

export interface RequirementsTraceabilityItem {
  reqId: string;
  userStoryId: string;
  testCaseId: string;
  testTitle: string;
  priority: string;
  verificationMethod: 'Playwright E2E' | 'API Validation' | 'Visual Regression';
  executionStatus: 'Passed' | 'Failed' | 'Pending Review' | 'Not Run';
}

export interface BRDDocument {
  documentId: string;
  version: string;
  title: string;
  projectName: string;
  author: string;
  targetRelease: string;
  createdDate: string;
  executiveSummary: string;
  businessObjectives: BRDObjective[];
  stakeholders: BRDStakeholder[];
  scopeIn: string[];
  scopeOut: string[];
  epics: BRDEpic[];
  userStories: BRDUserStory[];
  traceabilityMatrix: RequirementsTraceabilityItem[];
  nonFunctionalRequirements: {
    category: string;
    requirement: string;
    slaOrTarget: string;
  }[];
}
