import React, { useState, useEffect } from 'react';
import { 
  Project, 
  ApplicationAnalysis, 
  TestCase, 
  TestReviewFeedback, 
  TestRun, 
  TestResult, 
  StepExecutionRecord, 
  QASummaryReport,
  DefectTriage
} from './types/qa';
import { SAMPLE_APPS } from './services/sampleApps';
import { Header } from './components/Header';
import { WorkflowStepper } from './components/WorkflowStepper';
import { ProjectOnboarding } from './components/ProjectOnboarding';
import { AppAnalysisView } from './components/AppAnalysisView';
import { TestCaseManager } from './components/TestCaseManager';
import { ExecutionConsole } from './components/ExecutionConsole';
import { ReportExporter } from './components/ReportExporter';
import { LiveBrowserSandbox } from './components/LiveBrowserSandbox';
import { RequirementsAnalyzerModal } from './components/RequirementsAnalyzerModal';
import { CompletePdfModal } from './components/CompletePdfModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { Sparkles, Eye, EyeOff, Terminal, Bug } from 'lucide-react';

export default function App() {
  // Pre-loaded projects from sample apps
  const initialProjects: Project[] = SAMPLE_APPS.map((sa) => ({
    id: sa.id,
    name: sa.name,
    inputType: 'sandbox_app',
    targetUrl: sa.url,
    createdAt: new Date().toISOString(),
    status: 'tests_generated',
    sampleAppId: sa.id,
  }));

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [currentProject, setCurrentProject] = useState<Project>(initialProjects[0]);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [completedStages, setCompletedStages] = useState<number[]>([1, 2, 3]);

  // QA Data state
  const [analysis, setAnalysis] = useState<ApplicationAnalysis | null>(SAMPLE_APPS[0].analysis);
  const [testCases, setTestCases] = useState<TestCase[]>(SAMPLE_APPS[0].seededTestCases);
  const [reviewFeedbacks, setReviewFeedbacks] = useState<Record<string, TestReviewFeedback>>({
    'ECOM-001': {
      testId: 'ECOM-001',
      verdict: 'approved',
      score: 98,
      notes: ['Valid full purchase journey', 'Deterministic assertions in place', 'Low selector drift probability'],
      selectorStabilityScore: 'high',
      assertionRigor: 'strong',
    },
    'ECOM-002': {
      testId: 'ECOM-002',
      verdict: 'approved',
      score: 94,
      notes: ['Financial discount math verified', 'Coupon input target exists in DOM'],
      selectorStabilityScore: 'high',
      assertionRigor: 'strong',
    },
    'ECOM-003': {
      testId: 'ECOM-003',
      verdict: 'approved',
      score: 92,
      notes: ['Negative validation barrier covered', 'Protects against empty payload submissions'],
      selectorStabilityScore: 'high',
      assertionRigor: 'strong',
    },
  });

  const [currentRun, setCurrentRun] = useState<TestRun | null>(null);
  const [summaryReport, setSummaryReport] = useState<QASummaryReport | null>(null);

  // Loading flags
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGeneratingTests, setIsGeneratingTests] = useState<boolean>(false);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [isRunningSuite, setIsRunningSuite] = useState<boolean>(false);

  // Live sandbox visual overlay
  const [showSandboxPreview, setShowSandboxPreview] = useState<boolean>(true);
  const [highlightedSelector, setHighlightedSelector] = useState<string>('');

  // AI Requirements & User Story modal state
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState<boolean>(false);

  // Complete Application PDF modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Keyboard Shortcuts cheat sheet modal state
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Non-intrusive floating toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([
    {
      id: 'init-toast',
      type: 'info',
      title: 'AutoQA Studio Ready',
      description: 'Press [?] for keyboard shortcuts or [R] to run suite',
      duration: 5000,
    },
  ]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, title, description }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Global Keyboard Navigation Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form controls
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsRequirementsModalOpen(false);
        setIsPdfModalOpen(false);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if (e.key === '1') {
        setCurrentStage(1);
        addToast('info', 'Phase 01: Onboarding', 'Target ingestion and repository configuration');
      } else if (e.key === '2') {
        setCurrentStage(2);
        addToast('info', 'Phase 02: Route Analysis', 'Application routes and DOM map');
      } else if (e.key === '3') {
        setCurrentStage(3);
        addToast('info', 'Phase 03: Test Designer', 'Deterministic JSON test cases');
      } else if (e.key === '4') {
        setCurrentStage(4);
        addToast('info', 'Phase 04: Review Gate', 'QA signoff and assertion audits');
      } else if (e.key === '5') {
        setCurrentStage(5);
        addToast('info', 'Phase 05: Execution Engine', 'Playwright run and step traces');
      } else if (e.key === '6') {
        setCurrentStage(6);
        addToast('info', 'Phase 06: Signoff & Exports', 'ISO 29148 BRD & Complete QA PDF');
      } else if (e.key === 'r' || e.key === 'R') {
        if (!isRunningSuite) {
          handleRunFullPipeline();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPdfModalOpen((prev) => !prev);
      } else if (e.key === 'a' || e.key === 'A') {
        setIsRequirementsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunningSuite]);

  const handleImportGeneratedTests = (newCases: TestCase[], summary?: string) => {
    setTestCases(newCases);
    setCurrentStage(3); // Navigate to Test Designer & Review Gate
    setCompletedStages((prev) => Array.from(new Set([...prev, 1, 2, 3])));
    addToast('success', 'Requirements Imported', `Generated ${newCases.length} deterministic test cases`);

    // Pre-calculate review gate status for newly generated cases
    const initialFeedbacks: Record<string, TestReviewFeedback> = {};
    newCases.forEach((tc) => {
      const hasAssertion = tc.steps.some((s) => s.action.startsWith('assert_'));
      initialFeedbacks[tc.test_id] = {
        testId: tc.test_id,
        verdict: 'needs_revision',
        score: hasAssertion ? 92 : 68,
        notes: [
          `Derived from requirement: '${tc.requirement_id}'`,
          `Preconditions: ${tc.preconditions.join('; ') || 'None specified'}`,
          'Awaiting QA engineer inspection and signoff before Playwright execution'
        ],
        selectorStabilityScore: 'high',
        assertionRigor: hasAssertion ? 'strong' : 'acceptable',
      };
    });
    setReviewFeedbacks(initialFeedbacks);
  };

  // When project changes, update analysis and test cases
  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    const sample = SAMPLE_APPS.find((s) => s.id === project.sampleAppId);
    if (sample) {
      setAnalysis(sample.analysis);
      setTestCases(sample.seededTestCases);
      setCurrentStage(3);
      setCompletedStages([1, 2, 3]);
      addToast('success', 'Target Project Loaded', `${project.name} (${sample.seededTestCases.length} tests ready)`);
    } else {
      setCurrentStage(1);
      addToast('info', 'Project Selected', project.name);
    }
  };

  // Stage 1 -> Stage 2: Start Application Analysis (Agent 1)
  const handleStartAnalysis = async (projectData: Partial<Project>) => {
    setIsAnalyzing(true);
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectData.name || 'New Target Project',
      inputType: projectData.inputType || 'pasted_code',
      targetUrl: projectData.targetUrl,
      repositoryUrl: projectData.repositoryUrl,
      pastedFiles: projectData.pastedFiles,
      zipFileName: projectData.zipFileName,
      codebaseCoverageNotes: projectData.codebaseCoverageNotes,
      localFolderPath: projectData.localFolderPath,
      localFilesCount: projectData.localFilesCount,
      localFilesList: projectData.localFilesList,
      detectedFramework: projectData.detectedFramework,
      packageJsonData: projectData.packageJsonData,
      localDevUrl: projectData.localDevUrl,
      specDocument: projectData.specDocument,
      sampleAppId: projectData.sampleAppId,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    setProjects((prev) => [newProject, ...prev]);
    setCurrentProject(newProject);

    // If sandbox app, use pre-loaded analysis
    if (newProject.sampleAppId) {
      const sample = SAMPLE_APPS.find((s) => s.id === newProject.sampleAppId);
      if (sample) {
        setAnalysis(sample.analysis);
        setTestCases(sample.seededTestCases);
        setIsAnalyzing(false);
        setCurrentStage(2);
        setCompletedStages([1, 2]);
        return;
      }
    }

    // If user uploaded requirements / user stories, run AI Requirements Analyzer directly
    if (newProject.inputType === 'spec_upload' && newProject.specDocument) {
      try {
        const reqRes = await fetch('/api/qa/analyze-requirements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requirementsText: newProject.specDocument,
            appName: newProject.name,
            requestedCount: 4,
          }),
        });
        const reqData = await reqRes.json();
        if (reqData.success && reqData.result) {
          handleImportGeneratedTests(reqData.result.testCases, reqData.result.summary);
          setIsAnalyzing(false);
          return;
        }
      } catch (specErr) {
        console.warn('Requirements API error, falling back to general analysis:', specErr);
      }
    }

    try {
      const res = await fetch('/api/qa/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Analysis API error:', err);
    } finally {
      setIsAnalyzing(false);
      setCurrentStage(2);
      setCompletedStages((prev) => Array.from(new Set([...prev, 1, 2])));
    }
  };

  // Stage 2 -> Stage 3: Generate Test Cases (Agent 2)
  const handleProceedToDesign = async () => {
    if (!analysis) return;
    setIsGeneratingTests(true);

    try {
      const res = await fetch('/api/qa/generate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, requestedCount: 3 }),
      });
      const data = await res.json();
      if (data.success && data.testCases) {
        setTestCases(data.testCases);
      }
    } catch (err) {
      console.error('Design API error:', err);
    } finally {
      setIsGeneratingTests(false);
      setCurrentStage(3);
      setCompletedStages((prev) => Array.from(new Set([...prev, 1, 2, 3])));
    }
  };

  // Stage 3 -> Agent 3 Quality Review Gate
  const handleRunReviewGate = async () => {
    if (!testCases.length) return;
    setIsReviewing(true);

    try {
      const res = await fetch('/api/qa/review-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCases, analysis }),
      });
      const data = await res.json();
      if (data.success && data.reviews) {
        const feedbackMap: Record<string, TestReviewFeedback> = {};
        for (const rev of data.reviews) {
          feedbackMap[rev.testId] = rev;
        }
        setReviewFeedbacks(feedbackMap);
      }
    } catch (err) {
      console.error('Review API error:', err);
    } finally {
      setIsReviewing(false);
      setCompletedStages((prev) => Array.from(new Set([...prev, 4])));
    }
  };

  // Stage 4 / 5: Deterministic Execution Engine & Failure Triage (Agent 4)
  const handleExecuteSuite = async (defectMode: 'none' | 'product_bug' | 'flaky_selector' | 'network_timeout' = 'none') => {
    const approved = testCases.filter((tc) => tc.status === 'approved');
    if (!approved.length) return;

    setIsRunningSuite(true);
    setCurrentStage(5);

    const runId = `run-${Date.now()}`;
    const initialRun: TestRun = {
      id: runId,
      projectId: currentProject.id,
      projectName: currentProject.name,
      target: currentProject.targetUrl || 'http://localhost:3000',
      startedAt: new Date().toISOString(),
      status: 'running',
      totalTests: approved.length,
      passedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      durationMs: 0,
      results: [],
      defects: [],
      browser: 'Playwright Chromium',
      environment: 'Headless Sandbox',
    };

    setCurrentRun(initialRun);

    const executedResults: TestResult[] = [];
    const detectedDefects: DefectTriage[] = [];
    const startTime = Date.now();

    // Step through each test case deterministically
    for (let tIdx = 0; tIdx < approved.length; tIdx++) {
      const tc = approved[tIdx];
      const stepRecords: StepExecutionRecord[] = [];
      const testLogs: string[] = [
        `[PW] Launching Playwright Chromium page for '${tc.test_id}'`,
        `[PW] Navigating with viewport 1280x800`,
      ];
      let testPassed = true;
      let failureTriage: DefectTriage | undefined = undefined;

      // Determine if this test will trigger the injected defect
      const shouldFailThisTest = (defectMode !== 'none') && (tIdx === 1 || (defectMode === 'product_bug' && tc.title.includes('Promo')));

      for (let sIdx = 0; sIdx < tc.steps.length; sIdx++) {
        const step = tc.steps[sIdx];
        setHighlightedSelector(step.target);

        // Simulated action delay for realism & visual trace inspection
        await new Promise((r) => setTimeout(r, 280));

        const isLastStep = sIdx === tc.steps.length - 1;
        const stepFails = shouldFailThisTest && isLastStep;

        if (stepFails) {
          testPassed = false;
          let errMsg = 'Expected assertion condition was not met.';
          let errorContext = `Assertion failure on target '${step.target}'`;

          if (defectMode === 'product_bug') {
            errMsg = `Expected cart total to equal '$119.20' but found '$149.00'. Promo coupon calculation bug.`;
            errorContext = `Product bug: Cart state did not subtract 20% discount coupon.`;
          } else if (defectMode === 'flaky_selector') {
            errMsg = `Target element '[data-testid="${step.target}"]' was not visible in DOM after 5000ms timeout.`;
            errorContext = `Locator drift: Selector was updated in component markup.`;
          } else if (defectMode === 'network_timeout') {
            errMsg = `Gateway Timeout 504: API route /api/checkout failed to return 200 within timeout.`;
            errorContext = `Environment issue: Cloud gateway proxy timed out.`;
          }

          testLogs.push(`[PW ERROR] ${errMsg}`);

          // Call Agent 4 for AI Failure Triage
          try {
            const triageRes = await fetch('/api/qa/triage-failure', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                testCase: tc,
                failedStep: step,
                errorContext,
                domSnapshot: `<div data-testid="${step.target}">DOM Element</div>`,
              }),
            });
            const triageData = await triageRes.json();
            if (triageData.success && triageData.triage) {
              failureTriage = {
                id: `defect-${Date.now()}`,
                testId: tc.test_id,
                testTitle: tc.title,
                category: triageData.triage.category,
                confidence: triageData.triage.confidence,
                severity: triageData.triage.severity,
                rootCauseAnalysis: triageData.triage.rootCauseAnalysis,
                failedStep: step,
                actualBehavior: triageData.triage.actualBehavior,
                expectedBehavior: triageData.triage.expectedBehavior,
                suggestedFix: triageData.triage.suggestedFix,
                codeSnippet: triageData.triage.codeSnippet,
              };
              detectedDefects.push(failureTriage);
            }
          } catch (tErr) {
            console.error('Triage call error:', tErr);
          }

          stepRecords.push({
            stepIndex: sIdx,
            action: step.action,
            target: step.target,
            value: step.value,
            status: 'failed',
            durationMs: 420,
            logMessage: `[FAIL] ${step.action} on ${step.target}`,
            errorMessage: errMsg,
          });
          break; // Stop test on failure
        } else {
          testLogs.push(`[PW OK] Dispatched ${step.action} on '${step.target}' (${step.value || 'no-arg'})`);
          stepRecords.push({
            stepIndex: sIdx,
            action: step.action,
            target: step.target,
            value: step.value,
            status: 'passed',
            durationMs: Math.floor(Math.random() * 80) + 40,
            logMessage: `[PASS] ${step.action} on ${step.target}`,
          });
        }
      }

      setHighlightedSelector('');

      const result: TestResult = {
        testId: tc.test_id,
        testTitle: tc.title,
        priority: tc.priority,
        status: testPassed ? 'passed' : 'failed',
        durationMs: stepRecords.reduce((acc, s) => acc + s.durationMs, 0),
        stepRecords,
        defect: failureTriage,
        logs: testLogs,
        executedAt: new Date().toISOString(),
      };

      executedResults.push(result);

      // Incremental run update
      setCurrentRun((prev) =>
        prev
          ? {
              ...prev,
              passedCount: executedResults.filter((r) => r.status === 'passed').length,
              failedCount: executedResults.filter((r) => r.status === 'failed').length,
              results: [...executedResults],
              defects: [...detectedDefects],
            }
          : null
      );
    }

    const totalDuration = Date.now() - startTime;
    const completedRun: TestRun = {
      ...initialRun,
      status: 'completed',
      completedAt: new Date().toISOString(),
      passedCount: executedResults.filter((r) => r.status === 'passed').length,
      failedCount: executedResults.filter((r) => r.status === 'failed').length,
      durationMs: totalDuration,
      results: executedResults,
      defects: detectedDefects,
    };

    setCurrentRun(completedRun);
    setIsRunningSuite(false);
    setCompletedStages((prev) => Array.from(new Set([...prev, 5])));
    if (completedRun.failedCount > 0) {
      addToast(
        'error',
        'Execution Finished with Defects',
        `${completedRun.passedCount} passed, ${completedRun.failedCount} failed (${completedRun.durationMs}ms)`
      );
    } else {
      addToast(
        'success',
        'All Tests Passed',
        `${completedRun.passedCount}/${completedRun.totalTests} tests passed in ${completedRun.durationMs}ms`
      );
    }

    // Call Agent 5 to generate Executive Summary Report
    try {
      const summaryRes = await fetch('/api/qa/executive-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run: completedRun }),
      });
      const summaryData = await summaryRes.json();
      if (summaryData.success && summaryData.report) {
        setSummaryReport({
          runId: completedRun.id,
          projectName: completedRun.projectName,
          target: completedRun.target,
          executionTimestamp: completedRun.startedAt,
          passRate: Math.round((completedRun.passedCount / completedRun.totalTests) * 100),
          releaseVerdict: summaryData.report.releaseVerdict,
          verdictReason: summaryData.report.verdictReason,
          executiveSummary: summaryData.report.executiveSummary,
          keyFindings: summaryData.report.keyFindings,
          coverageMatrix: summaryData.report.coverageMatrix,
          criticalDefects: completedRun.defects,
          actionItems: summaryData.report.actionItems,
        });
      }
    } catch (err) {
      console.error('Summary API error:', err);
    }
  };

  // Full Pipeline Execution (Chained)
  const handleRunFullPipeline = async () => {
    if (!analysis) {
      await handleStartAnalysis(currentProject);
    }
    // Approve tests if needed
    const approved = testCases.map((tc) => ({ ...tc, status: 'approved' as const }));
    setTestCases(approved);
    await handleExecuteSuite('none');
    setCurrentStage(6);
    setCompletedStages([1, 2, 3, 4, 5, 6]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Platform Header */}
      <Header
        currentProject={currentProject}
        allProjects={projects}
        onSelectProject={handleSelectProject}
        onNewProject={() => {
          setCurrentStage(1);
          addToast('info', 'New Target', 'Select or enter project details below');
        }}
        activeStage={currentStage}
        isRunningSuite={isRunningSuite}
        onRunFullPipeline={handleRunFullPipeline}
        onOpenRequirementsAnalyzer={() => setIsRequirementsModalOpen(true)}
        onOpenCompletePdf={() => setIsPdfModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        testCount={testCases.length}
      />

      {/* 6-Phase Stepper */}
      <WorkflowStepper
        currentStage={currentStage}
        onSelectStage={(s) => setCurrentStage(s)}
        completedStages={completedStages}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Stage 1: Onboarding */}
        {currentStage === 1 && (
          <ProjectOnboarding
            onStartAnalysis={handleStartAnalysis}
            isLoading={isAnalyzing}
          />
        )}

        {/* Stage 2: Application Analyst */}
        {currentStage === 2 && analysis && (
          <AppAnalysisView
            analysis={analysis}
            project={currentProject}
            onProceedToDesign={handleProceedToDesign}
            onReanalyze={() => handleStartAnalysis(currentProject)}
            isGeneratingTests={isGeneratingTests}
            testCases={testCases}
            currentRun={currentRun}
          />
        )}

        {/* Stage 3 & 4: Test Designer & Reviewer Gate */}
        {(currentStage === 3 || currentStage === 4) && (
          <TestCaseManager
            testCases={testCases}
            onUpdateTestCases={(updated) => setTestCases(updated)}
            reviewFeedbacks={reviewFeedbacks}
            onRunReviewGate={handleRunReviewGate}
            onProceedToExecution={() => setCurrentStage(5)}
            isReviewing={isReviewing}
            onOpenRequirementsAnalyzer={() => setIsRequirementsModalOpen(true)}
            analysis={analysis}
            currentRun={currentRun}
          />
        )}

        {/* Stage 5: Execution Engine & Playwright Trace */}
        {currentStage === 5 && (
          <div className="space-y-6">
            <ExecutionConsole
              testCases={testCases}
              currentRun={currentRun}
              onRunSuite={(mode) => handleExecuteSuite(mode)}
              isRunning={isRunningSuite}
              onProceedToReport={() => {
                setCurrentStage(6);
                setCompletedStages((prev) => Array.from(new Set([...prev, 6])));
              }}
            />

            {/* In-page Target Application Sandbox Visualizer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <h4 className="text-sm font-bold text-white">Live Target Surface (Playwright Active Viewport)</h4>
                </div>
                <button
                  onClick={() => setShowSandboxPreview(!showSandboxPreview)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  {showSandboxPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSandboxPreview ? 'Hide Browser Surface' : 'Show Browser Surface'}</span>
                </button>
              </div>

              {showSandboxPreview && (
                <LiveBrowserSandbox
                  sampleAppId={currentProject.sampleAppId}
                  targetUrl={currentProject.targetUrl}
                  isExecuting={isRunningSuite}
                  highlightSelector={highlightedSelector}
                />
              )}
            </div>
          </div>
        )}

        {/* Stage 6: QA Executive Reports & Exports */}
        {currentStage === 6 && (
          <ReportExporter
            testCases={testCases}
            currentRun={currentRun}
            summaryReport={summaryReport}
            onRerunSuite={() => handleExecuteSuite('none')}
            project={currentProject}
            analysis={analysis}
            reviewFeedbacks={reviewFeedbacks}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        )}
      </main>

      {/* AI Requirements & User Stories Analyzer Modal */}
      <RequirementsAnalyzerModal
        isOpen={isRequirementsModalOpen}
        onClose={() => setIsRequirementsModalOpen(false)}
        onImportGeneratedTests={handleImportGeneratedTests}
      />

      {/* Complete Application QA Specification & PDF Modal */}
      <CompletePdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        project={currentProject}
        analysis={analysis}
        testCases={testCases}
        reviewFeedbacks={reviewFeedbacks}
        currentRun={currentRun}
        summaryReport={summaryReport}
      />

      {/* Keyboard Navigation Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Floating Non-intrusive Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
