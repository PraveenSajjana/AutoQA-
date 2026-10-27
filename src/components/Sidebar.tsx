import React from 'react';
import { AppNavigationSection, Project } from '../types/qa';
import { 
  LayoutDashboard, 
  FolderGit2, 
  CheckSquare, 
  PlayCircle, 
  Bug, 
  ListTree, 
  BarChart3, 
  Cpu, 
  Workflow, 
  Settings, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Sparkles,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentSection: AppNavigationSection;
  onSelectSection: (section: AppNavigationSection) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNewProject: () => void;
  currentProject: Project;
  allProjects: Project[];
  onSelectProject: (p: Project) => void;
  openDefectsCount: number;
  testCasesCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  collapsed,
  onToggleCollapsed,
  onNewProject,
  currentProject,
  allProjects,
  onSelectProject,
  openDefectsCount,
  testCasesCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = React.useState(false);

  const navItems: {
    section: AppNavigationSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { section: 'overview', label: 'Overview', icon: LayoutDashboard },
    { section: 'workflow', label: 'End-to-End QA', icon: Sparkles },
    { section: 'projects', label: 'Projects', icon: FolderGit2, badge: allProjects.length },
    { section: 'test-suites', label: 'Test Suites', icon: CheckSquare, badge: testCasesCount },
    { section: 'test-runs', label: 'Test Runs', icon: PlayCircle },
    { 
      section: 'defects', 
      label: 'Defects', 
      icon: Bug, 
      badge: openDefectsCount > 0 ? openDefectsCount : undefined,
      badgeColor: openDefectsCount > 0 ? 'bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/30' : undefined
    },
    { section: 'requirements', label: 'Requirements', icon: ListTree },
    { section: 'reports', label: 'Reports', icon: BarChart3 },
    { section: 'agent-activity', label: 'Agent Activity', icon: Cpu },
    { section: 'integrations', label: 'Integrations', icon: Workflow },
    { section: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (section: AppNavigationSection) => {
    onSelectSection(section);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-[#0E1528] border-r border-[#26334D] flex flex-col transition-all duration-200 select-none ${
          collapsed ? 'w-16' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & Workspace Header */}
        <div className="h-14 px-3.5 border-b border-[#26334D] flex items-center justify-between shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#7C5CFC]/20 border border-[#7C5CFC]/30 flex items-center justify-center text-[#7C5CFC] shrink-0 font-mono font-bold text-sm shadow-sm">
                QA
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-bold text-sm text-[#F1F5F9] tracking-tight">QA-Agent</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30 font-mono font-semibold">
                    v2.5
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] truncate mt-0.5">Autonomous Testing</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-[#7C5CFC]/20 border border-[#7C5CFC]/30 flex items-center justify-center text-[#7C5CFC] font-mono font-bold text-xs">
              QA
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex p-1.5 text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#111A2E] rounded-md transition"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace Context Switcher (Linear style) */}
        {!collapsed && (
          <div className="px-3 py-2.5 border-b border-[#26334D]/60 bg-[#0B1020]/40">
            <div className="relative">
              <button
                type="button"
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#111A2E] hover:bg-[#172238] border border-[#26334D] text-left transition text-xs group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                  <div className="truncate">
                    <span className="text-[#94A3B8] block text-[10px] font-mono leading-none">TARGET PROJECT</span>
                    <span className="text-[#F1F5F9] font-medium truncate block mt-0.5">{currentProject.name}</span>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform ${workspaceMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Workspace Dropdown */}
              {workspaceMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#111A2E] border border-[#26334D] rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono text-[#64748B] uppercase">Switch Target Project</div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {allProjects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectProject(p);
                          setWorkspaceMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-left transition ${
                          p.id === currentProject.id
                            ? 'bg-[#7C5CFC]/20 text-[#9278FF] font-semibold'
                            : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172238]'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {p.id === currentProject.id && <span className="text-[10px] text-[#22D3EE] font-mono">active</span>}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[#26334D] pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setWorkspaceMenuOpen(false);
                        onNewProject();
                      }}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-[#7C5CFC] hover:text-[#9278FF] hover:bg-[#7C5CFC]/10 rounded-lg transition font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Project...</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick New Project CTA */}
        <div className="p-3">
          <button
            type="button"
            onClick={onNewProject}
            className={`w-full flex items-center justify-center gap-2 py-2 bg-[#7C5CFC] hover:bg-[#9278FF] text-white rounded-lg text-xs font-semibold shadow-sm transition ${
              collapsed ? 'px-0' : 'px-3'
            }`}
            title="Create or Onboard New Project"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!collapsed && <span>New Project</span>}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.section;

            return (
              <button
                key={item.section}
                type="button"
                onClick={() => handleNavClick(item.section)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition group relative ${
                  isActive
                    ? 'bg-[#111A2E] text-[#F1F5F9] border border-[#26334D] shadow-xs'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E]/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {/* Active violet bar indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#7C5CFC] rounded-r" />
                )}

                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#7C5CFC]' : 'text-[#64748B] group-hover:text-[#94A3B8]'
                }`} />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                    item.badgeColor || 'bg-[#172238] text-[#94A3B8] border border-[#26334D]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Workspace Info Footer */}
        <div className="p-3 border-t border-[#26334D] bg-[#0B1020]/30 shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7C5CFC] to-[#22D3EE] flex items-center justify-center text-white text-[11px] font-bold font-mono shrink-0">
                  QA
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F1F5F9] truncate">Enterprise QA Squad</div>
                  <div className="text-[10px] text-[#64748B] truncate font-mono">Local Protected Mode</div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" title="Local Persistence Active" />
            </div>
          ) : (
            <div className="w-7 h-7 mx-auto rounded-full bg-gradient-to-tr from-[#7C5CFC] to-[#22D3EE] flex items-center justify-center text-white text-[11px] font-bold font-mono">
              Q
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
