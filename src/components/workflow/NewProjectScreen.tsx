import React, { useState, useRef } from 'react';
import { Project, ProjectInputType, PastedSourceFile } from '../../types/qa';
import { extractFilesFromZip } from '../../services/zipExtractor';
import { 
  Globe, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  FolderGit2, 
  Upload, 
  FileArchive, 
  Code2, 
  Terminal, 
  CheckCircle2, 
  Info, 
  GitBranch, 
  FolderOpen 
} from 'lucide-react';

interface NewProjectScreenProps {
  onStartAnalysis: (projectData: Partial<Project>) => Promise<void> | void;
  isLoading: boolean;
  onCancel?: () => void;
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
    if (!parsed.hostname || (parsed.hostname.indexOf('.') === -1 && parsed.hostname !== 'localhost')) {
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
}) => {
  type IngestionTab = 'workspace' | 'local_folder' | 'zip_upload' | 'git_repo' | 'website_url';
  const [activeTab, setActiveTab] = useState<IngestionTab>('workspace');

  // Workspace Mode State
  const [workspaceCustomPath, setWorkspaceCustomPath] = useState<string>('');
  const [isScanningWorkspace, setIsScanningWorkspace] = useState<boolean>(false);
  const [workspaceScanSummary, setWorkspaceScanSummary] = useState<{
    appName: string;
    version: string;
    techStack: string[];
    filesCount: number;
    totalLines: number;
    routesCount: number;
    workspacePath: string;
  } | null>(null);

  // Local Folder Mode State
  const [folderPathInput, setFolderPathInput] = useState<string>('');
  const [uploadedFolderFiles, setUploadedFolderFiles] = useState<PastedSourceFile[]>([]);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // ZIP Upload Mode State
  const [isUnzipping, setIsUnzipping] = useState<boolean>(false);
  const [zipFileName, setZipFileName] = useState<string>('');
  const [zipExtractedFiles, setZipExtractedFiles] = useState<PastedSourceFile[]>([]);
  const [zipError, setZipError] = useState<string | null>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Git Repo Mode State
  const [gitUrlInput, setGitUrlInput] = useState<string>('https://github.com/facebook/react');
  const [isFetchingGit, setIsFetchingGit] = useState<boolean>(false);
  const [gitRepoInfo, setGitRepoInfo] = useState<{
    repo: string;
    techStack: string[];
    summary: string;
    packageJson?: any;
  } | null>(null);
  const [gitError, setGitError] = useState<string | null>(null);

  // Web URL Mode State
  const [urlInput, setUrlInput] = useState<string>('https://localhost:3000');
  const [projectName, setProjectName] = useState<string>('AutoQA Workspace Application');
  const [environment, setEnvironment] = useState<'staging' | 'production' | 'local'>('local');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [hasAuth, setHasAuth] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('qa.tester@example.com');
  const [password, setPassword] = useState<string>('QaPassword#2026');

  // Auto-probe active workspace on initial mount
  React.useEffect(() => {
    let isMounted = true;
    async function probeWorkspace() {
      try {
        const res = await fetch('/api/qa/scan-workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maxFiles: 80 }),
        });
        const data = await res.json();
        if (isMounted && data.success) {
          setWorkspaceScanSummary({
            appName: data.appName,
            version: data.version,
            techStack: data.techStack,
            filesCount: data.filesCount,
            totalLines: data.totalLines,
            routesCount: data.routes?.length || 0,
            workspacePath: data.workspacePath
          });
          setProjectName(data.appName);
        }
      } catch (e) {
        // quiet fallback
      }
    }
    probeWorkspace();
    return () => { isMounted = false; };
  }, []);

  // Handle Workspace Scan Submit
  const handleStartWorkspaceScan = async () => {
    setIsScanningWorkspace(true);
    try {
      const res = await fetch('/api/qa/scan-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customPath: workspaceCustomPath.trim() || undefined, maxFiles: 100 }),
      });
      const data = await res.json();
      if (data.success) {
        onStartAnalysis({
          name: data.appName || 'Scanned Repository Project',
          inputType: 'workspace_scan',
          localFolderPath: data.workspacePath,
          localFilesCount: data.filesCount,
          localFilesList: data.files?.map((f: any) => f.relativePath),
          detectedFramework: data.techStack?.[0] || 'Modern Web Framework',
          packageJsonData: data.packageJson,
          codebaseCoverageNotes: `Direct codebase inspection of ${data.workspacePath} (${data.filesCount} files, ${data.totalLines.toLocaleString()} LOC). Discovered ${data.routes?.length || 0} functional modules and ${data.serverEndpoints?.length || 0} server endpoints.`,
        });
      } else {
        // Fallback to analyze directly
        onStartAnalysis({
          name: 'Active Repository Codebase',
          inputType: 'workspace_scan',
          localFolderPath: workspaceCustomPath.trim() || undefined,
        });
      }
    } catch {
      onStartAnalysis({
        name: 'Active Repository Codebase',
        inputType: 'workspace_scan',
        localFolderPath: workspaceCustomPath.trim() || undefined,
      });
    } finally {
      setIsScanningWorkspace(false);
    }
  };

  // Handle ZIP File Upload
  const handleZipFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setZipFileName(file.name);
    setIsUnzipping(true);
    setZipError(null);

    try {
      const result = await extractFilesFromZip(file);
      if (!result.success || result.files.length === 0) {
        setZipError(result.error || 'No readable source code files found in archive.');
        setIsUnzipping(false);
        return;
      }

      setZipExtractedFiles(result.files);
      if (result.projectName) {
        setProjectName(result.projectName);
      }
    } catch (err: any) {
      setZipError(`Failed to unpack ZIP archive: ${err.message || 'Corrupted file'}`);
    } finally {
      setIsUnzipping(false);
    }
  };

  // Handle ZIP Submit
  const handleStartZipAnalysis = () => {
    if (zipExtractedFiles.length === 0) {
      setZipError('Please upload a ZIP archive containing source files first.');
      return;
    }

    onStartAnalysis({
      name: projectName.trim() || zipFileName.replace(/\.zip$/i, '') || 'Extracted Codebase',
      inputType: 'zip_upload',
      zipFileName,
      pastedFiles: zipExtractedFiles,
      localFilesCount: zipExtractedFiles.length,
      codebaseCoverageNotes: `Extracted ${zipExtractedFiles.length} source files from ${zipFileName}. Direct AST inspection active.`,
    });
  };

  // Handle Local Folder File Selection
  const handleFolderUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const parsed: PastedSourceFile[] = [];
    const maxFiles = 60;
    const allowed = new Set(['ts', 'tsx', 'js', 'jsx', 'json', 'html', 'css', 'py', 'go', 'rs', 'sql', 'md']);

    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (allowed.has(ext) && file.size < 500000) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string || '';
          parsed.push({
            id: `f-${Date.now()}-${i}`,
            name: file.name,
            path: (file as any).webkitRelativePath || file.name,
            language: ext === 'ts' || ext === 'tsx' ? 'typescript' : ext === 'py' ? 'python' : 'javascript',
            content,
            sizeBytes: file.size,
            lineCount: content.split('\n').length
          });
          if (parsed.length === Math.min(files.length, maxFiles)) {
            setUploadedFolderFiles([...parsed]);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  // Handle Folder Submit
  const handleStartFolderAnalysis = () => {
    if (folderPathInput.trim()) {
      onStartAnalysis({
        name: projectName.trim() || folderPathInput.split('/').pop() || 'Local Project Folder',
        inputType: 'local_folder',
        localFolderPath: folderPathInput.trim(),
        codebaseCoverageNotes: `Configured local directory: ${folderPathInput.trim()}`,
      });
      return;
    }

    if (uploadedFolderFiles.length > 0) {
      onStartAnalysis({
        name: projectName.trim() || 'Uploaded Project Folder',
        inputType: 'local_folder',
        pastedFiles: uploadedFolderFiles,
        localFilesCount: uploadedFolderFiles.length,
        codebaseCoverageNotes: `Uploaded ${uploadedFolderFiles.length} source files from local folder.`,
      });
      return;
    }

    // Default to scanning workspace
    handleStartWorkspaceScan();
  };

  // Handle Git Repository Fetch
  const handleFetchGitRepo = async () => {
    if (!gitUrlInput.trim()) {
      setGitError('Please enter a GitHub repository URL.');
      return;
    }

    setIsFetchingGit(true);
    setGitError(null);
    try {
      const res = await fetch('/api/qa/fetch-github-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: gitUrlInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setGitRepoInfo({
          repo: data.repo,
          techStack: data.techStack,
          summary: data.summary,
          packageJson: data.packageJson
        });
        setProjectName(data.repoName ? `${data.repoName} Project` : 'Git Repository Project');
      } else {
        setGitError(data.error || 'Failed to inspect Git repository.');
      }
    } catch (err: any) {
      setGitError(`Network error fetching repository: ${err.message}`);
    } finally {
      setIsFetchingGit(false);
    }
  };

  // Handle Git Submit
  const handleStartGitAnalysis = () => {
    onStartAnalysis({
      name: projectName.trim() || gitRepoInfo?.repo || 'Git Repository Project',
      inputType: 'git_repo',
      repositoryUrl: gitUrlInput.trim(),
      detectedFramework: gitRepoInfo?.techStack?.[0] || 'Git Project',
      packageJsonData: gitRepoInfo?.packageJson,
      codebaseCoverageNotes: gitRepoInfo?.summary || `Mapped repository ${gitUrlInput.trim()}`,
    });
  };

  // Handle URL Submit
  const handleStartUrlAnalysis = (e: React.FormEvent) => {
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
          <span>Step 1 of 4: Direct Codebase &amp; Project Ingestion</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
          Ingest &amp; Analyze Your Codebase
        </h1>
        <p className="text-sm text-[#94A3B8]">
          AutoQA Studio inspects your real repository, parses routes, AST components, and API endpoints, and synthesizes automation-ready Playwright tests.
        </p>
      </div>

      {/* Primary Ingestion Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-[#0E1528] border border-[#26334D] rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('workspace')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === 'workspace'
              ? 'bg-[#7C5CFC] text-white shadow-md'
              : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E]'
          }`}
        >
          <Terminal className="w-4 h-4 shrink-0 text-[#22D3EE]" />
          <span>Active Workspace</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('local_folder')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === 'local_folder'
              ? 'bg-[#7C5CFC] text-white shadow-md'
              : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E]'
          }`}
        >
          <FolderOpen className="w-4 h-4 shrink-0" />
          <span>Local Folder</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('zip_upload')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === 'zip_upload'
              ? 'bg-[#7C5CFC] text-white shadow-md'
              : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E]'
          }`}
        >
          <FileArchive className="w-4 h-4 shrink-0 text-[#22C55E]" />
          <span>ZIP Codebase</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('git_repo')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === 'git_repo'
              ? 'bg-[#7C5CFC] text-white shadow-md'
              : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E]'
          }`}
        >
          <FolderGit2 className="w-4 h-4 shrink-0 text-[#FBBF24]" />
          <span>Git Repository</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('website_url')}
          className={`col-span-2 sm:col-span-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === 'website_url'
              ? 'bg-[#7C5CFC] text-white shadow-md'
              : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E]'
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span>Web URL</span>
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-[#111A2E] border border-[#26334D] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* ======================================================== */}
        {/* TAB 1: ACTIVE WORKSPACE / VS CODE DIRECT REPOSITORY SCAN */}
        {/* ======================================================== */}
        {activeTab === 'workspace' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-[#22D3EE]" />
                  Direct Filesystem &amp; VS Code Workspace Scan
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Accesses this workspace repository directly from disk. Discovers package manifests, components, routes, and server endpoints without manual pasting.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[11px] font-mono font-semibold">
                Direct Disk Access
              </span>
            </div>

            {/* Live Detected Manifest Preview */}
            <div className="p-4 rounded-xl bg-[#0D1629] border border-[#26334D] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F1F5F9]">Detected Active Project</span>
                <span className="font-mono text-[#94A3B8]">{workspaceScanSummary?.workspacePath || '/app/applet'}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-[#111A2E] border border-[#26334D]/60">
                  <div className="text-[10px] text-[#64748B] uppercase font-mono">Application</div>
                  <div className="text-xs font-bold text-[#F1F5F9] truncate">{workspaceScanSummary?.appName || 'AutoQA Studio'}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#111A2E] border border-[#26334D]/60">
                  <div className="text-[10px] text-[#64748B] uppercase font-mono">Source Files</div>
                  <div className="text-xs font-bold text-[#22D3EE]">{workspaceScanSummary?.filesCount || 18} Scanned Files</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#111A2E] border border-[#26334D]/60">
                  <div className="text-[10px] text-[#64748B] uppercase font-mono">Volume</div>
                  <div className="text-xs font-bold text-[#F1F5F9]">{workspaceScanSummary?.totalLines ? `${workspaceScanSummary.totalLines.toLocaleString()} LOC` : '15,000+ LOC'}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#111A2E] border border-[#26334D]/60">
                  <div className="text-[10px] text-[#64748B] uppercase font-mono">Runner Engine</div>
                  <div className="text-xs font-bold text-[#22C55E]">Playwright E2E</div>
                </div>
              </div>

              {workspaceScanSummary?.techStack && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {workspaceScanSummary.techStack.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#172238] border border-[#26334D] text-[#9278FF]">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Custom Directory Path */}
            <div className="space-y-1.5">
              <label htmlFor="custom-workspace-input" className="text-xs font-semibold text-[#94A3B8]">
                Custom Workspace / Subdirectory Path (Optional)
              </label>
              <input
                id="custom-workspace-input"
                type="text"
                placeholder="Leave blank to scan root (/app/applet) or enter custom path"
                value={workspaceCustomPath}
                onChange={(e) => setWorkspaceCustomPath(e.target.value)}
                disabled={isLoading || isScanningWorkspace}
                className="w-full px-3.5 py-2.5 bg-[#0D1629] border border-[#26334D] rounded-xl text-xs font-mono text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
              />
            </div>

            {/* Submit Action */}
            <button
              type="button"
              onClick={handleStartWorkspaceScan}
              disabled={isLoading || isScanningWorkspace}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#7C5CFC] hover:bg-[#9278FF] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#7C5CFC]/30 transition"
            >
              {isLoading || isScanningWorkspace ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Scanning Workspace &amp; Discovering Routes...</span>
                </>
              ) : (
                <>
                  <span>Scan Active Workspace &amp; Generate Tests</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: LOCAL FOLDER / DIRECTORY */}
        {/* ======================================================== */}
        {activeTab === 'local_folder' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-[#9278FF]" />
                  Local Repository Directory
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Specify a local filesystem path or select a project directory using your browser.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="local-folder-path-input" className="text-xs font-semibold text-[#F1F5F9]">
                Local Folder Path
              </label>
              <input
                id="local-folder-path-input"
                type="text"
                placeholder="/home/user/projects/my-app or ./packages/web"
                value={folderPathInput}
                onChange={(e) => setFolderPathInput(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-[#0D1629] border border-[#26334D] rounded-xl text-xs font-mono text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
              />
            </div>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#26334D]"></div>
              </div>
              <span className="relative px-3 bg-[#111A2E] text-[11px] font-mono text-[#64748B] uppercase">
                Or Select Folder in Browser
              </span>
            </div>

            <div>
              <input
                ref={folderInputRef}
                type="file"
                // @ts-ignore
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderUploadChange}
                className="hidden"
                id="folder-input-picker"
              />
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-[#26334D] hover:border-[#7C5CFC] rounded-xl flex flex-col items-center justify-center gap-1.5 transition text-xs text-[#94A3B8] hover:text-[#F1F5F9] bg-[#0D1629]/50"
              >
                <FolderOpen className="w-6 h-6 text-[#7C5CFC]" />
                <span className="font-semibold">Browse and Select Project Folder</span>
                <span className="text-[10px] text-[#64748B]">Parses frontend components, AST locators, and package.json</span>
              </button>

              {uploadedFolderFiles.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-[#0D1629] border border-[#26334D] flex items-center justify-between text-xs">
                  <span className="text-[#22C55E] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Loaded {uploadedFolderFiles.length} source file(s)
                  </span>
                  <span className="font-mono text-[#94A3B8] text-[11px]">
                    {uploadedFolderFiles.reduce((acc, f) => acc + f.lineCount, 0).toLocaleString()} lines
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleStartFolderAnalysis}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#7C5CFC] hover:bg-[#9278FF] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#7C5CFC]/30 transition"
            >
              <span>Analyze Local Folder Codebase</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ZIP CODEBASE ARCHIVE UPLOAD */}
        {/* ======================================================== */}
        {activeTab === 'zip_upload' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                  <FileArchive className="w-5 h-5 text-[#22C55E]" />
                  ZIP Codebase Ingestion
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Upload a compressed ZIP archive containing your repository. Extracts files client-side, filters node_modules, and maps testable modules.
                </p>
              </div>
            </div>

            <input
              ref={zipInputRef}
              type="file"
              accept=".zip,application/zip"
              onChange={handleZipFileChange}
              className="hidden"
              id="zip-file-input"
            />

            <div
              onClick={() => zipInputRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-[#26334D] hover:border-[#22C55E] cursor-pointer rounded-xl flex flex-col items-center justify-center gap-2 transition text-xs text-[#94A3B8] hover:text-[#F1F5F9] bg-[#0D1629]/50 group"
            >
              <Upload className="w-8 h-8 text-[#22C55E] group-hover:scale-110 transition shrink-0" />
              <div className="text-center space-y-1">
                <div className="font-semibold text-sm text-[#F1F5F9]">
                  {zipFileName ? zipFileName : 'Click to Upload ZIP Codebase Archive'}
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Supports standard zip files (max 50MB uncompressed). macOS resource forks are automatically cleaned.
                </div>
              </div>
            </div>

            {isUnzipping && (
              <div className="p-3 rounded-lg bg-[#0D1629] border border-[#26334D] flex items-center justify-center gap-2 text-xs text-[#22D3EE]">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Unpacking archive and parsing source files...</span>
              </div>
            )}

            {zipError && (
              <div className="p-3 rounded-lg bg-[#F87171]/10 border border-[#F87171]/30 flex items-center gap-2 text-xs text-[#F87171]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{zipError}</span>
              </div>
            )}

            {zipExtractedFiles.length > 0 && (
              <div className="p-4 rounded-xl bg-[#0D1629] border border-[#22C55E]/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#22C55E] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Extracted {zipExtractedFiles.length} Source Files
                  </span>
                  <span className="font-mono text-[#94A3B8]">
                    {zipExtractedFiles.reduce((acc, f) => acc + f.lineCount, 0).toLocaleString()} Lines
                  </span>
                </div>
                <div className="text-[11px] text-[#94A3B8] truncate">
                  Files: {zipExtractedFiles.slice(0, 5).map(f => f.name).join(', ')}{zipExtractedFiles.length > 5 ? ` and ${zipExtractedFiles.length - 5} more` : ''}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleStartZipAnalysis}
              disabled={isLoading || zipExtractedFiles.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#22C55E]/20 transition"
            >
              <span>Ingest Unpacked Codebase &amp; Generate Tests</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: REMOTE GIT REPOSITORY (GITHUB) */}
        {/* ======================================================== */}
        {activeTab === 'git_repo' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-[#FBBF24]" />
                  Remote Git Repository
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Connect a public or private GitHub repository to inspect dependencies, package scripts, and architecture.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="git-repo-url-input" className="text-xs font-semibold text-[#F1F5F9]">
                GitHub / GitLab Repository URL
              </label>
              <div className="flex gap-2">
                <input
                  id="git-repo-url-input"
                  type="text"
                  placeholder="https://github.com/owner/repository"
                  value={gitUrlInput}
                  onChange={(e) => setGitUrlInput(e.target.value)}
                  disabled={isLoading || isFetchingGit}
                  className="flex-1 px-4 py-2.5 bg-[#0D1629] border border-[#26334D] rounded-xl text-xs font-mono text-[#F1F5F9] focus:outline-hidden focus:border-[#7C5CFC]"
                />
                <button
                  type="button"
                  onClick={handleFetchGitRepo}
                  disabled={isLoading || isFetchingGit}
                  className="px-4 py-2.5 bg-[#172238] hover:bg-[#26334D] border border-[#26334D] text-xs font-semibold text-[#F1F5F9] rounded-xl transition flex items-center gap-1.5 shrink-0"
                >
                  {isFetchingGit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitBranch className="w-3.5 h-3.5" />}
                  <span>Inspect Repo</span>
                </button>
              </div>
            </div>

            {gitError && (
              <div className="p-3 rounded-lg bg-[#F87171]/10 border border-[#F87171]/30 flex items-center gap-2 text-xs text-[#F87171]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gitError}</span>
              </div>
            )}

            {gitRepoInfo && (
              <div className="p-4 rounded-xl bg-[#0D1629] border border-[#FBBF24]/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#FBBF24] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Connected to {gitRepoInfo.repo}
                  </span>
                  <span className="font-mono text-[#94A3B8]">v{gitRepoInfo.packageJson?.version || '1.0.0'}</span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">{gitRepoInfo.summary}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleStartGitAnalysis}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#7C5CFC] hover:bg-[#9278FF] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#7C5CFC]/30 transition"
            >
              <span>Analyze Git Repository &amp; Generate Tests</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: WEB APPLICATION URL */}
        {/* ======================================================== */}
        {activeTab === 'website_url' && (
          <form onSubmit={handleStartUrlAnalysis} className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="target-url-input" className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#7C5CFC]" />
                  Application Web URL <span className="text-[#F87171]">*</span>
                </label>
                <span className="text-[11px] text-[#64748B]">HTTPS or HTTP supported</span>
              </div>

              <input
                id="target-url-input"
                type="text"
                placeholder="https://example.com or http://localhost:3000"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlError(null);
                }}
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-[#0D1629] border rounded-xl text-sm font-mono text-[#F1F5F9] placeholder-[#64748B] transition focus:outline-hidden ${
                  urlError 
                    ? 'border-[#F87171] focus:ring-1 focus:ring-[#F87171]' 
                    : 'border-[#26334D] focus:border-[#7C5CFC]'
                }`}
              />

              {urlError && (
                <div className="flex items-center gap-1.5 text-xs text-[#F87171] font-medium pt-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{urlError}</span>
                </div>
              )}
            </div>

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
                  <option value="local">Local Dev Server (localhost:3000)</option>
                  <option value="staging">Staging Sandbox (Recommended)</option>
                  <option value="production">Production URL (Read-only Assertions)</option>
                </select>
              </div>
            </div>

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
        )}

        {/* Safety & Persistence Disclosures */}
        <div className="p-4 rounded-xl bg-[#0E1528] border border-[#26334D] text-xs text-[#94A3B8] space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-[#22C55E]">
            <ShieldCheck className="w-4 h-4" />
            <span>Real Code Inspection &amp; Safe Execution</span>
          </div>
          <p className="leading-relaxed">
            AutoQA Studio performs non-destructive static analysis and DOM actionability mapping. Test runs use isolated headless Playwright browser contexts.
          </p>
        </div>
      </div>
    </div>
  );
};
