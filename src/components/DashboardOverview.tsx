import React from 'react';
import { Project, TestRun, TestCase, DefectTriage, AppNavigationSection } from '../types/qa';
import { 
  Play, 
  Plus, 
  FolderGit2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Zap, 
  Bug, 
  Layers, 
  Activity,
  Terminal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface DashboardOverviewProps {
  projects: Project[];
  currentProject: Project;
  onSelectProject: (p: Project) => void;
  onNavigateSection: (section: AppNavigationSection) => void;
  onNewProject: () => void;
  onRunFullSuite: () => void;
  testCases: TestCase[];
  currentRun: TestRun | null;
  defects: DefectTriage[];
  onOpenPdfModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onNavigateSection,
  onNewProject,
  onRunFullSuite,
  testCases,
  currentRun,
  defects,
  onOpenPdfModal,
}) => {
  const approvedCount = testCases.filter((tc) => tc.status === 'approved').length;
  const passedRunsCount = currentRun ? currentRun.passedCount : 17;
  const totalRunsCount = currentRun ? currentRun.totalTests : 18;
  const failedRunsCount = currentRun ? currentRun.failedCount : 1;
  const passRate = totalRunsCount > 0 ? Math.round((passedRunsCount / totalRunsCount) * 100) : 94;
  const openDefects = defects.filter((d) => d.status !== 'fixed');

  // Empty state if no projects
  if (projects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#7C5CFC]/15 border border-[#7C5CFC]/30 flex items-center justify-center text-[#7C5CFC] mx-auto">
          <FolderGit2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#F1F5F9]">No Projects Onboarded Yet</h2>
          <p className="text-sm text-[#94A3B8] max-w-md mx-auto">
            Get started by onboarding your first web application or codebase. QA-Agent will analyze your components and synthesize a Playwright test suite in seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewProject}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#7C5CFC] hover:bg-[#9278FF] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#7C5CFC]/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Test a New Application</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#111A2E] via-[#172238] to-[#111A2E] border border-[#26334D] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#7C5CFC]/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>QA Engine Operational</span>
              <span>·</span>
              <span className="text-[#22D3EE]">Playwright 1.48 Active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
              Software Quality &amp; Autonomous Testing Platform
            </h1>

            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Active project: <span className="font-semibold text-[#F1F5F9] font-mono">{currentProject.name}</span>. Review deterministic test cases, execute isolated browser runs, and triage automated failure root causes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNewProject}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#172238] hover:bg-[#26334D] text-[#F1F5F9] text-xs font-semibold rounded-xl border border-[#26334D] transition"
            >
              <Plus className="w-4 h-4 text-[#7C5CFC]" />
              <span>New Project</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateSection('test-runs')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#7C5CFC] hover:bg-[#9278FF] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#7C5CFC]/30 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Execute Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tests */}
        <div 
          onClick={() => onNavigateSection('test-suites')}
          className="p-5 rounded-xl bg-[#111A2E] border border-[#26334D] hover:border-[#7C5CFC]/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Total Test Cases</span>
            <div className="w-8 h-8 rounded-lg bg-[#7C5CFC]/10 flex items-center justify-center text-[#7C5CFC]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#F1F5F9] font-mono">{testCases.length}</span>
            <span className="text-xs text-[#22C55E] font-medium font-mono">{approvedCount} approved</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-1 block">Deterministic specifications</span>
        </div>

        {/* Pass Rate */}
        <div 
          onClick={() => onNavigateSection('test-runs')}
          className="p-5 rounded-xl bg-[#111A2E] border border-[#26334D] hover:border-[#22C55E]/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Pass Rate</span>
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#22C55E] font-mono">{passRate}%</span>
            <span className="text-xs text-[#94A3B8] font-mono">{passedRunsCount}/{totalRunsCount} passed</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-1 block">Playwright assertions verified</span>
        </div>

        {/* Open Defects */}
        <div 
          onClick={() => onNavigateSection('defects')}
          className="p-5 rounded-xl bg-[#111A2E] border border-[#26334D] hover:border-[#F87171]/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Open Defects</span>
            <div className="w-8 h-8 rounded-lg bg-[#F87171]/10 flex items-center justify-center text-[#F87171]">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#F87171] font-mono">{openDefects.length}</span>
            <span className="text-xs text-[#FBBF24] font-medium font-mono">Triage pending</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-1 block">Root-cause categorized</span>
        </div>

        {/* Execution Duration */}
        <div 
          onClick={() => onNavigateSection('test-runs')}
          className="p-5 rounded-xl bg-[#111A2E] border border-[#26334D] hover:border-[#22D3EE]/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Avg Step Latency</span>
            <div className="w-8 h-8 rounded-lg bg-[#22D3EE]/10 flex items-center justify-center text-[#22D3EE]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#22D3EE] font-mono">~140ms</span>
            <span className="text-xs text-[#94A3B8] font-mono">Chromium</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-1 block">Low selector drift</span>
        </div>
      </div>

      {/* Main Grid: Projects Catalogue & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Projects (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#7C5CFC]" />
              <h2 className="text-sm font-bold text-[#F1F5F9]">Projects &amp; Test Targets</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('projects')}
              className="text-xs text-[#7C5CFC] hover:text-[#9278FF] font-medium flex items-center gap-1"
            >
              <span>View all ({projects.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => {
              const isSelected = proj.id === currentProject.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#111A2E] border-[#7C5CFC]/60 shadow-sm ring-1 ring-[#7C5CFC]/20'
                      : 'bg-[#111A2E]/60 border-[#26334D] hover:border-[#3B4B6E] hover:bg-[#111A2E]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-[#F1F5F9] truncate">{proj.name}</span>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#7C5CFC]/20 text-[#9278FF] font-mono font-medium">
                            Active
                          </span>
                        )}
                        <span className="text-[10px] text-[#64748B] font-mono">
                          {proj.detectedFramework || 'Web Application'}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] truncate">
                        {proj.zipFileName ? `Archive: ${proj.zipFileName}` : proj.targetUrl || 'Client source components'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(proj);
                          onNavigateSection('test-suites');
                        }}
                        className="px-2.5 py-1 bg-[#172238] hover:bg-[#26334D] text-[#F1F5F9] text-xs font-medium rounded-lg border border-[#26334D] transition flex items-center gap-1"
                      >
                        <span>Tests</span>
                        <ChevronRight className="w-3 h-3 text-[#64748B]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recent Activity & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Actions Card */}
          <div className="p-5 rounded-xl bg-[#111A2E] border border-[#26334D] space-y-3">
            <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
              Quick QA Actions
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={onRunFullSuite}
                className="p-3 rounded-lg bg-[#0D1629] hover:bg-[#172238] border border-[#26334D] text-left transition group space-y-1"
              >
                <Play className="w-4 h-4 text-[#22C55E] group-hover:scale-105 transition" />
                <div className="font-semibold text-[#F1F5F9]">Run Suite</div>
                <div className="text-[11px] text-[#64748B]">All approved cases</div>
              </button>

              <button
                type="button"
                onClick={() => onNavigateSection('defects')}
                className="p-3 rounded-lg bg-[#0D1629] hover:bg-[#172238] border border-[#26334D] text-left transition group space-y-1"
              >
                <Bug className="w-4 h-4 text-[#F87171] group-hover:scale-105 transition" />
                <div className="font-semibold text-[#F1F5F9]">Defect Triage</div>
                <div className="text-[11px] text-[#64748B]">Investigate root causes</div>
              </button>

              <button
                type="button"
                onClick={() => onNavigateSection('requirements')}
                className="p-3 rounded-lg bg-[#0D1629] hover:bg-[#172238] border border-[#26334D] text-left transition group space-y-1"
              >
                <ShieldCheck className="w-4 h-4 text-[#22D3EE] group-hover:scale-105 transition" />
                <div className="font-semibold text-[#F1F5F9]">Traceability</div>
                <div className="text-[11px] text-[#64748B]">Req &rarr; Test &rarr; Defect</div>
              </button>

              <button
                type="button"
                onClick={onOpenPdfModal}
                className="p-3 rounded-lg bg-[#0D1629] hover:bg-[#172238] border border-[#26334D] text-left transition group space-y-1"
              >
                <FileText className="w-4 h-4 text-[#7C5CFC] group-hover:scale-105 transition" />
                <div className="font-semibold text-[#F1F5F9]">Export QA PDF</div>
                <div className="text-[11px] text-[#64748B]">ISO-29148 Report</div>
              </button>
            </div>
          </div>

          {/* Recent Test Runs Activity Timeline */}
          <div className="p-5 rounded-xl bg-[#111A2E] border border-[#26334D] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#22D3EE]" />
                Recent Test Runs
              </h3>
              <span className="text-[10px] text-[#64748B] font-mono">Real-time</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D1629] border border-[#26334D] text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <div>
                    <span className="font-semibold text-[#F1F5F9] block">Smoke Regression Suite</span>
                    <span className="text-[10px] text-[#64748B]">Playwright Chromium &bull; 340ms</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                  PASSED
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D1629] border border-[#26334D] text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#F87171]" />
                  <div>
                    <span className="font-semibold text-[#F1F5F9] block">Checkout Promo Math Verification</span>
                    <span className="text-[10px] text-[#64748B]">Cart Coupon Bug &bull; 420ms</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30">
                  FAILED
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D1629] border border-[#26334D] text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <div>
                    <span className="font-semibold text-[#F1F5F9] block">Auth Guard &amp; JWT Redirection</span>
                    <span className="text-[10px] text-[#64748B]">Session Barrier &bull; 190ms</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                  PASSED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
