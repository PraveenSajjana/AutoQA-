import React, { useState } from 'react';
import { TestCase, RequirementsAnalysisResult, UserStoryItem } from '../types/qa';
import { generateBRDPDF } from '../services/pdfGenerator';
import { 
  FileText, 
  Sparkles, 
  Check, 
  X, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Code, 
  ListChecks, 
  Sliders, 
  Copy,
  Download
} from 'lucide-react';

interface RequirementsAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportGeneratedTests: (testCases: TestCase[], requirementsSummary?: string) => void;
}

const PRESET_STORIES = [
  {
    id: 'ecom-promo',
    title: 'E-Commerce: Cart Discount & Checkout',
    text: `# User Story: One-Click Promo Code & Express Checkout
As a registered retail customer
I want to apply promotional discount codes and submit delivery details
So that I can verify discounted order totals and receive instant confirmation

Acceptance Criteria:
1. AC-01: Adding an in-stock product increments the cart badge item counter by 1.
2. AC-02: Entering promo code "SAVE20" applies a 20% discount to cart subtotal.
3. AC-03: Submitting an expired or non-existent coupon displays "Invalid promo code" in red.
4. AC-04: Checkout form requires non-empty Customer Name and valid email address.
5. AC-05: Clicking "Pay and Confirm" disables button, charges card, and displays Order Confirmation ID.`
  },
  {
    id: 'saas-mfa',
    title: 'SaaS: 2FA MFA Authentication & Session',
    text: `# User Story: Enterprise Multi-Factor Authentication (MFA)
As an enterprise workspace administrator
I want to authenticate with password and verify a secondary 6-digit TOTP code
So that my organization's cloud resources are protected against credential compromise

Acceptance Criteria:
1. AC-01: Valid work email and password navigates user to the 2FA Challenge screen.
2. AC-02: Entering valid 6-digit authenticator code redirects user to Dashboard.
3. AC-03: Entering less than 6 digits or non-numeric characters blocks submit button.
4. AC-04: Exceeding 5 failed OTP attempts locks account for 15 minutes with warning.
5. AC-05: Authenticated session issues HTTP-only JWT token with 1-hour expiry.`
  },
  {
    id: 'fintech-wire',
    title: 'Fintech: Wire Transfer & Overdraft Boundary',
    text: `# User Story: High-Value Domestic & Wire Transfer
As a verified commercial banking customer
I want to disburse funds to a recipient IBAN routing number
So that payments are executed safely without exceeding available ledger balance

Acceptance Criteria:
1. AC-01: User can enter recipient routing number, amount, and transfer speed option.
2. AC-02: Transfer amount equal or less than available balance executes with #TRX receipt.
3. AC-03: Transfer amount greater than available balance is blocked with "Insufficient funds".
4. AC-04: Transfer amount <= $0.00 displays boundary validation error.
5. AC-05: Instant Wire option adds $5.00 surcharge reflected in total debit calculation.`
  }
];

export const RequirementsAnalyzerModal: React.FC<RequirementsAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onImportGeneratedTests,
}) => {
  const [requirementsText, setRequirementsText] = useState<string>(PRESET_STORIES[0].text);
  const [appName, setAppName] = useState<string>('Target Feature Application');
  const [testCount, setTestCount] = useState<number>(4);
  const [focusArea, setFocusArea] = useState<string>('comprehensive');
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<RequirementsAnalysisResult | null>(null);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'stories' | 'tests' | 'raw_json'>('tests');
  const [isDownloadingBrdPdf, setIsDownloadingBrdPdf] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '');
      setAppName(cleanFileName);

      const rawText = await file.text();
      if (isPdf) {
        // Extract readable strings and tokens from PDF text stream
        const extractedMatches = rawText.match(/\(([^)]+)\)\s*Tj/g) || rawText.match(/\[(.*?)\]\s*TJ/g);
        let extractedString = '';
        if (extractedMatches && extractedMatches.length > 0) {
          extractedString = extractedMatches
            .map((m) => m.replace(/^[(\[]|[)\]]\s*T[jJ]$/g, ''))
            .filter((s) => s.trim().length > 1)
            .join(' ');
        }

        if (extractedString.length > 50) {
          setRequirementsText(
            `# Imported from BRD PDF: ${file.name}\n\n${extractedString}`
          );
        } else {
          // Provide clean template populated with PDF context
          setRequirementsText(
            `# Business Requirements Document (Imported: ${file.name})\n` +
            `As a verified enterprise user\n` +
            `I want to execute the business requirements defined in ${file.name}\n` +
            `So that automated Playwright quality criteria are fully validated\n\n` +
            `Acceptance Criteria:\n` +
            `1. AC-01: Navigating to the primary route loads the expected feature view.\n` +
            `2. AC-02: User input fields validate mandatory fields and prompt inline alerts.\n` +
            `3. AC-03: Submitting valid workflow parameters completes with success confirmation.\n` +
            `4. AC-04: Boundary conditions and negative inputs are handled without system error.`
          );
        }
      } else {
        setRequirementsText(rawText);
      }
    } catch (err) {
      console.warn('File read error:', err);
    }
  };

  const handleDownloadBrdPdf = async () => {
    try {
      setIsDownloadingBrdPdf(true);
      await new Promise((r) => setTimeout(r, 60));
      const doc = generateBRDPDF({
        project: {
          id: 'brd-project',
          name: appName || 'Business Requirements Document',
          inputType: 'spec_upload',
          createdAt: new Date().toISOString(),
          status: 'analyzed',
          specDocument: requirementsText,
        },
        userStories: analysisResult?.userStories || [],
        testCases: analysisResult?.testCases || [],
        specText: requirementsText,
      });
      const cleanName = (appName || 'feature').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      doc.save(`AutoQA-${cleanName}-BRD-Specification.pdf`);
    } catch (err) {
      console.error('Failed to download BRD PDF:', err);
    } finally {
      setIsDownloadingBrdPdf(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!requirementsText.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/qa/analyze-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementsText,
          appName,
          requestedCount: testCount,
          focusArea,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setAnalysisResult(data.result);
        setSelectedTestCaseIds(data.result.testCases.map((tc: TestCase) => tc.test_id));
        setActiveTab('tests');
      }
    } catch (err) {
      console.error('Requirements analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSelectTest = (id: string) => {
    setSelectedTestCaseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCommitTests = () => {
    if (!analysisResult) return;
    const approvedTests = analysisResult.testCases
      .filter((tc) => selectedTestCaseIds.includes(tc.test_id))
      .map((tc) => ({ ...tc, status: 'pending_review' as const }));

    onImportGeneratedTests(approvedTests, analysisResult.summary);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Requirements &amp; User Stories Analyzer
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                  Agent 2 Test Designer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Analyzes user stories, acceptance criteria, and generates structured test cases awaiting user approval.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Section: Inputs & Preset Selector */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                User Stories / Requirements Specification (Markdown, PRD, Acceptance Criteria)
              </label>

              {/* Preset Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
                {PRESET_STORIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setRequirementsText(p.text);
                      setAppName(p.title);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-medium border transition whitespace-nowrap ${
                      requirementsText === p.text
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {p.title.split(':')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                rows={6}
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                placeholder="Paste your User Stories, Acceptance Criteria, Gherkin Scenarios, or Jira tickets here..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* File Upload */}
                <label className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-300 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload BRD (.pdf, .md, .txt)</span>
                  <input
                    type="file"
                    accept=".pdf,.md,.txt,.json,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Quick Download BRD PDF */}
                <button
                  type="button"
                  onClick={handleDownloadBrdPdf}
                  disabled={isDownloadingBrdPdf || !requirementsText.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs font-semibold rounded-lg border border-slate-700 hover:border-indigo-500/50 transition shadow-sm disabled:opacity-50"
                  title="Download complete ISO 29148 Business Requirements Document PDF"
                >
                  <Download className={`w-3.5 h-3.5 ${isDownloadingBrdPdf ? 'animate-bounce' : 'text-indigo-400'}`} />
                  <span>{isDownloadingBrdPdf ? 'Generating PDF...' : 'Download BRD PDF'}</span>
                </button>

                {/* Test count */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Test Cases:</span>
                  <select
                    value={testCount}
                    onChange={(e) => setTestCount(parseInt(e.target.value, 10))}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
                  >
                    <option value={3}>3 Cases (Quick Core)</option>
                    <option value={4}>4 Cases (Standard Suite)</option>
                    <option value={6}>6 Cases (Deep Boundary Matrix)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !requirementsText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Analyzing Stories & Generating...' : 'Analyze & Generate Test Cases'}</span>
              </button>
            </div>
          </div>

          {/* Analysis Results View */}
          {analysisResult && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              {/* Summary Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Requirements Synthesized Successfully
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                      {analysisResult.testCases.length} Test Cases Ready for Review
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl">{analysisResult.summary}</p>
                </div>

                {/* View Tabs */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tests')}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      activeTab === 'tests' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Test Cases ({analysisResult.testCases.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('stories')}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      activeTab === 'stories' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    User Stories ({analysisResult.userStories.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('raw_json')}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      activeTab === 'raw_json' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Strict JSON
                  </button>
                </div>
              </div>

              {/* TAB 1: Test Cases (Presented for Review & Selection) */}
              {activeTab === 'tests' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Select cases to import into your approved test suite (
                      <strong className="text-white">{selectedTestCaseIds.length}</strong> selected):
                    </span>
                    <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Status: pending_review (Must be reviewed before execution)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {analysisResult.testCases.map((tc) => {
                      const isSelected = selectedTestCaseIds.includes(tc.test_id);
                      return (
                        <div
                          key={tc.test_id}
                          onClick={() => toggleSelectTest(tc.test_id)}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition relative ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded border flex items-center justify-center text-[10px]">
                                {isSelected ? <Check className="w-3 h-3 text-indigo-400" /> : null}
                              </span>
                              <span className="font-mono text-xs font-bold text-indigo-400">
                                {tc.test_id}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                {tc.requirement_id}
                              </span>
                            </div>

                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                tc.priority === 'critical'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : tc.priority === 'high'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {tc.priority}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-white mb-2 leading-snug">
                            {tc.title}
                          </div>

                          {/* Preconditions */}
                          {tc.preconditions.length > 0 && (
                            <div className="text-[11px] text-slate-400 mb-2">
                              <span className="text-slate-500 font-semibold">Preconditions:</span>{' '}
                              {tc.preconditions.join('; ')}
                            </div>
                          )}

                          {/* Steps preview */}
                          <div className="space-y-1 mb-2">
                            {tc.steps.slice(0, 3).map((st, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300"
                              >
                                <span className="text-indigo-400 font-bold">{st.action}</span>
                                <span className="text-slate-500">&rarr;</span>
                                <span className="truncate max-w-[200px] text-cyan-300">{st.target}</span>
                                {st.value && <span className="text-amber-300">"{st.value}"</span>}
                              </div>
                            ))}
                            {tc.steps.length > 3 && (
                              <div className="text-[10px] text-slate-500 font-mono">
                                + {tc.steps.length - 3} more deterministic steps
                              </div>
                            )}
                          </div>

                          {/* Expected Result */}
                          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400">
                            <strong>Expected:</strong> {tc.expected_result}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: User Stories & Acceptance Criteria */}
              {activeTab === 'stories' && (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {analysisResult.userStories.map((story) => (
                    <div
                      key={story.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-400">
                          {story.id}: {story.title}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Role: {story.role}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
                        <div><strong className="text-indigo-300">As a</strong> {story.role}</div>
                        <div><strong className="text-indigo-300">I want to</strong> {story.action}</div>
                        <div><strong className="text-indigo-300">So that</strong> {story.benefit}</div>
                      </div>

                      {story.acceptanceCriteria?.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                            <ListChecks className="w-3.5 h-3.5 text-emerald-400" /> Acceptance Criteria:
                          </div>
                          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                            {story.acceptanceCriteria.map((ac, idx) => (
                              <li key={idx}>{ac}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: Raw JSON */}
              {activeTab === 'raw_json' && (
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 max-h-[380px] overflow-y-auto leading-relaxed">
                    {JSON.stringify(analysisResult.testCases, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {analysisResult ? (
              <span>
                {selectedTestCaseIds.length} of {analysisResult.testCases.length} test cases selected for review gate
              </span>
            ) : (
              <span>Paste requirements or choose a preset to generate test cases</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadBrdPdf}
              disabled={isDownloadingBrdPdf || !requirementsText.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 text-xs font-semibold rounded-xl border border-indigo-500/40 transition shadow-sm disabled:opacity-50"
              title="Download ISO/IEC/IEEE 29148 Standard Business Requirements Document PDF"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloadingBrdPdf ? 'animate-bounce' : 'text-indigo-400'}`} />
              <span>{isDownloadingBrdPdf ? 'Generating PDF...' : 'Download BRD PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
            >
              Cancel
            </button>

            {analysisResult && (
              <button
                type="button"
                onClick={handleCommitTests}
                disabled={selectedTestCaseIds.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Present for Review &amp; Approval</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
