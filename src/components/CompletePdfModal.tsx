import React, { useState, useRef } from 'react';
import { 
  Project, 
  ApplicationAnalysis, 
  TestCase, 
  TestReviewFeedback, 
  TestRun, 
  QASummaryReport 
} from '../types/qa';
import { generateCompleteApplicationPDF } from '../services/pdfGenerator';
import { compileToPlaywrightTS } from '../services/compiler';
import { 
  FileText, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  Code2,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface CompletePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  analysis: ApplicationAnalysis | null;
  testCases: TestCase[];
  reviewFeedbacks: Record<string, TestReviewFeedback>;
  currentRun: TestRun | null;
  summaryReport: QASummaryReport | null;
}

export const CompletePdfModal: React.FC<CompletePdfModalProps> = ({
  isOpen,
  onClose,
  project,
  analysis,
  testCases,
  reviewFeedbacks,
  currentRun,
  summaryReport,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'coverage'>('preview');

  if (!isOpen) return null;

  const totalTests = currentRun ? currentRun.totalTests : testCases.length;
  const passedTests = currentRun ? currentRun.passedCount : testCases.filter((t) => t.status === 'approved').length;
  const failedTests = currentRun ? currentRun.failedCount : 0;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100;
  const isHealthy = failedTests === 0;

  // Module coverage breakdown
  const moduleMap: Record<string, { total: number; passed: number; high: number; cases: TestCase[] }> = {};
  testCases.forEach((tc) => {
    let mod = 'General / Core';
    if (tc.category) {
      mod = tc.category.charAt(0).toUpperCase() + tc.category.slice(1);
    } else if (tc.title.toLowerCase().includes('cart') || tc.title.toLowerCase().includes('checkout')) {
      mod = 'Cart & Checkout';
    } else if (tc.title.toLowerCase().includes('promo') || tc.title.toLowerCase().includes('discount')) {
      mod = 'Discounts & Pricing';
    } else if (tc.title.toLowerCase().includes('filter') || tc.title.toLowerCase().includes('search')) {
      mod = 'Catalog & Search';
    } else if (tc.title.toLowerCase().includes('auth') || tc.title.toLowerCase().includes('login')) {
      mod = 'Authentication';
    }

    if (!moduleMap[mod]) {
      moduleMap[mod] = { total: 0, passed: 0, high: 0, cases: [] };
    }
    moduleMap[mod].total++;
    moduleMap[mod].cases.push(tc);
    if (tc.priority === 'high' || tc.priority === 'critical') moduleMap[mod].high++;

    const res = currentRun?.results.find((r) => r.testId === tc.test_id);
    if (res?.status === 'passed' || (!currentRun && tc.status === 'approved')) {
      moduleMap[mod].passed++;
    }
  });

  const playwrightScript = compileToPlaywrightTS(testCases, project.targetUrl || 'http://localhost:3000');

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      // Allow DOM state update
      await new Promise((r) => setTimeout(r, 60));

      const doc = generateCompleteApplicationPDF({
        project,
        analysis,
        testCases,
        reviewFeedbacks,
        currentRun,
        summaryReport,
      });

      const cleanName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      doc.save(`AutoQA-${cleanName}-Complete-Specification.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textLines = [
      `AUTOQA AUTONOMOUS TEST SUITE & ARCHITECTURE SPECIFICATION`,
      `Application: ${project.name}`,
      `Target URL: ${project.targetUrl || 'Sandbox'}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Release Verdict: ${isHealthy ? 'GO FOR RELEASE' : 'NO-GO BLOCKERS'} (${passRate}% Pass Rate)`,
      `Total Test Cases: ${testCases.length}`,
      `\n--- TEST CASES ---`,
      ...testCases.map((tc) => `[${tc.test_id}] ${tc.title} (${tc.priority.toUpperCase()})\nPreconditions: ${tc.preconditions.join('; ')}\nExpected: ${tc.expected_result}\nSteps:\n${tc.steps.map((s, i) => `  ${i + 1}. ${s.action} -> ${s.target} ${s.value ? `(${s.value})` : ''}`).join('\n')}`),
    ];
    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
      {/* Print stylesheet to ensure pristine printable output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-pdf-document, #printable-pdf-document * {
            visibility: visible;
          }
          #printable-pdf-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="relative w-full max-w-6xl h-[94vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="no-print px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 p-0.5 shadow-md shadow-indigo-600/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Complete Application PDF Document
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md uppercase">
                  Multi-Page QA Specification
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {project.name} &bull; {testCases.length} Test Cases &bull; {analysis?.routes.length || 0} Routes &bull; Playwright 1.48+
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
              title="Copy all specification text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              title="Print document or save using browser PDF printer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print / Browser PDF</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span>{isGeneratingPdf ? 'Compiling PDF...' : 'Download Complete PDF (.pdf)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-1"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-navbar with Section Tabs */}
        <div className="no-print px-6 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'preview'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Document Preview (PDF Layout)
            </button>
            <button
              onClick={() => setActiveTab('coverage')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'coverage'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Coverage Matrix ({Object.keys(moduleMap).length} Modules)
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'code'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Playwright TypeScript (.spec.ts)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>Format: ISO 32000-1 (PDF)</span>
            <span>&bull;</span>
            <span className={isHealthy ? 'text-emerald-400' : 'text-rose-400'}>
              Verdict: {isHealthy ? 'RELEASE GO' : 'RELEASE NO-GO'}
            </span>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/80">
          {activeTab === 'code' ? (
            <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
                <span className="text-indigo-400 font-bold">qa-automated.spec.ts</span>
                <span className="text-slate-500">{playwrightScript.split('\n').length} lines</span>
              </div>
              <pre className="p-5 text-xs text-indigo-200 font-mono overflow-x-auto leading-relaxed max-h-[70vh]">
                {playwrightScript}
              </pre>
            </div>
          ) : activeTab === 'coverage' ? (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Functional Module Test Matrix & Rigor
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Coverage breakdown across system boundaries, critical paths, and regression targets.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                        <th className="py-2 px-3">Module</th>
                        <th className="py-2 px-3">Test Cases</th>
                        <th className="py-2 px-3">Verified</th>
                        <th className="py-2 px-3">High Priority</th>
                        <th className="py-2 px-3">Coverage</th>
                        <th className="py-2 px-3">Rigor Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                      {Object.entries(moduleMap).map(([modName, stats]) => {
                        const cov = Math.round((stats.passed / stats.total) * 100);
                        return (
                          <tr key={modName} className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-sans font-bold text-slate-200">{modName}</td>
                            <td className="py-2.5 px-3 text-slate-300">{stats.total}</td>
                            <td className="py-2.5 px-3 text-emerald-400">{stats.passed}</td>
                            <td className="py-2.5 px-3 text-amber-400">{stats.high}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${cov === 100 ? 'bg-emerald-400' : 'bg-indigo-400'}`}
                                    style={{ width: `${cov}%` }}
                                  />
                                </div>
                                <span className="font-bold">{cov}%</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-sans">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                cov === 100
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {cov === 100 ? 'Complete' : 'In Progress'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Printable Clean Document Layout */
            <div
              id="printable-pdf-document"
              className="max-w-4xl mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-12 font-sans space-y-8"
            >
              {/* Cover Banner */}
              <div className="bg-slate-900 text-white p-8 rounded-xl shadow-md border-b-4 border-indigo-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded">
                        AUTOQA PLATFORM SPECIFICATION
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Playwright Test Automation Architecture
                      </span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-white">
                      {project.name}
                    </h1>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Complete Autonomous Test Architecture, Execution Traces &amp; Quality Gate Audit Report
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-lg text-right border border-slate-700 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Release Verdict
                    </span>
                    <span className={`text-base font-extrabold ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isHealthy ? 'READY (GO)' : 'FAILURES (NO-GO)'}
                    </span>
                    <span className="text-[11px] block text-slate-400 font-mono mt-0.5">
                      Pass Rate: {passRate}%
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Target Surface</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {project.targetUrl || project.localFolderPath || 'Sandbox App'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Framework / Stack</span>
                    <span className="font-semibold text-slate-200">
                      {analysis?.techStackDetected?.slice(0, 2).join(', ') || project.detectedFramework || 'React SPA'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Document Date</span>
                    <span className="font-semibold text-slate-200">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Test Suite Engine</span>
                    <span className="font-semibold text-slate-200">Playwright 1.48+</span>
                  </div>
                </div>
              </div>

              {/* Section 1: Executive Metrics */}
              <section className="space-y-3">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    1. Executive QA &amp; Test Suite Metrics
                  </h2>
                  <span className="text-xs text-slate-500 font-mono">Agent 5 Signoff</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Test Cases</span>
                    <span className="text-xl font-bold text-slate-900">{totalTests}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Passed / Verified</span>
                    <span className="text-xl font-bold text-emerald-700">{passedTests}</span>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-700 block">Failed / Blockers</span>
                    <span className="text-xl font-bold text-rose-700">{failedTests}</span>
                  </div>
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 block">Quality Rigor</span>
                    <span className="text-xl font-bold text-indigo-700">{passRate}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  {summaryReport?.executiveSummary ||
                    `AutoQA has synthesized deterministic Playwright test cases covering essential user journeys, cart calculations, locator selectors, boundary cases, and error handling for ${project.name}. Test cases have been verified against DOM stability criteria.`}
                </p>
              </section>

              {/* Section 2: Functional Module Coverage */}
              <section className="space-y-3">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    2. Functional Module Coverage Matrix
                  </h2>
                  <span className="text-xs text-slate-500 font-mono">
                    {Object.keys(moduleMap).length} Modules Tracked
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Module</th>
                        <th className="py-2.5 px-3">Cases</th>
                        <th className="py-2.5 px-3">Passed</th>
                        <th className="py-2.5 px-3">High Priority</th>
                        <th className="py-2.5 px-3">Coverage %</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {Object.entries(moduleMap).map(([mName, s]) => {
                        const c = Math.round((s.passed / s.total) * 100);
                        return (
                          <tr key={mName} className="text-slate-800">
                            <td className="py-2 px-3 font-sans font-bold">{mName}</td>
                            <td className="py-2 px-3">{s.total}</td>
                            <td className="py-2 px-3 text-emerald-700">{s.passed}</td>
                            <td className="py-2 px-3 text-amber-700">{s.high}</td>
                            <td className="py-2 px-3 font-bold">{c}%</td>
                            <td className="py-2 px-3 font-sans">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {c === 100 ? 'Verified' : 'Needs Run'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Section 3: Target Application Blueprint & Routes */}
              {analysis && analysis.routes && analysis.routes.length > 0 && (
                <section className="space-y-3">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      3. Target Application Blueprint &amp; Locators Catalog
                    </h2>
                    <span className="text-xs text-slate-500 font-mono">Agent 1 Application Map</span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Route Path</th>
                          <th className="py-2.5 px-3">View Name</th>
                          <th className="py-2.5 px-3">Key DOM Selectors</th>
                          <th className="py-2.5 px-3">Criticality</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {analysis.routes.map((rt) => (
                          <tr key={rt.path} className="text-slate-800">
                            <td className="py-2 px-3 font-mono text-indigo-600 font-semibold">{rt.path}</td>
                            <td className="py-2 px-3 font-medium">{rt.name}</td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                              {rt.interactiveElements?.slice(0, 3).map((e) => e.selector).join(', ') || 'Standard DOM'}
                            </td>
                            <td className="py-2 px-3 uppercase text-[10px] font-bold text-slate-600">
                              {rt.criticality}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Section 4: Complete Test Cases Catalog */}
              <section className="space-y-4 page-break">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    4. Complete Automated Test Cases Catalog ({testCases.length} Cases)
                  </h2>
                  <span className="text-xs text-slate-500 font-mono">Agent 2 &amp; 3 Quality Gate</span>
                </div>

                <div className="space-y-4">
                  {testCases.map((tc, idx) => {
                    const fb = reviewFeedbacks[tc.test_id];
                    const res = currentRun?.results.find((r) => r.testId === tc.test_id);
                    const isSuccess = res ? res.status === 'passed' : tc.status === 'approved';

                    return (
                      <div
                        key={tc.test_id}
                        className="border border-slate-300 rounded-lg p-4 bg-slate-50/50 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                              {tc.test_id}
                            </span>
                            <span className="font-bold text-xs text-slate-900">{tc.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              Req: {tc.requirement_id}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {res ? res.status : tc.status}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                          {tc.preconditions && tc.preconditions.length > 0 && (
                            <p>
                              <strong className="text-slate-800">Preconditions:</strong>{' '}
                              {tc.preconditions.join('; ')}
                            </p>
                          )}
                          <p>
                            <strong className="text-slate-800">Expected Result:</strong> {tc.expected_result}
                          </p>
                          {fb && (
                            <p className="text-[11px] text-slate-500 font-mono">
                              Quality Gate Audit Score: {fb.score}/100 &bull; Selector Stability: {fb.selectorStabilityScore} &bull; Assertion Rigor: {fb.assertionRigor}
                            </p>
                          )}
                        </div>

                        {/* Steps Table */}
                        <div className="overflow-x-auto border border-slate-200 rounded">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[9px]">
                              <tr>
                                <th className="py-1.5 px-2">Step</th>
                                <th className="py-1.5 px-2">Action</th>
                                <th className="py-1.5 px-2">Target Selector</th>
                                <th className="py-1.5 px-2">Value</th>
                                <th className="py-1.5 px-2">Description / Verification</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 font-mono">
                              {tc.steps.map((st, sIdx) => (
                                <tr key={sIdx} className="text-slate-800">
                                  <td className="py-1 px-2 font-sans font-bold text-slate-500">{sIdx + 1}</td>
                                  <td className="py-1 px-2 text-indigo-700 font-bold">{st.action}</td>
                                  <td className="py-1 px-2 text-slate-700">{st.target}</td>
                                  <td className="py-1 px-2 text-slate-500">{st.value || '-'}</td>
                                  <td className="py-1 px-2 font-sans text-slate-600">{st.description || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Section 5: Execution Trace & Defect Triage */}
              {currentRun && currentRun.results && (
                <section className="space-y-3 page-break">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      5. Playwright Execution Traces &amp; Defect Triage
                    </h2>
                    <span className="text-xs text-slate-500 font-mono">
                      Agent 4 Playwright Sandbox &bull; {currentRun.durationMs}ms
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Test ID</th>
                          <th className="py-2 px-3">Duration</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Execution Diagnostics</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                        {currentRun.results.map((r) => (
                          <tr key={r.testId} className="text-slate-800">
                            <td className="py-2 px-3 font-bold">{r.testId}</td>
                            <td className="py-2 px-3">{r.durationMs}ms</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                                r.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-sans text-slate-600">
                              {r.defect ? (
                                <span className="text-rose-700 font-semibold">
                                  [{r.defect.category}] {r.defect.rootCauseAnalysis}
                                </span>
                              ) : (
                                'Deterministic execution completed with all assertions passed.'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Document Signoff Footer */}
              <div className="pt-8 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-3 font-mono">
                <div>
                  AutoQA Studio &bull; End-to-End Autonomous Testing Specification
                </div>
                <div>
                  Confidential QA Document &bull; Generated {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
