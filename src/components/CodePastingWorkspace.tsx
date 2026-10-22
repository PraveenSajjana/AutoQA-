import React, { useState, useEffect } from 'react';
import { PastedSourceFile } from '../types/qa';
import { extractFilesFromZip } from '../services/zipExtractor';
import { 
  Code2, 
  Plus, 
  Trash2, 
  FileCode, 
  Upload, 
  FileArchive, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Layers, 
  Check, 
  Copy,
  Info
} from 'lucide-react';

interface CodePastingWorkspaceProps {
  files: PastedSourceFile[];
  onFilesChange: (files: PastedSourceFile[]) => void;
  activeFileId: string;
  onSelectActiveFile: (id: string) => void;
  onZipExtracted?: (filename: string, fileCount: number) => void;
}

export const SAMPLE_CODE_PRESETS = {
  reactAuth: {
    label: 'React Auth & Dashboard',
    description: 'Login form with validation, dashboard with metrics, and package manifest',
    files: [
      {
        name: 'LoginForm.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid business email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card" data-testid="login-container">
      <h2>Sign in to AutoQA Platform</h2>
      {error && <div className="alert-error" data-testid="login-error-alert">{error}</div>}
      <form onSubmit={handleSubmit} data-testid="login-form">
        <label htmlFor="login-email">Email Address</label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="input-email"
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="input-password"
        />

        <button type="submit" disabled={loading} data-testid="btn-submit-login">
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};`,
      },
      {
        name: 'Dashboard.tsx',
        language: 'typescript',
        content: `import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-root" data-testid="dashboard-view">
      <header className="dashboard-header">
        <h1 data-testid="welcome-heading">Welcome, Executive Admin</h1>
        <button data-testid="btn-logout" onClick={() => window.location.href = '/login'}>
          Sign Out
        </button>
      </header>
      <main className="metrics-grid">
        <div className="card" data-testid="metric-card-tests">
          <h3>Total Tests</h3>
          <span className="count">142</span>
        </div>
        <div className="card" data-testid="metric-card-pass-rate">
          <h3>Pass Rate</h3>
          <span className="count">99.4%</span>
        </div>
        <button data-testid="btn-run-suite" className="btn-primary">
          Run Full Suite
        </button>
      </main>
    </div>
  );
};`,
      },
      {
        name: 'package.json',
        language: 'json',
        content: `{
  "name": "enterprise-auth-portal",
  "version": "1.2.0",
  "private": true,
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.4.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "typescript": "^5.4.0",
    "vite": "^5.3.0"
  }
}`,
      },
    ],
  },
  ecomCart: {
    label: 'E-Commerce Cart & Stripe',
    description: 'Shopping cart drawer with discount coupon and Stripe checkout modal',
    files: [
      {
        name: 'CartDrawer.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';

export const CartDrawer: React.FC = () => {
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(149.00);

  const applyPromo = () => {
    if (coupon.trim().toUpperCase() === 'SAVE20') {
      setDiscount(20);
      setTotal(119.20);
    } else {
      alert('Invalid promo code');
    }
  };

  return (
    <aside className="cart-drawer" data-testid="cart-drawer">
      <h2>Your Cart (2 items)</h2>
      <div className="cart-item" data-testid="cart-item-1">
        <span>Ergonomic Keyboard</span>
        <span>$89.00</span>
      </div>
      <div className="promo-box">
        <input
          data-testid="coupon-code-input"
          placeholder="Promo code (try SAVE20)"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
        />
        <button data-testid="apply-coupon-btn" onClick={applyPromo}>
          Apply Promo
        </button>
      </div>
      {discount > 0 && <span data-testid="discount-badge">20% Discount Applied!</span>}
      <div className="cart-total" data-testid="cart-total">Total: \${total.toFixed(2)}</div>
      <button data-testid="checkout-btn" className="checkout-btn">
        Proceed to Checkout
      </button>
    </aside>
  );
};`,
      },
      {
        name: 'CheckoutModal.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';

export const CheckoutModal: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="checkout-modal" data-testid="checkout-modal">
      <h2>Payment & Shipping</h2>
      {submitted ? (
        <div data-testid="order-confirmation">Order Confirmed! Ref: #ORD-9842</div>
      ) : (
        <form onSubmit={handlePay} data-testid="checkout-form">
          <input
            data-testid="checkout-name"
            placeholder="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            data-testid="checkout-email"
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button data-testid="place-order-btn" type="submit">
            Authorize Payment
          </button>
        </form>
      )}
    </div>
  );
};`,
      },
      {
        name: 'package.json',
        language: 'json',
        content: `{
  "name": "nextgen-storefront",
  "version": "2.0.0",
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@stripe/stripe-js": "^2.4.0"
  }
}`,
      },
    ],
  },
  observeAi: {
    label: 'Observe.ai Conversation QA',
    description: 'Call interaction viewer, audio scrubber, and Auto-QA scoring evaluation',
    files: [
      {
        name: 'InteractionViewer.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';

export const InteractionViewer: React.FC = () => {
  const [search, setSearch] = useState('billing discrepancy');
  const [sentiment, setSentiment] = useState('frustrated');
  const [selectedCall, setSelectedCall] = useState<string | null>(null);

  return (
    <div className="observe-dashboard" data-testid="observe-root">
      <header className="filter-bar" data-testid="interaction-filter-bar">
        <input
          data-testid="search-interaction-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer calls..."
        />
        <select
          data-testid="sentiment-filter-select"
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value)}
        >
          <option value="frustrated">Frustrated</option>
          <option value="neutral">Neutral</option>
          <option value="positive">Positive</option>
        </select>
        <button data-testid="apply-interaction-filters-btn">Filter Calls</button>
      </header>

      <div data-testid="call-table-row-1" className="call-row">
        <span>Agent Sarah Chen</span>
        <span data-testid="call-sentiment-tag">Frustrated (-0.82)</span>
        <button data-testid="open-call-transcript-btn" onClick={() => setSelectedCall('#OBS-98214')}>
          Inspect Call
        </button>
      </div>

      {selectedCall && (
        <section data-testid="transcript-panel">
          <div data-testid="speaker-audio-scrubber">00:04:12 / 00:12:40</div>
          <p data-testid="transcript-dialogue-turn-1">Customer: I was billed twice.</p>
          <div data-testid="pci-redacted-token">[PCI-REDACTED-CARD: ****-****-****-9102]</div>
        </section>
      )}
    </div>
  );
};`,
      },
      {
        name: 'AutoQAScoring.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';

export const AutoQAScoring: React.FC = () => {
  const [published, setPublished] = useState(false);

  return (
    <div className="qa-score-card" data-testid="auto-qa-score-card">
      <h3>Automated Evaluation Rubric</h3>
      <div data-testid="auto-qa-overall-score" className="score">94 / 100</div>
      <div data-testid="compliance-pass-badge">PCI & TCPA Compliant</div>
      <button data-testid="publish-qa-evaluation-btn" onClick={() => setPublished(true)}>
        Publish Scorecard
      </button>
      {published && (
        <div data-testid="qa-evaluation-confirmed">Evaluation Published & Synced to Agent Scorecard</div>
      )}
    </div>
  );
};`,
      },
    ],
  },
  fastApiPython: {
    label: 'Python FastAPI Microservice',
    description: 'FastAPI REST backend with authentication endpoints and Pydantic models',
    files: [
      {
        name: 'main.py',
        language: 'python',
        content: `from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Payment & Customer API", version="1.0.0")

class LoginPayload(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    role: str

@app.post("/api/auth/login")
def login(payload: LoginPayload):
    if payload.username == "admin" and payload.password == "secret123":
        return {"access_token": "token_xyz_984", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.get("/api/users/me", response_model=UserProfile)
def get_current_user():
    return UserProfile(id="usr_123", email="admin@enterprise.io", role="qa_engineer")
`,
      },
      {
        name: 'requirements.txt',
        language: 'text',
        content: `fastapi>=0.110.0
uvicorn>=0.28.0
pydantic>=2.6.0
pytest>=8.0.0
httpx>=0.27.0
`,
      },
    ],
  },
};

export const detectLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'jsx':
      return 'javascript';
    case 'py':
      return 'python';
    case 'json':
      return 'json';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
    case 'scss':
      return 'css';
    case 'vue':
      return 'vue';
    case 'go':
      return 'go';
    case 'java':
      return 'java';
    case 'sql':
      return 'sql';
    case 'md':
      return 'markdown';
    default:
      return 'typescript';
  }
};

export const CodePastingWorkspace: React.FC<CodePastingWorkspaceProps> = ({
  files,
  onFilesChange,
  activeFileId,
  onSelectActiveFile,
  onZipExtracted,
}) => {
  const [isUnzipping, setIsUnzipping] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Helper to update current active file
  const updateActiveFile = (updates: Partial<PastedSourceFile>) => {
    if (!activeFile) return;
    const updated = files.map((f) => {
      if (f.id === activeFile.id) {
        const newObj = { ...f, ...updates };
        if (updates.name) {
          newObj.language = detectLanguage(updates.name);
        }
        if (updates.content !== undefined) {
          newObj.lineCount = updates.content.split('\n').length;
          newObj.sizeBytes = new Blob([updates.content]).size;
        }
        return newObj;
      }
      return f;
    });
    onFilesChange(updated);
  };

  const handleAddNewFile = () => {
    const defaultName = `Component${files.length + 1}.tsx`;
    const newFile: PastedSourceFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: defaultName,
      language: 'typescript',
      content: `// Paste source code for ${defaultName} here...\n\nexport const MyComponent = () => {\n  return <div>Component loaded</div>;\n};\n`,
      lineCount: 5,
      sizeBytes: 95,
    };
    onFilesChange([...files, newFile]);
    onSelectActiveFile(newFile.id);
  };

  const handleDeleteFile = (idToDelete: string) => {
    if (files.length <= 1) {
      alert('You must have at least one file in your codebase.');
      return;
    }
    const remaining = files.filter((f) => f.id !== idToDelete);
    onFilesChange(remaining);
    if (activeFileId === idToDelete) {
      onSelectActiveFile(remaining[0].id);
    }
  };

  const handleLoadPreset = (presetKey: keyof typeof SAMPLE_CODE_PRESETS) => {
    const preset = SAMPLE_CODE_PRESETS[presetKey];
    if (!preset) return;
    const loadedFiles: PastedSourceFile[] = preset.files.map((f, i) => ({
      id: `preset-${presetKey}-${i}-${Date.now()}`,
      name: f.name,
      language: f.language,
      content: f.content,
      lineCount: f.content.split('\n').length,
      sizeBytes: new Blob([f.content]).size,
    }));
    onFilesChange(loadedFiles);
    onSelectActiveFile(loadedFiles[0].id);
  };

  // ZIP Unpack Handler
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUnzipping(true);
      setZipError(null);
      const result = await extractFilesFromZip(file);

      if (!result.success || result.files.length === 0) {
        setZipError(result.error || 'No readable text or code files found in this ZIP archive.');
        return;
      }

      onFilesChange(result.files);
      onSelectActiveFile(result.files[0].id);
      if (onZipExtracted) {
        onZipExtracted(file.name, result.files.length);
      }
    } catch (err: any) {
      console.error('ZIP extraction error:', err);
      setZipError('Failed to read ZIP file: ' + (err.message || 'Corrupted archive'));
    } finally {
      setIsUnzipping(false);
      e.target.value = '';
    }
  };

  // Calculate total stats
  const totalLines = files.reduce((acc, f) => acc + f.lineCount, 0);
  const totalBytes = files.reduce((acc, f) => acc + f.sizeBytes, 0);
  const hasPackageJson = files.some((f) => f.name.toLowerCase() === 'package.json');
  const hasEntryPoint = files.some(
    (f) =>
      f.name.toLowerCase().includes('app') ||
      f.name.toLowerCase().includes('index') ||
      f.name.toLowerCase().includes('main')
  );

  return (
    <div className="space-y-4">
      {/* 1-Click Template Presets Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-semibold text-white">First time? Try a sample codebase preset:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(SAMPLE_CODE_PRESETS).map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleLoadPreset(key as any)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-white border border-slate-700/80 text-[11px] font-medium transition"
              title={p.description}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & File Manager Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
        {/* Top File Tabs Bar */}
        <div className="flex items-center justify-between bg-slate-950 px-3 pt-2 border-b border-slate-800 gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 min-w-0">
            {files.map((file) => {
              const isSelected = file.id === activeFile?.id;
              return (
                <div
                  key={file.id}
                  onClick={() => onSelectActiveFile(file.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs font-mono cursor-pointer transition border-t-2 select-none shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold border-indigo-500 shadow-sm'
                      : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="truncate max-w-[140px]">{file.name}</span>
                  {files.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 ml-1 p-0.5 rounded transition"
                      title="Remove file"
                    >
                      &times;
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleAddNewFile}
              className="flex items-center gap-1.5 px-3 py-1.5 ml-1 rounded-lg text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-dashed border-indigo-500/30 transition shrink-0"
              title="Add another source file"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add File</span>
            </button>
          </div>

          {/* Quick ZIP upload trigger */}
          <div className="flex items-center gap-2 pb-2 shrink-0">
            <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isUnzipping ? 'Unpacking...' : 'Upload ZIP'}</span>
              <input
                type="file"
                accept=".zip"
                onChange={handleZipUpload}
                disabled={isUnzipping}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Active File Header */}
        {activeFile && (
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-slate-400 font-mono">File Name:</span>
              <input
                type="text"
                value={activeFile.name}
                onChange={(e) => updateActiveFile({ name: e.target.value })}
                placeholder="e.g. LoginForm.tsx"
                className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full max-w-[260px]"
              />
              <select
                value={activeFile.language}
                onChange={(e) => updateActiveFile({ language: e.target.value })}
                className="bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-slate-300 text-xs font-mono cursor-pointer focus:outline-none"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="json">JSON</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="vue">Vue</option>
                <option value="go">Go</option>
                <option value="java">Java</option>
                <option value="sql">SQL</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="tabular-nums">{activeFile.lineCount} lines</span>
              <span>&bull;</span>
              <span className="tabular-nums">{(activeFile.sizeBytes / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        )}

        {/* Large Code Editor with Line Numbers */}
        {activeFile && (
          <div className="relative flex bg-slate-950 min-h-[340px] max-h-[480px] overflow-hidden">
            {/* Line numbers gutter */}
            <div className="w-12 bg-slate-950/80 border-r border-slate-800/80 py-3 pr-2.5 text-right font-mono text-xs text-slate-600 select-none overflow-hidden shrink-0">
              {Array.from({ length: Math.max(activeFile.lineCount, 1) }).map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code textarea */}
            <textarea
              value={activeFile.content}
              onChange={(e) => updateActiveFile({ content: e.target.value })}
              placeholder="Paste component code, router definitions, or package manifest here..."
              spellCheck={false}
              className="flex-1 bg-transparent text-slate-200 font-mono text-xs leading-6 p-3 focus:outline-none resize-none overflow-y-auto selection:bg-indigo-500/30 selection:text-indigo-200"
              style={{ tabSize: 2 }}
            />
          </div>
        )}

        {/* Codebase Health & Metadata Summary Bar */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span className="text-white font-bold">{files.length} Files</span>
            <span>&bull;</span>
            <span className="tabular-nums">{totalLines} Total Lines</span>
            <span>&bull;</span>
            <span className="tabular-nums">{(totalBytes / 1024).toFixed(1)} KB</span>
            <span>&bull;</span>
            <span className={hasPackageJson ? 'text-emerald-400' : 'text-amber-400'}>
              {hasPackageJson ? 'package.json found' : 'No package.json (inferred)'}
            </span>
            <span>&bull;</span>
            <span className={hasEntryPoint ? 'text-emerald-400' : 'text-indigo-400'}>
              {hasEntryPoint ? 'Entry point identified' : 'Modular component mode'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Preserves separate file names, routes, and component contracts.
          </div>
        </div>
      </div>

      {/* ZIP Upload Error Notification */}
      {zipError && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{zipError}</span>
        </div>
      )}

      {/* Direct Copy-Paste Limitation & Guidance Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-300">
            How AutoQA analyzes your pasted codebase:
          </div>
          <p className="leading-relaxed">
            AutoQA extracts React/Vue routes, form field locators, submission handlers, and API endpoints from your pasted source files. 
            For large repositories with 15+ files, use the <strong className="text-white">Upload ZIP</strong> button above to unpack your entire project archive in seconds.
          </p>
        </div>
      </div>
    </div>
  );
};
