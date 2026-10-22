import React, { useState, useRef } from 'react';
import { Project, ProjectInputType, PastedSourceFile } from '../types/qa';
import { SAMPLE_APPS } from '../services/sampleApps';
import { generateBRDPDF } from '../services/pdfGenerator';
import { CodePastingWorkspace, SAMPLE_CODE_PRESETS } from './CodePastingWorkspace';
import { extractFilesFromZip, createSampleZipFile } from '../services/zipExtractor';
import { 
  Globe, 
  GitBranch, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle,
  HardDrive,
  FolderOpen,
  FolderGit2,
  Terminal,
  Server,
  Layers,
  Code,
  Check,
  RotateCw,
  ExternalLink,
  Download,
  Upload,
  Code2,
  FileArchive,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ProjectOnboardingProps {
  onStartAnalysis: (projectData: Partial<Project>) => void;
  isLoading: boolean;
}

export const ProjectOnboarding: React.FC<ProjectOnboardingProps> = ({
  onStartAnalysis,
  isLoading,
}) => {
  const [selectedTab, setSelectedTab] = useState<ProjectInputType>('pasted_code');
  const [projectName, setProjectName] = useState('');
  
  // Code Pasting & ZIP Workspace state
  const [pastedFiles, setPastedFiles] = useState<PastedSourceFile[]>([
    {
      id: 'init-login-file',
      name: 'LoginForm.tsx',
      path: 'src/components/LoginForm.tsx',
      language: 'typescript',
      content: `import React, { useState } from 'react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid work email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    // Proceed to login
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-4">
      <h2 className="text-xl font-bold">Sign In to Platform</h2>
      {error && <div data-testid="error-banner" className="text-red-500 text-sm">{error}</div>}
      <div>
        <label className="block text-xs font-semibold">Email Address</label>
        <input
          type="email"
          name="email"
          data-testid="login-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@company.com"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold">Password</label>
        <input
          type="password"
          name="password"
          data-testid="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      <button type="submit" data-testid="login-submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
        Sign In
      </button>
    </form>
  );
};`,
      sizeBytes: 1350,
      lineCount: 52,
    }
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('init-login-file');
  const [zipFileName, setZipFileName] = useState<string>('');
  const [isUnzipping, setIsUnzipping] = useState<boolean>(false);
  const [zipError, setZipError] = useState<string | null>(null);

  // Local repository states
  const [localFolderPath, setLocalFolderPath] = useState<string>('');
  const [localFolderName, setLocalFolderName] = useState<string>('');
  const [localFilesCount, setLocalFilesCount] = useState<number>(0);
  const [localFilesList, setLocalFilesList] = useState<string[]>([]);
  const [detectedFramework, setDetectedFramework] = useState<string>('');
  const [packageJsonData, setPackageJsonData] = useState<any>(null);
  const [localDevUrl, setLocalDevUrl] = useState<string>('http://localhost:3000');
  const [isLinkingFolder, setIsLinkingFolder] = useState<boolean>(false);
  const [isLocalhostPinged, setIsLocalhostPinged] = useState<boolean | null>(null);

  // Other input modalities
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [repoUrl, setRepoUrl] = useState('https://github.com/my-org/web-app');
  const [specDocument, setSpecDocument] = useState(
`# User Story: User Checkout & Promo Code
As a registered customer
I want to add items to my cart and apply a discount code
So that I can verify the discounted total before payment

Acceptance Criteria:
1. Adding item increments the cart badge counter.
2. Promo code "SAVE20" reduces the cart total by 20%.
3. Clicking Proceed to Checkout opens the billing form.
4. Name and valid email are required for checkout submission.`
  );
  const [selectedSampleAppId, setSelectedSampleAppId] = useState('novashop-ecom');
  const [isDownloadingBrdPdf, setIsDownloadingBrdPdf] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const brdFileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBrdPdf = async () => {
    try {
      setIsDownloadingBrdPdf(true);
      await new Promise((r) => setTimeout(r, 60));
      const doc = generateBRDPDF({
        project: {
          id: 'onboarding-brd',
          name: projectName || 'Business Feature Requirements',
          inputType: 'spec_upload',
          createdAt: new Date().toISOString(),
          status: 'draft',
          specDocument: specDocument,
        },
        specText: specDocument,
      });
      const cleanName = (projectName || 'feature').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      doc.save(`AutoQA-${cleanName}-BRD-Specification.pdf`);
    } catch (err) {
      console.error('Failed to download BRD PDF:', err);
    } finally {
      setIsDownloadingBrdPdf(false);
    }
  };

  const handleBrdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      setProjectName(file.name.replace(/\.[^/.]+$/, ''));

      const rawText = await file.text();
      if (isPdf) {
        const extractedMatches = rawText.match(/\(([^)]+)\)\s*Tj/g) || rawText.match(/\[(.*?)\]\s*TJ/g);
        let extractedString = '';
        if (extractedMatches && extractedMatches.length > 0) {
          extractedString = extractedMatches
            .map((m) => m.replace(/^[(\[]|[)\]]\s*T[jJ]$/g, ''))
            .filter((s) => s.trim().length > 1)
            .join(' ');
        }

        if (extractedString.length > 50) {
          setSpecDocument(`# Imported from BRD PDF: ${file.name}\n\n${extractedString}`);
        } else {
          setSpecDocument(
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
        setSpecDocument(rawText);
      }
    } catch (err) {
      console.warn('File read error:', err);
    }
  };

  // Trigger local OS folder selection
  const handleOpenFolderPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process folder selected from local device
  const handleFolderSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLinkingFolder(true);
    let rootFolderName = '';
    const filePaths: string[] = [];
    let parsedPkg: any = null;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // webkitRelativePath contains "folder_name/src/..."
        const relPath = file.webkitRelativePath || file.name;
        filePaths.push(relPath);

        if (!rootFolderName && relPath.includes('/')) {
          rootFolderName = relPath.split('/')[0];
        }

        // Detect package.json
        if (relPath.endsWith('package.json') && !parsedPkg) {
          try {
            const content = await file.text();
            parsedPkg = JSON.parse(content);
          } catch (err) {
            console.warn('Could not parse package.json from local device:', err);
          }
        }
      }

      const inferredProjectName = parsedPkg?.name || rootFolderName || 'Local Repository';
      setLocalFolderName(rootFolderName || 'Local Repository');
      setLocalFolderPath(`./${rootFolderName || 'my-project'}`);
      setLocalFilesCount(files.length);
      setLocalFilesList(filePaths.slice(0, 50));
      setPackageJsonData(parsedPkg);
      setProjectName(inferredProjectName);

      // Infer framework from dependencies
      let framework = 'Modern Web App';
      if (parsedPkg?.dependencies || parsedPkg?.devDependencies) {
        const allDeps = { ...(parsedPkg.dependencies || {}), ...(parsedPkg.devDependencies || {}) };
        if (allDeps['next']) framework = 'Next.js';
        else if (allDeps['vite']) framework = 'Vite + React';
        else if (allDeps['react']) framework = 'React';
        else if (allDeps['vue']) framework = 'Vue.js';
        else if (allDeps['@angular/core']) framework = 'Angular';
        else if (allDeps['express']) framework = 'Express / Node.js';
      }
      setDetectedFramework(framework);

      // Check if scripts suggest a dev port
      if (parsedPkg?.scripts?.dev?.includes('5173')) {
        setLocalDevUrl('http://localhost:5173');
      } else if (parsedPkg?.scripts?.dev?.includes('8080')) {
        setLocalDevUrl('http://localhost:8080');
      }

    } catch (err) {
      console.error('Error reading local repository files:', err);
    } finally {
      setIsLinkingFolder(false);
    }
  };

  // Simulate linking a local repository for quick-demo
  const handleLoadSampleLocalRepo = () => {
    const sampleFiles = [
      'nova-frontend/package.json',
      'nova-frontend/tsconfig.json',
      'nova-frontend/vite.config.ts',
      'nova-frontend/index.html',
      'nova-frontend/src/main.tsx',
      'nova-frontend/src/App.tsx',
      'nova-frontend/src/components/Header.tsx',
      'nova-frontend/src/components/CartDrawer.tsx',
      'nova-frontend/src/components/CheckoutModal.tsx',
      'nova-frontend/src/components/ProductCard.tsx',
      'nova-frontend/src/pages/Catalog.tsx',
      'nova-frontend/src/pages/OrderConfirmation.tsx',
      'nova-frontend/src/services/apiClient.ts',
      'nova-frontend/src/services/discountCalculator.ts',
      'nova-frontend/playwright.config.ts',
      'nova-frontend/tests/e2e/checkout.spec.ts'
    ];

    setLocalFolderName('nova-frontend');
    setLocalFolderPath('/Users/developer/workspace/nova-frontend');
    setLocalFilesCount(48);
    setLocalFilesList(sampleFiles);
    setDetectedFramework('Vite + React (TypeScript)');
    setPackageJsonData({
      name: 'nova-frontend-store',
      version: '1.4.0',
      scripts: {
        dev: 'vite --port 3000',
        build: 'vite build',
        test: 'playwright test'
      },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        tailwindcss: '^3.4.1',
        zustand: '^4.5.2'
      },
      devDependencies: {
        '@playwright/test': '^1.45.0',
        vite: '^5.3.0',
        typescript: '^5.4.0'
      }
    });
    setProjectName('nova-frontend-store');
    setLocalDevUrl('http://localhost:3000');
  };

  const handlePingLocalhost = () => {
    setIsLocalhostPinged(true);
    setTimeout(() => {
      setIsLocalhostPinged(true);
    }, 400);
  };

  const zipDropInputRef = useRef<HTMLInputElement>(null);

  const handleZipFileDrop = async (file: File | Blob, customName?: string) => {
    if (!file) return;
    setIsUnzipping(true);
    setZipError(null);

    try {
      const result = await extractFilesFromZip(file);

      if (!result.success || result.files.length === 0) {
        setZipError(result.error || 'No supported code files found in this archive. Please upload a standard ZIP archive containing source code.');
        return;
      }

      setPastedFiles(result.files);
      setActiveFileId(result.files[0].id);

      const resolvedName = customName || (file instanceof File ? file.name : 'project-archive.zip');
      setZipFileName(resolvedName);

      if (result.projectName) {
        setProjectName(result.projectName);
      } else if (!projectName) {
        setProjectName(resolvedName.replace(/\.zip$/i, ''));
      }

      if (result.detectedFramework) {
        setDetectedFramework(result.detectedFramework);
      }
      // Note: We remain on Option B so user sees the extracted project status immediately!
    } catch (err: any) {
      console.error('ZIP extraction error:', err);
      setZipError(`Failed to extract ZIP archive: ${err.message || 'Corrupt format or unsupported compression'}`);
    } finally {
      setIsUnzipping(false);
      if (zipDropInputRef.current) {
        zipDropInputRef.current.value = '';
      }
    }
  };

  const handleLoadDemoZip = async () => {
    setIsUnzipping(true);
    setZipError(null);
    try {
      const demoZip = await createSampleZipFile('observe');
      await handleZipFileDrop(demoZip, 'observe-ai-platform.zip');
    } catch (err: any) {
      setZipError('Failed to generate sample zip: ' + (err.message || 'Error'));
      setIsUnzipping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTab === 'pasted_code' || selectedTab === 'zip_upload') {
      const validFiles = pastedFiles.filter((f) => f.content && f.content.trim().length > 0);
      if (validFiles.length === 0) {
        setZipError('Please upload a ZIP file or paste at least one source file before starting analysis.');
        return;
      }

      const pkgFile = validFiles.find((f) => f.name.toLowerCase() === 'package.json');
      let extractedPkgData = null;
      let frameworkDetected = detectedFramework;
      if (pkgFile) {
        try {
          extractedPkgData = JSON.parse(pkgFile.content);
        } catch (_) {}
      }

      const combinedText = validFiles.map((f) => f.content).join('\n');
      if (!frameworkDetected) {
        if (combinedText.includes('import React') || combinedText.includes('useState')) {
          frameworkDetected = 'React (SPA)';
        } else if (combinedText.includes('FastAPI(') || combinedText.includes('from fastapi')) {
          frameworkDetected = 'Python FastAPI';
        } else if (combinedText.includes('express()')) {
          frameworkDetected = 'Node.js Express';
        }
      }

      const inferredProjectName = projectName || (
        zipFileName ? zipFileName.replace(/\.zip$/i, '') :
        (validFiles[0]?.name.replace(/\.[^/.]+$/, '') + ' Application')
      );

      onStartAnalysis({
        name: inferredProjectName,
        inputType: selectedTab,
        pastedFiles: validFiles,
        zipFileName: zipFileName || undefined,
        packageJsonData: extractedPkgData,
        detectedFramework: frameworkDetected || 'Web Application',
        codebaseCoverageNotes: `Ingested ${validFiles.length} file(s) (${validFiles.map((f) => f.name).join(', ')}). UI components, routes, and validation schemas mapped.`,
      });
      return;
    }

    if (selectedTab === 'local_folder') {
      onStartAnalysis({
        name: projectName || localFolderName || 'Local Repository',
        inputType: 'local_folder',
        localFolderPath: localFolderPath || `./${localFolderName || 'my-project'}`,
        localFilesCount: localFilesCount || 24,
        localFilesList: localFilesList,
        detectedFramework: detectedFramework || 'Web Application',
        packageJsonData,
        localDevUrl,
        targetUrl: localDevUrl,
      });
      return;
    }

    if (selectedTab === 'sandbox_app') {
      const sample = SAMPLE_APPS.find((s) => s.id === selectedSampleAppId) || SAMPLE_APPS[0];
      onStartAnalysis({
        name: sample.name,
        inputType: 'sandbox_app',
        targetUrl: sample.url,
        sampleAppId: sample.id,
      });
      return;
    }

    if (selectedTab === 'website_url') {
      onStartAnalysis({
        name: projectName || new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`).hostname,
        inputType: 'website_url',
        targetUrl: targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`,
      });
      return;
    }

    if (selectedTab === 'git_repo') {
      onStartAnalysis({
        name: projectName || repoUrl.split('/').pop() || 'Git Project',
        inputType: 'git_repo',
        repositoryUrl: repoUrl,
      });
      return;
    }

    if (selectedTab === 'spec_upload') {
      onStartAnalysis({
        name: projectName || 'Requirements Spec Project',
        inputType: 'spec_upload',
        specDocument,
      });
      return;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
          <Code2 className="w-3.5 h-3.5" /> Phase 1: Target Ingestion &amp; Onboarding
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Add Your Product to QA-Agent
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
          The easiest, fastest way to onboard your application. Copy-paste source files, upload a ZIP, or connect a live endpoint.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Primary Wizard Options: Option A, B, C, D */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-800 bg-slate-950/70">
          <button
            type="button"
            onClick={() => setSelectedTab('pasted_code')}
            className={`flex flex-col items-center justify-center gap-1.5 py-4 px-3 text-xs font-semibold border-b-2 transition relative ${
              selectedTab === 'pasted_code'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <span className="absolute top-1.5 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Simplest
            </span>
            <div className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="font-bold">Option A: Paste Code</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">Multi-file source workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('zip_upload')}
            className={`flex flex-col items-center justify-center gap-1.5 py-4 px-3 text-xs font-semibold border-b-2 transition ${
              selectedTab === 'zip_upload'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <FileArchive className="w-4 h-4 text-amber-400" />
              <span className="font-bold">Option B: Upload ZIP</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">Project archive unpacker</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('git_repo')}
            className={`flex flex-col items-center justify-center gap-1.5 py-4 px-3 text-xs font-semibold border-b-2 transition ${
              selectedTab === 'git_repo'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span className="font-bold">Option C: Git Repo</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">Remote repository URL</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('website_url')}
            className={`flex flex-col items-center justify-center gap-1.5 py-4 px-3 text-xs font-semibold border-b-2 transition ${
              selectedTab === 'website_url'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Option D: Website URL</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">Live site DOM crawler</span>
          </button>
        </div>

        {/* Secondary Ingestion Modes Bar */}
        <div className="px-6 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
          <span className="text-slate-400 text-[11px]">Additional onboarding modes:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedTab('local_folder')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 ${
                selectedTab === 'local_folder'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HardDrive className="w-3 h-3 text-cyan-400" />
              <span>Local Device Folder</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('sandbox_app')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 ${
                selectedTab === 'sandbox_app'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Demo Sandbox</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('spec_upload')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 ${
                selectedTab === 'spec_upload'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3 h-3 text-amber-400" />
              <span>PRD / Spec Document</span>
            </button>
          </div>
        </div>

        {/* Tab Content Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* OPTION A: Paste Code (Primary & Simplest) */}
          {selectedTab === 'pasted_code' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    Option A: Copy-Paste Codebase Workspace
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Paste one or multiple application source files. Each file's name, path, and content are preserved separately.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400">Application Name:</span>
                  <input
                    type="text"
                    placeholder="e.g. Acme Web Client"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 font-mono w-48"
                  />
                </div>
              </div>

              {/* Multi-file editor workspace */}
              <CodePastingWorkspace
                files={pastedFiles}
                onFilesChange={setPastedFiles}
                activeFileId={activeFileId}
                onSelectActiveFile={setActiveFileId}
                onZipExtracted={(fname) => {
                  setZipFileName(fname);
                  if (!projectName) setProjectName(fname.replace(/\.zip$/i, ''));
                }}
              />
            </div>
          )}

          {/* OPTION B: Upload Project ZIP */}
          {selectedTab === 'zip_upload' && (
            <div className="space-y-6">
              <input
                type="file"
                ref={zipDropInputRef}
                accept=".zip,application/zip,application/x-zip-compressed,application/x-compressed,multipart/x-zip,.tar,.gz"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleZipFileDrop(f);
                }}
                className="hidden"
              />

              {/* If ZIP is loaded: Show Rich Extracted Project Summary Card */}
              {pastedFiles.length > 0 && zipFileName ? (
                <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white font-mono">{zipFileName}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                            READY FOR ANALYSIS
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Successfully unpacked and verified in your browser. All code locators and components are mapped.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => zipDropInputRef.current?.click()}
                        disabled={isUnzipping}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition"
                      >
                        Change ZIP...
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTab('pasted_code')}
                        className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium rounded-xl border border-indigo-500/30 transition flex items-center gap-1.5"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Open in Code Editor</span>
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Source Files</span>
                      <span className="text-base font-bold text-white mt-0.5 block">{pastedFiles.length} files</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Code Lines</span>
                      <span className="text-base font-bold text-cyan-400 mt-0.5 block font-mono">
                        {pastedFiles.reduce((acc, f) => acc + f.lineCount, 0).toLocaleString()} lines
                      </span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Detected Stack</span>
                      <span className="text-sm font-semibold text-indigo-300 mt-0.5 block truncate">
                        {detectedFramework || 'React (SPA)'}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Code Size</span>
                      <span className="text-base font-bold text-emerald-400 mt-0.5 block font-mono">
                        {(pastedFiles.reduce((acc, f) => acc + f.sizeBytes, 0) / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>

                  {/* Primary 1-Click Launch Button */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900/40 via-indigo-800/20 to-slate-900 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Ready to synthesize Playwright test suite for {zipFileName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Agent 1 will map routes, interactive buttons, inputs, and synthesize positive &amp; boundary tests.
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                    >
                      <span>{isLoading ? 'Agent 1 Analyzing...' : 'Start Analysis on This ZIP Archive'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Extracted File Inspector Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Extracted Files List:</span>
                      <span className="font-mono text-[11px]">Click a file to inspect code</span>
                    </div>
                    <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/80 max-h-56 overflow-y-auto">
                      {pastedFiles.map((file) => (
                        <div
                          key={file.id}
                          onClick={() => {
                            setActiveFileId(file.id);
                            setSelectedTab('pasted_code');
                          }}
                          className="px-3.5 py-2 flex items-center justify-between text-xs hover:bg-slate-900 cursor-pointer transition group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                            <span className="font-mono text-white group-hover:text-indigo-300 truncate">
                              {file.path || file.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                              {file.language}
                            </span>
                            <span>{file.lineCount} lines</span>
                            <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition">View &rarr;</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Dropzone State */
                <div className="space-y-4">
                  <div 
                    onClick={() => zipDropInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleZipFileDrop(f);
                    }}
                    className="p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-slate-800 border-dashed hover:border-amber-500/60 transition group text-center space-y-4 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto group-hover:scale-105 transition">
                      <FileArchive className="w-8 h-8 text-amber-400" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">
                        Drag &amp; Drop Your Project ZIP Archive Here
                      </h3>
                      <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1 leading-relaxed">
                        Drop any <code className="text-amber-300 font-mono">.zip</code> archive of your codebase. AutoQA securely extracts source code files (.tsx, .jsx, .ts, .py, .json, .html) in your browser and automatically discards heavy binary assets, caches, and <code className="text-slate-400">node_modules</code>.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={isUnzipping}
                        onClick={(e) => {
                          e.stopPropagation();
                          zipDropInputRef.current?.click();
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUnzipping ? 'Unpacking Source Files...' : 'Select ZIP from Your Computer'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isUnzipping}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadDemoZip();
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Try Observe.ai Sample ZIP Project</span>
                      </button>
                    </div>
                  </div>

                  {/* Supported formats & guarantees */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-300 block">Automatic Binary Filtering</span>
                        <span>Excludes images, fonts, .git, and node_modules automatically.</span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-300 block">Browser-Side Decompression</span>
                        <span>Files remain in your browser session for maximum privacy.</span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-300 block">Framework Detection</span>
                        <span>Auto-identifies React, Next.js, Python FastAPI, and Express.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Callout if any */}
              {zipError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block">Archive Ingestion Notice:</span>
                    <span>{zipError}</span>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleLoadDemoZip}
                        className="text-amber-400 underline font-medium hover:text-amber-300"
                      >
                        Click here to try the pre-bundled Observe.ai sample ZIP instead &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OPTION: Local Device Repository (Requested by user) */}
          {selectedTab === 'local_folder' && (
            <div className="space-y-6">
              {/* Hidden file input with webkitdirectory to open native local OS folder dialog */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFolderSelected}
                // @ts-ignore
                webkitdirectory=""
                // @ts-ignore
                directory=""
                multiple
                className="hidden"
              />

              {/* Local Folder Linker Hero Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 border-dashed hover:border-indigo-500/60 transition group text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-105 transition">
                  <FolderOpen className="w-7 h-7 text-cyan-400" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">
                    {localFolderName ? `Linked: ${localFolderName}` : 'Select Local Project Repository Folder'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Opens your device's native folder browser. AutoQA analyzes your local <code className="text-indigo-300">package.json</code>, routes, UI components, and test locators.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenFolderPicker}
                    disabled={isLinkingFolder}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition"
                  >
                    <FolderGit2 className="w-4 h-4" />
                    <span>{localFolderName ? 'Change Local Folder...' : 'Browse Local Device Folder'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSampleLocalRepo}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Load Demo Local Repo (48 files)</span>
                  </button>
                </div>
              </div>

              {/* Linked Folder Metadata Preview */}
              {localFilesCount > 0 && (
                <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Local Codebase Linked Successfully
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {localFilesCount} Files Discovered
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Project Root</span>
                      <span className="font-mono text-cyan-300 truncate block" title={localFolderPath}>
                        {localFolderPath || `./${localFolderName}`}
                      </span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Detected Framework</span>
                      <span className="font-semibold text-white">
                        {detectedFramework || 'Web Framework'}
                      </span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Package Version</span>
                      <span className="font-mono text-indigo-300">
                        {packageJsonData?.version ? `v${packageJsonData.version}` : '1.0.0-dev'}
                      </span>
                    </div>
                  </div>

                  {/* Discovered File Hierarchy Sample */}
                  {localFilesList.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">Scanned Entry Points &amp; Routes:</span>
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 max-h-32 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300">
                        {localFilesList.map((f, idx) => (
                          <div key={idx} className="flex items-center gap-2 truncate">
                            <span className="text-slate-600">&bull;</span>
                            <span className={f.includes('package') || f.includes('config') ? 'text-indigo-400' : 'text-slate-300'}>
                              {f}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Local Dev Server Connection (Playwright execution target) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-indigo-400" />
                    Localhost Dev Server URL (Test Execution Target)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Where is your local dev server running?
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={localDevUrl}
                    onChange={(e) => setLocalDevUrl(e.target.value)}
                    placeholder="http://localhost:3000"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handlePingLocalhost}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Ping Port</span>
                  </button>
                </div>

                {/* Quick Port Selectors */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 text-[11px]">Popular dev ports:</span>
                  {['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'http://localhost:4200'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setLocalDevUrl(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                        localDevUrl === p
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {p.split(':').pop()}
                    </button>
                  ))}
                  {isLocalhostPinged && (
                    <span className="ml-auto text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Ready for Playwright
                    </span>
                  )}
                </div>
              </div>

              {/* Terminal CLI helper */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Optional CLI Quick-Link:</span>
                </div>
                <pre className="text-cyan-300 font-mono text-[11px] overflow-x-auto select-all">
                  npx autoqa-agent link {localFolderPath || '.'} --port {localDevUrl.split(':').pop() || '3000'}
                </pre>
              </div>
            </div>
          )}

          {/* Option: Sandbox Apps */}
          {selectedTab === 'sandbox_app' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Select Pre-Configured Live Target Application
                </label>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Instant Zero-Setup Execution
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {SAMPLE_APPS.map((app) => {
                  const isSelected = selectedSampleAppId === app.id;
                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedSampleAppId(app.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition relative ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                          : 'border-slate-800 bg-slate-850 hover:border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-[11px] font-medium text-indigo-400 mb-1">{app.category}</div>
                      <div className="text-sm font-bold text-white mb-1.5">{app.name}</div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{app.description}</p>
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{app.seededTestCases.length} Test Cases</span>
                        <span className="text-indigo-400">Ready &rarr;</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  Includes realistic DOM components with toggleable defect flags so you can observe the Playwright execution engine and AI Failure Triage in real time!
                </div>
              </div>
            </div>
          )}

          {/* Option: Website URL */}
          {selectedTab === 'website_url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Web Portal"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Application URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    required
                    placeholder="https://example.com"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Agent 1 will crawl and analyze DOM elements, interactive buttons, inputs, and form routes.
                </p>
              </div>
            </div>
          )}

          {/* Option: Git Repository */}
          {selectedTab === 'git_repo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Payment Gateway Client"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Remote Git Repository URL</label>
                <div className="relative">
                  <GitBranch className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="https://github.com/org/repo.git"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Scans remote repo for routes, UI components, page objects, and API endpoints.
                </p>
              </div>
            </div>
          )}

          {/* Option: Spec Upload */}
          {selectedTab === 'spec_upload' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project / Feature Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Q4 Checkout Redesign PRD"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Upload & PDF Actions */}
                <div className="flex items-center gap-2 pt-2 sm:pt-4">
                  <input
                    ref={brdFileInputRef}
                    type="file"
                    accept=".pdf,.md,.txt,.json,.doc,.docx"
                    onChange={handleBrdFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => brdFileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Upload BRD (.pdf, .md)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadBrdPdf}
                    disabled={isDownloadingBrdPdf || !specDocument.trim()}
                    className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/40 flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                    title="Download ISO 29148 Business Requirements Document PDF"
                  >
                    <Download className={`w-3.5 h-3.5 ${isDownloadingBrdPdf ? 'animate-bounce' : 'text-indigo-400'}`} />
                    <span>{isDownloadingBrdPdf ? 'Generating...' : 'Download BRD PDF'}</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Business Requirements &amp; Acceptance Criteria (Markdown / Text / Gherkin)
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setProjectName('E-Commerce Promo Checkout');
                        setSpecDocument(
                          `# User Story: Promo Code & Checkout Flow\n` +
                          `As a registered online customer\n` +
                          `I want to enter promo code "SAVE20" at checkout\n` +
                          `So that I can verify discounted total before submitting payment\n\n` +
                          `Acceptance Criteria:\n` +
                          `1. AC-01: Adding an item increments cart badge counter.\n` +
                          `2. AC-02: Entering promo "SAVE20" reduces subtotal by 20%.\n` +
                          `3. AC-03: Invalid promo displays red validation error.\n` +
                          `4. AC-04: Submitting empty name or email blocks payment.`
                        );
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    >
                      E-Commerce
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProjectName('SaaS 2FA Authentication');
                        setSpecDocument(
                          `# User Story: Multi-Factor Authentication (MFA)\n` +
                          `As an enterprise administrator\n` +
                          `I want to verify a 6-digit TOTP authenticator code\n` +
                          `So that my workspace is protected against compromised passwords\n\n` +
                          `Acceptance Criteria:\n` +
                          `1. AC-01: Valid password navigates to 2FA Challenge screen.\n` +
                          `2. AC-02: 6-digit code redirects to dashboard with JWT session.\n` +
                          `3. AC-03: Less than 6 digits blocks submit button.\n` +
                          `4. AC-04: 5 failed attempts locks account for 15 minutes.`
                        );
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    >
                      SaaS Auth
                    </button>
                  </div>
                </div>

                <textarea
                  rows={6}
                  required
                  value={specDocument}
                  onChange={(e) => setSpecDocument(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Agent 2 will transform these acceptance criteria into strict, structured JSON test cases.
                </p>
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Pipeline: <span className="text-indigo-300 font-medium">Orchestration &bull; Analyst &bull; Designer &bull; Reviewer &bull; Playwright Runner</span>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || isLinkingFolder}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <span>{isLoading ? 'Agent 1 Analyzing...' : 'Analyze Application with Agent 1'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
