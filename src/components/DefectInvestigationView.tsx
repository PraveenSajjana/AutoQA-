import React, { useState } from 'react';
import { DefectTriage, DefectStatus, DefectClassification } from '../types/qa';
import { 
  Bug, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ExternalLink, 
  Copy, 
  Check, 
  Filter, 
  Search, 
  Code2, 
  ShieldAlert, 
  Terminal, 
  ChevronRight,
  Layers,
  ArrowUpRight,
  Plus
} from 'lucide-react';

interface DefectInvestigationViewProps {
  defects: DefectTriage[];
  onUpdateDefectStatus: (defectId: string, newStatus: DefectStatus) => void;
  onUpdateDefectClassification?: (defectId: string, newClassification: DefectClassification) => void;
  onNavigateToTestCase?: (testId: string) => void;
  onNavigateToRequirement?: (reqId: string) => void;
  onNewDefect?: () => void;
}

export const DefectInvestigationView: React.FC<DefectInvestigationViewProps> = ({
  defects,
  onUpdateDefectStatus,
  onUpdateDefectClassification,
  onNavigateToTestCase,
  onNavigateToRequirement,
  onNewDefect,
}) => {
  const [selectedDefectId, setSelectedDefectId] = useState<string>(defects[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  const selectedDefect = defects.find((d) => d.id === selectedDefectId) || defects[0];

  const filteredDefects = defects.filter((d) => {
    if (statusFilter !== 'all' && (d.status || 'new') !== statusFilter) return false;
    if (classificationFilter !== 'all' && (d.classification || 'product_defect') !== classificationFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${d.id} ${d.testTitle} ${d.rootCauseAnalysis} ${d.requirementId || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const getStatusBadge = (status?: DefectStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
            <Clock className="w-3 h-3" /> New
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30">
            <AlertTriangle className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      case 'fixed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
            <CheckCircle2 className="w-3 h-3" /> Fixed
          </span>
        );
      case 'reopened':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30">
            <RotateCcw className="w-3 h-3" /> Reopened
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#64748B]/20 text-[#94A3B8] border border-[#26334D]">
            New
          </span>
        );
    }
  };

  const getClassificationBadge = (classification?: DefectClassification) => {
    switch (classification) {
      case 'product_defect':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30">
            Confirmed Product Defect
          </span>
        );
      case 'suspected_defect':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30">
            Suspected Defect (AI Detected)
          </span>
        );
      case 'test_script_issue':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
            Test Script Issue
          </span>
        );
      case 'environment_issue':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#94A3B8]/20 text-[#F1F5F9] border border-[#26334D]">
            Environment Issue
          </span>
        );
      case 'flaky_test':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30">
            Flaky Test
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#172238] text-[#94A3B8] border border-[#26334D]">
            Unclassified
          </span>
        );
    }
  };

  const handleCopySnippet = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26334D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
              Defect Investigation &amp; Triage
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30">
              {defects.length} Recorded
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Isolate root causes, verify AI-detected anomalies against execution traces, and propose deterministic code patches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Classification guide pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111A2E] border border-[#26334D] text-[11px] text-[#94A3B8]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>AI suspicions require human review before bug filing</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="sm:col-span-1 lg:col-span-2 relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search defects by ID, title, or requirement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-xs text-[#F1F5F9] placeholder-[#64748B] focus:outline-hidden focus:border-[#7C5CFC]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter defects by status"
            className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-xs text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="fixed">Fixed</option>
            <option value="reopened">Reopened</option>
          </select>
        </div>

        <div>
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            aria-label="Filter defects by classification"
            className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-xs text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
          >
            <option value="all">All Classifications</option>
            <option value="product_defect">Product Defect</option>
            <option value="suspected_defect">Suspected Defect (AI)</option>
            <option value="test_script_issue">Test Script Issue</option>
            <option value="environment_issue">Environment Issue</option>
            <option value="flaky_test">Flaky Test</option>
          </select>
        </div>
      </div>

      {/* Main 2-column triage split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Defect List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider px-1">
            Issues List ({filteredDefects.length})
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredDefects.length === 0 ? (
              <div className="p-8 text-center bg-[#111A2E] rounded-xl border border-[#26334D] text-xs text-[#64748B]">
                No defects matching your filter criteria.
              </div>
            ) : (
              filteredDefects.map((defect) => {
                const isSelected = selectedDefect?.id === defect.id;
                return (
                  <div
                    key={defect.id}
                    onClick={() => setSelectedDefectId(defect.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#172238] border-[#7C5CFC] shadow-md shadow-[#7C5CFC]/10'
                        : 'bg-[#111A2E] border-[#26334D] hover:border-[#7C5CFC]/50 hover:bg-[#172238]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#7C5CFC]">
                          {defect.id}
                        </span>
                        {getStatusBadge(defect.status)}
                      </div>
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        defect.severity === 'critical' ? 'bg-[#F87171]/20 text-[#F87171]' :
                        defect.severity === 'major' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                        'bg-[#64748B]/20 text-[#94A3B8]'
                      }`}>
                        {defect.severity}
                      </span>
                    </div>

                    <h4 className="text-xs font-medium text-[#F1F5F9] line-clamp-2 mb-2 leading-relaxed">
                      {defect.testTitle}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                      <span>Ref: <span className="font-mono text-[#94A3B8]">{defect.testId}</span></span>
                      {defect.requirementId && (
                        <span className="font-mono text-[#22D3EE]">{defect.requirementId}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Defect Deep Dive (7 cols) */}
        {selectedDefect ? (
          <div className="lg:col-span-7 bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 space-y-6">
            {/* Top metadata header */}
            <div className="space-y-3 pb-4 border-b border-[#26334D]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-mono font-bold text-[#7C5CFC]">
                    {selectedDefect.id}
                  </span>
                  {getStatusBadge(selectedDefect.status)}
                  {getClassificationBadge(selectedDefect.classification)}
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="defect-status-select" className="text-xs text-[#64748B]">Status:</label>
                  <select
                    id="defect-status-select"
                    value={selectedDefect.status || 'new'}
                    onChange={(e) => onUpdateDefectStatus(selectedDefect.id, e.target.value as DefectStatus)}
                    aria-label="Update defect status"
                    className="px-2.5 py-1 bg-[#0D1629] border border-[#26334D] rounded-lg text-xs font-medium text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
                  >
                    <option value="new">New</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="fixed">Fixed</option>
                    <option value="reopened">Reopened</option>
                  </select>
                </div>
              </div>

              <h2 className="text-base font-semibold text-[#F1F5F9] leading-snug">
                {selectedDefect.testTitle}
              </h2>

              {/* Cross reference chips */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
                {selectedDefect.testId && (
                  <button
                    type="button"
                    onClick={() => onNavigateToTestCase && onNavigateToTestCase(selectedDefect.testId)}
                    className="inline-flex items-center gap-1 text-[#7C5CFC] hover:text-[#9278FF] font-mono hover:underline"
                  >
                    <span>Test: {selectedDefect.testId}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}

                {selectedDefect.requirementId && (
                  <button
                    type="button"
                    onClick={() => onNavigateToRequirement && onNavigateToRequirement(selectedDefect.requirementId!)}
                    className="inline-flex items-center gap-1 text-[#22D3EE] hover:underline font-mono"
                  >
                    <span>Req: {selectedDefect.requirementId}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}

                {selectedDefect.assignedTo && (
                  <span className="text-[#64748B]">
                    Assignee: <span className="text-[#F1F5F9]">{selectedDefect.assignedTo}</span>
                  </span>
                )}
              </div>
            </div>

            {/* AI Classification Warning Banner if suspected */}
            {selectedDefect.classification === 'suspected_defect' && (
              <div className="p-3.5 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
                <div className="text-xs text-[#FBBF24] space-y-1">
                  <div className="font-semibold">Unverified AI Suspicion</div>
                  <p className="text-[#94A3B8]">
                    This issue was flagged by an automated triage agent based on locator timeout patterns. Confirm whether this is an actual product application bug or a test script synchronization delay before assigning to engineering.
                  </p>
                  <div className="pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateDefectClassification && onUpdateDefectClassification(selectedDefect.id, 'product_defect')}
                      className="px-2.5 py-1 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold rounded text-[11px] transition"
                    >
                      Verify as Product Defect
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateDefectClassification && onUpdateDefectClassification(selectedDefect.id, 'test_script_issue')}
                      className="px-2.5 py-1 bg-[#172238] hover:bg-[#26334D] text-[#F1F5F9] border border-[#26334D] font-medium rounded text-[11px] transition"
                    >
                      Reclassify as Script Issue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Behavior Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-1.5">
                <div className="text-[11px] font-semibold text-[#F87171] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Actual Behavior (Failure)
                </div>
                <p className="text-xs text-[#F1F5F9] font-mono leading-relaxed">
                  {selectedDefect.actualBehavior}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-1.5">
                <div className="text-[11px] font-semibold text-[#22C55E] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Expected Behavior
                </div>
                <p className="text-xs text-[#F1F5F9] font-mono leading-relaxed">
                  {selectedDefect.expectedBehavior}
                </p>
              </div>
            </div>

            {/* Root Cause Analysis */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#7C5CFC]" />
                Root Cause Analysis
              </div>
              <div className="p-4 rounded-xl bg-[#0D1629] border border-[#26334D] text-xs text-[#F1F5F9] leading-relaxed">
                {selectedDefect.rootCauseAnalysis}
              </div>
            </div>

            {/* Failed Step Target */}
            {selectedDefect.failedStep && (
              <div className="p-3.5 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Failed Assertion Step</span>
                  <span className="font-mono text-[#F87171]">{selectedDefect.failedStep.action}</span>
                </div>
                <div className="font-mono text-[11px] bg-[#111A2E] p-2 rounded border border-[#26334D] text-[#22D3EE] break-all">
                  Target: {selectedDefect.failedStep.target}
                </div>
              </div>
            )}

            {/* Suggested Fix Code Snippet */}
            {selectedDefect.codeSnippet && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#22C55E]" />
                    Suggested Patch
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySnippet(selectedDefect.codeSnippet!)}
                    className="flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-[#F1F5F9] px-2 py-1 rounded bg-[#0D1629] border border-[#26334D] transition"
                  >
                    {copiedSnippet ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy Patch'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#0D1629] border border-[#26334D] text-xs font-mono text-[#94A3B8] overflow-x-auto leading-relaxed">
                  <code>{selectedDefect.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-7 bg-[#111A2E] border border-[#26334D] rounded-2xl p-12 text-center text-xs text-[#64748B]">
            Select a defect from the list to view reproduction details and analysis.
          </div>
        )}
      </div>
    </div>
  );
};
