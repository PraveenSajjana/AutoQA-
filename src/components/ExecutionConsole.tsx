import React, { useState, useEffect } from 'react';
import { TestCase, TestRun, TestResult, StepExecutionRecord, DefectTriage, TriageCategory } from '../types/qa';
import { SAMPLE_APPS } from '../services/sampleApps';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Layers, 
  Terminal, 
  Image as ImageIcon, 
  Bug, 
  Check, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Copy
} from 'lucide-react';

interface ExecutionConsoleProps {
  testCases: TestCase[];
  currentRun: TestRun | null;
  onRunSuite: (defectMode?: 'none' | 'product_bug' | 'flaky_selector' | 'network_timeout') => void;
  isRunning: boolean;
  onProceedToReport: () => void;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  testCases,
  currentRun,
  onRunSuite,
  isRunning,
  onProceedToReport,
}) => {
  const [activeTestIndex, setActiveTestIndex] = useState<number>(0);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [defectSimulationMode, setDefectSimulationMode] = useState<'none' | 'product_bug' | 'flaky_selector' | 'network_timeout'>('none');
  const [activeTab, setActiveTab] = useState<'trace' | 'dom' | 'logs' | 'triage'>('trace');
  const [copiedFix, setCopiedFix] = useState(false);

  const handleCopyFix = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedFix(true);
    setTimeout(() => setCopiedFix(false), 2000);
  };

  const approvedTests = testCases.filter((tc) => tc.status === 'approved');
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
  }, [currentRun]);

  const hasCompleted = currentRun && currentRun.status === 'completed';

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Banner & Execution Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-cyan-400" /> Agent 4: Deterministic Playwright Runner &amp; Triage
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Target: {currentRun?.browser || 'Playwright Chromium'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Execution Engine &amp; Trace Scrubber
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Deterministic browser automation &bull; Action-level screenshot evidence &bull; AI failure categorization
          </p>
        </div>

        {/* Defect injection and trigger buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Defect Simulator Selector */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Chaos Injection:</span>
            <select
              value={defectSimulationMode}
              onChange={(e) => setDefectSimulationMode(e.target.value as any)}
              className="bg-transparent text-indigo-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="none">Normal (Clean Pass)</option>
              <option value="product_bug">Product Bug (Math Error)</option>
              <option value="flaky_selector">Script Issue (Selector Drift)</option>
              <option value="network_timeout">Env Issue (504 Gateway)</option>
            </select>
          </div>

          <button
            onClick={() => onRunSuite(defectSimulationMode)}
            disabled={isRunning || approvedTests.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Browser Tests...' : 'Execute Suite'}</span>
          </button>

          {hasCompleted && (
            <button
              onClick={onProceedToReport}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition"
            >
              <span>View Agent 5 QA Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Real-time Suite Progress Bar */}
      {currentRun && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">Suite Status:</span>
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                  currentRun.status === 'running'
                    ? 'bg-indigo-500/20 text-indigo-300 animate-pulse'
                    : currentRun.failedCount > 0
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {currentRun.status}
              </span>
              <span className="text-slate-400">
                Duration: <strong className="text-slate-200 tabular-nums">{currentRun.durationMs}ms</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-emerald-400 flex items-center gap-1 tabular-nums">
                <CheckCircle2 className="w-3.5 h-3.5" /> {currentRun.passedCount} Passed
              </span>
              <span className="text-rose-400 flex items-center gap-1 tabular-nums">
                <XCircle className="w-3.5 h-3.5" /> {currentRun.failedCount} Failed
              </span>
              <span className="text-slate-400 tabular-nums">Total: {currentRun.totalTests}</span>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{
                width: `${currentRun.totalTests > 0 ? (currentRun.passedCount / currentRun.totalTests) * 100 : 0}%`,
              }}
            />
            <div
              className="bg-rose-500 transition-all duration-300"
              style={{
                width: `${currentRun.totalTests > 0 ? (currentRun.failedCount / currentRun.totalTests) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Main Execution Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Test Case Results list */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Executed Test Cases
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {currentRun?.results.length || 0} / {approvedTests.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {(currentRun?.results || []).map((result, rIdx) => {
              const isSelected = rIdx === activeTestIndex;
              return (
                <div
                  key={result.testId}
                  onClick={() => {
                    setActiveTestIndex(rIdx);
                    setSelectedStepIndex(0);
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-indigo-400">
                      {result.testId}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                        result.status === 'passed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {result.status === 'passed' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {result.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-white mb-2 leading-snug">
                    {result.testTitle}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                    <span>{result.stepRecords.length} Steps</span>
                    <span>{result.durationMs}ms</span>
                    {result.defect && (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <Bug className="w-3 h-3" /> {result.defect.category.split('_')[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {!currentRun && (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Click "Execute Suite" above to launch Playwright tests and begin trace capture.
              </div>
            )}
          </div>
        </div>

        {/* Right column: Interactive Trace Viewer & Inspector */}
        <div className="lg:col-span-8 space-y-4">
          {activeTestResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Test Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {activeTestResult.testId}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                        activeTestResult.status === 'passed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {activeTestResult.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {activeTestResult.durationMs}ms
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{activeTestResult.testTitle}</h3>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveTab('trace')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'trace' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Step Trace</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('dom')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'dom' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>DOM &amp; Logs</span>
                  </button>

                  {activeTestResult.defect && (
                    <button
                      onClick={() => setActiveTab('triage')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        activeTab === 'triage'
                          ? 'bg-rose-600 text-white'
                          : 'text-rose-400 hover:text-rose-300'
                      }`}
                    >
                      <Bug className="w-3.5 h-3.5" />
                      <span>AI Triage (RCA)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* TAB 1: Step Trace Scrubber */}
              {activeTab === 'trace' && (
                <div className="space-y-4">
                  {/* Step Timeline Pills */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Playwright Action Timeline (Click step to inspect snapshot)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {activeTestResult.stepRecords.map((step, sIdx) => {
                        const isSelected = sIdx === selectedStepIndex;
                        return (
                          <button
                            key={sIdx}
                            onClick={() => setSelectedStepIndex(sIdx)}
                            className={`p-2 rounded-lg border text-left transition ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-500/20 text-white'
                                : step.status === 'passed'
                                ? 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                                : 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                              <span>#{sIdx + 1}</span>
                              <span className={step.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'}>
                                {step.status === 'passed' ? 'PASS' : 'FAIL'}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold font-mono truncate">{step.action}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">{step.durationMs}ms</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Step Details & Visual Screenshot Preview */}
                  {activeStepRecord && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-mono">
                              {selectedStepIndex + 1}
                            </span>
                            Step Detail: <span className="font-mono text-indigo-400">{activeStepRecord.action}</span>
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              activeStepRecord.status === 'passed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {activeStepRecord.status.toUpperCase()} ({activeStepRecord.durationMs}ms)
                          </span>
                        </div>

                        <div className="text-xs space-y-1 font-mono text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <div>
                            <span className="text-slate-500">target:</span> <span className="text-cyan-300">{activeStepRecord.target}</span>
                          </div>
                          {activeStepRecord.value && (
                            <div>
                              <span className="text-slate-500">value:</span> <span className="text-amber-300">{activeStepRecord.value}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-500">log:</span> <span className="text-slate-400">{activeStepRecord.logMessage}</span>
                          </div>
                          {activeStepRecord.errorMessage && (
                            <div className="text-rose-400 pt-1 border-t border-slate-800">
                              <span className="text-rose-500 font-bold">error:</span> {activeStepRecord.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Visual Captured Browser State */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <ImageIcon className="w-3.5 h-3.5" /> DOM Visual Evidence
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">1280x800 Viewport</span>
                        </div>

                        <div className="h-44 rounded-lg bg-slate-900 border border-slate-800 p-3 flex flex-col justify-between font-mono text-xs overflow-hidden relative">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span className="ml-2 text-slate-300">Playwright Headless Surface</span>
                            </span>
                            <span className="text-indigo-400">t + {activeStepRecord.durationMs}ms</span>
                          </div>

                          <div className="py-2 text-slate-300 space-y-1.5">
                            <div className="text-[11px] text-slate-400 font-mono">
                              &gt; Target: <span className="text-indigo-300">[{activeStepRecord.target}]</span>
                            </div>
                            <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[11px]">
                              {activeStepRecord.status === 'passed' ? (
                                <span className="text-emerald-400 flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5" /> Action successfully dispatched &amp; rendered
                                </span>
                              ) : (
                                <span className="text-rose-400 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" /> {activeStepRecord.errorMessage || 'Assertion mismatch'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center justify-between">
                            <span>Evidence Trace Captured</span>
                            <span>SHA: 8f9b2...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DOM & Console Logs */}
              {activeTab === 'dom' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Playwright Console Logs &amp; Network Activity
                    </h4>
                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[300px] leading-relaxed space-y-1">
                      {activeTestResult.logs.map((log, lIdx) => (
                        <div key={lIdx} className="hover:text-indigo-300">
                          {log}
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 3: Defect Triage & Root Cause Analysis */}
              {activeTab === 'triage' && activeTestResult.defect && (
                <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-rose-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                        <Bug className="w-5 h-5" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            Agent 4 AI Failure Triage
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                              activeTestResult.defect.category === 'PRODUCT_DEFECT'
                                ? 'bg-rose-500 text-white'
                                : activeTestResult.defect.category === 'TEST_SCRIPT_ISSUE'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-cyan-500 text-slate-950'
                            }`}
                          >
                            {activeTestResult.defect.category.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-rose-300 mt-0.5">
                          Classification Confidence: <strong className="text-white">{activeTestResult.defect.confidence}%</strong> &bull; Severity: <strong className="text-white">{activeTestResult.defect.severity.toUpperCase()}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-slate-200">
                    <div>
                      <span className="text-rose-400 font-bold block uppercase tracking-wider text-[10px] mb-1">
                        Root Cause Analysis (RCA)
                      </span>
                      <p className="bg-slate-950/80 p-3 rounded-lg border border-rose-500/20 leading-relaxed">
                        {activeTestResult.defect.rootCauseAnalysis}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] font-bold block uppercase mb-1">Actual Behavior</span>
                        <span className="text-rose-300">{activeTestResult.defect.actualBehavior}</span>
                      </div>
                      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] font-bold block uppercase mb-1">Expected Behavior</span>
                        <span className="text-emerald-300">{activeTestResult.defect.expectedBehavior}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-indigo-300 font-bold uppercase tracking-wider text-[10px]">
                          Suggested Resolution Patch
                        </span>
                        {activeTestResult.defect.codeSnippet && (
                          <button
                            type="button"
                            onClick={() => handleCopyFix(activeTestResult.defect!.codeSnippet!)}
                            className="flex items-center gap-1 text-[11px] text-indigo-300 hover:text-white px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition"
                            title="Copy code fix to clipboard"
                          >
                            {copiedFix ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Playwright Fix</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-slate-300 mb-2 leading-relaxed">{activeTestResult.defect.suggestedFix}</p>
                      {activeTestResult.defect.codeSnippet && (
                        <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-300 overflow-x-auto text-[11px] leading-relaxed">
                          {activeTestResult.defect.codeSnippet}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <Play className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Execution Engine Ready</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                Execute your approved test cases to watch step-by-step trace timeline and automatic AI root cause triage.
              </p>
              <button
                onClick={() => onRunSuite(defectSimulationMode)}
                disabled={isRunning || approvedTests.length === 0}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition"
              >
                Launch Deterministic Suite
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
