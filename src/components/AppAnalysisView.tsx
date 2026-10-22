import React, { useState } from 'react';
import { ApplicationAnalysis, Project, TestCase, TestRun } from '../types/qa';
import { ModuleCoverageVisualizer } from './ModuleCoverageVisualizer';
import { 
  MapPin, 
  Layers, 
  AlertTriangle, 
  ArrowRight, 
  Cpu, 
  Sparkles, 
  CheckCircle, 
  RefreshCw,
  Sliders,
  HardDrive,
  Server,
  Filter,
  X
} from 'lucide-react';

interface AppAnalysisViewProps {
  analysis: ApplicationAnalysis;
  project?: Project;
  onProceedToDesign: () => void;
  onReanalyze: () => void;
  isGeneratingTests: boolean;
  testCases?: TestCase[];
  currentRun?: TestRun | null;
}

export const AppAnalysisView: React.FC<AppAnalysisViewProps> = ({
  analysis,
  project,
  onProceedToDesign,
  onReanalyze,
  isGeneratingTests,
  testCases = [],
  currentRun = null,
}) => {
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string | null>(null);

  const displayedRoutes = selectedModuleFilter
    ? analysis.routes.filter(
        (r) =>
          r.path.toLowerCase() === selectedModuleFilter.toLowerCase() ||
          r.path.toLowerCase().startsWith(selectedModuleFilter.toLowerCase()) ||
          r.name.toLowerCase().includes(selectedModuleFilter.toLowerCase())
      )
    : analysis.routes;
  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Agent 1: Application Analyst Output
            </span>
            {project?.pastedFiles && project.pastedFiles.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 font-mono">
                <Layers className="w-3 h-3 text-indigo-400" />
                {project.zipFileName ? `ZIP: ${project.zipFileName}` : 'Pasted Codebase'} ({project.pastedFiles.length} files)
              </span>
            )}
            {project?.inputType === 'local_folder' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-mono">
                <HardDrive className="w-3 h-3" /> Local Repo: {project.localFolderPath || 'Device Files'} ({project.localFilesCount || 0} files)
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono">
              Scanned: {new Date(analysis.generatedAt).toLocaleTimeString()}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{analysis.appName}</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl">{analysis.summary}</p>

          {/* Honest Coverage & Sandbox Execution Notice */}
          {project?.pastedFiles && project.pastedFiles.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Codebase Ingestion Scope ({project.pastedFiles.length} files received):</span>
              </div>
              <p className="text-slate-400">
                Analyzed source files: <span className="font-mono text-slate-200">{project.pastedFiles.map(f => f.name).join(', ')}</span>.
              </p>
              <p className="text-slate-400 text-[10px]">
                <strong className="text-amber-400">Environment notice:</strong> Pasted code represents application client components. Test execution runs against the isolated browser DOM sandbox with safe deterministic action translation (no arbitrary server-side code execution).
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReanalyze}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rescan Map</span>
          </button>

          <button
            onClick={onProceedToDesign}
            disabled={isGeneratingTests}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Cpu className="w-4 h-4" />
            <span>{isGeneratingTests ? 'Agent 2 Designing Cases...' : 'Proceed to Agent 2: Test Designer'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tech Stack & High-level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Discovered Routes</div>
          <div className="text-2xl font-bold text-white mt-1">{analysis.routes.length}</div>
          <div className="text-[11px] text-indigo-400 mt-1 font-mono">
            {analysis.routes.filter((r) => r.criticality === 'critical').length} Critical Paths
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Interactive Elements</div>
          <div className="text-2xl font-bold text-white mt-1">
            {analysis.routes.reduce((acc, r) => acc + r.interactiveElements.length, 0)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">
            Inputs, Buttons &amp; Forms
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Boundary Scenarios</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{analysis.boundaryScenarios.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Edge-case risks flagged
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Tech Stack Fingerprint</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {analysis.techStackDetected.map((tech, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Module Coverage Analytics & Interactive Recharts Visualizer */}
      <ModuleCoverageVisualizer
        analysis={analysis}
        testCases={testCases}
        currentRun={currentRun}
        onSelectModuleFilter={(modulePath) => {
          setSelectedModuleFilter((prev) => (prev === modulePath ? null : modulePath));
        }}
      />

      {/* Discovered Routes and Interactive Targets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              Application Route Map &amp; Interactive Locators
            </h3>
            {selectedModuleFilter && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Filter className="w-3 h-3" />
                <span>Filtered by: <strong className="font-mono">{selectedModuleFilter}</strong></span>
                <button
                  onClick={() => setSelectedModuleFilter(null)}
                  className="hover:text-white ml-1 p-0.5 rounded hover:bg-indigo-500/20"
                  title="Clear filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Locators mapped to Playwright Actions ({displayedRoutes.length} of {analysis.routes.length} shown)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedRoutes.map((route, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {route.path}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      route.criticality === 'critical'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : route.criticality === 'high'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {route.criticality}
                  </span>
                </div>

                <div className="font-semibold text-sm text-white mb-1">{route.name}</div>
                <p className="text-xs text-slate-400 mb-3">{route.description}</p>

                {/* Elements */}
                <div className="space-y-1.5 mb-3">
                  <div className="text-[11px] font-medium text-slate-400">Target Selectors:</div>
                  <div className="space-y-1">
                    {route.interactiveElements.map((el, eIdx) => (
                      <div
                        key={eIdx}
                        className="flex items-center justify-between text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800/80 font-mono"
                      >
                        <span className="text-slate-300 truncate max-w-[150px]">
                          {el.label}
                        </span>
                        <span className="text-indigo-400 truncate max-w-[130px]" title={el.selector}>
                          #{el.selector}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks */}
                {route.potentialRisks.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] font-semibold text-amber-400/90 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3 h-3" /> Flagged Risks:
                    </div>
                    <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc list-inside">
                      {route.potentialRisks.map((risk, rIdx) => (
                        <li key={rIdx} className="truncate">{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Test Suites & Boundary Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Suites */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Agent 2 Suggested Test Suites
          </h4>
          <div className="space-y-2.5">
            {analysis.recommendedTestSuites.map((suite, sIdx) => (
              <div
                key={sIdx}
                className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{suite.name}</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{suite.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    ~{suite.estimatedCases} cases
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boundary Scenarios */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            Boundary &amp; Negative Edge Cases
          </h4>
          <div className="space-y-2">
            {analysis.boundaryScenarios.map((scen, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-[10px] font-mono">
                  {idx + 1}
                </div>
                <div className="leading-relaxed">{scen}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
