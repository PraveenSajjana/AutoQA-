import React, { useState, useMemo } from 'react';
import { ApplicationAnalysis, TestCase, TestRun, RouteMetadata } from '../types/qa';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Eye, 
  HelpCircle,
  Filter
} from 'lucide-react';

interface ModuleCoverageVisualizerProps {
  analysis: ApplicationAnalysis;
  testCases: TestCase[];
  currentRun?: TestRun | null;
  onSelectModuleFilter?: (modulePath: string) => void;
}

interface ModuleCoverageMetric {
  name: string;
  path: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  totalElements: number;
  testCaseCount: number;
  coveredElements: number;
  recommendedCases: number;
  coveragePercentage: number;
  passedTests: number;
  failedTests: number;
  status: 'optimal' | 'moderate' | 'needs_attention';
}

const CRITICALITY_COLORS: Record<string, string> = {
  critical: '#f43f5e', // rose-500
  high: '#f59e0b',     // amber-500
  medium: '#6366f1',   // indigo-500
  low: '#10b981',      // emerald-500
};

const CATEGORY_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const ModuleCoverageVisualizer: React.FC<ModuleCoverageVisualizerProps> = ({
  analysis,
  testCases,
  currentRun,
  onSelectModuleFilter,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'donut' | 'radial'>('bar');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Compute coverage metrics per functional module (derived from analysis.routes & testCases)
  const moduleMetrics: ModuleCoverageMetric[] = useMemo(() => {
    return analysis.routes.map((route) => {
      // Find all test cases that target this route or its interactive element selectors
      const routeElements = route.interactiveElements.map((el) => el.selector.toLowerCase());
      
      const matchingTestCases = testCases.filter((tc) => {
        // Matches if a step navigates to this route
        const navigatesToRoute = tc.steps.some(
          (s) => s.action === 'navigate' && (s.target === route.path || s.target.endsWith(route.path))
        );
        // Matches if a step clicks/fills an element belonging to this route
        const usesRouteSelector = tc.steps.some((s) =>
          routeElements.some((re) => s.target.toLowerCase().includes(re))
        );
        // Or title/requirement matches route name
        const textMatch = tc.title.toLowerCase().includes(route.name.toLowerCase().split(' ')[0]);

        return navigatesToRoute || usesRouteSelector || textMatch;
      });

      // Count which specific interactive elements are targeted in test steps
      const coveredElementsCount = route.interactiveElements.filter((el) => {
        return testCases.some((tc) =>
          tc.steps.some((s) => s.target.toLowerCase().includes(el.selector.toLowerCase()))
        );
      }).length;

      // Recommended cases for this route from analysis or heuristic
      const recommended = Math.max(
        Math.ceil(route.interactiveElements.length * 0.75),
        route.criticality === 'critical' ? 3 : 2
      );

      // Percentage of coverage: weighted by tested elements and defined test cases
      const elementRatio = route.interactiveElements.length > 0 
        ? coveredElementsCount / route.interactiveElements.length 
        : 1;
      const caseRatio = Math.min(matchingTestCases.length / Math.max(recommended, 1), 1);
      const coveragePercentage = Math.round(((elementRatio * 0.6) + (caseRatio * 0.4)) * 100);

      // Pass/fail stats if execution run exists
      let passedTests = 0;
      let failedTests = 0;
      if (currentRun) {
        matchingTestCases.forEach((tc) => {
          const res = currentRun.results.find((r) => r.testId === tc.test_id);
          if (res?.status === 'passed') passedTests++;
          if (res?.status === 'failed') failedTests++;
        });
      }

      let status: 'optimal' | 'moderate' | 'needs_attention' = 'optimal';
      if (coveragePercentage < 50 || (route.criticality === 'critical' && matchingTestCases.length === 0)) {
        status = 'needs_attention';
      } else if (coveragePercentage < 80) {
        status = 'moderate';
      }

      return {
        name: route.name,
        path: route.path,
        criticality: route.criticality,
        totalElements: route.interactiveElements.length,
        testCaseCount: matchingTestCases.length,
        coveredElements: coveredElementsCount,
        recommendedCases: recommended,
        coveragePercentage,
        passedTests,
        failedTests,
        status,
      };
    });
  }, [analysis, testCases, currentRun]);

  // Overall Global Statistics
  const globalStats = useMemo(() => {
    const totalElements = moduleMetrics.reduce((sum, m) => sum + m.totalElements, 0);
    const coveredElements = moduleMetrics.reduce((sum, m) => sum + m.coveredElements, 0);
    const totalTests = testCases.length;
    const avgCoverage = moduleMetrics.length > 0
      ? Math.round(moduleMetrics.reduce((sum, m) => sum + m.coveragePercentage, 0) / moduleMetrics.length)
      : 0;

    const criticalModules = moduleMetrics.filter((m) => m.criticality === 'critical');
    const criticalCoverage = criticalModules.length > 0
      ? Math.round(criticalModules.reduce((sum, m) => sum + m.coveragePercentage, 0) / criticalModules.length)
      : 100;

    return {
      totalElements,
      coveredElements,
      totalTests,
      avgCoverage,
      criticalCoverage,
      elementCoveragePct: totalElements > 0 ? Math.round((coveredElements / totalElements) * 100) : 100,
    };
  }, [moduleMetrics, testCases]);

  // Data for Donut Chart (Coverage by Test Category)
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    testCases.forEach((tc) => {
      const cat = tc.category || 'functional';
      map[cat] = (map[cat] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name: name.replace('-', ' ').toUpperCase(),
      value,
    }));
  }, [testCases]);

  // Data for Radial Bar Chart
  const radialData = useMemo(() => {
    return moduleMetrics.map((m, idx) => ({
      name: m.name,
      coverage: m.coveragePercentage,
      fill: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));
  }, [moduleMetrics]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Functional Module Test Coverage Matrix
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Recharts Analysis View
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Application Module Verification &amp; Locator Coverage
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Real-time coverage correlation derived from Agent 1 Application Map and Agent 2 strict test cases.
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              chartType === 'bar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Modules Bar</span>
          </button>

          <button
            onClick={() => setChartType('donut')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              chartType === 'donut' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Category Ratio</span>
          </button>

          <button
            onClick={() => setChartType('radial')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              chartType === 'radial' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Radial Health</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Overall Module Coverage
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-white font-mono">
              {globalStats.avgCoverage}%
            </span>
            <span className={`text-[10px] font-bold ${globalStats.avgCoverage >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {globalStats.avgCoverage >= 80 ? 'Optimal' : 'Needs Expansion'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            Across {moduleMetrics.length} functional routes
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Critical Paths Guard
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-rose-400 font-mono">
              {globalStats.criticalCoverage}%
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">
              Verified
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            High-severity conversion flows
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Tested UI Locators
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-cyan-400 font-mono">
              {globalStats.coveredElements} / {globalStats.totalElements}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            {globalStats.elementCoveragePct}% interactive element reach
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Automated Test Cases
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-indigo-400 font-mono">
              {globalStats.totalTests}
            </span>
            <span className="text-[10px] text-indigo-300 font-mono">Cases</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            {testCases.filter((t) => t.status === 'approved').length} approved for run
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
        {/* CHART 1: Horizontal / Vertical Bar Chart */}
        {chartType === 'bar' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                Module Breakdown: Defined Test Cases vs Interactive UI Elements vs Coverage %
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Click any bar to inspect module
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={moduleMetrics}
                  margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length > 0) {
                      const mod = e.activePayload[0].payload;
                      setSelectedModule(mod.path);
                      if (onSelectModuleFilter) onSelectModuleFilter(mod.path);
                    }
                  }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'coveragePercentage') return [`${value}%`, 'Coverage Score'];
                      if (name === 'testCaseCount') return [value, 'Mapped Tests'];
                      if (name === 'totalElements') return [value, 'Interactive Locators'];
                      return [value, name];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(val) => {
                      if (val === 'coveragePercentage') return 'Coverage Score (%)';
                      if (val === 'testCaseCount') return 'Defined Test Cases';
                      if (val === 'totalElements') return 'Discovered Interactive Locators';
                      return val;
                    }}
                  />
                  <Bar
                    dataKey="testCaseCount"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    name="testCaseCount"
                  />
                  <Bar
                    dataKey="totalElements"
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                    name="totalElements"
                  />
                  <Bar
                    dataKey="coveragePercentage"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="coveragePercentage"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: Donut Pie Chart (Test Suite Category Distribution) */}
        {chartType === 'donut' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Test Category Distribution
              </div>
              <div className="space-y-2">
                {categoryData.map((cat, idx) => {
                  const pct = Math.round((cat.value / Math.max(testCases.length, 1)) * 100);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                        />
                        <span className="font-semibold text-slate-200">{cat.name}</span>
                      </div>
                      <div className="font-mono text-slate-400">
                        {cat.value} cases ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CHART 3: Radial Bar Chart (Module Health Comparison) */}
        {chartType === 'radial' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="90%"
                  barSize={12}
                  data={radialData}
                >
                  <RadialBar
                    background={{ fill: '#1e293b' }}
                    dataKey="coverage"
                    cornerRadius={6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Coverage Score']}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Module Health Index
              </div>
              {moduleMetrics.map((mod, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="font-medium text-white">{mod.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">{mod.path}</span>
                    <span className="font-bold text-emerald-400">{mod.coveragePercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Module Matrix Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider text-slate-300">
            Functional Route &amp; Locator Test Mapping ({moduleMetrics.length} Modules)
          </span>
          <span className="text-[11px] font-mono text-indigo-400">
            Automated Traceability Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                <th className="py-2.5 px-3">Module Name &amp; Route</th>
                <th className="py-2.5 px-3">Criticality</th>
                <th className="py-2.5 px-3 text-center">Interactive Locators</th>
                <th className="py-2.5 px-3 text-center">Associated Tests</th>
                <th className="py-2.5 px-3">Coverage Bar</th>
                <th className="py-2.5 px-3 text-right">Coverage %</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {moduleMetrics.map((mod, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-800/40 transition cursor-pointer ${
                    selectedModule === mod.path ? 'bg-indigo-500/10' : ''
                  }`}
                  onClick={() => {
                    setSelectedModule(mod.path);
                    if (onSelectModuleFilter) onSelectModuleFilter(mod.path);
                  }}
                >
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{mod.name}</div>
                    <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{mod.path}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        mod.criticality === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : mod.criticality === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {mod.criticality}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center font-mono text-slate-300">
                    <span className="text-cyan-400 font-bold">{mod.coveredElements}</span> / {mod.totalElements}
                  </td>

                  <td className="py-3 px-3 text-center font-mono">
                    <span className="text-white font-bold">{mod.testCaseCount}</span>
                    <span className="text-slate-500 text-[10px]"> (rec. ~{mod.recommendedCases})</span>
                  </td>

                  <td className="py-3 px-3 w-40">
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          mod.coveragePercentage >= 80
                            ? 'bg-emerald-500'
                            : mod.coveragePercentage >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${mod.coveragePercentage}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold">
                    <span
                      className={
                        mod.coveragePercentage >= 80
                          ? 'text-emerald-400'
                          : mod.coveragePercentage >= 50
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }
                    >
                      {mod.coveragePercentage}%
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    {mod.status === 'optimal' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Optimal
                      </span>
                    ) : mod.status === 'moderate' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" /> Needs Cases
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        <AlertTriangle className="w-3 h-3" /> Uncovered
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
