import React, { useState } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Clock, 
  Play, 
  ShieldCheck, 
  Sparkles, 
  FileSearch, 
  FileCode, 
  Terminal, 
  Bug, 
  FileText,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { ApplicationAnalysis, TestCase, TestRun, DefectTriage, QASummaryReport } from '../types/qa';

interface AgentActivityViewProps {
  analysis: ApplicationAnalysis | null;
  testCases: TestCase[];
  currentRun: TestRun | null;
  defects: DefectTriage[];
  summaryReport: QASummaryReport | null;
  onNavigateSection: (section: any) => void;
  onTriggerAnalysis?: () => void;
  onTriggerExecution?: () => void;
}

export const AgentActivityView: React.FC<AgentActivityViewProps> = ({
  analysis,
  testCases,
  currentRun,
  defects,
  summaryReport,
  onNavigateSection,
  onTriggerAnalysis,
  onTriggerExecution,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<number>(1);

  const agents = [
    {
      id: 1,
      name: 'Application Analyst',
      role: 'AST & Component Inspector',
      icon: FileSearch,
      status: analysis ? 'completed' : 'idle',
      summary: 'Inspects DOM selectors, technology stack, interactive routes, and boundary risk scenarios.',
      details: analysis ? {
        routesCount: analysis.routes.length,
        techStack: analysis.techStackDetected.join(', '),
        risksCount: analysis.boundaryScenarios.length,
        lastRun: analysis.generatedAt,
      } : null,
      actionLabel: 'View Analysis Matrix',
      actionSection: 'overview',
    },
    {
      id: 2,
      name: 'Test Designer',
      role: 'Deterministic Spec Synthesizer',
      icon: FileCode,
      status: testCases.length > 0 ? 'completed' : 'idle',
      summary: 'Synthesizes high-rigor Playwright test cases with strict locators and explicit assertions.',
      details: testCases.length > 0 ? {
        casesGenerated: testCases.length,
        approvedCases: testCases.filter((c) => c.status === 'approved').length,
        criticalCases: testCases.filter((c) => c.priority === 'critical').length,
        categories: Array.from(new Set(testCases.map((c) => c.category || 'functional'))).join(', '),
      } : null,
      actionLabel: 'Review Test Cases',
      actionSection: 'test-suites',
    },
    {
      id: 3,
      name: 'Test Executor',
      role: 'Headless Playwright Runner',
      icon: Terminal,
      status: currentRun ? (currentRun.status === 'running' ? 'working' : 'completed') : 'idle',
      summary: 'Drives Playwright Chromium sandbox, captures actionability timings, DOM traces, and screenshots.',
      details: currentRun ? {
        totalExecuted: currentRun.totalTests,
        passed: currentRun.passedCount,
        failed: currentRun.failedCount,
        duration: `${(currentRun.durationMs / 1000).toFixed(1)}s`,
        browser: currentRun.browser,
      } : null,
      actionLabel: 'Open Execution Console',
      actionSection: 'test-runs',
    },
    {
      id: 4,
      name: 'Failure Triage Agent',
      role: 'Automated Root Cause Diagnostician',
      icon: Bug,
      status: defects.length > 0 ? 'completed' : 'idle',
      summary: 'Dissects failed locators and stack traces to isolate application bugs vs test script drift, proposing fixes.',
      details: defects.length > 0 ? {
        defectsIdentified: defects.length,
        criticalCount: defects.filter((d) => d.severity === 'critical').length,
        avgConfidence: `${Math.round(defects.reduce((acc, d) => acc + d.confidence, 0) / defects.length)}%`,
        activeTriages: defects.filter((d) => d.status !== 'fixed').length,
      } : null,
      actionLabel: 'Investigate Defects',
      actionSection: 'defects',
    },
    {
      id: 5,
      name: 'Report Generator',
      role: 'Release Governance & Audit Exporter',
      icon: FileText,
      status: summaryReport ? 'completed' : 'idle',
      summary: 'Synthesizes executive release GO/NO-GO verdict, coverage matrices, and audit-ready PDF/Markdown exports.',
      details: summaryReport ? {
        passRate: `${summaryReport.passRate}%`,
        verdict: summaryReport.releaseVerdict,
        findingsCount: summaryReport.keyFindings.length,
        actionItemsCount: summaryReport.actionItems.length,
      } : null,
      actionLabel: 'View Executive Report',
      actionSection: 'reports',
    },
  ];

  const currentAgentData = agents.find((a) => a.id === selectedAgent) || agents[0];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26334D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
              5-Stage Autonomous QA Orchestrator
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
              Pipeline Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Multi-agent architecture coordinating application analysis, test generation, isolated execution, triage, and audit reporting.
          </p>
        </div>
      </div>

      {/* 5-Step Pipeline Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isSelected = selectedAgent === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between min-h-[140px] ${
                isSelected
                  ? 'bg-[#172238] border-[#7C5CFC] shadow-md shadow-[#7C5CFC]/15'
                  : 'bg-[#111A2E] border-[#26334D] hover:border-[#7C5CFC]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-[#7C5CFC] text-white' : 'bg-[#172238] text-[#94A3B8]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-[#64748B]">
                    0{agent.id}
                  </span>
                </div>
                <div className="font-bold text-xs text-[#F1F5F9]">{agent.name}</div>
                <div className="text-[10px] text-[#64748B] font-mono mt-0.5 truncate">{agent.role}</div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className={`inline-flex items-center gap-1 font-mono text-[10px] ${
                  agent.status === 'completed' ? 'text-[#22C55E]' :
                  agent.status === 'working' ? 'text-[#22D3EE] animate-pulse' :
                  'text-[#64748B]'
                }`}>
                  {agent.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                  {agent.status === 'working' && <Clock className="w-3 h-3" />}
                  {agent.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Detailed View */}
      <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26334D]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#7C5CFC]/20 border border-[#7C5CFC]/30 flex items-center justify-center text-[#7C5CFC]">
              <currentAgentData.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-[#7C5CFC]">Agent 0{currentAgentData.id}</span>
                <span className="text-xs text-[#64748B]">·</span>
                <span className="text-xs font-mono text-[#94A3B8]">{currentAgentData.role}</span>
              </div>
              <h2 className="text-lg font-bold text-[#F1F5F9]">{currentAgentData.name}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateSection(currentAgentData.actionSection)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7C5CFC] hover:bg-[#9278FF] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#7C5CFC]/20 transition"
          >
            <span>{currentAgentData.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[#94A3B8] leading-relaxed">
          {currentAgentData.summary}
        </p>

        {/* Dynamic Metric Grid for Selected Agent */}
        {currentAgentData.details ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(currentAgentData.details).map(([key, val]) => (
              <div key={key} className="p-4 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-1">
                <span className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <div className="text-sm font-semibold font-mono text-[#F1F5F9] truncate">
                  {String(val)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#0D1629] rounded-xl border border-[#26334D] text-xs text-[#64748B]">
            This agent has not been triggered for the current project session yet.
          </div>
        )}

        {/* Operating Guarantees */}
        <div className="p-4 rounded-xl bg-[#0E1528] border border-[#26334D] space-y-2">
          <div className="text-xs font-semibold text-[#F1F5F9] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            Production Safety &amp; Grounding Guarantee
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            All agent outputs are strictly grounded in concrete DOM selectors, real AST syntax, and deterministic assertions. No hallucinated passes: test outcomes are derived exclusively from Playwright assertion evaluation.
          </p>
        </div>
      </div>
    </div>
  );
};
