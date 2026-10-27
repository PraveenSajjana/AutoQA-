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
    case 'jsonc':
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
    case 'astro':
      return 'astro';
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
    case 'prisma':
      return 'prisma';
    default:
      return 'typescript';
  }
};

/**
 * Exact directory names to ignore during ZIP codebase unpacking.
 * Tested against directory segments only, NEVER matching substrings of filenames.
 */
const IGNORED_DIR_NAMES = new Set([
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
  '.output',
  'vendor',
  'venv',
  '.venv',
  'env',
  '.env',
  '__pycache__',
  'target',
  'coverage',
  '.idea',
  '.vscode',
  '.husky',
  'bin',
  'obj',
  '.turbo',
  '.cache',
  '.parcel-cache',
  '.yarn',
]);

/**
 * Known binary and non-code file extensions that should be skipped.
 */
const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'tiff', 'svgz',
  'pdf', 'zip', 'tar', 'gz', 'tgz', '7z', 'rar', 'bz2', 'xz',
  'exe', 'dll', 'so', 'dylib', 'bin', 'class', 'pyc', 'pyo', 'jar',
  'db', 'sqlite', 'sqlite3', 'woff', 'woff2', 'ttf', 'eot', 'otf',
  'mp3', 'mp4', 'wav', 'ogg', 'mov', 'avi', 'mkv', 'webm', 'flac', 'aac',
  'iso', 'dmg', 'app', 'ipa', 'apk', 'wasm', 'dat', 'lock', 'map'
]);

/**
 * Heavy lockfiles and minified files to skip to prevent browser choking.
 */
const SKIP_FILENAMES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'npm-shrinkwrap.json',
  'cargo.lock',
  'poetry.lock',
  'composer.lock',
  '.ds_store',
  'thumbs.db',
  'desktop.ini'
]);

export interface ZipExtractionResult {
  success: boolean;
  files: PastedSourceFile[];
  projectName?: string;
  detectedFramework?: string;
  totalBytes: number;
  totalLines: number;
  error?: string;
  skippedFilesCount?: number;
}

/**
 * Robustly unpacks a ZIP archive in the browser.
 * Cleans macOS __MACOSX resource forks, skips node_modules & binaries,
 * supports Windows backslashes, preserves directory hierarchy,
 * and extracts all readable source files.
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
    let skippedFilesCount = 0;

    for (const rawPath of entries) {
      const zipEntry = zip.files[rawPath];
      // Normalize slashes (handles Windows zip archives with backslashes)
      const cleanPath = rawPath.replace(/\\/g, '/').replace(/^\/+/, '');

      // Skip directory entries
      if (zipEntry.dir || cleanPath.endsWith('/')) {
        continue;
      }

      // Skip macOS resource forks & AppleDouble files
      if (cleanPath.startsWith('__MACOSX/') || cleanPath.includes('/__MACOSX/')) {
        continue;
      }

      const segments = cleanPath.split('/');
      const filename = segments.pop() || '';
      const filenameLower = filename.toLowerCase();

      // Skip empty filename or AppleDouble/hidden OS files
      if (!filename || filename.startsWith('._') || SKIP_FILENAMES.has(filenameLower)) {
        skippedFilesCount++;
        continue;
      }

      // Skip minified bundles
      if (filenameLower.endsWith('.min.js') || filenameLower.endsWith('.min.css')) {
        skippedFilesCount++;
        continue;
      }

      // Check directory segments against IGNORED_DIR_NAMES (exact match on folder name)
      const dirSegments = segments.map((s) => s.toLowerCase());
      const isInIgnoredFolder = dirSegments.some((dir) => IGNORED_DIR_NAMES.has(dir));
      if (isInIgnoredFolder) {
        skippedFilesCount++;
        continue;
      }

      // Skip binary extensions
      const ext = filename.split('.').pop()?.toLowerCase() || '';
      if (BINARY_EXTENSIONS.has(ext)) {
        skippedFilesCount++;
        continue;
      }

      try {
        const content = await zipEntry.async('string');

        // Check if content appears to be binary by looking for null bytes in initial chunk
        if (content.length > 0 && content.slice(0, 300).includes('\0')) {
          skippedFilesCount++;
          continue;
        }

        // Avoid ingesting giant files > 1.2MB into browser memory
        if (content.length > 1200000) {
          skippedFilesCount++;
          continue;
        }

        const lines = content.split('\n');
        rawFiles.push({
          id: `zip-${Date.now()}-${rawFiles.length}-${Math.random().toString(36).substring(2, 6)}`,
          name: filename,
          path: cleanPath,
          content,
          language: detectLanguage(filename),
          sizeBytes: new Blob([content]).size,
          lineCount: lines.length,
        });

        // Safe maximum limit of 150 source files to keep DOM and state responsive
        if (rawFiles.length >= 150) {
          break;
        }
      } catch (readErr) {
        console.warn(`Could not read entry ${cleanPath}:`, readErr);
        skippedFilesCount++;
      }
    }

    if (rawFiles.length === 0) {
      return {
        success: false,
        files: [],
        totalBytes: 0,
        totalLines: 0,
        skippedFilesCount,
        error: 'No readable code or text files found in this ZIP archive. Please ensure the archive contains standard source files (.tsx, .jsx, .ts, .js, .py, .html, .json) and is not empty or composed solely of binaries and node_modules.',
      };
    }

    // Sort files to put entry points first (package.json, App, main, index, routes)
    rawFiles.sort((a, b) => {
      const aLower = a.name.toLowerCase();
      const bLower = b.name.toLowerCase();
      const aScore = aLower === 'package.json' ? 100 :
        aLower.startsWith('app') ? 90 :
        aLower.startsWith('main') ? 85 :
        aLower.startsWith('index') ? 80 :
        aLower.includes('router') || aLower.includes('route') ? 70 : 10;
      const bScore = bLower === 'package.json' ? 100 :
        bLower.startsWith('app') ? 90 :
        bLower.startsWith('main') ? 85 :
        bLower.startsWith('index') ? 80 :
        bLower.includes('router') || bLower.includes('route') ? 70 : 10;
      if (aScore !== bScore) return bScore - aScore;
      return a.path && b.path ? a.path.localeCompare(b.path) : a.name.localeCompare(b.name);
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
        if (deps.svelte) detectedFramework = 'Svelte';
        if (deps.astro) detectedFramework = 'Astro';
      } catch (_) {}
    }

    // If no package.json name, check if all files share a common root folder prefix
    if (!detectedName && rawFiles.length > 0) {
      const firstPath = rawFiles[0].path || '';
      if (firstPath.includes('/')) {
        const candidateRoot = firstPath.split('/')[0];
        // Check if all files share this prefix
        const allShare = rawFiles.every((f) => (f.path || '').startsWith(candidateRoot + '/'));
        if (allShare && candidateRoot.length > 1 && !['src', 'app', 'public', 'pages', 'components'].includes(candidateRoot.toLowerCase())) {
          detectedName = candidateRoot.replace(/-master$|-main$/, '');
        }
      }
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
      skippedFilesCount,
    };
  } catch (err: any) {
    return {
      success: false,
      files: [],
      totalBytes: 0,
      totalLines: 0,
      error: `Failed to extract ZIP archive: ${err.message || 'The archive may be corrupted, password-protected, or using an unsupported compression method.'}`,
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
