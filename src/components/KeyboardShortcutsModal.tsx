import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1', action: 'Jump to Phase 1: Onboarding & Target Input' },
    { key: '2', action: 'Jump to Phase 2: App Analysis & Routes' },
    { key: '3', action: 'Jump to Phase 3: Test Designer & Step Editor' },
    { key: '4', action: 'Jump to Phase 4: Review Gate & Signoff' },
    { key: '5', action: 'Jump to Phase 5: Playwright Execution & Trace' },
    { key: '6', action: 'Jump to Phase 6: Executive QA Reports & Exports' },
    { key: 'R', action: 'Trigger Playwright Test Suite Run' },
    { key: 'P', action: 'Open Complete Application PDF Modal' },
    { key: 'A', action: 'Open AI Requirements & Story Analyzer' },
    { key: '?', action: 'Toggle this Keyboard Shortcuts cheat sheet' },
    { key: 'Esc', action: 'Close any active modal or overlay' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-slate-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Keyboard Navigation</h3>
              <p className="text-[11px] text-slate-400">Quick shortcuts to navigate AutoQA Studio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-850/50 transition text-xs"
            >
              <span className="text-slate-300">{sc.action}</span>
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700/80 rounded font-mono text-[11px] text-indigo-300 font-semibold shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Esc</kbd> anytime to dismiss
          </p>
        </div>
      </div>
    </div>
  );
};
