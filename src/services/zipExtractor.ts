import JSZip from 'jszip';
import { PastedSourceFile } from '../types/qa';

export const detectLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'py':
    case 'pyw':
      return 'python';
    case 'json':
      return 'json';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return 'css';
    case 'vue':
      return 'vue';
    case 'svelte':
      return 'svelte';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'java':
      return 'java';
    case 'kt':
    case 'kts':
      return 'kotlin';
    case 'swift':
      return 'swift';
    case 'c':
    case 'cpp':
    case 'cc':
    case 'h':
    case 'hpp':
      return 'cpp';
    case 'cs':
      return 'csharp';
    case 'php':
      return 'php';
    case 'rb':
      return 'ruby';
    case 'sql':
      return 'sql';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'toml':
      return 'toml';
    case 'xml':
    case 'svg':
      return 'xml';
    case 'sh':
    case 'bash':
    case 'zsh':
      return 'shell';
    case 'graphql':
    case 'gql':
      return 'graphql';
    default:
      return 'typescript';
  }
};

const IGNORED_PATH_SEGMENTS = [
  '__macosx',
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'out',
  'vendor',
  'venv',
  '.venv',
  'env',
  '__pycache__',
  'target',
  'coverage',
  '.idea',
  '.vscode',
  '.husky',
  'bin',
  'obj',
  '.turbo',
  '.cache'
];

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svgz',
  'pdf', 'zip', 'tar', 'gz', 'tgz', '7z', 'rar', 'bz2', 'xz',
  'exe', 'dll', 'so', 'dylib', 'bin', 'class', 'pyc', 'pyo', 'jar',
  'db', 'sqlite', 'sqlite3', 'woff', 'woff2', 'ttf', 'eot', 'otf',
  'mp3', 'mp4', 'wav', 'ogg', 'mov', 'avi', 'mkv', 'webm',
  'iso', 'dmg', 'app', 'ipa', 'apk', 'wasm', 'lock'
]);

export interface ZipExtractionResult {
  success: boolean;
  files: PastedSourceFile[];
  projectName?: string;
  detectedFramework?: string;
  totalBytes: number;
  totalLines: number;
  error?: string;
}

/**
 * Robustly unpacks a ZIP archive in the browser.
 * Cleans macOS __MACOSX resource forks, skips node_modules & binaries,
 * and extracts all text/code source files.
 */
export async function extractFilesFromZip(fileOrBuffer: File | ArrayBuffer | Blob): Promise<ZipExtractionResult> {
  try {
    let zip: JSZip;
    if (fileOrBuffer instanceof File || fileOrBuffer instanceof Blob) {
      const buffer = await fileOrBuffer.arrayBuffer();
      zip = await JSZip.loadAsync(buffer);
    } else {
      zip = await JSZip.loadAsync(fileOrBuffer);
    }

    const rawFiles: PastedSourceFile[] = [];
    const entries = Object.keys(zip.files);

    for (const relativePath of entries) {
      const zipEntry = zip.files[relativePath];
      if (zipEntry.dir) continue;

      const lower = relativePath.toLowerCase();

      // Skip directory noise, caches, and VCS
      if (IGNORED_PATH_SEGMENTS.some((seg) => lower.includes(seg))) {
        continue;
      }

      const segments = relativePath.split('/').filter(Boolean);
      const filename = segments.pop() || '';

      // Skip AppleDouble resource forks, DS_Store, and empty names
      if (
        !filename ||
        filename.startsWith('._') ||
        filename === '.DS_Store' ||
        filename.toLowerCase() === 'thumbs.db' ||
        filename.toLowerCase() === 'desktop.ini'
      ) {
        continue;
      }

      // Skip binary extensions
      const ext = filename.split('.').pop()?.toLowerCase() || '';
      if (BINARY_EXTENSIONS.has(ext)) {
        continue;
      }

      try {
        const content = await zipEntry.async('string');

        // Check if content appears to be binary by looking for null bytes
        if (content.length > 0 && content.slice(0, 400).includes('\0')) {
          continue;
        }

        const lines = content.split('\n');
        rawFiles.push({
          id: `zip-${Date.now()}-${rawFiles.length}-${Math.random().toString(36).substring(2, 6)}`,
          name: filename,
          path: relativePath,
          content,
          language: detectLanguage(filename),
          sizeBytes: new Blob([content]).size,
          lineCount: lines.length,
        });

        // Limit to 80 source files to keep DOM & memory lightweight
        if (rawFiles.length >= 80) break;
      } catch (readErr) {
        console.warn(`Could not read entry ${relativePath}:`, readErr);
      }
    }

    if (rawFiles.length === 0) {
      return {
        success: false,
        files: [],
        totalBytes: 0,
        totalLines: 0,
        error: 'No readable code or text files found in this ZIP archive. Please ensure it contains source code (e.g. .tsx, .jsx, .py, .js, .json).',
      };
    }

    // Sort files to put entry points first (package.json, App, main, index)
    rawFiles.sort((a, b) => {
      const aIsCore = a.name.toLowerCase().includes('package.json') || a.name.toLowerCase().includes('app') || a.name.toLowerCase().includes('index') || a.name.toLowerCase().includes('main');
      const bIsCore = b.name.toLowerCase().includes('package.json') || b.name.toLowerCase().includes('app') || b.name.toLowerCase().includes('index') || b.name.toLowerCase().includes('main');
      if (aIsCore && !bIsCore) return -1;
      if (!aIsCore && bIsCore) return 1;
      return a.name.localeCompare(b.name);
    });

    // Detect framework & project name from files
    let detectedName: string | undefined;
    let detectedFramework = 'Web Application';

    const pkgFile = rawFiles.find((f) => f.name.toLowerCase() === 'package.json');
    if (pkgFile) {
      try {
        const pkgData = JSON.parse(pkgFile.content);
        if (pkgData.name) detectedName = pkgData.name;
        const deps = { ...pkgData.dependencies, ...pkgData.devDependencies };
        if (deps.react || deps['react-dom']) detectedFramework = 'React (SPA)';
        if (deps.next) detectedFramework = 'Next.js';
        if (deps.vue) detectedFramework = 'Vue.js';
        if (deps.express) detectedFramework = 'Express / Node.js';
      } catch (_) {}
    }

    const combinedText = rawFiles.map((f) => f.content).join('\n');
    if (combinedText.includes('FastAPI(') || combinedText.includes('from fastapi')) {
      detectedFramework = 'Python FastAPI';
    } else if (combinedText.includes('import React') || combinedText.includes('useState')) {
      if (detectedFramework === 'Web Application') detectedFramework = 'React (SPA)';
    }

    const totalBytes = rawFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
    const totalLines = rawFiles.reduce((acc, f) => acc + f.lineCount, 0);

    return {
      success: true,
      files: rawFiles,
      projectName: detectedName,
      detectedFramework,
      totalBytes,
      totalLines,
    };
  } catch (err: any) {
    return {
      success: false,
      files: [],
      totalBytes: 0,
      totalLines: 0,
      error: `Failed to extract ZIP file: ${err.message || 'Archive may be corrupted or using unsupported compression.'}`,
    };
  }
}

/**
 * Creates an in-memory sample ZIP file containing a realistic React / Observe.ai application
 * so the user can test the ZIP upload flow with one click.
 */
export async function createSampleZipFile(type: 'observe' | 'react' = 'observe'): Promise<File> {
  const zip = new JSZip();

  if (type === 'observe') {
    zip.file('package.json', JSON.stringify({
      name: 'observe-ai-speech-qa',
      version: '2.4.0',
      description: 'Observe.ai contact center quality evaluation and speech analytics workspace',
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        '@observe/intelligence-sdk': '^3.2.0',
        tailwindcss: '^3.4.1'
      }
    }, null, 2));

    zip.file('src/App.tsx', `import React from 'react';
import { InteractionViewer } from './components/InteractionViewer';
import { AutoQAEvaluator } from './components/AutoQAEvaluator';

export default function App() {
  return (
    <div className="observe-platform" data-testid="observe-dashboard-root">
      <header className="navbar" data-testid="observe-nav">
        <h1>Observe.ai QA Platform</h1>
      </header>
      <main className="grid grid-cols-2 gap-4 p-4">
        <InteractionViewer />
        <AutoQAEvaluator />
      </main>
    </div>
  );
}`);

    zip.file('src/components/InteractionViewer.tsx', `import React, { useState } from 'react';

export const InteractionViewer: React.FC = () => {
  const [selectedCallId, setSelectedCallId] = useState('CALL-1049');
  const [filterSentiment, setFilterSentiment] = useState('negative');

  return (
    <div className="card" data-testid="interaction-viewer-card">
      <h2 data-testid="interaction-header">Call Recordings & Sentiment</h2>
      <div className="controls">
        <input 
          data-testid="search-agent-input" 
          placeholder="Filter by agent..." 
          defaultValue="Sarah Jenkins" 
        />
        <button data-testid="filter-negative-sentiment-btn" className="btn-filter">
          Flagged Calls
        </button>
      </div>
      <div data-testid="call-row-1049" className="call-item">
        <span>Call #1049 - Agent Sarah Jenkins</span>
        <span data-testid="sentiment-score-badge" className="badge-danger">Negative (-0.88)</span>
      </div>
      <div data-testid="audio-waveform-player" className="audio-player">
        <button data-testid="play-audio-btn">Play Call Audio</button>
        <span data-testid="redaction-badge-pci" className="pci-badge">PCI 1000Hz Tone Active</span>
      </div>
    </div>
  );
};`);

    zip.file('src/components/AutoQAEvaluator.tsx', `import React, { useState } from 'react';

export const AutoQAEvaluator: React.FC = () => {
  const [score, setScore] = useState(88);
  const [published, setPublished] = useState(false);

  return (
    <div className="card" data-testid="qa-evaluator-card">
      <h2>Supervisor Evaluation Scorecard</h2>
      <div className="metrics">
        <div data-testid="overall-score-display" className="score">{score} / 100</div>
        <button 
          data-testid="run-ai-evaluation-btn" 
          onClick={() => setScore(94)} 
          className="btn-primary"
        >
          Run AI Speech Analytics
        </button>
      </div>
      <button 
        data-testid="publish-scorecard-btn" 
        onClick={() => setPublished(true)}
        className="btn-success"
      >
        Publish Evaluation
      </button>
      {published && <div data-testid="publish-confirmed-badge">Evaluation Synced</div>}
    </div>
  );
};`);

    zip.file('README.md', `# Observe.ai QA Application
Source code archive for automated test design and Playwright execution verification.`);

    const blob = await zip.generateAsync({ type: 'blob' });
    return new File([blob], 'observe-ai-codebase.zip', { type: 'application/zip' });
  }

  // React Starter Project
  zip.file('package.json', JSON.stringify({
    name: 'acme-storefront-app',
    version: '1.0.0',
    dependencies: {
      react: '^18.3.0',
      'react-dom': '^18.3.0'
    }
  }, null, 2));

  zip.file('src/App.tsx', `import React from 'react';
export default function App() {
  return (
    <div data-testid="app-root">
      <h1 data-testid="app-title">Acme Storefront</h1>
      <button data-testid="cta-primary-btn">Get Started</button>
    </div>
  );
}`);

  const blob = await zip.generateAsync({ type: 'blob' });
  return new File([blob], 'acme-storefront.zip', { type: 'application/zip' });
}
