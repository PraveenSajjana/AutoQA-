import React from 'react';
import { Project, ApplicationAnalysis, TestCase, TestRun, DefectTriage } from '../../types/qa';
import { NewProjectScreen } from './NewProjectScreen';
import { ApplicationAnalysisScreen } from './ApplicationAnalysisScreen';
import { TestCaseReviewScreen } from './TestCaseReviewScreen';
import { TestExecutionEvidenceScreen } from './TestExecutionEvidenceScreen';
import { 
  FolderGit2, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight, 
  Globe, 
  Layers, 
  CheckSquare, 
  PlayCircle, 
  ShieldCheck,
  Plus,
  RotateCw
} from 'lucide-react';

export type WorkflowStepId = 'new_project' | 'analysis' | 'test_cases' | 'execution';

interface WorkflowShellProps {
  currentStep: WorkflowStepId;
  onSelectStep: (step: WorkflowStepId) => void;
  currentProject: Project;
  allProjects: Project[];
  onSelectProject: (p: Project) => void;
  onNewProject: () => void;
  analysis: ApplicationAnalysis | null;
  onUpdateAnalysis: (analysis: ApplicationAnalysis) => void;
  testCases: TestCase[];
  onUpdateTestCases: (cases: TestCase[]) => void;
  currentRun: TestRun | null;
  isRunningSuite: boolean;
  onStartAnalysis: (projectData: Partial<Project>) => Promise<void> | void;
  isAnalyzing: boolean;
  onProceedToDesign: () => Promise<void> | void;
  isGeneratingTests: boolean;
  onRunSuite: (defectMode?: 'none' | 'product_bug' | 'flaky_selector' | 'network_timeout') => Promise<void> | void;
  onLoadSample: (sampleId: string) => void;
  onOpenPdfModal?: () => void;
}

export const WorkflowShell: React.FC<WorkflowShellProps> = ({
  currentStep,
  onSelectStep,
  currentProject,
  allProjects,
  onSelectProject,
  onNewProject,
  analysis,
  onUpdateAnalysis,
  testCases,
  onUpdateTestCases,
  currentRun,
  isRunningSuite,
  onStartAnalysis,
  isAnalyzing,
  onProceedToDesign,
  isGeneratingTests,
  onRunSuite,
  onLoadSample,
  onOpenPdfModal,
}) => {
  const steps: { id: WorkflowStepId; number: number; label: string; description: string; icon: any }[] = [
    { id: 'new_project', number: 1, label: 'New Project', description: 'Target URL & Config', icon: Globe },
    { id: 'analysis', number: 2, label: 'Application Analysis', description: 'Routes & Boundaries', icon: Layers },
    { id: 'test_cases', number: 3, label: 'Test Case Review', description: 'Approval & Signoff', icon: CheckSquare },
    { id: 'execution', number: 4, label: 'Test Execution', description: 'Traces & Evidence', icon: PlayCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  // Can navigate forward checks
  const canGoToAnalysis = !!analysis || currentStepIndex >= 1;
  const canGoToTestCases = testCases.length > 0 || currentStepIndex >= 2;
  const canGoToExecution = (testCases.some((tc) => tc.status === 'approved') || currentRun !== null) || currentStepIndex >= 3;

  const isStepAccessible = (stepId: WorkflowStepId) => {
    if (stepId === 'new_project') return true;
    if (stepId === 'analysis') return canGoToAnalysis;
    if (stepId === 'test_cases') return canGoToTestCases;
    if (stepId === 'execution') return canGoToExecution;
    return false;
  };

  const handleStepClick = (stepId: WorkflowStepId) => {
    if (isStepAccessible(stepId)) {
      onSelectStep(stepId);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* 4-Step Interactive Stepper Bar */}
      <div className="bg-[#0E1528] border-b border-[#26334D] px-4 sm:px-6 py-3 select-none sticky top-14 z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Stepper items */}
          <nav aria-label="Workflow progress" className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {steps.map((step, idx) => {
              const isCurrent = step.id === currentStep;
              const isPast = steps.findIndex((s) => s.id === currentStep) > idx;
              const accessible = isStepAccessible(step.id);
              const StepIcon = step.icon;

              return (
                <React.Fragment key={step.id}>
                  {idx > 0 && (
                    <ChevronRight className="w-3.5 h-3.5 text-[#26334D] shrink-0 hidden sm:inline" />
                  )}

                  <button
                    type="button"
                    onClick={() => handleStepClick(step.id)}
                    disabled={!accessible}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition shrink-0 ${
                      isCurrent
                        ? 'bg-[#172238] border-[#7C5CFC] text-[#F1F5F9] shadow-sm'
                        : isPast
                        ? 'bg-[#111A2E] border-[#26334D] text-[#22C55E] hover:border-[#22C55E]/40'
                        : accessible
                        ? 'bg-[#0D1629] border-[#26334D] text-[#94A3B8] hover:text-[#F1F5F9]'
                        : 'opacity-40 cursor-not-allowed border-transparent text-[#64748B]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent ? 'bg-[#7C5CFC] text-white' :
                      isPast ? 'bg-[#22C55E]/20 text-[#22C55E]' :
                      'bg-[#172238] text-[#94A3B8]'
                    }`}>
                      {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.number}
                    </div>

                    <div className="text-left hidden lg:block leading-tight">
                      <div className="font-semibold">{step.label}</div>
                      <div className="text-[10px] text-[#64748B]">{step.description}</div>
                    </div>

                    <span className="lg:hidden font-medium">{step.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Quick Context & Switcher */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[#64748B] hidden sm:inline">Project:</span>
              <span className="font-semibold text-[#F1F5F9] font-mono truncate max-w-[160px]">
                {currentProject.name}
              </span>
            </div>

            <button
              type="button"
              onClick={onNewProject}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111A2E] hover:bg-[#172238] border border-[#26334D] text-[#7C5CFC] hover:text-[#9278FF] transition text-xs font-medium shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Target</span>
            </button>
          </div>
        </div>
      </div>

      {/* Screen Render Container */}
      <div className="flex-1">
        {currentStep === 'new_project' && (
          <NewProjectScreen
            onStartAnalysis={onStartAnalysis}
            isLoading={isAnalyzing}
            onLoadSample={onLoadSample}
          />
        )}

        {currentStep === 'analysis' && analysis && (
          <ApplicationAnalysisScreen
            analysis={analysis}
            project={currentProject}
            onProceedToDesign={onProceedToDesign}
            onReanalyze={() => onStartAnalysis(currentProject)}
            isGeneratingTests={isGeneratingTests}
            onUpdateAnalysis={onUpdateAnalysis}
          />
        )}

        {currentStep === 'test_cases' && (
          <TestCaseReviewScreen
            testCases={testCases}
            onUpdateTestCases={onUpdateTestCases}
            onProceedToExecution={() => onSelectStep('execution')}
            projectName={currentProject.name}
          />
        )}

        {currentStep === 'execution' && (
          <TestExecutionEvidenceScreen
            testCases={testCases}
            currentRun={currentRun}
            onRunSuite={onRunSuite}
            isRunning={isRunningSuite}
            project={currentProject}
            analysis={analysis}
            onOpenPdfModal={onOpenPdfModal}
            onNavigateToReview={() => onSelectStep('test_cases')}
          />
        )}
      </div>

      {/* Bottom Step Nav Footer & Local Persistence Notice */}
      <div className="bg-[#0E1528] border-t border-[#26334D] p-4 text-xs select-none">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Browser-local persistence active &bull; Edits and test reviews are saved in your browser storage</span>
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={() => onSelectStep(steps[currentStepIndex - 1].id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111A2E] hover:bg-[#172238] border border-[#26334D] text-[#F1F5F9] font-medium transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {currentStepIndex < steps.length - 1 && isStepAccessible(steps[currentStepIndex + 1].id) && (
              <button
                type="button"
                onClick={() => onSelectStep(steps[currentStepIndex + 1].id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C5CFC] hover:bg-[#9278FF] text-white font-semibold transition"
              >
                <span>Next: {steps[currentStepIndex + 1].label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
