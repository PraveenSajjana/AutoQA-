import React, { useState } from 'react';
import { TestCase, TestRun, QASummaryReport, Project, ApplicationAnalysis, TestReviewFeedback } from '../types/qa';
import { 
  compileToPlaywrightTS, 
  compileToJUnitXML, 
  compileToCSV, 
  generateHTMLReport 
} from '../services/compiler';
import { generateCompleteApplicationPDF, generateBRDPDF } from '../services/pdfGenerator';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Code, 
  FileSpreadsheet, 
  Sparkles, 
  ShieldCheck, 
  BarChart3,
  ExternalLink,
  Printer,
  ChevronRight
} from 'lucide-react';

interface ReportExporterProps {
  testCases: TestCase[];
  currentRun: TestRun | null;
  summaryReport: QASummaryReport | null;
  onRerunSuite: () => void;
  project?: Project;
  analysis?: ApplicationAnalysis | null;
  reviewFeedbacks?: Record<string, TestReviewFeedback>;
  onOpenPdfModal?: () => void;
}

export const ReportExporter: React.FC<ReportExporterProps> = ({
  testCases,
  currentRun,
  summaryReport,
  onRerunSuite,
  project,
  analysis,
  reviewFeedbacks = {},
  onOpenPdfModal,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [previewFormat, setPreviewFormat] = useState<'playwright' | 'junit' | 'csv' | 'html' | 'json'>('playwright');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isDownloadingBrdPdf, setIsDownloadingBrdPdf] = useState<boolean>(false);

  const fallbackProject: Project = project || {
    id: currentRun?.projectId || 'default-proj',
    name: currentRun?.projectName || 'Target Application',
    inputType: 'sandbox_app',
    createdAt: new Date().toISOString(),
    status: 'completed',
    targetUrl: currentRun?.target,
  };

  const handleDownloadCompletePdf = async () => {
    try {
      setIsDownloadingPdf(true);
      await new Promise((r) => setTimeout(r, 60));
      const doc = generateCompleteApplicationPDF({
        project: fallbackProject,
        analysis: analysis || null,
        testCases,
        reviewFeedbacks,
        currentRun,
        summaryReport,
      });
      const cleanName = fallbackProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      doc.save(`AutoQA-${cleanName}-Complete-Specification.pdf`);
    } catch (err) {
      console.error('Failed to generate complete PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadBrdPdf = async () => {
    try {
      setIsDownloadingBrdPdf(true);
      await new Promise((r) => setTimeout(r, 60));
      const doc = generateBRDPDF({
        project: fallbackProject,
        analysis: analysis || null,
        testCases,
        currentRun,
        specText: fallbackProject.specDocument,
      });
      const cleanName = fallbackProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      doc.save(`AutoQA-${cleanName}-BRD-Specification.pdf`);
    } catch (err) {
      console.error('Failed to generate BRD PDF:', err);
    } finally {
      setIsDownloadingBrdPdf(false);
    }
  };

  if (!currentRun) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-2">No Test Run Data Available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Execute the test suite in Stage 5 to generate comprehensive QA reports and multi-format exports.
          </p>
          <button
            onClick={onRerunSuite}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
          >
            Launch Test Execution
          </button>
        </div>
      </div>
    );
  }

  const passRate = currentRun.totalTests > 0 ? Math.round((currentRun.passedCount / currentRun.totalTests) * 100) : 0;
  const isGo = currentRun.failedCount === 0;

  // Compilations
  const playwrightTS = compileToPlaywrightTS(testCases, currentRun.target);
  const junitXML = compileToJUnitXML(currentRun);
  const csvData = compileToCSV(testCases, currentRun);
  const htmlReport = generateHTMLReport(currentRun);
  const jsonReport = JSON.stringify({ run: currentRun, testCases }, null, 2);

  const getPreviewContent = () => {
    switch (previewFormat) {
      case 'playwright':
        return { content: playwrightTS, filename: 'qa-automated.spec.ts', mime: 'text/typescript' };
      case 'junit':
        return { content: junitXML, filename: 'junit-results.xml', mime: 'application/xml' };
      case 'csv':
        return { content: csvData, filename: 'qa-test-matrix.csv', mime: 'text/csv' };
      case 'html':
        return { content: htmlReport, filename: 'qa-report.html', mime: 'text/html' };
      case 'json':
        return { content: jsonReport, filename: 'qa-execution-trace.json', mime: 'application/json' };
    }
  };

  const currentPreview = getPreviewContent();

  const handleDownload = (formatKey: typeof previewFormat) => {
    let content = '';
    let filename = '';
    let mime = 'text/plain';

    if (formatKey === 'playwright') {
      content = playwrightTS;
      filename = `${currentRun.projectName.toLowerCase().replace(/\s+/g, '-')}.spec.ts`;
      mime = 'text/typescript';
    } else if (formatKey === 'junit') {
      content = junitXML;
      filename = 'junit-report.xml';
      mime = 'application/xml';
    } else if (formatKey === 'csv') {
      content = csvData;
      filename = 'test-matrix.csv';
      mime = 'text/csv';
    } else if (formatKey === 'html') {
      content = htmlReport;
      filename = 'qa-executive-report.html';
      mime = 'text/html';
    } else if (formatKey === 'json') {
      content = jsonReport;
      filename = 'qa-test-suite.json';
      mime = 'application/json';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPreview.content);
    setCopiedFormat(previewFormat);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Release Verdict Card */}
      <div className={`p-6 rounded-2xl border shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
        isGo
          ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40'
          : 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`p-3 rounded-xl shrink-0 ${isGo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {isGo ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                isGo ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
              }`}>
                {isGo ? 'RELEASE GO VERDICT' : 'RELEASE NO-GO (BLOCKERS)'}
              </span>
              <span className="text-xs text-slate-400 font-mono">Agent 5 QA Signoff</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              {summaryReport?.verdictReason || (isGo ? 'All core paths passed with 100% deterministic stability.' : 'Defects detected during Playwright execution requiring triage.')}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {summaryReport?.executiveSummary || `AutoQA completed execution of ${currentRun.totalTests} test cases in ${currentRun.durationMs}ms.`}
            </p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 shrink-0">
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pass Rate</span>
            <span className={`text-3xl font-extrabold ${passRate > 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {passRate}%
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {currentRun.passedCount} / {currentRun.totalTests} tests passed
          </span>
        </div>
      </div>

      {/* Complete Application PDF Document Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/40 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500 text-white uppercase tracking-wider">
                COMPLETE APPLICATION PDF
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                Publication-Ready ISO 32000-1 Document
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              End-to-End QA Architecture &amp; Test Specification PDF
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Consolidates Executive Summary, Functional Module Coverage Matrix, Target Blueprint &amp; Locators Catalog, all {testCases.length} Test Cases with Preconditions and Assertions, Playwright Execution Traces, AI Defect Triage RCA, and Runnable .spec.ts Automation Code.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownloadBrdPdf}
            disabled={isDownloadingBrdPdf}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 text-xs font-bold rounded-xl border border-indigo-500/40 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            title="Download ISO/IEC/IEEE 29148 Business Requirements Document PDF"
          >
            <Download className={`w-4 h-4 ${isDownloadingBrdPdf ? 'animate-bounce' : 'text-indigo-400'}`} />
            <span>{isDownloadingBrdPdf ? 'Generating BRD...' : 'Download BRD PDF (.pdf)'}</span>
          </button>

          {onOpenPdfModal && (
            <button
              onClick={onOpenPdfModal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preview &amp; Print</span>
            </button>
          )}

          <button
            onClick={handleDownloadCompletePdf}
            disabled={isDownloadingPdf}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isDownloadingPdf ? 'animate-bounce' : ''}`} />
            <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Complete QA PDF (.pdf)'}</span>
          </button>
        </div>
      </div>

      {/* 5 Reusable Export Format Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-400" />
            Reusable Multi-Format Export Packages (Phase 5)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Directly importable into CI/CD, IDEs, and QA spreadsheets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Format 1: Playwright TS */}
          <div
            onClick={() => setPreviewFormat('playwright')}
            className={`p-4 rounded-xl border text-left cursor-pointer transition ${
              previewFormat === 'playwright'
                ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="text-indigo-400 font-bold text-xs mb-1 flex items-center justify-between">
              <span>Playwright TS</span>
              <Code className="w-4 h-4" />
            </div>
            <div className="text-white text-xs font-semibold">.spec.ts Test Script</div>
            <p className="text-[11px] text-slate-400 mt-1">Ready for npx playwright test in CI</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload('playwright');
              }}
              className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>

          {/* Format 2: JUnit XML */}
          <div
            onClick={() => setPreviewFormat('junit')}
            className={`p-4 rounded-xl border text-left cursor-pointer transition ${
              previewFormat === 'junit'
                ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="text-cyan-400 font-bold text-xs mb-1 flex items-center justify-between">
              <span>JUnit XML</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-white text-xs font-semibold">CI/CD Test Report</div>
            <p className="text-[11px] text-slate-400 mt-1">Jenkins &amp; GitHub Actions results</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload('junit');
              }}
              className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>

          {/* Format 3: Excel / CSV */}
          <div
            onClick={() => setPreviewFormat('csv')}
            className={`p-4 rounded-xl border text-left cursor-pointer transition ${
              previewFormat === 'csv'
                ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="text-emerald-400 font-bold text-xs mb-1 flex items-center justify-between">
              <span>Excel / CSV</span>
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="text-white text-xs font-semibold">Test Case Matrix</div>
            <p className="text-[11px] text-slate-400 mt-1">Spreadsheet for QA planning</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload('csv');
              }}
              className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>

          {/* Format 4: Standalone HTML */}
          <div
            onClick={() => setPreviewFormat('html')}
            className={`p-4 rounded-xl border text-left cursor-pointer transition ${
              previewFormat === 'html'
                ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="text-amber-400 font-bold text-xs mb-1 flex items-center justify-between">
              <span>HTML Report</span>
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="text-white text-xs font-semibold">Self-Contained Report</div>
            <p className="text-[11px] text-slate-400 mt-1">Standalone web view for stakeholders</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload('html');
              }}
              className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>

          {/* Format 5: JSON Suite & Trace */}
          <div
            onClick={() => setPreviewFormat('json')}
            className={`p-4 rounded-xl border text-left cursor-pointer transition ${
              previewFormat === 'json'
                ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="text-purple-400 font-bold text-xs mb-1 flex items-center justify-between">
              <span>JSON Trace</span>
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-white text-xs font-semibold">Full Execution Trace</div>
            <p className="text-[11px] text-slate-400 mt-1">Raw machine-readable artifact</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload('json');
              }}
              className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        </div>
      </div>

      {/* Code / Artifact Live Preview Window */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-indigo-400">
              {currentPreview.filename}
            </span>
            <span className="text-slate-500 text-xs font-mono">
              ({currentPreview.content.split('\n').length} lines)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition"
            >
              {copiedFormat === previewFormat ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Content</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownload(previewFormat)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        <pre className="p-6 text-xs text-indigo-200 font-mono overflow-x-auto max-h-[500px] leading-relaxed bg-slate-950/60 selection:bg-indigo-500/30">
          {currentPreview.content}
        </pre>
      </div>
    </div>
  );
};
