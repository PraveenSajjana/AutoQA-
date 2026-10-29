import React, { useState } from 'react';
import { TestCase, TestStep, TestPriority } from '../../types/qa';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Edit3, 
  Trash2, 
  Play, 
  ArrowRight, 
  Search, 
  Filter, 
  AlertTriangle, 
  Check, 
  X, 
  Plus, 
  Sparkles,
  ShieldAlert,
  Save,
  CheckCheck,
  HelpCircle
} from 'lucide-react';

interface TestCaseReviewScreenProps {
  testCases: TestCase[];
  onUpdateTestCases: (updated: TestCase[]) => void;
  onProceedToExecution: () => void;
  projectName?: string;
}

export const TestCaseReviewScreen: React.FC<TestCaseReviewScreenProps> = ({
  testCases,
  onUpdateTestCases,
  onProceedToExecution,
  projectName = 'Application',
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(testCases[0]?.test_id || '');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending_review' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [featureFilter, setFeatureFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<TestCase | null>(null);

  const approvedCases = testCases.filter((tc) => tc.status === 'approved');
  const pendingCases = testCases.filter((tc) => tc.status === 'pending_review');
  const rejectedCases = testCases.filter((tc) => tc.status === 'rejected');

  // Discover all distinct feature IDs
  const availableFeatureIds = Array.from(new Set(testCases.map((tc) => tc.feature_id).filter(Boolean))) as string[];

  const filteredCases = testCases.filter((tc) => {
    if (statusFilter !== 'all' && tc.status !== statusFilter) return false;
    if (categoryFilter !== 'all') {
      const type = tc.test_type || tc.category || 'functional';
      if (type !== categoryFilter) return false;
    }
    if (featureFilter !== 'all' && tc.feature_id !== featureFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = `${tc.test_id} ${tc.title} ${tc.requirement_id || ''} ${tc.feature_id || ''} ${tc.module || ''} ${tc.objective || ''} ${tc.traceability || ''}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  const selectedCase = testCases.find((tc) => tc.test_id === selectedCaseId) || testCases[0];

  // Actions
  const handleSetStatus = (testId: string, newStatus: TestCase['status']) => {
    const updated = testCases.map((tc) => (tc.test_id === testId ? { ...tc, status: newStatus } : tc));
    onUpdateTestCases(updated);
  };

  const handleBulkApprove = () => {
    const updated = testCases.map((tc) => (tc.status === 'rejected' ? tc : { ...tc, status: 'approved' as const }));
    onUpdateTestCases(updated);
  };

  const handleStartEdit = (tc: TestCase) => {
    setEditFormData(JSON.parse(JSON.stringify(tc)));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    const updated = testCases.map((tc) => (tc.test_id === editFormData.test_id ? editFormData : tc));
    onUpdateTestCases(updated);
    setIsEditing(false);
    setEditFormData(null);
  };

  const handleStepChange = (index: number, field: keyof TestStep, val: any) => {
    if (!editFormData) return;
    const steps = [...editFormData.steps];
    steps[index] = { ...steps[index], [field]: val };
    setEditFormData({ ...editFormData, steps });
  };

  const handleAddStep = () => {
    if (!editFormData) return;
    const newStep: TestStep = { action: 'assert_visible', target: 'body', description: 'Validate DOM element' };
    setEditFormData({ ...editFormData, steps: [...editFormData.steps, newStep] });
  };

  const handleRemoveStep = (index: number) => {
    if (!editFormData || editFormData.steps.length <= 1) return;
    const steps = editFormData.steps.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, steps });
  };

  const isExecutionEligible = approvedCases.length > 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" /> Step 3 of 4: QA Review &amp; Approval Gate
            </span>
            <span className="text-xs text-[#64748B] font-mono">
              Target: {projectName}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
            Test Case Management &amp; Human Signoff
          </h1>

          <p className="text-sm text-[#94A3B8] leading-relaxed">
            Review synthesized Playwright test cases, inspect preconditions, modify assertions, and approve tests before submitting to the execution engine.
          </p>
        </div>

        {/* Execution CTA with strict gating */}
        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBulkApprove}
              className="px-4 py-2.5 bg-[#0D1629] hover:bg-[#172238] text-[#F1F5F9] border border-[#26334D] text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-[#22C55E]" />
              <span>Approve All ({testCases.length})</span>
            </button>

            <button
              type="button"
              onClick={onProceedToExecution}
              disabled={!isExecutionEligible}
              title={isExecutionEligible ? 'Submit approved test cases to Playwright runner' : 'At least 1 test case must be approved before execution'}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#7C5CFC] hover:bg-[#9278FF] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-[#7C5CFC]/30 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Execute Approved Suite ({approvedCases.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {!isExecutionEligible && (
            <span className="text-[11px] font-medium text-[#F87171] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Execution blocked: Approve at least 1 test case below to proceed.
            </span>
          )}
        </div>
      </div>

      {/* KPI Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === 'all' ? 'bg-[#172238] border-[#7C5CFC]' : 'bg-[#111A2E] border-[#26334D]'
          }`}
        >
          <span className="text-xs text-[#94A3B8] font-medium">Total Test Cases</span>
          <div className="text-2xl font-bold font-mono text-[#F1F5F9] mt-1">{testCases.length}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === 'approved' ? 'bg-[#172238] border-[#22C55E]' : 'bg-[#111A2E] border-[#26334D]'
          }`}
        >
          <span className="text-xs text-[#22C55E] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved (Ready)
          </span>
          <div className="text-2xl font-bold font-mono text-[#22C55E] mt-1">{approvedCases.length}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending_review')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === 'pending_review' ? 'bg-[#172238] border-[#FBBF24]' : 'bg-[#111A2E] border-[#26334D]'
          }`}
        >
          <span className="text-xs text-[#FBBF24] font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
          <div className="text-2xl font-bold font-mono text-[#FBBF24] mt-1">{pendingCases.length}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            statusFilter === 'rejected' ? 'bg-[#172238] border-[#F87171]' : 'bg-[#111A2E] border-[#26334D]'
          }`}
        >
          <span className="text-xs text-[#F87171] font-medium flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
          <div className="text-2xl font-bold font-mono text-[#F87171] mt-1">{rejectedCases.length}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-1 md:col-span-2 relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, feature, route, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-xs text-[#F1F5F9] placeholder-[#64748B] focus:outline-hidden focus:border-[#7C5CFC]"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter test cases by type"
            className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-xs text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
          >
            <option value="all">All Test Types</option>
            <option value="positive">Positive / Happy Path</option>
            <option value="negative">Negative Validation</option>
            <option value="boundary">Boundary Values</option>
            <option value="security">Security &amp; Auth</option>
            <option value="smoke">Smoke / Health</option>
            <option value="regression">Regression</option>
          </select>
        </div>

        <div>
          <select
            value={featureFilter}
            onChange={(e) => setFeatureFilter(e.target.value)}
            aria-label="Filter test cases by discovered feature"
            className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-xs text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
          >
            <option value="all">All Discovered Features ({availableFeatureIds.length})</option>
            {availableFeatureIds.map((fId) => (
              <option key={fId} value={fId}>{fId}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2-Column Split: Cases List and Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Test Cases List (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#94A3B8] uppercase tracking-wider px-1">
            <span>Test Cases ({filteredCases.length})</span>
            {featureFilter !== 'all' && (
              <span className="text-[10px] text-[#7C5CFC] font-mono lowercase">feature: {featureFilter}</span>
            )}
          </div>

          <div className="space-y-2 max-h-[660px] overflow-y-auto pr-1">
            {filteredCases.length === 0 ? (
              <div className="p-8 text-center bg-[#111A2E] rounded-xl border border-[#26334D] text-xs text-[#64748B]">
                No test cases match your filter criteria.
              </div>
            ) : (
              filteredCases.map((tc) => {
                const isSelected = selectedCase?.test_id === tc.test_id;
                const testType = tc.test_type || tc.category || 'functional';
                return (
                  <div
                    key={tc.test_id}
                    onClick={() => {
                      setSelectedCaseId(tc.test_id);
                      setIsEditing(false);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#172238] border-[#7C5CFC] shadow-md shadow-[#7C5CFC]/10'
                        : 'bg-[#111A2E] border-[#26334D] hover:border-[#7C5CFC]/40 hover:bg-[#172238]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#7C5CFC]">
                          {tc.test_id}
                        </span>
                        {tc.feature_id && (
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30">
                            {tc.feature_id}
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                          tc.status === 'approved' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30' :
                          tc.status === 'rejected' ? 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30' :
                          'bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30'
                        }`}>
                          {tc.status === 'approved' ? 'Approved' : tc.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          testType === 'positive' ? 'bg-[#22C55E]/15 text-[#22C55E]' :
                          testType === 'negative' ? 'bg-[#FBBF24]/15 text-[#FBBF24]' :
                          testType === 'boundary' ? 'bg-[#9278FF]/15 text-[#9278FF]' :
                          testType === 'security' ? 'bg-[#F87171]/15 text-[#F87171]' :
                          'bg-[#64748B]/20 text-[#94A3B8]'
                        }`}>
                          {testType}
                        </span>
                        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          tc.priority === 'critical' ? 'bg-[#F87171]/20 text-[#F87171]' :
                          tc.priority === 'high' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                          'bg-[#64748B]/20 text-[#94A3B8]'
                        }`}>
                          {tc.priority}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-medium text-[#F1F5F9] line-clamp-2 leading-relaxed mb-1.5">
                      {tc.title}
                    </h4>

                    {tc.objective && (
                      <p className="text-[11px] text-[#94A3B8] line-clamp-1 mb-2 italic">
                        {tc.objective}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                      <span className="font-mono text-[#22D3EE] truncate max-w-[180px]">
                        {tc.traceability || tc.requirement_id || 'UI'}
                      </span>
                      <div className="flex items-center gap-2">
                        {tc.confidence && (
                          <span className="font-mono text-[10px] text-[#22D3EE] bg-[#22D3EE]/10 px-1 rounded">
                            {tc.confidence}% conf
                          </span>
                        )}
                        <span>{tc.steps.length} Steps</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Test Case Review & Editor (7 cols) */}
        {selectedCase && (
          <div className="lg:col-span-7 bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 space-y-6">
            {!isEditing ? (
              <>
                {/* Header & Approval Controls */}
                <div className="space-y-3 pb-4 border-b border-[#26334D]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-mono font-bold text-[#7C5CFC]">{selectedCase.test_id}</span>
                      {selectedCase.feature_id && (
                        <span className="text-xs font-mono font-semibold text-[#9278FF] bg-[#7C5CFC]/15 px-2 py-0.5 rounded border border-[#7C5CFC]/30">
                          Feature: {selectedCase.feature_id}
                        </span>
                      )}
                      <span className="text-xs font-mono text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded border border-[#22D3EE]/20">
                        {selectedCase.requirement_id}
                      </span>
                    </div>

                    {/* Approve / Reject / Edit Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetStatus(selectedCase.test_id, 'approved')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          selectedCase.status === 'approved'
                            ? 'bg-[#22C55E] text-black shadow-md'
                            : 'bg-[#22C55E]/15 hover:bg-[#22C55E]/25 text-[#22C55E] border border-[#22C55E]/30'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetStatus(selectedCase.test_id, 'rejected')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          selectedCase.status === 'rejected'
                            ? 'bg-[#F87171] text-white shadow-md'
                            : 'bg-[#F87171]/15 hover:bg-[#F87171]/25 text-[#F87171] border border-[#F87171]/30'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(selectedCase)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0D1629] hover:bg-[#172238] border border-[#26334D] text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#7C5CFC]" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>

                  <h2 className="text-base font-bold text-[#F1F5F9] leading-snug">
                    {selectedCase.title}
                  </h2>

                  {/* Objective */}
                  {selectedCase.objective && (
                    <div className="p-3 rounded-xl bg-[#0D1629] border border-[#26334D] text-xs text-[#94A3B8]">
                      <span className="font-semibold text-[#F1F5F9] block mb-0.5">Objective:</span>
                      <p className="leading-relaxed">{selectedCase.objective}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
                    <span>Module: <strong className="text-[#F1F5F9]">{selectedCase.module || 'General'}</strong></span>
                    <span>&bull;</span>
                    <span>Type: <strong className="text-[#F1F5F9] uppercase">{selectedCase.test_type || selectedCase.category || 'Functional'}</strong></span>
                    <span>&bull;</span>
                    <span>Priority: <strong className="text-[#FBBF24] uppercase">{selectedCase.priority}</strong></span>
                    {selectedCase.traceability && (
                      <>
                        <span>&bull;</span>
                        <span>Traceability: <code className="text-[#22D3EE] font-mono text-[11px]">{selectedCase.traceability}</code></span>
                      </>
                    )}
                    {selectedCase.confidence && (
                      <>
                        <span>&bull;</span>
                        <span className="text-[#22D3EE]">Confidence: {selectedCase.confidence}%</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Test Data Parameters (if any) */}
                {selectedCase.test_data && Object.keys(selectedCase.test_data).length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-2 text-xs">
                    <div className="font-semibold text-[#94A3B8] uppercase text-[10px] tracking-wider">
                      Synthesized Test Data
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      {Object.entries(selectedCase.test_data).map(([key, value]) => (
                        <div key={key} className="p-2 rounded bg-[#111A2E] border border-[#26334D] flex items-center justify-between">
                          <span className="text-[#64748B]">{key}:</span>
                          <span className="text-[#22D3EE] font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preconditions */}
                {selectedCase.preconditions && selectedCase.preconditions.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-1.5 text-xs">
                    <div className="font-semibold text-[#94A3B8] uppercase text-[10px] tracking-wider">Preconditions</div>
                    <ul className="list-disc list-inside space-y-0.5 text-[#F1F5F9]">
                      {selectedCase.preconditions.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Step Sequence */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Playwright Step Sequence ({selectedCase.steps.length})
                  </div>

                  <div className="space-y-2">
                    {selectedCase.steps.map((step, sIdx) => (
                      <div key={sIdx} className="p-3 rounded-xl bg-[#0D1629] border border-[#26334D] flex items-start justify-between gap-3 text-xs">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="font-mono text-[#64748B] text-[11px] mt-0.5">#{sIdx + 1}</span>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-[#172238] font-mono text-[#7C5CFC] font-semibold text-[10px] uppercase border border-[#26334D]">
                                {step.action}
                              </span>
                              <span className="font-mono text-[#22D3EE] font-semibold text-[11px] truncate">
                                {step.target}
                              </span>
                            </div>
                            {step.description && (
                              <p className="text-[#94A3B8] text-[11px]">{step.description}</p>
                            )}
                          </div>
                        </div>

                        {step.value && (
                          <span className="font-mono text-[11px] text-[#F1F5F9] bg-[#111A2E] px-2 py-0.5 rounded border border-[#26334D] shrink-0">
                            "{step.value}"
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Result */}
                <div className="p-3.5 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-1 text-xs">
                  <div className="font-semibold text-[#22C55E] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Expected Result &amp; Assertion Condition
                  </div>
                  <p className="text-[#F1F5F9] leading-relaxed">
                    {selectedCase.expected_result}
                  </p>
                </div>
              </>
            ) : (
              /* Inline Test Case Editor */
              editFormData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#26334D]">
                    <div className="font-bold text-sm text-[#F1F5F9] flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-[#7C5CFC]" />
                      <span>Editing {editFormData.test_id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#7C5CFC] hover:bg-[#9278FF] text-white text-xs font-semibold rounded-lg transition"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 bg-[#172238] text-[#94A3B8] hover:text-[#F1F5F9] text-xs font-semibold rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[#94A3B8] block mb-1">Title</label>
                      <input
                        type="text"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
                      />
                    </div>

                    <div>
                      <label className="text-[#94A3B8] block mb-1">Objective</label>
                      <input
                        type="text"
                        value={editFormData.objective || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, objective: e.target.value })}
                        placeholder="State the primary verification goal of this test..."
                        className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[#94A3B8] block mb-1">Linked Feature ID</label>
                        <input
                          type="text"
                          value={editFormData.feature_id || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, feature_id: e.target.value })}
                          placeholder="e.g. FEAT-001"
                          className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg font-mono text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
                        />
                      </div>

                      <div>
                        <label className="text-[#94A3B8] block mb-1">Test Type</label>
                        <select
                          value={editFormData.test_type || editFormData.category || 'positive'}
                          onChange={(e) => setEditFormData({ ...editFormData, test_type: e.target.value as any, category: e.target.value as any })}
                          className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
                        >
                          <option value="positive">Positive / Happy Path</option>
                          <option value="negative">Negative Validation</option>
                          <option value="boundary">Boundary Values</option>
                          <option value="security">Security &amp; Auth</option>
                          <option value="smoke">Smoke / Health</option>
                          <option value="regression">Regression</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[#94A3B8] block mb-1">Priority</label>
                        <select
                          value={editFormData.priority}
                          onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as TestPriority })}
                          className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
                        >
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#94A3B8] block mb-1">Requirement ID</label>
                        <input
                          type="text"
                          value={editFormData.requirement_id}
                          onChange={(e) => setEditFormData({ ...editFormData, requirement_id: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg font-mono text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
                        />
                      </div>

                      <div>
                        <label className="text-[#94A3B8] block mb-1">Traceability (File/Route)</label>
                        <input
                          type="text"
                          value={editFormData.traceability || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, traceability: e.target.value })}
                          placeholder="e.g. /checkout or src/App.tsx"
                          className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg font-mono text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
                        />
                      </div>
                    </div>

                    {/* Step Editor */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#94A3B8]">Steps</span>
                        <button
                          type="button"
                          onClick={handleAddStep}
                          className="text-[11px] text-[#7C5CFC] hover:text-[#9278FF] flex items-center gap-1 font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Step
                        </button>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {editFormData.steps.map((st, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-[#0D1629] border border-[#26334D] flex items-center gap-2">
                            <select
                              value={st.action}
                              onChange={(e) => handleStepChange(i, 'action', e.target.value)}
                              className="px-2 py-1 bg-[#111A2E] border border-[#26334D] rounded text-[11px] font-mono text-[#7C5CFC]"
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
                              value={st.target}
                              onChange={(e) => handleStepChange(i, 'target', e.target.value)}
                              placeholder="target selector"
                              className="flex-1 px-2 py-1 bg-[#111A2E] border border-[#26334D] rounded text-[11px] font-mono text-[#F1F5F9]"
                            />

                            <input
                              type="text"
                              value={st.value || ''}
                              onChange={(e) => handleStepChange(i, 'value', e.target.value)}
                              placeholder="value"
                              className="w-24 px-2 py-1 bg-[#111A2E] border border-[#26334D] rounded text-[11px] font-mono text-[#F1F5F9]"
                            />

                            {editFormData.steps.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveStep(i)}
                                className="p-1 text-[#64748B] hover:text-[#F87171]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[#94A3B8] block mb-1">Expected Result</label>
                      <textarea
                        rows={2}
                        value={editFormData.expected_result}
                        onChange={(e) => setEditFormData({ ...editFormData, expected_result: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
