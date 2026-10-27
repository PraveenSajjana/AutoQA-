import React, { useState } from 'react';
import { 
  Workflow, 
  Copy, 
  Check, 
  Terminal, 
  GitBranch, 
  Send, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Code2
} from 'lucide-react';
import { Project } from '../types/qa';

interface IntegrationsViewProps {
  currentProject: Project;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ currentProject }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const githubActionYaml = `name: QA-Agent Automated Regression

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  qa-agent-e2e:
    timeout-minutes: 15
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps chromium

    - name: Run QA-Agent Synthetic Suite
      env:
        QA_AGENT_PROJECT_ID: '${currentProject.id}'
        TARGET_URL: '${currentProject.targetUrl || 'http://localhost:3000'}'
      run: npx qa-agent run --project=${currentProject.id} --reporter=html,json

    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: qa-agent-playwright-report
        path: playwright-report/
        retention-days: 14
`;

  const cliSnippet = `# Run the generated test cases headlessly
npx qa-agent run --project=${currentProject.id} --browser=chromium

# Run with interactive Playwright Inspector UI
npx qa-agent run --project=${currentProject.id} --ui

# Export verified Playwright spec files to local tests directory
npx qa-agent export --out=./tests/e2e/`;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26334D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
              CI/CD &amp; Developer Integrations
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
              Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Incorporate synthesized Playwright suites into your GitHub Actions, GitLab CI, or local terminal workflows.
          </p>
        </div>
      </div>

      {/* GitHub Actions Integration Card */}
      <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#7C5CFC]/20 border border-[#7C5CFC]/30 flex items-center justify-center text-[#7C5CFC]">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#F1F5F9]">GitHub Actions Workflow (.github/workflows/qa.yml)</h3>
              <p className="text-xs text-[#64748B]">Trigger regression suite on every pull request</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(githubActionYaml, 'gha')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1629] border border-[#26334D] text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition"
          >
            {copiedKey === 'gha' ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'gha' ? 'Copied YAML' : 'Copy Workflow'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-[#0D1629] border border-[#26334D] text-xs font-mono text-[#94A3B8] overflow-x-auto leading-relaxed">
          <code>{githubActionYaml}</code>
        </pre>
      </div>

      {/* CLI Runner Snippet */}
      <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#22D3EE]/20 border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#F1F5F9]">Local Terminal &amp; Playwright CLI Commands</h3>
              <p className="text-xs text-[#64748B]">Execute tests locally in headless or UI debug mode</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(cliSnippet, 'cli')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1629] border border-[#26334D] text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition"
          >
            {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'cli' ? 'Copied Commands' : 'Copy Commands'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-[#0D1629] border border-[#26334D] text-xs font-mono text-[#22D3EE] overflow-x-auto leading-relaxed">
          <code>{cliSnippet}</code>
        </pre>
      </div>

      {/* Webhook & Slack Alert Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#111A2E] border border-[#26334D] space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm text-[#F1F5F9]">Slack &amp; Discord Alerts</div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
              Active
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Receive automated failure alerts with triage root-cause summaries directly in your engineering release channel.
          </p>
          <input
            type="text"
            readOnly
            value="https://hooks.slack.com/services/T00/B00/qa-agent-webhook"
            aria-label="Slack Webhook URL"
            className="w-full px-3 py-2 bg-[#0D1629] border border-[#26334D] rounded-lg text-xs font-mono text-[#64748B]"
          />
        </div>

        <div className="p-5 rounded-2xl bg-[#111A2E] border border-[#26334D] space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm text-[#F1F5F9]">Jira / Linear Issue Sync</div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30">
              Connected
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Confirmed defects automatically file typed Linear or Jira tickets with steps to reproduce and stack trace evidence.
          </p>
          <div className="text-xs text-[#64748B] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Workspace: linear.app/qa-agent-team</span>
          </div>
        </div>
      </div>
    </div>
  );
};
