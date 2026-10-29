import { TestRun, TestCase, DefectTriage, Project, ApplicationAnalysis } from '../types/qa';

export interface ExportReportData {
  project: Project;
  analysis: ApplicationAnalysis | null;
  run: TestRun | null;
  testCases: TestCase[];
  defects: DefectTriage[];
  exportedAt: string;
}

/**
 * Generates and triggers browser download of an authentic, structured JSON report
 */
export function downloadJsonReport(data: ExportReportData, filenamePrefix = 'qa-agent-report'): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filenamePrefix}-${Date.now()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Generates and triggers browser download of a self-contained, beautifully styled standalone HTML report
 */
export function downloadHtmlReport(data: ExportReportData, filenamePrefix = 'qa-agent-report'): void {
  const total = data.run?.totalTests || data.testCases.length || 0;
  const passed = data.run?.passedCount || 0;
  const failed = data.run?.failedCount || 0;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const projectName = data.project.name || 'QA Project';
  const targetUrl = data.project.targetUrl || 'http://localhost:3000';
  const executionDate = data.run?.startedAt ? new Date(data.run.startedAt).toLocaleString() : new Date().toLocaleString();

  const resultsHtml = (data.run?.results || []).map((res, idx) => {
    const isPassed = res.status === 'passed';
    const statusColor = isPassed ? '#22C55E' : '#F87171';
    const statusBg = isPassed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(248, 113, 113, 0.1)';
    const matchingCase = data.testCases.find((tc) => tc.test_id === res.testId);

    const stepsHtml = (res.stepRecords || []).map((step, sIdx) => {
      const stepPassed = step.status === 'passed';
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; margin-bottom:6px; background:#0D1629; border:1px solid #26334D; border-radius:6px; font-size:12px; font-family:monospace;">
          <div>
            <span style="color:#64748B; margin-right:8px;">#${sIdx + 1}</span>
            <span style="color:#7C5CFC; font-weight:600; margin-right:8px;">${step.action}</span>
            <span style="color:#F1F5F9;">${step.target}</span>
            ${step.value ? `<span style="color:#94A3B8; margin-left:8px;">(${escapeHtml(step.value)})</span>` : ''}
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="color:#64748B;">${step.durationMs}ms</span>
            <span style="color:${stepPassed ? '#22C55E' : '#F87171'}; font-weight:bold;">${stepPassed ? 'PASS' : 'FAIL'}</span>
          </div>
        </div>
        ${step.errorMessage ? `<div style="padding:8px 12px; margin-bottom:6px; background:rgba(248, 113, 113, 0.1); border:1px solid #F87171; border-radius:6px; color:#F87171; font-size:11px; font-family:monospace;">Error: ${escapeHtml(step.errorMessage)}</div>` : ''}
      `;
    }).join('');

    const defectHtml = res.defect ? `
      <div style="margin-top:12px; padding:12px; background:rgba(248, 113, 113, 0.08); border:1px solid rgba(248, 113, 113, 0.3); border-radius:8px;">
        <div style="font-weight:bold; color:#F87171; font-size:12px; margin-bottom:6px;">Automated Failure Triage (${res.defect.category})</div>
        <div style="color:#F1F5F9; font-size:12px; margin-bottom:6px;">${escapeHtml(res.defect.rootCauseAnalysis)}</div>
        <div style="color:#22D3EE; font-size:11px; font-family:monospace; margin-bottom:4px;">Suggested fix: ${escapeHtml(res.defect.suggestedFix)}</div>
        ${res.defect.codeSnippet ? `<pre style="background:#0B1020; padding:8px; border-radius:4px; color:#94A3B8; font-size:11px; overflow-x:auto;">${escapeHtml(res.defect.codeSnippet)}</pre>` : ''}
      </div>
    ` : '';

    return `
      <div style="background:#111A2E; border:1px solid #26334D; border-radius:12px; padding:16px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span style="font-family:monospace; font-weight:bold; color:#7C5CFC; font-size:13px;">${res.testId}</span>
              ${matchingCase?.feature_id ? `<span style="font-family:monospace; font-size:11px; color:#9278FF; background:rgba(124,92,252,0.15); border:1px solid rgba(124,92,252,0.3); padding:1px 6px; border-radius:4px;">Feature: ${matchingCase.feature_id}</span>` : ''}
              ${matchingCase?.test_type ? `<span style="font-size:10px; text-transform:uppercase; color:#22D3EE; background:rgba(34,211,238,0.1); border:1px solid rgba(34,211,238,0.25); padding:1px 6px; border-radius:4px;">${matchingCase.test_type}</span>` : ''}
            </div>
            <span style="font-weight:600; color:#F1F5F9; font-size:14px;">${escapeHtml(res.testTitle)}</span>
            ${matchingCase?.objective ? `<div style="color:#94A3B8; font-size:12px; margin-top:4px;">Objective: ${escapeHtml(matchingCase.objective)}</div>` : ''}
            ${matchingCase?.traceability ? `<div style="color:#64748B; font-family:monospace; font-size:11px; margin-top:2px;">Trace: ${escapeHtml(matchingCase.traceability)}</div>` : ''}
          </div>
          <div style="display:flex; align-items:center; gap:8px; shrink-0;">
            <span style="font-size:11px; color:#64748B;">${res.durationMs}ms</span>
            <span style="background:${statusBg}; color:${statusColor}; border:1px solid ${statusColor}; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; text-transform:uppercase;">${res.status}</span>
          </div>
        </div>
        <div style="margin-top:8px;">${stepsHtml}</div>
        ${defectHtml}
      </div>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QA-Agent Test Report - ${escapeHtml(projectName)}</title>
  <style>
    body {
      background-color: #0B1020;
      color: #F1F5F9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 32px 16px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      background: #111A2E;
      border: 1px solid #26334D;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    .metric-card {
      background: #0D1629;
      border: 1px solid #26334D;
      border-radius: 10px;
      padding: 12px 16px;
    }
    .metric-val {
      font-size: 24px;
      font-weight: bold;
      font-family: monospace;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <span style="background:rgba(124, 92, 252, 0.15); color:#7C5CFC; border:1px solid rgba(124, 92, 252, 0.3); padding:3px 8px; border-radius:6px; font-size:11px; font-weight:bold; font-family:monospace;">QA-AGENT AUDIT REPORT</span>
          <h1 style="margin:8px 0 4px 0; font-size:22px; color:#F1F5F9;">${escapeHtml(projectName)}</h1>
          <div style="color:#94A3B8; font-size:12px; font-family:monospace;">Target: ${escapeHtml(targetUrl)} &bull; Executed: ${executionDate}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; color:#64748B;">Runner Engine</div>
          <div style="font-family:monospace; color:#22D3EE; font-size:13px; font-weight:600;">${escapeHtml(data.run?.browser || 'Playwright Chromium')}</div>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div style="color:#94A3B8; font-size:11px;">PASS RATE</div>
          <div class="metric-val" style="color:${passRate >= 90 ? '#22C55E' : passRate >= 70 ? '#FBBF24' : '#F87171'};">${passRate}%</div>
        </div>
        <div class="metric-card">
          <div style="color:#94A3B8; font-size:11px;">TOTAL TESTS</div>
          <div class="metric-val" style="color:#F1F5F9;">${total}</div>
        </div>
        <div class="metric-card">
          <div style="color:#22C55E; font-size:11px;">PASSED</div>
          <div class="metric-val" style="color:#22C55E;">${passed}</div>
        </div>
        <div class="metric-card">
          <div style="color:#F87171; font-size:11px;">FAILED</div>
          <div class="metric-val" style="color:#F87171;">${failed}</div>
        </div>
      </div>
    </div>

    <h2 style="font-size:16px; font-weight:bold; color:#F1F5F9; margin-bottom:16px;">Test Execution Results (${(data.run?.results || []).length})</h2>
    ${resultsHtml || '<div style="color:#64748B; font-size:13px;">No execution results recorded.</div>'}

    <div style="text-align:center; margin-top:32px; color:#64748B; font-size:12px; font-family:monospace;">
      Generated by QA-Agent &bull; Production Test Intelligence Platform
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filenamePrefix}-${Date.now()}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
