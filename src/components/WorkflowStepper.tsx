import React from 'react';
import { 
  FolderPlus, 
  MapPin, 
  FileCode2, 
  ShieldCheck, 
  PlayCircle, 
  BarChart3, 
  Check 
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
  const steps = [
    { id: 1, num: '01', label: 'Onboarding', subtitle: 'Target Ingestion', icon: FolderPlus, shortcut: '1' },
    { id: 2, num: '02', label: 'App Analysis', subtitle: 'Route Discovery', icon: MapPin, shortcut: '2' },
    { id: 3, num: '03', label: 'Test Designer', subtitle: 'Deterministic Cases', icon: FileCode2, shortcut: '3' },
    { id: 4, num: '04', label: 'Review Gate', subtitle: 'QA Signoff', icon: ShieldCheck, shortcut: '4' },
    { id: 5, num: '05', label: 'Execution', subtitle: 'Playwright & Trace', icon: PlayCircle, shortcut: '5' },
    { id: 6, num: '06', label: 'Signoff & Export', subtitle: 'ISO Reports & PDF', icon: BarChart3, shortcut: '6' },
  ];

  return (
    <nav aria-label="QA Pipeline Phases" className="w-full bg-slate-950 border-b border-slate-800/80 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2 no-scrollbar py-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStage === step.id;
          const isDone = completedStages.includes(step.id);

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => onSelectStage(step.id)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-left whitespace-nowrap group focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isActive
                    ? 'bg-slate-900 border border-indigo-500/40 text-white shadow-sm'
                    : isDone
                    ? 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
                title={`Phase ${step.id}: ${step.label} [Press ${step.shortcut}]`}
              >
                {/* Step Index / Checkmark */}
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-[11px] font-bold transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-850 text-slate-400 group-hover:text-slate-300 border border-slate-800'
                  }`}
                >
                  {isDone && !isActive ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <span>{step.num}</span>
                  )}
                </div>

                {/* Label & Subtitle */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${isActive ? 'text-indigo-300' : 'text-slate-200'}`}>
                      {step.label}
                    </span>
                    <span className="hidden xl:inline text-[9px] font-mono text-slate-400 opacity-60 group-hover:opacity-100 transition">
                      [{step.shortcut}]
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono tracking-tight">
                    {step.subtitle}
                  </div>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block w-4 h-[1px] bg-slate-800/80 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
