import React from 'react';
import { Project, AppNavigationSection } from '../types/qa';
import { 
  FolderGit2, 
  Plus, 
  ExternalLink, 
  Globe, 
  FileCode, 
  Archive, 
  Layers, 
  Trash2, 
  Check, 
  Play, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  currentProject: Project;
  onSelectProject: (p: Project) => void;
  onNewProject: () => void;
  onDeleteProject?: (projectId: string) => void;
  onNavigateSection: (section: AppNavigationSection) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onNavigateSection,
}) => {
  const getInputTypeBadge = (type: Project['inputType']) => {
    switch (type) {
      case 'website_url':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
            <Globe className="w-3 h-3" /> Live URL
          </span>
        );
      case 'zip_upload':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30">
            <Archive className="w-3 h-3" /> ZIP Archive
          </span>
        );
      case 'git_repo':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30">
            <FolderGit2 className="w-3 h-3" /> Git Repo
          </span>
        );
      case 'pasted_code':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
            <FileCode className="w-3 h-3" /> Pasted Code
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#172238] text-[#94A3B8]">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26334D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
              Applications &amp; Projects
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#7C5CFC]/15 text-[#9278FF] border border-[#7C5CFC]/30">
              {projects.length} Registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Manage test targets, switch active workspaces, and onboard new applications via live URL, ZIP bundle, or Git repository.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewProject}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#7C5CFC] hover:bg-[#9278FF] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#7C5CFC]/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Test a New Application</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => {
          const isActive = project.id === currentProject.id;
          return (
            <div
              key={project.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                isActive
                  ? 'bg-[#172238] border-[#7C5CFC] ring-1 ring-[#7C5CFC]/40 shadow-lg shadow-[#7C5CFC]/10'
                  : 'bg-[#111A2E] border-[#26334D] hover:border-[#7C5CFC]/50 hover:bg-[#172238]/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  {getInputTypeBadge(project.inputType)}
                  {isActive && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#22C55E]">
                      <Check className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#F1F5F9] leading-snug">
                    {project.name}
                  </h3>
                  {project.targetUrl && (
                    <p className="text-xs font-mono text-[#64748B] truncate mt-1">
                      {project.targetUrl}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.detectedFramework && (
                    <span className="px-2 py-0.5 rounded bg-[#0D1629] text-[10px] font-mono text-[#94A3B8] border border-[#26334D]">
                      {project.detectedFramework}
                    </span>
                  )}
                  {project.zipFileName && (
                    <span className="px-2 py-0.5 rounded bg-[#0D1629] text-[10px] font-mono text-[#94A3B8] border border-[#26334D]">
                      {project.zipFileName}
                    </span>
                  )}
                  {project.pastedFiles && (
                    <span className="px-2 py-0.5 rounded bg-[#0D1629] text-[10px] font-mono text-[#94A3B8] border border-[#26334D]">
                      {project.pastedFiles.length} files
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-5 mt-4 border-t border-[#26334D]/60 flex items-center justify-between gap-2">
                {isActive ? (
                  <button
                    type="button"
                    onClick={() => onNavigateSection('test-suites')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#7C5CFC] hover:bg-[#9278FF] text-white font-semibold text-xs transition"
                  >
                    <span>View Test Suite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#0D1629] hover:bg-[#111A2E] text-[#F1F5F9] border border-[#26334D] font-medium text-xs transition text-center"
                  >
                    Select Project
                  </button>
                )}

                {onDeleteProject && projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteProject(project.id)}
                    className="p-2 text-[#64748B] hover:text-[#F87171] hover:bg-[#F87171]/10 rounded-lg transition"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
