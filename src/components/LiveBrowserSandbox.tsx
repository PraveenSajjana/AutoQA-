import React, { useState } from 'react';
import { 
  Globe, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  Terminal,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Copy,
  Check
} from 'lucide-react';

interface LiveBrowserSandboxProps {
  sampleAppId?: string;
  targetUrl?: string;
  isExecuting?: boolean;
  highlightSelector?: string;
}

export const LiveBrowserSandbox: React.FC<LiveBrowserSandboxProps> = ({
  targetUrl = 'http://localhost:3000',
  isExecuting = false,
  highlightSelector,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(targetUrl);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'viewport' | 'console' | 'dom_tree'>('viewport');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'max-w-[390px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="rounded-2xl border border-[#26334D] bg-[#0E1528] overflow-hidden shadow-2xl transition-all">
      {/* Browser Chrome Header */}
      <div className="bg-[#111A2E] px-4 py-3 border-b border-[#26334D] flex flex-wrap items-center justify-between gap-3">
        {/* Window controls and navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#F87171]/80 hover:bg-[#F87171] transition" />
            <div className="w-3 h-3 rounded-full bg-[#FBBF24]/80 hover:bg-[#FBBF24] transition" />
            <div className="w-3 h-3 rounded-full bg-[#22C55E]/80 hover:bg-[#22C55E] transition" />
          </div>

          <div className="h-4 w-px bg-[#26334D] mx-1" />

          <div className="flex items-center gap-1 text-[#94A3B8]">
            <button
              type="button"
              className="p-1 rounded hover:bg-[#172238] hover:text-[#F1F5F9] transition disabled:opacity-40"
              disabled
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-[#172238] hover:text-[#F1F5F9] transition disabled:opacity-40"
              disabled
              title="Forward"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className={`p-1 rounded hover:bg-[#172238] hover:text-[#F1F5F9] transition ${
                isRefreshing ? 'animate-spin text-[#22D3EE]' : ''
              }`}
              title="Reload target page"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-xl mx-2 min-w-[200px]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D1629] border border-[#26334D] text-xs font-mono text-[#F1F5F9]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
            <input
              type="text"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              className="w-full bg-transparent outline-none text-[#F1F5F9] text-xs font-mono"
              placeholder="https://your-app.example.com"
            />
            <button
              type="button"
              onClick={handleCopyUrl}
              className="text-[#64748B] hover:text-[#94A3B8] transition shrink-0"
              title="Copy URL"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Device Mode & Engine Status */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center rounded-lg bg-[#0D1629] p-0.5 border border-[#26334D] text-[11px] font-medium text-[#94A3B8]">
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              className={`px-2 py-0.5 rounded transition ${
                viewportMode === 'desktop' ? 'bg-[#7C5CFC] text-white' : 'hover:text-[#F1F5F9]'
              }`}
            >
              1280×800
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('tablet')}
              className={`px-2 py-0.5 rounded transition ${
                viewportMode === 'tablet' ? 'bg-[#7C5CFC] text-white' : 'hover:text-[#F1F5F9]'
              }`}
            >
              768×1024
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              className={`px-2 py-0.5 rounded transition ${
                viewportMode === 'mobile' ? 'bg-[#7C5CFC] text-white' : 'hover:text-[#F1F5F9]'
              }`}
            >
              390×844
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0D1629] border border-[#26334D]">
            <span
              className={`w-2 h-2 rounded-full ${
                isExecuting ? 'bg-[#22D3EE] animate-ping' : 'bg-[#22C55E]'
              }`}
            />
            <span className="text-[11px] font-mono text-[#94A3B8]">
              {isExecuting ? 'Step Executing' : 'Chromium Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Active Playwright Locator Banner */}
      {highlightSelector && (
        <div className="bg-[#7C5CFC]/15 border-b border-[#7C5CFC]/30 px-4 py-2 flex items-center justify-between text-xs animate-pulse">
          <div className="flex items-center gap-2 font-mono text-[#22D3EE]">
            <span className="text-[#94A3B8] font-sans font-semibold">Active Locator:</span>
            <code className="bg-[#111A2E] px-2 py-0.5 rounded border border-[#7C5CFC]/40 text-[#22D3EE]">
              page.locator('{highlightSelector}')
            </code>
          </div>
          <span className="text-[11px] text-[#9278FF] font-medium">
            Waiting for actionability check (visible, enabled, stable)...
          </span>
        </div>
      )}

      {/* Viewport Workspace */}
      <div className="p-4 sm:p-6 bg-[#0B1020] flex justify-center min-h-[460px] overflow-auto">
        <div className={`${getViewportWidth()} transition-all duration-300`}>
          <div className="rounded-xl border border-[#26334D] bg-[#111A2E] p-6 space-y-6 shadow-inner">
            {/* Viewport Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#26334D]">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#7C5CFC]" />
                <div>
                  <div className="text-sm font-semibold text-[#F1F5F9]">
                    Target Application Viewport
                  </div>
                  <div className="text-xs text-[#94A3B8] font-mono">
                    {currentUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
                  Playwright Sandbox
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#172238] text-[#94A3B8] border border-[#26334D]">
                  DPR: 1.0
                </span>
              </div>
            </div>

            {/* Live Interactive DOM Inspection Canvas */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#7C5CFC]" />
                    Target Surface Structure
                  </span>
                  <span className="font-mono text-[#22C55E]">200 OK — Ready</span>
                </div>

                {/* Interactive Simulated DOM Nodes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div 
                    className={`p-3 rounded-lg border transition ${
                      highlightSelector && highlightSelector.includes('nav') 
                        ? 'border-[#22D3EE] bg-[#22D3EE]/10 ring-2 ring-[#22D3EE]/40' 
                        : 'border-[#26334D] bg-[#111A2E]'
                    }`}
                  >
                    <div className="text-[11px] font-mono text-[#94A3B8] mb-1">
                      &lt;nav data-testid="app-navigation"&gt;
                    </div>
                    <div className="text-xs font-medium text-[#F1F5F9]">Navigation Bar & Routes</div>
                    <div className="text-[10px] text-[#64748B] mt-1 font-mono">selector: [data-testid="app-navigation"]</div>
                  </div>

                  <div 
                    className={`p-3 rounded-lg border transition ${
                      highlightSelector && (highlightSelector.includes('main') || highlightSelector.includes('container') || highlightSelector.includes('root'))
                        ? 'border-[#22D3EE] bg-[#22D3EE]/10 ring-2 ring-[#22D3EE]/40' 
                        : 'border-[#26334D] bg-[#111A2E]'
                    }`}
                  >
                    <div className="text-[11px] font-mono text-[#94A3B8] mb-1">
                      &lt;main data-testid="app-main-content"&gt;
                    </div>
                    <div className="text-xs font-medium text-[#F1F5F9]">Primary View & Components</div>
                    <div className="text-[10px] text-[#64748B] mt-1 font-mono">selector: [data-testid="app-main-content"]</div>
                  </div>

                  <div 
                    className={`p-3 rounded-lg border transition ${
                      highlightSelector && (highlightSelector.includes('input') || highlightSelector.includes('form') || highlightSelector.includes('search'))
                        ? 'border-[#22D3EE] bg-[#22D3EE]/10 ring-2 ring-[#22D3EE]/40' 
                        : 'border-[#26334D] bg-[#111A2E]'
                    }`}
                  >
                    <div className="text-[11px] font-mono text-[#94A3B8] mb-1">
                      &lt;input data-testid="search-input"&gt;
                    </div>
                    <div className="text-xs font-medium text-[#F1F5F9]">Interactive Form & Query Inputs</div>
                    <div className="text-[10px] text-[#64748B] mt-1 font-mono">selector: [data-testid="search-input"]</div>
                  </div>

                  <div 
                    className={`p-3 rounded-lg border transition ${
                      highlightSelector && (highlightSelector.includes('btn') || highlightSelector.includes('button') || highlightSelector.includes('submit'))
                        ? 'border-[#22D3EE] bg-[#22D3EE]/10 ring-2 ring-[#22D3EE]/40' 
                        : 'border-[#26334D] bg-[#111A2E]'
                    }`}
                  >
                    <div className="text-[11px] font-mono text-[#94A3B8] mb-1">
                      &lt;button data-testid="action-submit-btn"&gt;
                    </div>
                    <div className="text-xs font-medium text-[#F1F5F9]">Action Triggers & Dispatchers</div>
                    <div className="text-[10px] text-[#64748B] mt-1 font-mono">selector: [data-testid="action-submit-btn"]</div>
                  </div>
                </div>
              </div>

              {/* Execution Console Mini-Stream */}
              <div className="p-3.5 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="font-mono text-[11px] flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-[#22D3EE]" />
                    Playwright Console Log Stream
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">WebSocket: Connected</span>
                </div>
                <div className="font-mono text-[11px] text-[#94A3B8] space-y-1 bg-[#111A2E] p-2.5 rounded border border-[#26334D]">
                  <div className="text-[#22D3EE]">[Playwright] Connected to headless Chromium process (pid: sandboxed)</div>
                  <div className="text-[#94A3B8]">[Navigator] Loaded URL: {currentUrl}</div>
                  {highlightSelector ? (
                    <div className="text-[#7C5CFC] font-semibold">
                      [Action] Dispatching action on locator: {highlightSelector}
                    </div>
                  ) : (
                    <div className="text-[#64748B]">[Status] Viewport waiting for test suite execution triggers...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
