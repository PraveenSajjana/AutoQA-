import React from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  MapPin, 
  FileCheck2, 
  PlayCircle, 
  BarChart3, 
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryDemo: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onTryDemo,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '1',
      title: 'Add Your Product Code or URL',
      desc: 'Paste your frontend source code (.tsx, .jsx, .py), drag & drop a ZIP archive of your codebase, or provide a live website URL. No terminal commands or complex config required.',
      icon: Code2,
      badge: 'Zero Configuration',
    },
    {
      num: '2',
      title: 'Automatic Feature & Route Discovery',
      desc: 'AutoQA inspects your components, routes, interactive buttons, inputs, and tech stack (React, Next.js, FastAPI, Express). It maps every testable user journey.',
      icon: MapPin,
      badge: 'Full App Model',
    },
    {
      num: '3',
      title: 'Review Generated Test Scenarios',
      desc: 'Review deterministic Playwright test cases covering Happy Paths, Form Validation errors, and Edge Boundaries. Edit steps, add assertions, or approve with 1 click.',
      icon: FileCheck2,
      badge: 'Human QA Gate',
    },
    {
      num: '4',
      title: 'Safe Isolated Test Execution',
      desc: 'Tests run in an isolated browser sandbox with real-time Playwright execution traces, DOM snapshots, and step-by-step logs. Never runs untrusted server code.',
      icon: PlayCircle,
      badge: 'Safe Sandbox',
    },
    {
      num: '5',
      title: 'Audit Results & Executive Signoff',
      desc: 'Review pass/fail rates, failure root-cause analysis, and download ISO-29148 compliant QA specifications in PDF, JSON, or Markdown with 1 click.',
      icon: BarChart3,
      badge: 'Instant Export',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                How AutoQA Works
              </h2>
              <p className="text-xs text-slate-400">
                A systematic, 5-phase autonomous quality engineering pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div 
                  key={s.num} 
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    {s.num}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-white flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{s.title}</span>
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        {s.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Privacy & Safety Guarantee */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-emerald-300 block">Security &amp; Privacy Guarantee:</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Source code uploaded or pasted is analyzed strictly for UI component structure and routes in your isolated session. AutoQA translates actions into deterministic Playwright test commands without executing untrusted code on your host machine.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            Keyboard navigation: Press [1-5] to jump phases, [R] to run suite
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                onClose();
                onTryDemo();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Instant Demo App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
