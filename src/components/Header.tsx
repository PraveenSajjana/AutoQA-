import React from 'react';
import { Project } from '../types/qa';
import { 
  Terminal, 
  Play, 
  Plus, 
  FileText, 
  Sparkles,
  HelpCircle,
  Trash2,
  ChevronDown,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  currentProject: Project;
  allProjects: Project[];
  onSelectProject: (p: Project) => void;
  onNewProject: () => void;
  activeStage: number;
  isRunningSuite: boolean;
  onRunFullPipeline: () => void;
  onOpenRequirementsAnalyzer?: () => void;
  onOpenCompletePdf?: () => void;
  onOpenShortcuts?: () => void;
  onOpenHowItWorks?: () => void;
  testCount?: number;
  onDeleteCurrentProject?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  allProjects,
  onSelectProject,
  onNewProject,
  activeStage,
  isRunningSuite,
  onRunFullPipeline,
  onOpenRequirementsAnalyzer,
  onOpenCompletePdf,
  onOpenShortcuts,
  onOpenHowItWorks,
  testCount = 0,
  onDeleteCurrentProject,
}) => {
  return (
    <header className="border-b border-slate-800/90 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Zone 1: Wordmark & Target Project Context */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white font-mono">
                Auto<span className="text-indigo-400">QA</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider">
                STUDIO
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0" />

          {/* Project Switcher with Unboxed Metadata */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex items-center">
              <select
                aria-label="Active Test Target Project"
                value={currentProject.id}
                onChange={(e) => {
                  const p = allProjects.find((x) => x.id === e.target.value);
                  if (p) onSelectProject(p);
                }}
                className="appearance-none bg-slate-850 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-medium rounded-lg pl-3 pr-7 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer transition max-w-[200px] truncate"
              >
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.zipFileName ? '(ZIP)' : p.pastedFiles?.length ? '(Code)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Delete button for user-added / uploaded projects */}
            {!currentProject.sampleAppId && onDeleteCurrentProject && (
              <button
                type="button"
                onClick={onDeleteCurrentProject}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                title={`Delete ${currentProject.name} from local storage`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onNewProject}
              id="add-your-product-btn"
              aria-label="Add Your Product"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm shadow-indigo-600/30 transition shrink-0"
              title="Add Your Product (Paste Code, Upload ZIP, Git, URL)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-sans">Add Your Product</span>
            </button>

            {/* Unboxed Metadata (Anti-slop zero pill rule) */}
            <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 font-mono ml-1">
              <span>·</span>
              <span className="text-slate-300 font-medium">{testCount > 0 ? `${testCount} Tests Ready` : 'Suite Ready'}</span>
              <span>·</span>
              <span className="text-emerald-400 font-medium">Safe Sandbox</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Systematic Step Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-500">Step:</span>
          <span className="text-indigo-300 font-semibold">
            {activeStage === 1 && '1 of 5: Ingest Product'}
            {activeStage === 2 && '2 of 5: App Feature Map'}
            {(activeStage === 3 || activeStage === 4) && '3 of 5: Test Plan & Review'}
            {activeStage === 5 && '4 of 5: Safe Execution'}
            {activeStage === 6 && '5 of 5: Results & Signoff'}
          </span>
        </div>

        {/* Zone 3: Quick Action Tools & Primary CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenHowItWorks && (
            <button
              onClick={onOpenHowItWorks}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 text-xs font-medium rounded-lg border border-indigo-500/30 transition"
              title="Learn how AutoQA works systematically"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">How It Works</span>
            </button>
          )}

          {onOpenRequirementsAnalyzer && (
            <button
              onClick={onOpenRequirementsAnalyzer}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 text-xs font-medium rounded-lg border border-indigo-500/20 hover:border-indigo-500/40 transition"
              title="AI Requirements & User Stories Analyzer [Press A]"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Stories</span>
            </button>
          )}

          {onOpenCompletePdf && (
            <button
              onClick={onOpenCompletePdf}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-medium rounded-lg border border-slate-700/80 hover:border-slate-600 transition"
              title="Generate & View Complete Application QA PDF [Press P]"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Complete PDF</span>
            </button>
          )}

          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              aria-label="View keyboard shortcuts"
              className="p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700/80 transition hidden sm:inline-flex"
              title="Keyboard Shortcuts [?]"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Primary Action Button */}
          <button
            onClick={onRunFullPipeline}
            disabled={isRunningSuite}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            title="Execute End-to-End Test Suite [Press R]"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunningSuite ? 'animate-spin' : ''}`} />
            <span>{isRunningSuite ? 'Executing...' : 'Run Pipeline'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
