import React, { useState } from 'react';
import { TestCase, TestStep, TestActionType, TestPriority, TestReviewFeedback, ApplicationAnalysis, TestRun } from '../types/qa';
import { ModuleCoverageVisualizer } from './ModuleCoverageVisualizer';
import { 
  FileCode2, 
  ShieldCheck, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Code, 
  Play, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  Eye,
  Sliders,
  CheckCheck,
  FileText,
  CheckCircle2,
  BarChart3,
  Search,
  Copy
} from 'lucide-react';

interface TestCaseManagerProps {
  testCases: TestCase[];
  onUpdateTestCases: (updated: TestCase[]) => void;
  reviewFeedbacks: Record<string, TestReviewFeedback>;
  onRunReviewGate: () => void;
  onProceedToExecution: () => void;
  isReviewing: boolean;
  onOpenRequirementsAnalyzer?: () => void;
  analysis?: ApplicationAnalysis | null;
  currentRun?: TestRun | null;
}

export const TestCaseManager: React.FC<TestCaseManagerProps> = ({
  testCases,
  onUpdateTestCases,
  reviewFeedbacks,
  onRunReviewGate,
  onProceedToExecution,
  isReviewing,
  onOpenRequirementsAnalyzer,
  analysis,
  currentRun,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'coverage'>('visual');
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string>(testCases[0]?.test_id || '');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTestCase, setEditedTestCase] = useState<TestCase | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'needs_revision'>('all');
  const [copiedSelector, setCopiedSelector] = useState<string | null>(null);

  const handleCopySelector = (sel: string) => {
    navigator.clipboard.writeText(sel);
    setCopiedSelector(sel);
    setTimeout(() => setCopiedSelector(null), 1800);
  };

  const currentTestCase = testCases.find((tc) => tc.test_id === selectedTestCaseId) || testCases[0];

  const filteredTestCases = testCases.filter((tc) => {
    const matchesSearch =
      tc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.test_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.requirement_id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'approved') return tc.status === 'approved';
    if (statusFilter === 'pending') return tc.status === 'pending_review';
    if (statusFilter === 'needs_revision') return tc.status === 'rejected';
    return true;
  });

  const handleApprove = (testId: string) => {
    const updated = testCases.map((tc) =>
      tc.test_id === testId ? { ...tc, status: 'approved' as const } : tc
    );
    onUpdateTestCases(updated);
  };

  const handleReject = (testId: string) => {
    const updated = testCases.map((tc) =>
      tc.test_id === testId ? { ...tc, status: 'rejected' as const } : tc
    );
    onUpdateTestCases(updated);
  };

  const handleApproveAll = () => {
    const updated = testCases.map((tc) => ({ ...tc, status: 'approved' as const }));
    onUpdateTestCases(updated);
  };

  const handleStartEdit = (tc: TestCase) => {
    setEditedTestCase(JSON.parse(JSON.stringify(tc)));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editedTestCase) return;
    const updated = testCases.map((tc) =>
      tc.test_id === editedTestCase.test_id ? editedTestCase : tc
    );
    onUpdateTestCases(updated);
    setIsEditing(false);
    setEditedTestCase(null);
  };

  const handleAddStep = () => {
    if (!editedTestCase) return;
    const newStep: TestStep = {
      action: 'click',
      target: 'new-target-selector',
      value: '',
      description: 'Click action step',
    };
    setEditedTestCase({
      ...editedTestCase,
      steps: [...editedTestCase.steps, newStep],
    });
  };

  const handleRemoveStep = (index: number) => {
    if (!editedTestCase) return;
    const updatedSteps = [...editedTestCase.steps];
    updatedSteps.splice(index, 1);
    setEditedTestCase({ ...editedTestCase, steps: updatedSteps });
  };

  const handleStepChange = (index: number, field: keyof TestStep, val: any) => {
    if (!editedTestCase) return;
    const updatedSteps = [...editedTestCase.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: val };
    setEditedTestCase({ ...editedTestCase, steps: updatedSteps });
  };

  const approvedCount = testCases.filter((tc) => tc.status === 'approved').length;
  const pendingCount = testCases.filter((tc) => tc.status === 'pending_review').length;
  const canProceed = approvedCount > 0;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Agent 2 (Designer) &amp; Agent 3 (Reviewer Gate)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Strict JSON Schema Specification
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Deterministic Test Suite ({testCases.length} Cases)
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Review and approve tests before execution. Approved: <span className="text-emerald-400 font-bold">{approvedCount}</span> &bull; Pending Review: <span className="text-amber-400 font-bold">{pendingCount}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenRequirementsAnalyzer && (
            <button
              onClick={onOpenRequirementsAnalyzer}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/30 transition shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Analyze Stories / PRD</span>
            </button>
          )}

          <button
            onClick={onRunReviewGate}
            disabled={isReviewing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isReviewing ? 'Auditing...' : 'Run Agent 3 Audit'}</span>
          </button>

          <button
            onClick={handleApproveAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/30 transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Approve All</span>
          </button>

          <button
            onClick={onProceedToExecution}
            disabled={!canProceed}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Execute Approved Tests (Agent 4)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Review Gate Enforced Callout if pending items exist */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-300">
                User Review &amp; Approval Gate Enforced ({pendingCount} pending cases)
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Every AI-generated test case must be reviewed by the QA engineer prior to browser execution. Inspect preconditions, Playwright steps, and assertions below, then click "Approve" to unlock.
              </p>
            </div>
          </div>

          <button
            onClick={handleApproveAll}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shrink-0 transition"
          >
            Approve All ({pendingCount})
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Test Case List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Test Cases
              </span>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                {filteredTestCases.length} of {testCases.length}
              </span>
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by ID, title, or requirement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear test filter search"
                  className="absolute right-2 top-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Segmented Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`flex-1 py-1 rounded text-center transition ${
                  statusFilter === 'all'
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({testCases.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('approved')}
                className={`flex-1 py-1 rounded text-center transition ${
                  statusFilter === 'approved'
                    ? 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`flex-1 py-1 rounded text-center transition ${
                  statusFilter === 'pending'
                    ? 'bg-amber-950/70 border border-amber-500/30 text-amber-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pending ({pendingCount})
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredTestCases.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 border border-dashed border-slate-800 rounded-xl">
                No matching test cases found for "{searchQuery}".
              </div>
            ) : (
              filteredTestCases.map((tc) => {
                const isSelected = tc.test_id === (isEditing ? editedTestCase?.test_id : selectedTestCaseId);
                const feedback = reviewFeedbacks[tc.test_id];

                return (
                  <div
                    key={tc.test_id}
                    onClick={() => {
                      setSelectedTestCaseId(tc.test_id);
                      setIsEditing(false);
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition relative ${
                      isSelected
                        ? 'border-indigo-500/80 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        {tc.test_id}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        <span
                          className={`font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            tc.priority === 'critical'
                              ? 'bg-rose-500/20 text-rose-300'
                              : tc.priority === 'high'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {tc.priority}
                        </span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded ${
                            tc.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : tc.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {tc.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      {tc.module && (
                        <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          {tc.module}
                        </span>
                      )}
                      {tc.automation_feasibility === 'manual_verification_required' ? (
                        <span className="text-[9px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                          Manual
                        </span>
                      ) : (
                        <span className="text-[9px] text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                          Playwright E2E
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-white mb-2 leading-snug">
                      {tc.title}
                    </div>

                    <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                      <span className="text-cyan-400 truncate max-w-[150px]" title={tc.requirement_id}>
                        Trace: {tc.requirement_id}
                      </span>
                      {feedback && (
                        <span className="text-emerald-400 flex items-center gap-1 tabular-nums">
                          <ShieldCheck className="w-3 h-3" /> Gate: {feedback.score}%
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                      <span className="tabular-nums">{tc.steps.length} Steps</span>
                      
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {tc.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(tc.test_id)}
                            className="px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-[10px] flex items-center gap-1 transition"
                            title="Approve test case"
                          >
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Approve</span>
                          </button>
                        )}
                        {tc.status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(tc.test_id)}
                            className="px-1.5 py-0.5 rounded bg-rose-600/10 hover:bg-rose-600/30 text-rose-300 border border-rose-500/20 text-[10px] transition"
                            title="Reject test case"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Test Case Detail / Step Editor */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('visual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'visual'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Interactive Spec</span>
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'json'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Raw JSON Test Case</span>
                </button>
                {analysis && (
                  <button
                    onClick={() => setActiveTab('coverage')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'coverage'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Module Coverage (Recharts)</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => handleStartEdit(currentTestCase)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Steps</span>
                    </button>
                    {currentTestCase?.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(currentTestCase.test_id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                    {currentTestCase?.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(currentTestCase.test_id)}
                        className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-medium rounded-lg border border-rose-500/30 flex items-center gap-1.5 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
                    >
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Visual View */}
            {activeTab === 'visual' && currentTestCase && (
              <div className="space-y-6">
                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Requirement</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{currentTestCase.requirement_id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Module</span>
                    <span className="text-xs font-semibold text-indigo-400 truncate block" title={currentTestCase.module || 'Core'}>
                      {currentTestCase.module || 'Core'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Priority</span>
                    <span className="text-xs font-bold text-amber-400">{currentTestCase.priority.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Category</span>
                    <span className="text-xs font-medium text-slate-300">{currentTestCase.category || 'Functional'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Feasibility</span>
                    <span className={`text-xs font-semibold ${currentTestCase.automation_feasibility === 'manual_verification_required' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {currentTestCase.automation_feasibility === 'manual_verification_required' ? 'Manual Signoff' : 'Automated (PW)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status</span>
                    <span className="text-xs font-semibold text-emerald-400">{currentTestCase.status.toUpperCase()}</span>
                  </div>
                </div>

                {/* Uncertain Assumptions Callout (Requirement 5) */}
                {currentTestCase.uncertainAssumptions && currentTestCase.uncertainAssumptions.length > 0 && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Uncertain Assumptions Marked for QA Review:</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-1 font-mono text-[11px]">
                      {currentTestCase.uncertainAssumptions.map((assump, aIdx) => (
                        <li key={aIdx}>{assump}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Preconditions */}
                {currentTestCase.preconditions?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Preconditions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentTestCase.preconditions.map((pre, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300"
                        >
                          &bull; {pre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Test Steps Timeline */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Deterministic Playwright Steps ({isEditing ? editedTestCase?.steps.length : currentTestCase.steps.length})
                    </h4>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleAddStep}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Step
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {(!isEditing ? currentTestCase.steps : editedTestCase?.steps || []).map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                          {sIdx + 1}
                        </div>

                        {!isEditing ? (
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                            <div className="sm:col-span-3">
                              <span className="font-mono font-bold text-indigo-400 uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 mr-2 text-[11px]">
                                {step.action}
                              </span>
                            </div>
                            <div className="sm:col-span-5 font-mono text-slate-300 flex items-center gap-1.5 min-w-0" title={step.target}>
                              <span className="text-slate-500 shrink-0">target:</span>
                              <code className="text-cyan-300 bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-800/30 truncate text-[11px]">
                                {step.target}
                              </code>
                              <button
                                type="button"
                                onClick={() => handleCopySelector(step.target)}
                                aria-label="Copy selector locator"
                                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 shrink-0 transition"
                                title="Copy locator"
                              >
                                {copiedSelector === step.target ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <div className="sm:col-span-4 text-slate-400 truncate text-[11px]">
                              {step.value ? (
                                <span className="font-mono text-amber-300">val: "{step.value}"</span>
                              ) : (
                                <span className="italic text-slate-400">{step.description || 'Action step'}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                            <select
                              value={step.action}
                              onChange={(e) => handleStepChange(sIdx, 'action', e.target.value as TestActionType)}
                              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                            >
                              <option value="navigate">navigate</option>
                              <option value="fill">fill</option>
                              <option value="click">click</option>
                              <option value="assert_visible">assert_visible</option>
                              <option value="assert_text">assert_text</option>
                              <option value="assert_value">assert_value</option>
                              <option value="select">select</option>
                              <option value="wait">wait</option>
                            </select>

                            <input
                              type="text"
                              placeholder="target (selector / url)"
                              value={step.target}
                              onChange={(e) => handleStepChange(sIdx, 'target', e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                            />

                            <input
                              type="text"
                              placeholder="value (optional)"
                              value={step.value || ''}
                              onChange={(e) => handleStepChange(sIdx, 'value', e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                            />

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="description"
                                value={step.description || ''}
                                onChange={(e) => handleStepChange(sIdx, 'description', e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveStep(sIdx)}
                                className="text-rose-400 hover:text-rose-300 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Result */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Expected Result &amp; Assertion
                  </div>
                  <div className="text-xs text-emerald-300 font-medium">
                    {currentTestCase.expected_result}
                  </div>
                </div>

                {/* Agent 3 Reviewer Feedback Card */}
                {reviewFeedbacks[currentTestCase.test_id] && (
                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Agent 3 Quality Review:</span>
                        <span className="text-xs font-bold text-emerald-400">
                          {reviewFeedbacks[currentTestCase.test_id].score}/100 Score
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                          Stability: {reviewFeedbacks[currentTestCase.test_id].selectorStabilityScore}
                        </span>
                      </div>
                      <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                        {reviewFeedbacks[currentTestCase.test_id].notes.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Raw JSON View */}
            {activeTab === 'json' && currentTestCase && (
              <div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-mono overflow-x-auto max-h-[500px] leading-relaxed">
                  {JSON.stringify(currentTestCase, null, 2)}
                </pre>
              </div>
            )}

            {/* Recharts Module Coverage Visualization View */}
            {activeTab === 'coverage' && analysis && (
              <div className="pt-2">
                <ModuleCoverageVisualizer
                  analysis={analysis}
                  testCases={testCases}
                  currentRun={currentRun}
                  onSelectModuleFilter={(path) => {
                    const matchedTest = testCases.find(
                      (tc) =>
                        tc.steps.some((s) => s.target && s.target.includes(path)) ||
                        tc.title.toLowerCase().includes(path.replace('/', '').toLowerCase())
                    );
                    if (matchedTest) {
                      setSelectedTestCaseId(matchedTest.test_id);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
