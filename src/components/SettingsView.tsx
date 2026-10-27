import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Trash2, 
  ShieldCheck, 
  Sliders, 
  Monitor, 
  Check,
  AlertTriangle
} from 'lucide-react';

interface SettingsViewProps {
  onResetAllData: () => void;
  onAddToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetAllData, onAddToast }) => {
  const [browserEngine, setBrowserEngine] = useState<'chromium' | 'firefox' | 'webkit'>('chromium');
  const [actionTimeoutMs, setActionTimeoutMs] = useState<number>(5000);
  const [assertionTimeoutMs, setAssertionTimeoutMs] = useState<number>(8000);
  const [captureScreenshots, setCaptureScreenshots] = useState<boolean>(true);
  const [captureNetwork, setCaptureNetwork] = useState<boolean>(true);
  const [viewportPreset, setViewportPreset] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);

  const handleSaveSettings = () => {
    localStorage.setItem('qa_agent_settings', JSON.stringify({
      browserEngine,
      actionTimeoutMs,
      assertionTimeoutMs,
      captureScreenshots,
      captureNetwork,
      viewportPreset,
    }));
    onAddToast('success', 'Settings Saved', 'Playwright execution parameters updated.');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26334D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
              Platform &amp; Runner Settings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Configure Playwright execution timeouts, browser targets, capture options, and sandbox storage.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-4 py-2 bg-[#7C5CFC] hover:bg-[#9278FF] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#7C5CFC]/20 transition shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Execution Engine Card */}
      <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 space-y-5">
        <div className="font-semibold text-sm text-[#F1F5F9] border-b border-[#26334D] pb-3 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-[#7C5CFC]" />
          <span>Playwright Browser Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'chromium', label: 'Chromium (Default)', desc: 'Fastest headless execution with complete CDP trace support' },
            { id: 'firefox', label: 'Firefox Gecko', desc: 'Cross-browser layout and CSS flex/grid compatibility validation' },
            { id: 'webkit', label: 'WebKit (Safari)', desc: 'Mobile Safari emulation and WebKit rendering compliance' },
          ].map((b) => (
            <div
              key={b.id}
              onClick={() => setBrowserEngine(b.id as any)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                browserEngine === b.id
                  ? 'bg-[#172238] border-[#7C5CFC] ring-1 ring-[#7C5CFC]'
                  : 'bg-[#0D1629] border-[#26334D] hover:border-[#7C5CFC]/40'
              }`}
            >
              <div className="font-semibold text-xs text-[#F1F5F9] mb-1">{b.label}</div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Timeouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">Action Timeout (ms)</label>
            <input
              type="number"
              value={actionTimeoutMs}
              onChange={(e) => setActionTimeoutMs(Number(e.target.value))}
              aria-label="Action Timeout in milliseconds"
              className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-xs font-mono text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
            />
            <span className="text-[11px] text-[#64748B]">Maximum wait time for element click/fill actionability</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">Assertion Timeout (ms)</label>
            <input
              type="number"
              value={assertionTimeoutMs}
              onChange={(e) => setAssertionTimeoutMs(Number(e.target.value))}
              aria-label="Assertion Timeout in milliseconds"
              className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-xs font-mono text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
            />
            <span className="text-[11px] text-[#64748B]">Maximum polling duration for expect() conditions</span>
          </div>
        </div>

        {/* Trace Captures */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-medium text-[#94A3B8]">Trace &amp; Evidence Collection</div>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 text-xs text-[#F1F5F9] cursor-pointer">
              <input
                type="checkbox"
                checked={captureScreenshots}
                onChange={(e) => setCaptureScreenshots(e.target.checked)}
                className="rounded border-[#26334D] text-[#7C5CFC] focus:ring-[#7C5CFC]"
              />
              <span>Capture Step Screenshots on Failure</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#F1F5F9] cursor-pointer">
              <input
                type="checkbox"
                checked={captureNetwork}
                onChange={(e) => setCaptureNetwork(e.target.checked)}
                className="rounded border-[#26334D] text-[#7C5CFC] focus:ring-[#7C5CFC]"
              />
              <span>Record HTTP Network Requests &amp; Responses</span>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone / Reset */}
      <div className="bg-[#111A2E] border border-[#F87171]/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#F87171]">
          <AlertTriangle className="w-4 h-4" />
          <span>Local Storage &amp; Session Reset</span>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Reset all cached projects, test cases, execution runs, and defect triages back to fresh initial seed demo data.
        </p>

        {!confirmResetOpen ? (
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F87171]/15 hover:bg-[#F87171]/25 text-[#F87171] border border-[#F87171]/30 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Demo Storage</span>
          </button>
        ) : (
          <div className="p-3 bg-[#0D1629] border border-[#F87171]/50 rounded-xl space-y-2">
            <p className="text-xs text-[#F87171]">Are you sure? This will wipe locally modified test cases and reload defaults.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetAllData();
                  setConfirmResetOpen(false);
                  onAddToast('info', 'Storage Reset', 'Demo projects and test cases restored.');
                }}
                className="px-3 py-1 bg-[#F87171] hover:bg-[#EF4444] text-white font-bold text-xs rounded transition"
              >
                Yes, Reset All
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-3 py-1 bg-[#172238] text-[#94A3B8] hover:text-[#F1F5F9] text-xs rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
