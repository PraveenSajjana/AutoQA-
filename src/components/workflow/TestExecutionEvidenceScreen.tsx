import React, { useState, useEffect } from 'react';
import { TestCase, TestRun, TestResult, StepExecutionRecord, DefectTriage, Project, ApplicationAnalysis } from '../../types/qa';
import { downloadJsonReport, downloadHtmlReport } from '../../services/reportExportService';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Layers, 
  Terminal, 
  Bug, 
  FileText, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  Code2, 
  Copy, 
  Check, 
  Info,
  Maximize2,
  Minimize2,
  FileCode,
  ArrowRight
} from 'lucide-react';

interface TestExecutionEvidenceScreenProps {
  testCases: TestCase[];
  currentRun: TestRun | null;
  onRunSuite: (defectMode?: 'none' | 'product_bug' | 'flaky_selector' | 'network_timeout') => Promise<void> | void;
  isRunning: boolean;
  project: Project;
  analysis: ApplicationAnalysis | null;
  onOpenPdfModal?: () => void;
  onNavigateToReview?: () => void;
}

export const TestExecutionEvidenceScreen: React.FC<TestExecutionEvidenceScreenProps> = ({
  testCases,
  currentRun,
  onRunSuite,
  isRunning,
  project,
  analysis,
  onOpenPdfModal,
  onNavigateToReview,
}) => {
  const [activeTestIndex, setActiveTestIndex] = useState<number>(0);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [defectSimulationMode, setDefectSimulationMode] = useState<'none' | 'product_bug' | 'flaky_selector' | 'network_timeout'>('product_bug');
  const [activeTab, setActiveTab] = useState<'steps' | 'dom' | 'logs' | 'triage'>('steps');
  const [copiedPatch, setCopiedPatch] = useState<boolean>(false);

  const approvedTests = testCases.filter((tc) => tc.status === 'approved');
  const testsToRun = approvedTests.length > 0 ? approvedTests : testCases;
  const activeTestResult: TestResult | undefined = currentRun?.results[activeTestIndex];
  const activeStepRecord: StepExecutionRecord | undefined = activeTestResult?.stepRecords[selectedStepIndex];

  // Auto select failing test if any
  useEffect(() => {
    if (currentRun && currentRun.status === 'completed') {
      const failIdx = currentRun.results.findIndex((r) => r.status === 'failed');
      if (failIdx !== -1) {
        setActiveTestIndex(failIdx);
        const failedStep = currentRun.results[failIdx].stepRecords.findIndex((s) => s.status === 'failed');
        if (failedStep !== -1) setSelectedStepIndex(failedStep);
        setActiveTab('triage');
      }
    }
  }, [currentRun?.status]);

  const handleCopyPatch = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  const handleExportJson = () => {
    downloadJsonReport({
      project,
      analysis,
      run: currentRun,
      testCases,
      defects: currentRun?.defects || [],
      exportedAt: new Date().toISOString(),
    }, `qa-run-${project.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleExportHtml = () => {
    downloadHtmlReport({
      project,
      analysis,
      run: currentRun,
      testCases,
      defects: currentRun?.defects || [],
      exportedAt: new Date().toISOString(),
    }, `qa-report-${project.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const hasCompleted = currentRun && currentRun.status === 'completed';
  const passRate = currentRun && currentRun.totalTests > 0
    ? Math.round((currentRun.passedCount / currentRun.totalTests) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-fade-in">
      {/* Top Banner & Execution Controls */}
      <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" /> Step 4 of 4: Test Execution &amp; Evidence
            </span>

            {/* Clear, honest Execution Mode indicator */}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Demo Runner Simulation (Headless Playwright Preview)</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
            Execution Console &amp; Step Inspector
          </h1>

          <p className="text-sm text-[#94A3B8] leading-relaxed">
            Execute approved test cases with deterministic step timings, inspect DOM actionability traces, triage failures, and export audit-ready reports.
          </p>
        </div>

        {/* Execution Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Defect injection mode selector */}
          <div className="flex items-center gap-1.5 bg-[#0D1629] p-1 rounded-xl border border-[#26334D]">
            <span className="text-[11px] font-mono text-[#64748B] px-2">Scenario:</span>
            <select
              value={defectSimulationMode}
              onChange={(e) => setDefectSimulationMode(e.target.value as any)}
              disabled={isRunning}
              aria-label="Select test simulation scenario"
              className="bg-transparent text-xs text-[#F1F5F9] font-medium focus:outline-hidden pr-2 cursor-pointer"
            >
              <option value="none" className="bg-[#111A2E]">All Pass (Happy Path)</option>
              <option value="product_bug" className="bg-[#111A2E]">Inject Product Bug (Math Mismatch)</option>
              <option value="flaky_selector" className="bg-[#111A2E]">Inject Locator Timeout (Drift)</option>
              <option value="network_timeout" className="bg-[#111A2E]">Inject 504 Gateway Timeout</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => onRunSuite(defectSimulationMode)}
            disabled={isRunning || testsToRun.length === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#7C5CFC] hover:bg-[#9278FF] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#7C5CFC]/30 transition"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Running Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{currentRun ? 'Rerun Suite' : 'Start Execution'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Honest Simulation Disclosure Notice */}
      <div className="p-4 rounded-xl bg-[#0D1629] border border-[#26334D] flex items-start gap-3 text-xs text-[#94A3B8]">
        <Info className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-[#F1F5F9]">Execution Environment Note:</span>
          <p className="leading-relaxed">
            Actual external browser daemon execution is emulated in this container using deterministic assertion logic and DOM state translation. Real assertions are validated against the rendered application sandbox.
          </p>
        </div>
      </div>

      {/* Execution Stats & Export Bar */}
      {currentRun && (
        <div className="p-5 rounded-2xl bg-[#111A2E] border border-[#26334D] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-[11px] text-[#94A3B8] font-mono uppercase">Status</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {currentRun.status === 'running' ? (
                  <span className="text-xs font-mono font-bold text-[#22D3EE] flex items-center gap-1 animate-pulse">
                    <Clock className="w-3.5 h-3.5" /> Running ({currentRun.results.length}/{currentRun.totalTests})
                  </span>
                ) : currentRun.failedCount > 0 ? (
                  <span className="text-xs font-mono font-bold text-[#F87171] flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> {currentRun.failedCount} Failed &bull; Pass Rate {passRate}%
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-[#22C55E] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Tests Passed &bull; 100%
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[#94A3B8] font-mono uppercase">Duration</span>
              <div className="text-xs font-mono font-bold text-[#F1F5F9] mt-0.5">
                {currentRun.durationMs}ms
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[#94A3B8] font-mono uppercase">Total / Passed / Failed</span>
              <div className="text-xs font-mono font-bold text-[#F1F5F9] mt-0.5">
                {currentRun.totalTests} total &bull; <span className="text-[#22C55E]">{currentRun.passedCount} pass</span> &bull; <span className="text-[#F87171]">{currentRun.failedCount} fail</span>
              </div>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1629] hover:bg-[#172238] border border-[#26334D] text-xs font-medium text-[#F1F5F9] transition"
              title="Download machine-readable JSON execution log"
            >
              <FileCode className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handleExportHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1629] hover:bg-[#172238] border border-[#26334D] text-xs font-medium text-[#F1F5F9] transition"
              title="Download standalone HTML Playwright audit report"
            >
              <FileText className="w-3.5 h-3.5 text-[#7C5CFC]" />
              <span>Export HTML</span>
            </button>

            {onOpenPdfModal && (
              <button
                type="button"
                onClick={onOpenPdfModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C5CFC]/15 hover:bg-[#7C5CFC]/25 border border-[#7C5CFC]/30 text-xs font-medium text-[#9278FF] transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Executive PDF</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Execution Inspector (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Test Results List (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider px-1">
            Test Execution Sequence ({currentRun?.results.length || 0}/{testsToRun.length})
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {(!currentRun || currentRun.results.length === 0) ? (
              <div className="p-8 text-center bg-[#111A2E] rounded-xl border border-[#26334D] space-y-3">
                <p className="text-xs text-[#94A3B8]">
                  No test run recorded yet. Click "Start Execution" above to run the approved suite.
                </p>
                <button
                  type="button"
                  onClick={() => onRunSuite('none')}
                  className="px-4 py-2 bg-[#7C5CFC] hover:bg-[#9278FF] text-white text-xs font-semibold rounded-lg shadow-md transition"
                >
                  Run 1st Automated Suite
                </button>
              </div>
            ) : (
              currentRun.results.map((result, idx) => {
                const isSelected = idx === activeTestIndex;
                const isPassed = result.status === 'passed';
                return (
                  <div
                    key={result.testId}
                    onClick={() => {
                      setActiveTestIndex(idx);
                      setSelectedStepIndex(0);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#172238] border-[#7C5CFC] shadow-md shadow-[#7C5CFC]/10'
                        : 'bg-[#111A2E] border-[#26334D] hover:border-[#7C5CFC]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#7C5CFC]">
                          {result.testId}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.2 rounded ${
                          isPassed
                            ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                            : 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30'
                        }`}>
                          {isPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {result.status.toUpperCase()}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-[#64748B]">
                        {result.durationMs}ms
                      </span>
                    </div>

                    <h4 className="text-xs font-medium text-[#F1F5F9] line-clamp-2 leading-relaxed">
                      {result.testTitle}
                    </h4>

                    {result.defect && (
                      <div className="mt-2 text-[11px] text-[#F87171] font-mono truncate flex items-center gap-1">
                        <Bug className="w-3 h-3 shrink-0" />
                        <span>Triage: {result.defect.category}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Test Evidence Deep Dive (7 cols) */}
        {activeTestResult ? (
          <div className="lg:col-span-7 bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2 pb-4 border-b border-[#26334D]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-[#7C5CFC]">{activeTestResult.testId}</span>
                <span className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  activeTestResult.status === 'passed' ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#F87171]/15 text-[#F87171]'
                }`}>
                  {activeTestResult.status} ({activeTestResult.durationMs}ms)
                </span>
              </div>
              <h2 className="text-base font-bold text-[#F1F5F9]">{activeTestResult.testTitle}</h2>
            </div>

            {/* Evidence Tabs */}
            <div className="flex border-b border-[#26334D] gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('steps')}
                className={`pb-2 border-b-2 transition ${
                  activeTab === 'steps' ? 'border-[#7C5CFC] text-[#F1F5F9]' : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'
                }`}
              >
                Step Trace ({activeTestResult.stepRecords.length})
              </button>

              {activeTestResult.defect && (
                <button
                  type="button"
                  onClick={() => setActiveTab('triage')}
                  className={`pb-2 border-b-2 transition flex items-center gap-1 ${
                    activeTab === 'triage' ? 'border-[#F87171] text-[#F87171]' : 'border-transparent text-[#F87171]/70 hover:text-[#F87171]'
                  }`}
                >
                  <Bug className="w-3 h-3" />
                  <span>Failure Triage</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('logs')}
                className={`pb-2 border-b-2 transition ${
                  activeTab === 'logs' ? 'border-[#7C5CFC] text-[#F1F5F9]' : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'
                }`}
              >
                Console Logs ({activeTestResult.logs.length})
              </button>
            </div>

            {/* Tab: Steps Trace */}
            {activeTab === 'steps' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  {activeTestResult.stepRecords.map((step, sIdx) => {
                    const stepPassed = step.status === 'passed';
                    return (
                      <div
                        key={sIdx}
                        onClick={() => setSelectedStepIndex(sIdx)}
                        className={`p-3 rounded-xl border text-xs transition cursor-pointer ${
                          selectedStepIndex === sIdx ? 'bg-[#172238] border-[#7C5CFC]' : 'bg-[#0D1629] border-[#26334D]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[#64748B] text-[11px]">#{sIdx + 1}</span>
                            <span className="font-mono text-[#7C5CFC] font-semibold uppercase text-[11px]">{step.action}</span>
                            <span className="font-mono text-[#F1F5F9]">{step.target}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-[#64748B]">{step.durationMs}ms</span>
                            <span className={`font-mono text-[11px] font-bold ${stepPassed ? 'text-[#22C55E]' : 'text-[#F87171]'}`}>
                              {stepPassed ? 'PASS' : 'FAIL'}
                            </span>
                          </div>
                        </div>

                        {step.errorMessage && (
                          <div className="mt-2 p-2.5 rounded-lg bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171] font-mono text-[11px]">
                            {step.errorMessage}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Failure Triage */}
            {activeTab === 'triage' && activeTestResult.defect && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase tracking-wider text-[11px] text-[#F87171]">
                      Root Cause Analysis ({activeTestResult.defect.category})
                    </span>
                    <span className="font-mono text-[11px] text-[#22D3EE]">
                      Confidence: {activeTestResult.defect.confidence}%
                    </span>
                  </div>
                  <p className="text-[#F1F5F9] leading-relaxed">
                    {activeTestResult.defect.rootCauseAnalysis}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-[#F87171]">Actual Behavior</span>
                    <p className="text-[#F1F5F9] font-mono text-[11px]">{activeTestResult.defect.actualBehavior}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-[#22C55E]">Expected Behavior</span>
                    <p className="text-[#F1F5F9] font-mono text-[11px]">{activeTestResult.defect.expectedBehavior}</p>
                  </div>
                </div>

                {activeTestResult.defect.codeSnippet && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold uppercase tracking-wider text-[11px] text-[#22C55E]">Suggested Patch</span>
                      <button
                        type="button"
                        onClick={() => handleCopyPatch(activeTestResult.defect!.codeSnippet!)}
                        className="flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-[#F1F5F9] px-2 py-0.5 rounded bg-[#0D1629] border border-[#26334D]"
                      >
                        {copiedPatch ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPatch ? 'Copied' : 'Copy Patch'}</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-[#0D1629] border border-[#26334D] rounded-xl text-xs font-mono text-[#94A3B8] overflow-x-auto">
                      <code>{activeTestResult.defect.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Console Logs */}
            {activeTab === 'logs' && (
              <div className="p-3 bg-[#0D1629] border border-[#26334D] rounded-xl text-xs font-mono text-[#94A3B8] space-y-1 max-h-64 overflow-y-auto">
                {activeTestResult.logs.map((log, lIdx) => (
                  <div key={lIdx} className={log.includes('FAIL') || log.includes('ERROR') ? 'text-[#F87171]' : 'text-[#94A3B8]'}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-7 bg-[#111A2E] border border-[#26334D] rounded-2xl p-12 text-center text-xs text-[#64748B]">
            Select an executed test case to view step traces, failure evidence, and suggested code patches.
          </div>
        )}
      </div>
    </div>
  );
};
