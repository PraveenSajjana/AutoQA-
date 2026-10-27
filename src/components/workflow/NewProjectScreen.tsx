import React, { useState } from 'react';
import { Project } from '../../types/qa';
import { Globe, ArrowRight, ShieldCheck, Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface NewProjectScreenProps {
  onStartAnalysis: (projectData: Partial<Project>) => Promise<void> | void;
  isLoading: boolean;
  onCancel?: () => void;
  onLoadSample: (sampleId: string) => void;
}

export function validateWebUrl(inputUrl: string): { isValid: boolean; error?: string; formattedUrl?: string } {
  const trimmed = inputUrl.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Please enter a target web application URL.' };
  }

  // Ensure protocol
  let formatted = trimmed;
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }

  try {
    const parsed = new URL(formatted);
    if (!parsed.hostname || parsed.hostname.indexOf('.') === -1 && parsed.hostname !== 'localhost') {
      return { isValid: false, error: 'Please enter a valid domain name (e.g., example.com or app.mycompany.io).' };
    }
    return { isValid: true, formattedUrl: formatted };
  } catch (e) {
    return { isValid: false, error: 'The URL format is invalid. Please check for spaces or unexpected characters.' };
  }
}

export const NewProjectScreen: React.FC<NewProjectScreenProps> = ({
  onStartAnalysis,
  isLoading,
  onLoadSample,
}) => {
  const [urlInput, setUrlInput] = useState<string>('https://demo.novashop-store.io');
  const [projectName, setProjectName] = useState<string>('NovaShop E-Commerce');
  const [environment, setEnvironment] = useState<'staging' | 'production' | 'local'>('staging');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [hasAuth, setHasAuth] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('qa.tester@example.com');
  const [password, setPassword] = useState<string>('QaPassword#2026');

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    setUrlError(null);

    // Auto infer project name if empty or default
    try {
      const formatted = !/^https?:\/\//i.test(value.trim()) ? `https://${value.trim()}` : value.trim();
      const hostname = new URL(formatted).hostname;
      if (hostname && (projectName === '' || projectName.includes('E-Commerce') || projectName.includes('Application'))) {
        const cleanName = hostname.replace(/^www\./, '').split('.')[0];
        setProjectName(`${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)} Web App`);
      }
    } catch {
      // ignore typing parsing errors
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateWebUrl(urlInput);
    if (!validation.isValid) {
      setUrlError(validation.error || 'Invalid URL.');
      return;
    }

    onStartAnalysis({
      name: projectName.trim() || 'Target Web Application',
      inputType: 'website_url',
      targetUrl: validation.formattedUrl,
      localDevUrl: validation.formattedUrl,
      codebaseCoverageNotes: `Configured for ${environment.toUpperCase()} testing${hasAuth ? ' with test account credentials' : ''}.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C5CFC]/15 border border-[#7C5CFC]/30 text-xs font-mono font-semibold text-[#9278FF]">
          <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span>Step 1 of 4: Project Onboarding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
          Test a New Application
        </h1>
        <p className="text-sm text-[#94A3B8]">
          Enter your live application URL. QA-Agent will analyze routes, interactive DOM components, user journeys, and boundary risks.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="target-url-input" className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#7C5CFC]" />
                Application Web URL <span className="text-[#F87171]">*</span>
              </label>
              <span className="text-[11px] text-[#64748B]">HTTPS or HTTP supported</span>
            </div>

            <div className="relative">
              <input
                id="target-url-input"
                type="text"
                placeholder="https://example.com or https://staging.app.io"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-[#0D1629] border rounded-xl text-sm font-mono text-[#F1F5F9] placeholder-[#64748B] transition focus:outline-hidden ${
                  urlError 
                    ? 'border-[#F87171] focus:ring-1 focus:ring-[#F87171]' 
                    : 'border-[#26334D] focus:border-[#7C5CFC]'
                }`}
              />
            </div>

            {urlError && (
              <div className="flex items-center gap-1.5 text-xs text-[#F87171] font-medium pt-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{urlError}</span>
              </div>
            )}
          </div>

          {/* Project Name and Environment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="project-name-input" className="text-xs font-semibold text-[#94A3B8]">
                Project Identifier Name
              </label>
              <input
                id="project-name-input"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. My SaaS Dashboard"
                className="w-full px-3.5 py-2.5 bg-[#0D1629] border border-[#26334D] rounded-xl text-xs text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="environment-select" className="text-xs font-semibold text-[#94A3B8]">
                Test Environment
              </label>
              <select
                id="environment-select"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-[#0D1629] border border-[#26334D] rounded-xl text-xs text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
              >
                <option value="staging">Staging Sandbox (Recommended)</option>
                <option value="production">Production URL (Read-only / Safe Assertions)</option>
                <option value="local">Local Dev Server (localhost:3000)</option>
              </select>
            </div>
          </div>

          {/* Optional Test Credentials */}
          <div className="p-4 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#F1F5F9]">
                <input
                  type="checkbox"
                  checked={hasAuth}
                  onChange={(e) => setHasAuth(e.target.checked)}
                  disabled={isLoading}
                  className="rounded border-[#26334D] text-[#7C5CFC] focus:ring-[#7C5CFC]"
                />
                <span>Include Test Credentials for Authenticated Flows</span>
              </label>
              <span className="text-[10px] font-mono text-[#64748B]">Optional</span>
            </div>

            {hasAuth && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <input
                  type="text"
                  placeholder="Test Email / Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="px-3 py-2 bg-[#111A2E] border border-[#26334D] rounded-lg text-xs font-mono text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
                />
                <input
                  type="password"
                  placeholder="Test Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="px-3 py-2 bg-[#111A2E] border border-[#26334D] rounded-lg text-xs font-mono text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
                />
              </div>
            )}
          </div>

          {/* Local Persistence & Safety Disclosures */}
          <div className="p-4 rounded-xl bg-[#0E1528] border border-[#26334D] text-xs text-[#94A3B8] space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[#22C55E]">
              <ShieldCheck className="w-4 h-4" />
              <span>Safe Execution &amp; Browser-Local Persistence</span>
            </div>
            <p className="leading-relaxed">
              Your target project settings, discovered application routes, and test cases will be persisted locally in your browser session. No untrusted server processes are spawned.
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#7C5CFC] hover:bg-[#9278FF] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#7C5CFC]/30 transition"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Inspecting Application Structure &amp; Routes...</span>
              </>
            ) : (
              <>
                <span>Start Application Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Quick 1-Click Sample Apps */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider text-center">
          Or Select a Pre-Configured Sample Target
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => {
              onLoadSample('flipkart-ecom');
            }}
            className="p-4 rounded-xl bg-[#111A2E] hover:bg-[#172238] border border-[#26334D] hover:border-[#7C5CFC] cursor-pointer transition space-y-1 relative ring-1 ring-[#7C5CFC]/30 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#F1F5F9] group-hover:text-[#7C5CFC] transition">Flipkart E-Commerce</span>
              <span className="text-[10px] font-mono text-[#2874F0] bg-[#2874F0]/15 px-2 py-0.5 rounded font-bold">8722451115</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Login via mobile (8722451115), search for iPhone 17 Pro Max, and add to cart with price verification.
            </p>
          </div>

          <div
            onClick={() => {
              onLoadSample('novashop-ecom');
            }}
            className="p-4 rounded-xl bg-[#111A2E] hover:bg-[#172238] border border-[#26334D] hover:border-[#7C5CFC]/50 cursor-pointer transition space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#F1F5F9]">NovaShop Modern Store</span>
              <span className="text-[10px] font-mono text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded">Storefront</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Product catalog, shopping cart promo discount engine, and multi-step checkout form.
            </p>
          </div>

          <div
            onClick={() => {
              onLoadSample('observe-speech-qa');
            }}
            className="p-4 rounded-xl bg-[#111A2E] hover:bg-[#172238] border border-[#26334D] hover:border-[#7C5CFC]/50 cursor-pointer transition space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#F1F5F9]">Observe.ai Speech QA</span>
              <span className="text-[10px] font-mono text-[#7C5CFC] bg-[#7C5CFC]/10 px-2 py-0.5 rounded">SaaS Audio</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Contact center audio stream evaluations, sentiment analytics, and PCI redaction validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
