import { 
  Project, 
  ApplicationAnalysis, 
  TestCase, 
  TestReviewFeedback, 
  TestRun, 
  QASummaryReport 
} from '../types/qa';
import { SAMPLE_APPS } from './sampleApps';

export interface ProjectSessionData {
  projectId: string;
  analysis: ApplicationAnalysis | null;
  testCases: TestCase[];
  reviewFeedbacks: Record<string, TestReviewFeedback>;
  currentRun: TestRun | null;
  summaryReport: QASummaryReport | null;
  currentStage: number;
  completedStages: number[];
  updatedAt: string;
}

const STORAGE_KEYS = {
  PROJECTS: 'autoqa_studio_projects_v1',
  ACTIVE_PROJECT_ID: 'autoqa_studio_active_proj_id_v1',
  SESSION_PREFIX: 'autoqa_studio_session_',
};

/**
 * Gets the initial default projects list from SAMPLE_APPS.
 */
export function getDefaultProjects(): Project[] {
  return SAMPLE_APPS.map((sa) => ({
    id: sa.id,
    name: sa.name,
    inputType: 'sandbox_app',
    targetUrl: sa.url,
    createdAt: new Date().toISOString(),
    status: 'tests_generated',
    sampleAppId: sa.id,
  }));
}

/**
 * Load all stored projects from localStorage.
 * Falls back to default sample projects if none are stored.
 */
export function loadStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      const defaults = getDefaultProjects();
      saveStoredProjects(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Could not load projects from localStorage:', err);
  }
  return getDefaultProjects();
}

/**
 * Save projects list to localStorage.
 */
export function saveStoredProjects(projects: Project[]): void {
  try {
    // Sanitize slightly to keep storage size optimal
    const serialized = JSON.stringify(projects);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, serialized);
  } catch (err) {
    console.warn('Could not save projects to localStorage (quota or disabled):', err);
  }
}

/**
 * Save active project ID.
 */
export function saveActiveProjectId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
  } catch (_) {}
}

/**
 * Load active project ID.
 */
export function loadActiveProjectId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
  } catch (_) {
    return null;
  }
}

/**
 * Load session data (analysis, testCases, reviews, runs) for a specific project.
 */
export function loadProjectSession(projectId: string): ProjectSessionData | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.SESSION_PREFIX}${projectId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Could not load session for project ${projectId}:`, err);
  }

  // If this is a sample project without a saved session, provide the sample defaults
  const sample = SAMPLE_APPS.find((s) => s.id === projectId);
  if (sample) {
    const defaultFeedback: Record<string, TestReviewFeedback> = {
      'ECOM-001': {
        testId: 'ECOM-001',
        verdict: 'approved',
        score: 98,
        notes: ['Valid full purchase journey', 'Deterministic assertions in place', 'Low selector drift probability'],
        selectorStabilityScore: 'high',
        assertionRigor: 'strong',
      },
      'ECOM-002': {
        testId: 'ECOM-002',
        verdict: 'approved',
        score: 94,
        notes: ['Financial discount math verified', 'Coupon input target exists in DOM'],
        selectorStabilityScore: 'high',
        assertionRigor: 'strong',
      },
      'ECOM-003': {
        testId: 'ECOM-003',
        verdict: 'approved',
        score: 92,
        notes: ['Negative validation barrier covered', 'Protects against empty payload submissions'],
        selectorStabilityScore: 'high',
        assertionRigor: 'strong',
      },
    };

    return {
      projectId,
      analysis: sample.analysis,
      testCases: sample.seededTestCases,
      reviewFeedbacks: defaultFeedback,
      currentRun: null,
      summaryReport: null,
      currentStage: 3,
      completedStages: [1, 2, 3],
      updatedAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Save or update session data for a specific project.
 */
export function saveProjectSession(
  projectId: string, 
  data: Partial<ProjectSessionData>
): void {
  try {
    const existing = loadProjectSession(projectId);
    const merged: ProjectSessionData = {
      projectId,
      analysis: data.analysis !== undefined ? data.analysis : existing?.analysis || null,
      testCases: data.testCases !== undefined ? data.testCases : existing?.testCases || [],
      reviewFeedbacks: data.reviewFeedbacks !== undefined ? data.reviewFeedbacks : existing?.reviewFeedbacks || {},
      currentRun: data.currentRun !== undefined ? data.currentRun : existing?.currentRun || null,
      summaryReport: data.summaryReport !== undefined ? data.summaryReport : existing?.summaryReport || null,
      currentStage: data.currentStage !== undefined ? data.currentStage : existing?.currentStage || 1,
      completedStages: data.completedStages !== undefined ? data.completedStages : existing?.completedStages || [1],
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `${STORAGE_KEYS.SESSION_PREFIX}${projectId}`, 
      JSON.stringify(merged)
    );
  } catch (err: any) {
    if (err.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded. Pruning older test runs to preserve essential data.');
      try {
        // Strip heavy run logs to fit within quota
        if (data.currentRun) {
          const lightweightRun = {
            ...data.currentRun,
            results: data.currentRun.results.map((r) => ({ ...r, logs: r.logs?.slice(-10) })),
          };
          const minimal = { ...data, currentRun: lightweightRun };
          localStorage.setItem(`${STORAGE_KEYS.SESSION_PREFIX}${projectId}`, JSON.stringify(minimal));
        }
      } catch (_) {}
    } else {
      console.warn(`Could not save session for project ${projectId}:`, err);
    }
  }
}

/**
 * Remove a project and its associated session data from storage.
 */
export function removeProjectFromStorage(projectId: string): void {
  try {
    const currentList = loadStoredProjects();
    const updated = currentList.filter((p) => p.id !== projectId);
    saveStoredProjects(updated);
    localStorage.removeItem(`${STORAGE_KEYS.SESSION_PREFIX}${projectId}`);
  } catch (err) {
    console.warn(`Error removing project ${projectId}:`, err);
  }
}

/**
 * Synchronize project data with the backend server API for persistent storage.
 */
export async function syncProjectToBackend(project: Project, sessionData?: Partial<ProjectSessionData>): Promise<void> {
  try {
    await fetch('/api/qa/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project,
        sessionData,
      }),
    });
  } catch (err) {
    // Non-blocking: client localStorage already preserves data locally
    console.warn('Backend project sync note:', err);
  }
}

/**
 * Fetch all projects from the backend server API.
 */
export async function fetchProjectsFromBackend(): Promise<Project[] | null> {
  try {
    const res = await fetch('/api/qa/projects');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.projects)) {
      return data.projects;
    }
  } catch (_) {}
  return null;
}
