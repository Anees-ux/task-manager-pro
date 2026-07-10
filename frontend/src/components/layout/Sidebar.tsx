import { useState } from 'react';
import type { Project, CreateProjectRequest } from '../../types/project';
import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline';
import Modal from '../common/Modal';

interface SidebarProps {
  projects: Project[];
  selectedProjectId: number | null;
  onSelectProject: (id: number | null) => void;
  onCreateProject: (request: CreateProjectRequest) => Promise<void>;
}

export default function Sidebar({ projects, selectedProjectId, onSelectProject, onCreateProject }: SidebarProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await onCreateProject({ name: name.trim(), description: description.trim() || null });
      setName('');
      setDescription('');
      setShowForm(false);
    } finally {
      setCreating(false);
    }
  };

  const totalTasks = projects.reduce((sum, p) => sum + p.taskCount, 0);

  return (
    <>
      <aside className="w-64 bg-slate-900 border-r border-slate-700/50 flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Projects</h2>
          <nav className="space-y-1">
            <button
              onClick={() => onSelectProject(null)}
              id="project-all"
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedProjectId === null
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderIcon className="h-4.5 w-4.5" />
                <span>All Projects</span>
              </div>
              <span className="text-xs bg-slate-700/60 px-2 py-0.5 rounded-full">{totalTasks}</span>
            </button>
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                id={`project-${project.id}`}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedProjectId === project.id
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-indigo-400" />
                  <span className="truncate">{project.name}</span>
                </div>
                <span className="text-xs bg-slate-700/60 px-2 py-0.5 rounded-full">{project.taskCount}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 mt-auto">
          <button
            onClick={() => setShowForm(true)}
            id="create-project-btn"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-400 border border-dashed border-indigo-500/30 hover:bg-indigo-500/5 hover:border-indigo-500/50 transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            New Project
          </button>
        </div>
      </aside>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Project">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              id="project-name-input"
              placeholder="Enter project name"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              id="project-desc-input"
              placeholder="Optional description"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              id="save-project-btn"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
