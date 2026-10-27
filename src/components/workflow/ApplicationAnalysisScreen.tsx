import React, { useState } from 'react';
import { ApplicationAnalysis, Project, RouteMetadata } from '../../types/qa';
import { 
  Sparkles, 
  Layers, 
  MapPin, 
  AlertTriangle, 
  ArrowRight, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  RotateCw, 
  ShieldCheck, 
  Cpu, 
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';

interface ApplicationAnalysisScreenProps {
  analysis: ApplicationAnalysis;
  project: Project;
  onProceedToDesign: () => Promise<void> | void;
  onReanalyze: () => Promise<void> | void;
  isGeneratingTests: boolean;
  onUpdateAnalysis?: (updated: ApplicationAnalysis) => void;
}

export const ApplicationAnalysisScreen: React.FC<ApplicationAnalysisScreenProps> = ({
  analysis,
  project,
  onProceedToDesign,
  onReanalyze,
  isGeneratingTests,
  onUpdateAnalysis,
}) => {
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number>(0);
  const [isAddingRoute, setIsAddingRoute] = useState<boolean>(false);
  const [newRoutePath, setNewRoutePath] = useState<string>('');
  const [newRouteName, setNewRouteName] = useState<string>('');
  const [newRouteDesc, setNewRouteDesc] = useState<string>('');

  const currentRoute: RouteMetadata | undefined = analysis.routes[selectedRouteIdx] || analysis.routes[0];

  // Check analysis source
  const isSimulatedDemo = !project.specDocument && !project.targetUrl?.includes('localhost');

  const handleAddRoute = () => {
    if (!newRoutePath.trim() || !newRouteName.trim() || !onUpdateAnalysis) return;
    const addedRoute: RouteMetadata = {
      path: newRoutePath.startsWith('/') ? newRoutePath : `/${newRoutePath}`,
      name: newRouteName.trim(),
      description: newRouteDesc.trim() || 'Custom user journey route added during review.',
      criticality: 'high',
      interactiveElements: [
        { type: 'button', selector: 'action-btn', label: 'Primary Action', purpose: 'Workflow step' },
      ],
      potentialRisks: ['Custom flow regression'],
    };

    const updated: ApplicationAnalysis = {
      ...analysis,
      routes: [...analysis.routes, addedRoute],
    };

    onUpdateAnalysis(updated);
    setIsAddingRoute(false);
    setNewRoutePath('');
    setNewRouteName('');
    setNewRouteDesc('');
  };

  const handleRemoveRoute = (idx: number) => {
    if (!onUpdateAnalysis || analysis.routes.length <= 1) return;
    const updatedRoutes = analysis.routes.filter((_, i) => i !== idx);
    onUpdateAnalysis({
      ...analysis,
      routes: updatedRoutes,
    });
    if (selectedRouteIdx >= updatedRoutes.length) {
      setSelectedRouteIdx(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" /> Step 2 of 4: Application Discovery
            </span>

            {/* Clear, honest Analysis Engine badge */}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Demo Heuristic Analysis Adapter</span>
            </span>

            <span className="text-xs text-[#64748B] font-mono">
              Scanned: {new Date(analysis.generatedAt).toLocaleTimeString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
            {analysis.appName}
          </h1>

          <p className="text-sm text-[#94A3B8] leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onReanalyze}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D1629] hover:bg-[#172238] text-[#F1F5F9] border border-[#26334D] text-xs font-semibold rounded-xl transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Re-analyze</span>
          </button>

          <button
            type="button"
            onClick={onProceedToDesign}
            disabled={isGeneratingTests}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#7C5CFC] hover:bg-[#9278FF] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#7C5CFC]/30 transition"
          >
            {isGeneratingTests ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Test Cases...</span>
              </>
            ) : (
              <>
                <span>Generate Test Cases</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Honest Disclosure Banner */}
      <div className="p-4 rounded-xl bg-[#0D1629] border border-[#26334D] flex items-start gap-3 text-xs text-[#94A3B8]">
        <Info className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-[#F1F5F9]">Analysis Engine Disclosure:</span>
          <p className="leading-relaxed">
            This preview environment utilizes deterministic AST parsing and domain heuristics to identify modules, user journeys, and boundary scenarios. A headless Playwright crawler daemon is required for dynamic deep DOM execution.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111A2E] border border-[#26334D] space-y-1">
          <span className="text-xs text-[#94A3B8] font-medium">Mapped Routes</span>
          <div className="text-2xl font-bold font-mono text-[#F1F5F9]">{analysis.routes.length}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111A2E] border border-[#26334D] space-y-1">
          <span className="text-xs text-[#94A3B8] font-medium">Tech Stack Detected</span>
          <div className="text-xs font-mono text-[#22D3EE] font-semibold truncate pt-1">
            {analysis.techStackDetected.join(', ')}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111A2E] border border-[#26334D] space-y-1">
          <span className="text-xs text-[#94A3B8] font-medium">Boundary Scenarios</span>
          <div className="text-2xl font-bold font-mono text-[#FBBF24]">{analysis.boundaryScenarios.length}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111A2E] border border-[#26334D] space-y-1">
          <span className="text-xs text-[#94A3B8] font-medium">Suggested Test Suites</span>
          <div className="text-2xl font-bold font-mono text-[#7C5CFC]">{analysis.recommendedTestSuites.length}</div>
        </div>
      </div>

      {/* 2-Column Split: Routes List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Routes Tree (5 cols) */}
        <div className="lg:col-span-5 bg-[#111A2E] border border-[#26334D] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#7C5CFC]" />
              Discovered Modules ({analysis.routes.length})
            </h3>

            <button
              type="button"
              onClick={() => setIsAddingRoute(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0D1629] hover:bg-[#172238] border border-[#26334D] text-xs font-medium text-[#7C5CFC] hover:text-[#9278FF] transition"
            >
              <Plus className="w-3 h-3" />
              <span>Add Module</span>
            </button>
          </div>

          {/* Add Route Form */}
          {isAddingRoute && (
            <div className="p-3.5 rounded-xl bg-[#0D1629] border border-[#7C5CFC]/40 space-y-3">
              <div className="text-xs font-semibold text-[#F1F5F9]">Add New Module / Route</div>
              <input
                type="text"
                placeholder="Route Path (e.g. /checkout/payment)"
                value={newRoutePath}
                onChange={(e) => setNewRoutePath(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#111A2E] border border-[#26334D] rounded-lg text-xs font-mono text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
              />
              <input
                type="text"
                placeholder="Module Name (e.g. Payment Gateway)"
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#111A2E] border border-[#26334D] rounded-lg text-xs text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddRoute}
                  className="px-3 py-1 bg-[#7C5CFC] hover:bg-[#9278FF] text-white text-xs font-semibold rounded-lg transition"
                >
                  Save Route
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingRoute(false)}
                  className="px-3 py-1 bg-[#172238] text-[#94A3B8] hover:text-[#F1F5F9] text-xs rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Routes List */}
          <div className="space-y-2">
            {analysis.routes.map((route, idx) => {
              const isSelected = idx === selectedRouteIdx;
              return (
                <div
                  key={route.path + idx}
                  onClick={() => setSelectedRouteIdx(idx)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#172238] border-[#7C5CFC] ring-1 ring-[#7C5CFC]/30 shadow-md'
                      : 'bg-[#0D1629] border-[#26334D] hover:border-[#7C5CFC]/40'
                  }`}
                >
                  <div className="min-w-0 pr-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#7C5CFC]">{route.path}</span>
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                        route.criticality === 'critical' ? 'bg-[#F87171]/20 text-[#F87171]' :
                        route.criticality === 'high' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                        'bg-[#64748B]/20 text-[#94A3B8]'
                      }`}>
                        {route.criticality}
                      </span>
                    </div>
                    <div className="text-xs text-[#F1F5F9] font-medium truncate">{route.name}</div>
                  </div>

                  {analysis.routes.length > 1 && onUpdateAnalysis && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveRoute(idx);
                      }}
                      className="p-1 text-[#64748B] hover:text-[#F87171] rounded transition"
                      title="Remove route"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Route Deep Dive (7 cols) */}
        <div className="lg:col-span-7 bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 space-y-6">
          {currentRoute ? (
            <>
              <div className="space-y-1.5 pb-4 border-b border-[#26334D]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#7C5CFC]">{currentRoute.path}</span>
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30">
                    {currentRoute.criticality} Criticality
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F1F5F9]">{currentRoute.name}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{currentRoute.description}</p>
              </div>

              {/* Interactive DOM Elements Discovered */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center justify-between">
                  <span>Interactive DOM Elements ({currentRoute.interactiveElements.length})</span>
                  <span className="text-[11px] text-[#22D3EE] font-mono">Mapped for Playwright</span>
                </div>

                <div className="space-y-2">
                  {currentRoute.interactiveElements.map((elem, eIdx) => (
                    <div key={eIdx} className="p-2.5 rounded-lg bg-[#0D1629] border border-[#26334D] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 rounded bg-[#172238] text-[10px] font-mono text-[#94A3B8] border border-[#26334D] uppercase">
                          {elem.type}
                        </span>
                        <span className="font-mono text-[#22D3EE] font-semibold text-[11px] truncate">
                          [{elem.selector}]
                        </span>
                      </div>
                      <span className="text-[#94A3B8] text-[11px] truncate ml-2">{elem.purpose}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Potential Risks */}
              {currentRoute.potentialRisks && currentRoute.potentialRisks.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#FBBF24] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Identified Risk Scenarios</span>
                  </div>
                  <ul className="space-y-1 text-xs text-[#94A3B8] list-disc list-inside">
                    {currentRoute.potentialRisks.map((risk, rIdx) => (
                      <li key={rIdx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-xs text-[#64748B]">
              Select a module from the left to inspect discovered routes and elements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
