import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import TaskList from '../features/tasks/TaskList';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';

export default function Dashboard() {
  const { tasks, loading: tasksLoading, fetchTasks, createTask, updateTask, deleteTask } = useTasks();
  const { projects, loading: projectsLoading, fetchProjects, createProject } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          projects={projects} 
          selectedProjectId={selectedProjectId} 
          onSelectProject={setSelectedProjectId}
          onCreateProject={async (req) => {
            await createProject(req);
            await fetchProjects();
          }}
        />
        <main className="flex-1 flex flex-col min-w-0 bg-slate-900/50">
          <TaskList 
            tasks={tasks}
            projects={projects}
            loading={tasksLoading || projectsLoading}
            selectedProjectId={selectedProjectId}
            onFetchTasks={fetchTasks}
            onCreateTask={createTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        </main>
      </div>
    </div>
  );
}
