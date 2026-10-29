import { TestCase, ApplicationAnalysis } from '../types/qa';

export interface SampleAppDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  mockHtml: string;
  defaultDefectMode?: 'none' | 'product_bug' | 'flaky_selector' | 'network_timeout';
  analysis: ApplicationAnalysis;
  seededTestCases: TestCase[];
}

/**
 * Hardcoded projects have been removed as per requirement.
 * All projects are now dynamically created by analyzing user-supplied code (Workspace, Folder, ZIP, Git, URL).
 */
export const SAMPLE_APPS: SampleAppDefinition[] = [];
