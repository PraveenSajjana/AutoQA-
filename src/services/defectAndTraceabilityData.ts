import { DefectTriage, TraceabilityRequirement, ApplicationAnalysis, TestCase } from '../types/qa';

/**
 * Initial empty defects state.
 * Defects are triaged dynamically from real Playwright test execution failures
 * and AI root-cause analysis, not hardcoded sample fixtures.
 */
export const INITIAL_DEFECTS: DefectTriage[] = [];

/**
 * Initial empty requirements state.
 * Requirements are synthesized dynamically from analyzed application features,
 * routes, and user specifications.
 */
export const INITIAL_TRACEABILITY_REQUIREMENTS: TraceabilityRequirement[] = [];

/**
 * Dynamically extract requirement traceability items from an analyzed application's
 * discovered features, routes, and test cases.
 */
export function createRequirementsFromAnalysis(
  analysis: ApplicationAnalysis,
  testCases: TestCase[] = []
): TraceabilityRequirement[] {
  if (analysis.discoveredFeatures && analysis.discoveredFeatures.length > 0) {
    return analysis.discoveredFeatures.map((f, idx) => {
      const code = `REQ-${(idx + 1).toString().padStart(3, '0')}`;
      const matchingTests = testCases.filter(
        (tc) =>
          tc.feature_id === f.id ||
          tc.title.toLowerCase().includes(f.name.toLowerCase()) ||
          (tc.module && tc.module.toLowerCase().includes(f.name.toLowerCase()))
      );
      return {
        id: `req-${f.id || idx + 1}`,
        code,
        title: f.name,
        description: f.description,
        module: f.name,
        priority: f.riskLevel === 'critical' ? 'critical' : f.riskLevel === 'high' ? 'high' : 'medium',
        status: matchingTests.length > 0 ? 'covered' : 'uncovered',
        testCaseIds: matchingTests.map((t) => t.test_id),
        defectIds: [],
        lastExecutionStatus: 'untested',
      };
    });
  }

  if (analysis.routes && analysis.routes.length > 0) {
    return analysis.routes.map((r, idx) => {
      const code = `REQ-RT-${(idx + 1).toString().padStart(3, '0')}`;
      const matchingTests = testCases.filter(
        (tc) =>
          (tc.module && tc.module.toLowerCase().includes(r.name.toLowerCase())) ||
          tc.title.toLowerCase().includes(r.name.toLowerCase())
      );
      return {
        id: `req-rt-${idx + 1}`,
        code,
        title: `${r.name} Flow`,
        description: r.description,
        module: r.name,
        priority: r.criticality === 'critical' ? 'critical' : r.criticality === 'high' ? 'high' : 'medium',
        status: matchingTests.length > 0 ? 'covered' : 'uncovered',
        testCaseIds: matchingTests.map((t) => t.test_id),
        defectIds: [],
        lastExecutionStatus: 'untested',
      };
    });
  }

  return [];
}
