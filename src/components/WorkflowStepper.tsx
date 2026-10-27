import React from 'react';
import { 
  FolderPlus, 
  MapPin, 
  FileCode2, 
  PlayCircle, 
  BarChart3, 
  Check,
  ArrowRight
} from 'lucide-react';

interface WorkflowStepperProps {
  currentStage: number; // 1 to 6
  onSelectStage: (stage: number) => void;
  completedStages: number[];
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStage,
  onSelectStage,
  completedStages,
}) => {
  // Systematic 5-Step Pipeline mapping:
  // Step 1: Onboarding (Stage 1)
  // Step 2: App Analysis (Stage 2)
  // Step 3: Test Plan & Review (Stage 3 & 4)
  // Step 4: Playwright Execution (Stage 5)
  // Step 5: QA Signoff & Export (Stage 6)
  const steps = [
    { 
      id: 1, 
      targetStage: 1, 
      num: '1', 
      label: 'Add Product', 
      subtitle: 'Paste code, ZIP or URL', 
      icon: FolderPlus, 
      shortcut: '1' 
    },
    { 
      id: 2, 
      targetStage: 2, 
      num: '2', 
      label: 'App Map', 
      subtitle: 'Routes & components', 
      icon: MapPin, 
      shortcut: '2' 
    },
    { 
      id: 3, 
      targetStage: 3, 
      num: '3', 
      label: 'Test Plan', 
      subtitle: 'Review & approve tests', 
      icon: FileCode2, 
      shortcut: '3' 
    },
    { 
      id: 4, 
      targetStage: 5, 
      num: '4', 
      label: 'Run Tests', 
      subtitle: 'Live Playwright execution', 
      icon: PlayCircle, 
      shortcut: '4' 
    },
    { 
      id: 5, 
      targetStage: 6, 
      num: '5', 
      label: 'Results & Signoff', 
      subtitle: 'Metrics & PDF export', 
      icon: BarChart3, 
      shortcut: '5' 
    },
  ];

  const getIsActive = (step: typeof steps[0]) => {
    if (step.id === 1) return currentStage === 1;
    if (step.id === 2) return currentStage === 2;
    if (step.id === 3) return currentStage === 3 || currentStage === 4;
    if (step.id === 4) return currentStage === 5;
    if (step.id === 5) return currentStage === 6;
    return false;
  };

  const getIsCompleted = (step: typeof steps[0]) => {
    if (step.id === 1) return completedStages.includes(1);
    if (step.id === 2) return completedStages.includes(2);
    if (step.id === 3) return completedStages.includes(3);
    if (step.id === 4) return completedStages.includes(5);
    if (step.id === 5) return completedStages.includes(6);
    return false;
  };

  return (
    <nav aria-label="Systematic QA Workflow Stepper" className="w-full bg-slate-950 border-b border-slate-800/80 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2 no-scrollbar py-2.5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = getIsActive(step);
          const isDone = getIsCompleted(step);

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onSelectStage(step.targetStage)}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all text-left whitespace-nowrap group focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isActive
                    ? 'bg-slate-900 border border-indigo-500/50 text-white shadow-sm ring-1 ring-indigo-500/20'
                    : isDone
                    ? 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
                title={`Step ${step.num}: ${step.label} (${step.subtitle})`}
              >
                {/* Step Number / Check Icon */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-colors shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-850 text-slate-400 group-hover:text-slate-300 border border-slate-800'
                  }`}
                >
                  {isDone && !isActive ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{step.num}</span>
                  )}
                </div>

                {/* Label & Descriptive Subtitle */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${isActive ? 'text-indigo-300' : 'text-slate-200'}`}>
                      {step.label}
                    </span>
                    <span className="hidden xl:inline text-[9px] font-mono text-slate-500 opacity-70 group-hover:opacity-100 transition">
                      [{step.shortcut}]
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal">
                    {step.subtitle}
                  </div>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex items-center text-slate-700 mx-1">
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
