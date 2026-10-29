import React, { useState } from 'react';
import { ApplicationAnalysis, Project, RouteMetadata, DiscoveredFeature } from '../../types/qa';
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
  CheckCircle2, 
  Info,
  Terminal,
  FolderGit2,
  FileArchive,
  Code2,
  FileText,
  ToggleLeft,
  ToggleRight,
  Sliders,
  ExternalLink,
  X
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
  const [activeTab, setActiveTab] = useState<'features' | 'routes' | 'architecture'>('features');
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number>(0);
  
  // Feature editing state
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editFeatureName, setEditFeatureName] = useState<string>('');
  const [editFeatureDesc, setEditFeatureDesc] = useState<string>('');
  const [editFeatureRisk, setEditFeatureRisk] = useState<'critical' | 'high' | 'medium' | 'low'>('high');

  // Add custom feature state
  const [isAddingFeature, setIsAddingFeature] = useState<boolean>(false);
  const [newFeatName, setNewFeatName] = useState<string>('');
  const [newFeatDesc, setNewFeatDesc] = useState<string>('');
  const [newFeatPath, setNewFeatPath] = useState<string>('src/');
  const [newFeatRisk, setNewFeatRisk] = useState<'critical' | 'high' | 'medium' | 'low'>('high');

  // Add route state
  const [isAddingRoute, setIsAddingRoute] = useState<boolean>(false);
  const [newRoutePath, setNewRoutePath] = useState<string>('');
  const [newRouteName, setNewRouteName] = useState<string>('');
  const [newRouteDesc, setNewRouteDesc] = useState<string>('');

  // Normalize discovered features list (fallback to routes if empty)
  const features: DiscoveredFeature[] = React.useMemo(() => {
    if (analysis.discoveredFeatures && analysis.discoveredFeatures.length > 0) {
      return analysis.discoveredFeatures;
    }
    // Derive from routes
    return (analysis.routes || []).map((r, idx) => ({
      id: `FEAT-${String(idx + 1).padStart(3, '0')}`,
      name: r.name,
      description: r.description,
      sourceFilePaths: [r.path],
      relevantRoutesOrEndpoints: [r.path],
      relatedComponents: [r.name],
      dependencies: (analysis.techStackDetected || []).slice(0, 2),
      riskLevel: r.criticality || 'high',
      riskRationale: r.potentialRisks?.[0] || 'User workflow interaction point',
      confidenceLevel: 'high' as const,
      evidence: `Discovered interactive route at ${r.path} with ${r.interactiveElements?.length || 0} DOM element(s)`,
      analysisLimitations: 'Client route surface inspection',
      confirmed: true
    }));
  }, [analysis.discoveredFeatures, analysis.routes, analysis.techStackDetected]);

  const confirmedCount = features.filter((f) => f.confirmed !== false).length;
  const currentRoute: RouteMetadata | undefined = analysis.routes[selectedRouteIdx] || analysis.routes[0];

  // Toggle Feature Confirmation for Test Generation
  const handleToggleConfirmFeature = (featId: string) => {
    if (!onUpdateAnalysis) return;
    const updatedFeatures = features.map((f) => 
      f.id === featId ? { ...f, confirmed: !f.confirmed } : f
    );
    onUpdateAnalysis({
      ...analysis,
      discoveredFeatures: updatedFeatures
    });
  };

  // Confirm or Exclude All Features
  const handleToggleAllFeatures = (confirmState: boolean) => {
    if (!onUpdateAnalysis) return;
    const updatedFeatures = features.map((f) => ({ ...f, confirmed: confirmState }));
    onUpdateAnalysis({
      ...analysis,
      discoveredFeatures: updatedFeatures
    });
  };

  // Start Editing Feature
  const handleStartEditFeature = (feat: DiscoveredFeature) => {
    setEditingFeatureId(feat.id);
    setEditFeatureName(feat.name);
    setEditFeatureDesc(feat.description);
    setEditFeatureRisk(feat.riskLevel);
  };

  // Save Feature Edit
  const handleSaveEditFeature = () => {
    if (!editingFeatureId || !onUpdateAnalysis) return;
    const updatedFeatures = features.map((f) => 
      f.id === editingFeatureId ? {
        ...f,
        name: editFeatureName.trim() || f.name,
        description: editFeatureDesc.trim() || f.description,
        riskLevel: editFeatureRisk
      } : f
    );
    onUpdateAnalysis({
      ...analysis,
      discoveredFeatures: updatedFeatures
    });
    setEditingFeatureId(null);
  };

  // Add Custom Feature
  const handleCreateCustomFeature = () => {
    if (!newFeatName.trim() || !onUpdateAnalysis) return;
    const customFeat: DiscoveredFeature = {
      id: `FEAT-${String(features.length + 1).padStart(3, '0')}`,
      name: newFeatName.trim(),
      description: newFeatDesc.trim() || 'Custom user journey feature defined for automated testing.',
      sourceFilePaths: [newFeatPath.trim() || 'src/components/CustomFeature.tsx'],
      relevantRoutesOrEndpoints: ['/' + newFeatName.toLowerCase().replace(/\s+/g, '-')],
      relatedComponents: [newFeatName.replace(/\s+/g, '')],
      dependencies: (analysis.techStackDetected || []).slice(0, 2),
      riskLevel: newFeatRisk,
      riskRationale: 'User-specified critical path feature requiring verification.',
      confidenceLevel: 'high',
      evidence: 'Manually verified business requirement',
      analysisLimitations: 'Custom defined specification',
      confirmed: true
    };

    onUpdateAnalysis({
      ...analysis,
      discoveredFeatures: [...features, customFeat]
    });
    setIsAddingFeature(false);
    setNewFeatName('');
    setNewFeatDesc('');
  };

  // Add Route
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
      {/* Top Header Banner */}
      <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" /> Step 2 of 4: Architecture &amp; Feature Inventory
            </span>

            {/* Dynamic Verified Engine badge */}
            {project.inputType === 'workspace_scan' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>Workspace Codebase Scanner (/app/applet)</span>
              </span>
            ) : project.inputType === 'zip_upload' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center gap-1">
                <FileArchive className="w-3.5 h-3.5" />
                <span>Unpacked ZIP AST Ingestion</span>
              </span>
            ) : project.inputType === 'git_repo' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30 flex items-center gap-1">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Git Remote Repository</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Live Route &amp; DOM Mapping Engine</span>
              </span>
            )}

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

          {/* Tech Stack Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {analysis.techStackDetected.map((tech) => (
              <span key={tech} className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-[#0D1629] border border-[#26334D] text-[#94A3B8]">
                {tech}
              </span>
            ))}
            {analysis.entryPoints && analysis.entryPoints.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-[#172238] border border-[#7C5CFC]/30 text-[#22D3EE]">
                Entry: {analysis.entryPoints[0]}
              </span>
            )}
          </div>
        </div>

        {/* Primary CTA Buttons */}
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
            disabled={isGeneratingTests || confirmedCount === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#7C5CFC] hover:bg-[#9278FF] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#7C5CFC]/30 transition"
            title={confirmedCount === 0 ? 'Please confirm at least 1 feature to generate test cases.' : undefined}
          >
            {isGeneratingTests ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing Test Cases...</span>
              </>
            ) : (
              <>
                <span>Generate Tests ({confirmedCount} Confirmed)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Features, Routes, Architecture */}
      <div className="flex items-center justify-between border-b border-[#26334D] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'features'
                ? 'bg-[#7C5CFC] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Discovered Features ({features.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'routes'
                ? 'bg-[#7C5CFC] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Routes &amp; Selectors ({analysis.routes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'architecture'
                ? 'bg-[#7C5CFC] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E]'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
            <span>Risk Boundaries &amp; Environment</span>
          </button>
        </div>

        {activeTab === 'features' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleAllFeatures(confirmedCount < features.length)}
              className="text-xs font-mono text-[#94A3B8] hover:text-[#22D3EE] transition"
            >
              {confirmedCount < features.length ? 'Confirm All' : 'Deselect All'}
            </button>
            <button
              type="button"
              onClick={() => setIsAddingFeature(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111A2E] hover:bg-[#172238] border border-[#26334D] text-xs font-semibold text-[#F1F5F9] transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#7C5CFC]" />
              <span>Add Feature</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DISCOVERED FEATURES INVENTORY & REVIEW */}
      {/* ======================================================== */}
      {activeTab === 'features' && (
        <div className="space-y-4 animate-fade-in">
          {/* Instructions Bar */}
          <div className="p-3.5 rounded-xl bg-[#0E1528] border border-[#26334D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#22D3EE] shrink-0" />
              <span>
                Review and confirm the discovered features below. Test cases will only be generated for features marked as <strong>Confirmed</strong>.
              </span>
            </div>
            <span className="font-mono text-[#22C55E] shrink-0 font-semibold">
              {confirmedCount} of {features.length} Features Confirmed
            </span>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feat) => {
              const isConfirmed = feat.confirmed !== false;
              const isEditing = editingFeatureId === feat.id;

              const riskBadgeColor = 
                feat.riskLevel === 'critical' ? 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30' :
                feat.riskLevel === 'high' ? 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30' :
                'bg-[#22D3EE]/15 text-[#22D3EE] border-[#22D3EE]/30';

              return (
                <div
                  key={feat.id}
                  className={`rounded-2xl border transition p-5 space-y-4 ${
                    isConfirmed 
                      ? 'bg-[#111A2E] border-[#26334D] hover:border-[#7C5CFC]/50 shadow-md' 
                      : 'bg-[#0E1528]/60 border-[#26334D]/40 opacity-60'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#7C5CFC] bg-[#7C5CFC]/10 px-2 py-0.5 rounded">
                          {feat.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${riskBadgeColor}`}>
                          {feat.riskLevel} Risk
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#172238] text-[#94A3B8] border border-[#26334D]">
                          {feat.confidenceLevel} confidence
                        </span>
                      </div>

                      {isEditing ? (
                        <input
                          type="text"
                          value={editFeatureName}
                          onChange={(e) => setEditFeatureName(e.target.value)}
                          className="w-full px-2 py-1 bg-[#0D1629] border border-[#7C5CFC] rounded text-sm text-[#F1F5F9] font-bold mt-1"
                        />
                      ) : (
                        <h3 className={`text-base font-bold text-[#F1F5F9] truncate ${!isConfirmed ? 'line-through text-[#64748B]' : ''}`}>
                          {feat.name}
                        </h3>
                      )}
                    </div>

                    {/* Toggle Confirm / Exclude */}
                    <button
                      type="button"
                      onClick={() => handleToggleConfirmFeature(feat.id)}
                      className={`p-1.5 rounded-lg border transition shrink-0 ${
                        isConfirmed 
                          ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E] hover:bg-[#22C55E]/25' 
                          : 'bg-[#172238] border-[#26334D] text-[#64748B] hover:text-[#94A3B8]'
                      }`}
                      title={isConfirmed ? 'Click to exclude this feature from test generation' : 'Click to confirm this feature'}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editFeatureDesc}
                        onChange={(e) => setEditFeatureDesc(e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1 bg-[#0D1629] border border-[#26334D] rounded text-xs text-[#F1F5F9]"
                      />
                      <div className="flex items-center justify-between">
                        <select
                          value={editFeatureRisk}
                          onChange={(e) => setEditFeatureRisk(e.target.value as any)}
                          className="px-2 py-1 bg-[#0D1629] border border-[#26334D] rounded text-xs text-[#F1F5F9]"
                        >
                          <option value="critical">Critical Risk</option>
                          <option value="high">High Risk</option>
                          <option value="medium">Medium Risk</option>
                          <option value="low">Low Risk</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingFeatureId(null)}
                            className="px-2.5 py-1 text-xs text-[#64748B] hover:text-[#F1F5F9]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEditFeature}
                            className="px-3 py-1 bg-[#7C5CFC] text-white rounded text-xs font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      {feat.description}
                    </p>
                  )}

                  {/* Code Evidence and Source Traceability */}
                  <div className="space-y-1.5 pt-2 border-t border-[#26334D]/60 text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#94A3B8] truncate">
                      <FileText className="w-3.5 h-3.5 text-[#7C5CFC] shrink-0" />
                      <span className="font-mono truncate">{feat.sourceFilePaths.join(', ')}</span>
                    </div>

                    {feat.relevantRoutesOrEndpoints && feat.relevantRoutesOrEndpoints.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[#22D3EE] truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono truncate">{feat.relevantRoutesOrEndpoints.join(', ')}</span>
                      </div>
                    )}

                    <div className="text-[11px] text-[#64748B] bg-[#0D1629] p-2 rounded-lg border border-[#26334D]/60">
                      <strong className="text-[#94A3B8]">Evidence: </strong>
                      <span>{feat.evidence}</span>
                    </div>

                    {feat.riskRationale && (
                      <div className="text-[11px] text-[#FBBF24]/90 bg-[#FBBF24]/5 p-2 rounded-lg border border-[#FBBF24]/20">
                        <strong>Risk Rationale: </strong>
                        <span>{feat.riskRationale}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  {!isEditing && (
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditFeature(feat)}
                        className="text-[11px] text-[#94A3B8] hover:text-[#F1F5F9] flex items-center gap-1 font-medium"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Details</span>
                      </button>

                      <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                        isConfirmed ? 'text-[#22C55E]' : 'text-[#64748B]'
                      }`}>
                        {isConfirmed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmed</span>
                          </>
                        ) : (
                          <span>Excluded</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Custom Feature Modal */}
          {isAddingFeature && (
            <div className="fixed inset-0 z-50 bg-[#0B1020]/80 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#26334D]">
                  <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#7C5CFC]" />
                    Add Custom Application Feature
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingFeature(false)}
                    className="text-[#64748B] hover:text-[#F1F5F9]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Feature Name</label>
                    <input
                      type="text"
                      placeholder="e.g. User Profile Picture Upload"
                      value={newFeatName}
                      onChange={(e) => setNewFeatName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-xl text-xs text-[#F1F5F9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Description</label>
                    <textarea
                      placeholder="Explain what this feature does..."
                      value={newFeatDesc}
                      onChange={(e) => setNewFeatDesc(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-xl text-xs text-[#F1F5F9]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Source File Path</label>
                      <input
                        type="text"
                        placeholder="src/components/Profile.tsx"
                        value={newFeatPath}
                        onChange={(e) => setNewFeatPath(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-xl text-xs font-mono text-[#F1F5F9]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Risk Level</label>
                      <select
                        value={newFeatRisk}
                        onChange={(e) => setNewFeatRisk(e.target.value as any)}
                        className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-xl text-xs text-[#F1F5F9]"
                      >
                        <option value="critical">Critical Risk</option>
                        <option value="high">High Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="low">Low Risk</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingFeature(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCustomFeature}
                    className="px-4 py-2 bg-[#7C5CFC] hover:bg-[#9278FF] text-white text-xs font-bold rounded-xl"
                  >
                    Confirm &amp; Add Feature
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DISCOVERED ROUTES & SELECTORS */}
      {/* ======================================================== */}
      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left: Routes List */}
          <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#26334D]">
              <span className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#22D3EE]" />
                Discovered Routes ({analysis.routes.length})
              </span>
              <button
                type="button"
                onClick={() => setIsAddingRoute(true)}
                className="text-xs font-semibold text-[#7C5CFC] hover:text-[#9278FF] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Route
              </button>
            </div>

            <div className="space-y-2">
              {analysis.routes.map((route, idx) => (
                <div
                  key={route.path + idx}
                  onClick={() => setSelectedRouteIdx(idx)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    selectedRouteIdx === idx
                      ? 'bg-[#172238] border-[#7C5CFC] shadow-sm'
                      : 'bg-[#0D1629] border-[#26334D] hover:border-[#7C5CFC]/50 text-[#94A3B8]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#F1F5F9] truncate">{route.name}</div>
                    <div className="text-[11px] font-mono text-[#64748B] truncate">{route.path}</div>
                  </div>
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                    route.criticality === 'critical' ? 'bg-[#F87171]/15 text-[#F87171]' :
                    route.criticality === 'high' ? 'bg-[#FBBF24]/15 text-[#FBBF24]' :
                    'bg-[#22C55E]/15 text-[#22C55E]'
                  }`}>
                    {route.criticality}
                  </span>
                </div>
              ))}
            </div>

            {isAddingRoute && (
              <div className="p-3 rounded-xl bg-[#0D1629] border border-[#7C5CFC] space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Route Path (e.g. /checkout)"
                  value={newRoutePath}
                  onChange={(e) => setNewRoutePath(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#111A2E] border border-[#26334D] rounded-lg text-xs font-mono text-[#F1F5F9]"
                />
                <input
                  type="text"
                  placeholder="Route Name (e.g. Checkout Form)"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#111A2E] border border-[#26334D] rounded-lg text-xs text-[#F1F5F9]"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setIsAddingRoute(false)} className="px-2 py-1 text-xs text-[#64748B]">Cancel</button>
                  <button type="button" onClick={handleAddRoute} className="px-2.5 py-1 bg-[#7C5CFC] text-white rounded text-xs font-semibold">Add</button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Selected Route Details */}
          <div className="lg:col-span-2 bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 shadow-lg space-y-6">
            {currentRoute && (
              <>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded">
                      {currentRoute.path}
                    </span>
                    <h2 className="text-xl font-bold text-[#F1F5F9]">{currentRoute.name}</h2>
                    <p className="text-xs text-[#94A3B8]">{currentRoute.description}</p>
                  </div>
                  {analysis.routes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRoute(selectedRouteIdx)}
                      className="text-xs text-[#F87171] hover:text-[#f87171]/80 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Interactive Elements / Locators */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
                    Discovered DOM Selectors ({currentRoute.interactiveElements?.length || 0})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(currentRoute.interactiveElements || []).map((el, i) => (
                      <div key={el.selector + i} className="p-3 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#F1F5F9]">{el.label}</span>
                          <span className="text-[10px] font-mono text-[#7C5CFC] uppercase bg-[#7C5CFC]/10 px-1.5 py-0.2 rounded font-bold">
                            {el.type}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#22D3EE] truncate">
                          [{el.selector}]
                        </div>
                        <p className="text-[10px] text-[#64748B]">{el.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Potential Risks */}
                <div className="p-4 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-2">
                  <div className="text-xs font-bold text-[#FBBF24] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Potential Vulnerabilities &amp; Failure Modes</span>
                  </div>
                  <ul className="text-xs text-[#94A3B8] space-y-1 list-disc list-inside">
                    {(currentRoute.potentialRisks || []).map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: RISK BOUNDARIES & ENVIRONMENT */}
      {/* ======================================================== */}
      {activeTab === 'architecture' && (
        <div className="space-y-6 animate-fade-in">
          {/* Limitations Notice */}
          <div className="p-4 rounded-2xl bg-[#0D1629] border border-[#26334D] space-y-2">
            <div className="text-xs font-bold text-[#F1F5F9] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              <span>Static Analysis &amp; Environmental Limitations</span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Static analysis inspects component syntax, routes, form handlers, and data-testid locators. The following constraints apply:
            </p>
            <ul className="text-xs text-[#64748B] space-y-1 list-disc list-inside pt-1">
              {(analysis.limitations || [
                'External database transactions are simulated unless staging credentials are provided.',
                'Cross-domain network latency modeled based on standard web application timeouts.',
                'Isolated browser context prevents state leakage between test iterations.'
              ]).map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </div>

          {/* Boundary Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
                Boundary Scenarios Under Test
              </h3>
              <ul className="space-y-2">
                {(analysis.boundaryScenarios || []).map((scenario, i) => (
                  <li key={i} className="p-2.5 rounded-lg bg-[#0D1629] border border-[#26334D] text-xs text-[#94A3B8] flex items-start gap-2">
                    <span className="text-[#FBBF24] font-bold">•</span>
                    <span>{scenario}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#7C5CFC]" />
                Synthesized Test Suites Plan
              </h3>
              <div className="space-y-2">
                {(analysis.recommendedTestSuites || []).map((suite, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#0D1629] border border-[#26334D] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-[#F1F5F9]">{suite.name}</div>
                      <div className="text-[11px] text-[#64748B]">{suite.description}</div>
                    </div>
                    <span className="font-mono text-[#22D3EE] font-bold shrink-0">
                      ~{suite.estimatedCases} Tests
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
