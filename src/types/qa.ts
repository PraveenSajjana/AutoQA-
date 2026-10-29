/**
 * Core Type Definitions for AutoQA Studio
 * Strictly conforms to the JSON test case specification and 5-agent architecture.
 */

export type ProjectInputType = 'website_url' | 'git_repo' | 'local_folder' | 'spec_upload' | 'sandbox_app' | 'pasted_code' | 'zip_upload' | 'workspace_scan';


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

export interface DiscoveredFeature {
  id: string; // e.g. FEAT-001
  name: string;
  description: string;
  sourceFilePaths: string[];
  relevantRoutesOrEndpoints: string[];
  relatedComponents: string[];
  dependencies: string[];
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  riskRationale: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  evidence: string;
  analysisLimitations: string;
  confirmed: boolean; // toggle to include or exclude from test generation
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
  featureId?: string;
}

export interface ApplicationAnalysis {
  projectId: string;
  appName: string;
  version: string;
  summary: string;
  techStackDetected: string[];
  entryPoints?: string[];
  sourceRevision?: string; // Git commit SHA, branch, or folder path
  discoveredFeatures?: DiscoveredFeature[];
  apiEndpoints?: string[];
  databaseModels?: string[];
  existingTestTooling?: string[];
  routes: RouteMetadata[];
  boundaryScenarios: string[];
  recommendedTestSuites: {
    name: string;
    description: string;
    estimatedCases: number;
    priority: 'smoke' | 'critical-path' | 'regression' | 'edge-cases' | 'functional' | 'boundary' | 'negative';
  }[];
  limitations?: string[];
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
  feature_id?: string;
  title: string;
  objective?: string;
  module?: string;
  priority: TestPriority;
  category?: 'smoke' | 'functional' | 'boundary' | 'negative' | 'regression' | 'critical-path' | 'edge-cases';
  test_type?: 'positive' | 'negative' | 'boundary' | 'security' | 'regression' | 'accessibility' | 'contract';
  traceability?: string;
  evidence?: string;
  confidence?: 'high' | 'medium' | 'experimental';
  preconditions: string[];
  test_data?: string | Record<string, any>;
  steps: TestStep[];
  expected_result: string;
  status: TestCaseStatus;
  automation_feasibility?: 'automated_playwright' | 'manual_verification_required' | 'api_mock_required';
  execution_compatibility?: 'playwright_web' | 'api_mock' | 'manual_verification';
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

export type DefectStatus = 'new' | 'confirmed' | 'in_progress' | 'fixed' | 'reopened';
export type DefectClassification = 'product_defect' | 'suspected_defect' | 'test_script_issue' | 'environment_issue' | 'flaky_test';

export interface DefectTriage {
  id: string;
  testId: string;
  testTitle: string;
  category: TriageCategory;
  classification?: DefectClassification;
  status?: DefectStatus;
  confidence: number; // 0 - 100
  severity: 'critical' | 'major' | 'minor';
  rootCauseAnalysis: string;
  failedStep: TestStep;
  actualBehavior: string;
  expectedBehavior: string;
  suggestedFix: string;
  codeSnippet?: string;
  requirementId?: string;
  assignedTo?: string;
  createdAt?: string;
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

export type AppNavigationSection =
  | 'overview'
  | 'workflow'
  | 'projects'
  | 'test-suites'
  | 'test-runs'
  | 'defects'
  | 'requirements'
  | 'reports'
  | 'agent-activity'
  | 'integrations'
  | 'settings';

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkSection?: AppNavigationSection;
}

export interface TraceabilityRequirement {
  id: string;
  code: string; // e.g. REQ-ECOM-01
  title: string;
  description: string;
  module: string;
  priority: TestPriority;
  status: 'covered' | 'partial' | 'uncovered';
  testCaseIds: string[];
  defectIds: string[];
  lastExecutionStatus?: 'passed' | 'failed' | 'running' | 'untested';
}
