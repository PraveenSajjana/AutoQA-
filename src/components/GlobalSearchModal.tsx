import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  CheckSquare, 
  Bug, 
  ListTree, 
  FolderGit2, 
  ArrowRight, 
  FileText,
  Sliders,
  Sparkles
} from 'lucide-react';
import { TestCase, DefectTriage, TraceabilityRequirement, Project, AppNavigationSection } from '../types/qa';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  testCases: TestCase[];
  defects: DefectTriage[];
  requirements: TraceabilityRequirement[];
  projects: Project[];
  onSelectTestCase: (testId: string) => void;
  onSelectDefect: (defectId: string) => void;
  onSelectRequirement: (reqId: string) => void;
  onSelectProject: (p: Project) => void;
  onNavigateSection: (section: AppNavigationSection) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  testCases,
  defects,
  requirements,
  projects,
  onSelectTestCase,
  onSelectDefect,
  onSelectRequirement,
  onSelectProject,
  onNavigateSection,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingTests = q ? testCases.filter((tc) => 
    tc.test_id.toLowerCase().includes(q) || 
    tc.title.toLowerCase().includes(q) ||
    tc.category?.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchingDefects = q ? defects.filter((d) => 
    d.id.toLowerCase().includes(q) || 
    d.testTitle.toLowerCase().includes(q) || 
    d.rootCauseAnalysis.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchingRequirements = q ? requirements.filter((r) => 
    r.code.toLowerCase().includes(q) || 
    r.title.toLowerCase().includes(q) || 
    r.module.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchingProjects = q ? projects.filter((p) => 
    p.name.toLowerCase().includes(q) || 
    p.detectedFramework?.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const quickNavItems: { label: string; section: AppNavigationSection; icon: any }[] = [
    { label: 'Overview Dashboard', section: 'overview', icon: Sliders },
    { label: 'Test Suites & Assertions', section: 'test-suites', icon: CheckSquare },
    { label: 'Playwright Execution Runner', section: 'test-runs', icon: Sparkles },
    { label: 'Defect Triage & Patches', section: 'defects', icon: Bug },
    { label: 'Traceability Matrix', section: 'requirements', icon: ListTree },
    { label: 'Executive QA Reports', section: 'reports', icon: FileText },
  ];

  const matchingNav = q ? quickNavItems.filter((item) => 
    item.label.toLowerCase().includes(q) || 
    item.section.toLowerCase().includes(q)
  ) : quickNavItems;

  const totalResults = matchingTests.length + matchingDefects.length + matchingRequirements.length + matchingProjects.length + (q ? matchingNav.length : 0);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#0E1528] border border-[#26334D] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="p-4 border-b border-[#26334D] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#7C5CFC] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search test cases, defects, requirements, projects, or views..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-[#64748B] hover:text-[#F1F5F9] rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[#172238] border border-[#26334D] text-[#64748B]">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {q && totalResults === 0 && (
            <div className="py-8 text-center text-xs text-[#64748B]">
              No items matching "{query}" found.
            </div>
          )}

          {/* Test Cases */}
          {matchingTests.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#7C5CFC]" /> Test Cases
              </div>
              {matchingTests.map((tc) => (
                <div
                  key={tc.test_id}
                  onClick={() => {
                    onSelectTestCase(tc.test_id);
                    onClose();
                  }}
                  className="p-2.5 rounded-lg bg-[#111A2E] hover:bg-[#172238] border border-[#26334D] flex items-center justify-between cursor-pointer transition"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-xs font-bold text-[#7C5CFC] mr-2">{tc.test_id}</span>
                    <span className="text-xs text-[#F1F5F9]">{tc.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Defects */}
          {matchingDefects.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-[#F87171]" /> Defects
              </div>
              {matchingDefects.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    onSelectDefect(d.id);
                    onClose();
                  }}
                  className="p-2.5 rounded-lg bg-[#111A2E] hover:bg-[#172238] border border-[#26334D] flex items-center justify-between cursor-pointer transition"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-xs font-bold text-[#F87171] mr-2">{d.id}</span>
                    <span className="text-xs text-[#F1F5F9]">{d.testTitle}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Requirements */}
          {matchingRequirements.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <ListTree className="w-3.5 h-3.5 text-[#22D3EE]" /> Requirements
              </div>
              {matchingRequirements.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    onSelectRequirement(r.id);
                    onClose();
                  }}
                  className="p-2.5 rounded-lg bg-[#111A2E] hover:bg-[#172238] border border-[#26334D] flex items-center justify-between cursor-pointer transition"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-xs font-bold text-[#22D3EE] mr-2">{r.code}</span>
                    <span className="text-xs text-[#F1F5F9]">{r.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Navigation Views */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              Navigation &amp; Views
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matchingNav.map((nav) => {
                const Icon = nav.icon;
                return (
                  <div
                    key={nav.section}
                    onClick={() => {
                      onNavigateSection(nav.section);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg bg-[#111A2E] hover:bg-[#172238] border border-[#26334D] flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-[#7C5CFC]" />
                      <span className="text-xs text-[#F1F5F9]">{nav.label}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-[#64748B]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-[#0B1020] border-t border-[#26334D] text-[11px] text-[#64748B] flex items-center justify-between">
          <span>Tip: Press ESC to exit search</span>
          <span className="font-mono">QA-Agent v2.5</span>
        </div>
      </div>
    </div>
  );
};
