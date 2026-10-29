import React, { useState } from 'react';
import { AppNavigationSection, Project, NotificationItem } from '../types/qa';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Plus, 
  Menu, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  HelpCircle,
  Terminal
} from 'lucide-react';

interface TopNavProps {
  currentSection: AppNavigationSection;
  currentProject: Project;
  allProjects: Project[];
  onSelectProject: (p: Project) => void;
  onNewProject: () => void;
  onScanWorkspace?: () => void;
  onOpenSearch: () => void;
  onOpenHowItWorks: () => void;
  onOpenMobileMenu: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  notifications: NotificationItem[];
  onDismissNotification: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentSection,
  currentProject,
  allProjects,
  onSelectProject,
  onNewProject,
  onScanWorkspace,
  onOpenSearch,
  onOpenHowItWorks,
  onOpenMobileMenu,
  isDarkMode,
  onToggleTheme,
  notifications,
  onDismissNotification,
  onMarkAllNotificationsRead,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const sectionLabels: Record<AppNavigationSection, string> = {
    overview: 'Overview',
    workflow: 'QA Workflow',
    projects: 'Projects',
    'test-suites': 'Test Suites',
    'test-runs': 'Test Execution',
    defects: 'Defects & Triage',
    requirements: 'Requirement Traceability',
    reports: 'QA Reports',
    'agent-activity': 'Agent Activity',
    integrations: 'Integrations',
    settings: 'Settings',
  };

  return (
    <header className="h-14 bg-[#0B1020]/90 border-b border-[#26334D] sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="p-1.5 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E] rounded-md md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#94A3B8] min-w-0 font-medium">
          <span className="hidden sm:inline hover:text-[#F1F5F9] cursor-pointer">QA-Agent</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#64748B] shrink-0 hidden sm:inline" />
          <span className="text-[#F1F5F9] font-semibold truncate">{sectionLabels[currentSection]}</span>
          {currentProject && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="text-[#7C5CFC] truncate font-mono text-[11px] hidden md:inline">
                {currentProject.name}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Right: Quick Tools & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0D1629] hover:bg-[#111A2E] border border-[#26334D] text-[#94A3B8] hover:text-[#F1F5F9] text-xs transition"
          title="Search test cases, defects, or projects (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#172238] border border-[#26334D] text-[#64748B]">
            ⌘K
          </kbd>
        </button>

        {/* How It Works Explainer */}
        <button
          type="button"
          onClick={onOpenHowItWorks}
          className="p-1.5 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E] rounded-lg transition"
          title="How QA-Agent works systematically"
        >
          <HelpCircle className="w-4 h-4 text-[#7C5CFC]" />
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E] rounded-lg transition"
          title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-[#FBBF24]" /> : <Moon className="w-4 h-4 text-[#7C5CFC]" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="View notifications"
            className="p-1.5 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111A2E] rounded-lg transition relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#7C5CFC] ring-2 ring-[#0B1020]" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#111A2E] border border-[#26334D] rounded-xl shadow-2xl p-3 z-50 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#26334D] pb-2">
                <span className="text-xs font-bold text-[#F1F5F9]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllNotificationsRead}
                    className="text-[11px] text-[#7C5CFC] hover:text-[#9278FF] font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#64748B] text-center py-4">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-lg text-xs border transition ${
                        n.read
                          ? 'bg-[#0B1020]/40 border-transparent text-[#94A3B8]'
                          : 'bg-[#172238] border-[#26334D] text-[#F1F5F9]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold">{n.title}</span>
                        <button
                          type="button"
                          onClick={() => onDismissNotification(n.id)}
                          className="text-[#64748B] hover:text-[#F1F5F9]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-[#64748B] font-mono mt-1 block">{n.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-[#26334D] hidden sm:block" />

        {/* Scan Workspace Quick CTA */}
        {onScanWorkspace && (
          <button
            type="button"
            onClick={onScanWorkspace}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111A2E] hover:bg-[#172238] border border-[#26334D] hover:border-[#22D3EE] text-[#F1F5F9] text-xs font-semibold rounded-lg transition shrink-0"
            title="Scan active repository codebase (/app/applet)"
          >
            <Terminal className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span className="hidden sm:inline">Scan Workspace</span>
          </button>
        )}

        {/* Primary "+ New Project" CTA */}
        <button
          type="button"
          onClick={onNewProject}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7C5CFC] hover:bg-[#9278FF] text-white text-xs font-semibold rounded-lg shadow-sm transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Project</span>
        </button>
      </div>
    </header>
  );
};
