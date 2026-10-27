import React, { useState } from 'react';
import { TraceabilityRequirement, TestCase, DefectTriage } from '../types/qa';
import { 
  ListTree, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Plus, 
  ShieldCheck, 
  Layers, 
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface RequirementTraceabilityViewProps {
  requirements: TraceabilityRequirement[];
  testCases: TestCase[];
  defects: DefectTriage[];
  onNavigateToTestCase?: (testId: string) => void;
  onNavigateToDefect?: (defectId: string) => void;
  onGenerateTestForRequirement?: (req: TraceabilityRequirement) => void;
}

export const RequirementTraceabilityView: React.FC<RequirementTraceabilityViewProps> = ({
  requirements,
  testCases,
  defects,
  onNavigateToTestCase,
  onNavigateToDefect,
  onGenerateTestForRequirement,
}) => {
  const [filterCoverage, setFilterCoverage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReqId, setSelectedReqId] = useState<string>(requirements[0]?.id || '');

  const totalReqs = requirements.length;
  const coveredCount = requirements.filter((r) => r.status === 'covered').length;
  const partialCount = requirements.filter((r) => r.status === 'partial').length;
  const uncoveredCount = requirements.filter((r) => r.status === 'uncovered').length;
  const coveragePercent = totalReqs > 0 ? Math.round(((coveredCount + partialCount * 0.5) / totalReqs) * 100) : 0;

  const filteredRequirements = requirements.filter((req) => {
    if (filterCoverage === 'gaps' && req.status === 'covered') return false;
    if (filterCoverage !== 'all' && filterCoverage !== 'gaps' && req.status !== filterCoverage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = `${req.code} ${req.title} ${req.description} ${req.module}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  const selectedReq = requirements.find((r) => r.id === selectedReqId) || requirements[0];

  const getStatusBadge = (status: TraceabilityRequirement['status']) => {
    switch (status) {
      case 'covered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
            <CheckCircle2 className="w-3 h-3" /> Fully Covered
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30">
            <AlertTriangle className="w-3 h-3" /> Partial
          </span>
        );
      case 'uncovered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30">
            <XCircle className="w-3 h-3" /> Coverage Gap
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26334D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
              Requirement-to-Test Traceability Matrix
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30">
              {coveragePercent}% Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Bidirectional verification tracking linking PRD user stories to automated Playwright test assertions and active defects.
          </p>
        </div>

        {/* Coverage Gap Filter Quick Button */}
        {uncoveredCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterCoverage(filterCoverage === 'gaps' ? 'all' : 'gaps')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              filterCoverage === 'gaps'
                ? 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/50 ring-1 ring-[#F87171]'
                : 'bg-[#111A2E] text-[#94A3B8] hover:text-[#F1F5F9] border-[#26334D]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#F87171]" />
            <span>Show Blind Spots ({uncoveredCount} Gaps)</span>
          </button>
        )}
      </div>

      {/* Coverage KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111A2E] border border-[#26334D]">
          <span className="text-xs text-[#94A3B8] font-medium">Total Specifications</span>
          <div className="text-2xl font-bold font-mono text-[#F1F5F9] mt-1">{totalReqs}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111A2E] border border-[#26334D]">
          <span className="text-xs text-[#22C55E] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Covered Requirements
          </span>
          <div className="text-2xl font-bold font-mono text-[#22C55E] mt-1">{coveredCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111A2E] border border-[#26334D]">
          <span className="text-xs text-[#FBBF24] font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Partial Coverage
          </span>
          <div className="text-2xl font-bold font-mono text-[#FBBF24] mt-1">{partialCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111A2E] border border-[#26334D]">
          <span className="text-xs text-[#F87171] font-medium flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> Untested Gaps
          </span>
          <div className="text-2xl font-bold font-mono text-[#F87171] mt-1">{uncoveredCount}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search requirements by code, title, module, or user story..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-xs text-[#F1F5F9] placeholder-[#64748B] focus:outline-hidden focus:border-[#7C5CFC]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCoverage}
            onChange={(e) => setFilterCoverage(e.target.value)}
            aria-label="Filter requirements by coverage"
            className="px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-xs text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
          >
            <option value="all">All Requirements</option>
            <option value="gaps">Coverage Gaps Only</option>
            <option value="covered">Fully Covered</option>
            <option value="partial">Partially Covered</option>
            <option value="uncovered">Uncovered</option>
          </select>
        </div>
      </div>

      {/* Traceability Table */}
      <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E1528] text-[#94A3B8] uppercase font-mono tracking-wider border-b border-[#26334D]">
              <tr>
                <th className="py-3 px-4">Requirement ID</th>
                <th className="py-3 px-4">Specification / Story</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Linked Test Cases</th>
                <th className="py-3 px-4">Defect Link</th>
                <th className="py-3 px-4">Coverage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26334D]/60">
              {filteredRequirements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#64748B]">
                    No requirements match the current filters.
                  </td>
                </tr>
              ) : (
                filteredRequirements.map((req) => {
                  const linkedCases = testCases.filter((tc) => req.testCaseIds.includes(tc.test_id));
                  const linkedDefects = defects.filter((d) => req.defectIds.includes(d.id));

                  return (
                    <tr 
                      key={req.id} 
                      onClick={() => setSelectedReqId(req.id)}
                      className={`hover:bg-[#172238]/60 cursor-pointer transition ${
                        selectedReq?.id === req.id ? 'bg-[#172238]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#7C5CFC] whitespace-nowrap">
                        {req.code}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-[#F1F5F9]">{req.title}</div>
                        <div className="text-[11px] text-[#94A3B8] line-clamp-1 mt-0.5">
                          {req.description}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#94A3B8] whitespace-nowrap">
                        {req.module}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          req.priority === 'critical' ? 'bg-[#F87171]/15 text-[#F87171]' :
                          req.priority === 'high' ? 'bg-[#FBBF24]/15 text-[#FBBF24]' :
                          'bg-[#64748B]/20 text-[#94A3B8]'
                        }`}>
                          {req.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {req.testCaseIds.length === 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#F87171] font-mono text-[11px]">No tests</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onGenerateTestForRequirement) onGenerateTestForRequirement(req);
                              }}
                              className="px-1.5 py-0.5 bg-[#7C5CFC]/20 hover:bg-[#7C5CFC] text-[#9278FF] hover:text-white rounded text-[10px] transition font-semibold"
                              title="Synthesize automated test"
                            >
                              + Create
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {req.testCaseIds.map((tid) => (
                              <button
                                key={tid}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onNavigateToTestCase) onNavigateToTestCase(tid);
                                }}
                                className="px-1.5 py-0.5 rounded bg-[#0D1629] border border-[#26334D] text-[11px] font-mono text-[#22D3EE] hover:border-[#22D3EE] transition"
                              >
                                {tid}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {req.defectIds.length === 0 ? (
                          <span className="text-[#64748B] text-[11px]">None</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {req.defectIds.map((did) => (
                              <button
                                key={did}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onNavigateToDefect) onNavigateToDefect(did);
                                }}
                                className="px-1.5 py-0.5 rounded bg-[#F87171]/15 border border-[#F87171]/30 text-[11px] font-mono text-[#F87171] hover:bg-[#F87171]/25 transition"
                              >
                                {did}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Requirement Deep Dive Panel */}
      {selectedReq && (
        <div className="p-5 rounded-2xl bg-[#111A2E] border border-[#26334D] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#26334D]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-[#7C5CFC]">{selectedReq.code}</span>
              <span className="text-sm font-semibold text-[#F1F5F9]">{selectedReq.title}</span>
              {getStatusBadge(selectedReq.status)}
            </div>

            {selectedReq.status === 'uncovered' && (
              <button
                type="button"
                onClick={() => onGenerateTestForRequirement && onGenerateTestForRequirement(selectedReq)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7C5CFC] hover:bg-[#9278FF] text-white rounded-lg text-xs font-semibold shadow-md shadow-[#7C5CFC]/20 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Generate Test For This Gap</span>
              </button>
            )}
          </div>

          <div className="text-xs text-[#94A3B8] leading-relaxed">
            {selectedReq.description}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-2 text-xs">
              <div className="font-semibold text-[#F1F5F9]">Verification Strategy</div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Automated Playwright browser emulation with DOM assertion checks and screenshot trace capture. Target module: {selectedReq.module}.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-2 text-xs">
              <div className="font-semibold text-[#F1F5F9]">Quality Risk Level</div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Criticality rated as <span className="font-semibold uppercase text-[#FBBF24]">{selectedReq.priority}</span>. 
                {selectedReq.status === 'uncovered' ? ' Regression risk is elevated until automated assertions are generated.' : ' Verified against current deployment build.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
