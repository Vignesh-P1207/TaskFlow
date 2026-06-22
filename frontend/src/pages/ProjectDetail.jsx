import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";
import TaskRow from "../components/TaskRow";
import TaskModal from "../components/TaskModal";
import ProjectModal from "../components/ProjectModal";
import Toast from "../components/Toast";
import { Spinner } from "../components/Loader";
import { getProject, updateProject, deleteProject, getProjectLogs } from "../api/projects";
import { getTasks, createTask, updateTask, completeTask, uncompleteTask, deleteTask } from "../api/tasks";
import ActivityTimeline from "../components/ActivityTimeline";
import { useAuth } from "../context/AuthContext";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState({ status: "", priority: "", search: "" });

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const loadProject = useCallback(async () => {
    const cached = localStorage.getItem(`taskflow_project_${id}`);
    if (cached) setProject(JSON.parse(cached));

    const res = await getProject(id);
    localStorage.setItem(`taskflow_project_${id}`, JSON.stringify(res.data));
    setProject(res.data);
  }, [id]);

  const loadLogs = useCallback(async () => {
    const cached = localStorage.getItem(`taskflow_logs_${id}`);
    if (cached) setLogs(JSON.parse(cached));

    try {
      const res = await getProjectLogs(id);
      localStorage.setItem(`taskflow_logs_${id}`, JSON.stringify(res.data));
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to load logs");
    }
  }, [id]);

  const loadTasks = useCallback(async () => {
    const isDefaultFilter = !taskFilter.search && !taskFilter.status && !taskFilter.priority;
    const cacheKey = `taskflow_tasks_${id}`;

    if (isDefaultFilter) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) setTasks(JSON.parse(cached));
    }

    const params = { projectId: id };
    if (taskFilter.status) params.status = taskFilter.status;
    if (taskFilter.priority) params.priority = taskFilter.priority;
    if (taskFilter.search) params.search = taskFilter.search;
    
    const res = await getTasks(params);
    
    if (isDefaultFilter) {
      localStorage.setItem(cacheKey, JSON.stringify(res.data));
    }
    setTasks(res.data);
  }, [id, taskFilter]);

  useEffect(() => {
    let active = true;
    async function init() {
      // Optimistic UI for Project Detail
      const cachedProject = localStorage.getItem(`taskflow_project_${id}`);
      const cachedLogs = localStorage.getItem(`taskflow_logs_${id}`);
      const cachedTasks = localStorage.getItem(`taskflow_tasks_${id}`);
      
      if (cachedProject && cachedLogs && cachedTasks) {
        setLoading(false); // Instantly remove spinner
      } else {
        setLoading(true);
      }

      try {
        await Promise.all([loadProject(), loadLogs()]);
      } catch (err) {
        setToast({ type: "error", message: "Project not found" });
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, [loadProject, loadLogs, id]);

  useEffect(() => {
    if (!taskFilter.search) {
      loadTasks().catch(() => setToast({ type: "error", message: "Failed to load tasks" }));
      return;
    }
    const t = setTimeout(() => {
      loadTasks().catch(() => setToast({ type: "error", message: "Failed to load tasks" }));
    }, 250);
    return () => clearTimeout(t);
  }, [loadTasks, taskFilter.search]);

  const handleToggleComplete = async (task) => {
    const originalTasks = [...tasks];
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    
    // Optimistic update for instant visual feedback
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    // Optimistic update for instant visual feedback on logs
    const tempLog = {
      id: "temp-" + Date.now(),
      action: newStatus === "COMPLETED" ? "TASK_COMPLETED" : "TASK_UNCOMPLETED",
      details: newStatus === "COMPLETED" 
        ? `Task "${task.name}" was marked as completed! (+50 XP)` 
        : `Task "${task.name}" was marked as pending. (-50 XP)`,
      createdAt: new Date().toISOString()
    };
    setLogs([tempLog, ...logs]);

    // Optimistic Gamification & Toasts
    const xpChange = newStatus === "COMPLETED" ? 50 : -50;
    const newXp = Math.max(0, (user?.xp || 0) + xpChange);
    const newLevel = Math.floor(newXp / 100) + 1;
    const leveledUp = newStatus === "COMPLETED" && newLevel > (user?.level || 1);
    const leveledDown = newStatus !== "COMPLETED" && newLevel < (user?.level || 1);

    updateUser({ xp: newXp, level: newLevel });

    if (leveledUp) {
      setToast({ type: "success", message: `LEVEL UP! You are now Level ${newLevel}! 🎉` });
    } else if (leveledDown) {
      setToast({ type: "error", message: `LEVEL LOST! You fell to Level ${newLevel} 📉` });
    } else if (newStatus === "COMPLETED") {
      setToast({ type: "success", message: `+50 XP! Tree is growing! 🌱` });
    } else {
      setToast({ type: "error", message: `-50 XP! Tree shrank! 🍂` });
    }

    try {
      if (task.status === "COMPLETED") {
        await uncompleteTask(task.id);
      } else {
        await completeTask(task.id);
      }
      
      // Clear global caches so Dashboard stats update instantly
      localStorage.removeItem("taskflow_dash_stats");
      localStorage.removeItem("taskflow_dash_projects");
      localStorage.removeItem(`taskflow_tasks_${id}`);
      localStorage.removeItem(`taskflow_logs_${id}`);
      
      // Silently sync with server in background
      loadTasks();
      loadLogs();
    } catch {
      // Revert if API fails
      setTasks(originalTasks);
      setToast({ type: "error", message: "Failed to update task" });
    }
  };

  const handleTaskSubmit = async (form) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, form);
        setToast({ type: "success", message: "Task updated" });
      } else {
        await createTask({ ...form, projectId: id });
        setToast({ type: "success", message: "Task created" });
      }
      setTaskModalOpen(false);
      
      // Optimistic Log Update
      const tempLog = {
        id: "temp-" + Date.now(),
        action: editingTask ? "TASK_UPDATED" : "TASK_CREATED",
        details: editingTask ? `Task "${form.name}" details were updated.` : `Task "${form.name}" was created.`,
        createdAt: new Date().toISOString()
      };
      setLogs([tempLog, ...logs]);

      // Clear global caches
      localStorage.removeItem("taskflow_dash_stats");
      localStorage.removeItem(`taskflow_tasks_${id}`);
      localStorage.removeItem(`taskflow_logs_${id}`);
      
      loadTasks();
      loadLogs();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Save failed" });
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete task "${task.name}"?`)) return;
    try {
      await deleteTask(task.id);
      setToast({ type: "success", message: "Task deleted" });
      
      // Optimistic Log
      const tempLog = {
        id: "temp-" + Date.now(),
        action: "TASK_DELETED",
        details: `Task "${task.name}" was deleted.`,
        createdAt: new Date().toISOString()
      };
      setLogs([tempLog, ...logs]);

      localStorage.removeItem("taskflow_dash_stats");
      localStorage.removeItem(`taskflow_tasks_${id}`);
      localStorage.removeItem(`taskflow_logs_${id}`);
      
      loadTasks();
      loadLogs();
    } catch {
      setToast({ type: "error", message: "Failed to delete task" });
    }
  };

  const handleProjectSubmit = async (form) => {
    try {
      await updateProject(id, form);
      setToast({ type: "success", message: "Project updated" });
      setProjectModalOpen(false);
      loadProject();
      loadLogs();
    } catch {
      setToast({ type: "error", message: "Failed to update project" });
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete "${project.name}"? This will also delete its tasks.`)) return;
    try {
      await deleteProject(id);
      navigate("/projects");
    } catch {
      setToast({ type: "error", message: "Failed to delete project" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Spinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="text-center py-20 text-on-surface-variant">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-surface/30">
      {/* Premium Background Blurs */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-secondary-container/10 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

      <Navbar />
      <main className="relative z-10 pt-[104px] pb-10 px-8 max-w-5xl mx-auto">
        <Link to="/projects" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/50 hover:bg-white rounded-lg text-sm font-bold text-on-surface-variant hover:text-primary transition-all shadow-sm mb-6 group w-fit border border-white/60">
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Projects
        </Link>

        <div className="glass-panel relative overflow-hidden rounded-2xl p-8 mb-10 border border-white/60 shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[32px]">dataset</span>
              </div>
              <div>
                <h1 className="text-3xl font-display font-extrabold text-on-surface mb-2">{project.name}</h1>
                <Badge value={project.status} />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setProjectModalOpen(true)} className="flex items-center justify-center w-10 h-10 bg-white/60 hover:bg-white rounded-xl text-on-surface-variant hover:text-primary shadow-sm transition-all" title="Edit Project">
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button onClick={handleDeleteProject} className="flex items-center justify-center w-10 h-10 bg-white/60 hover:bg-error-container/40 rounded-xl text-on-surface-variant hover:text-error shadow-sm transition-all" title="Delete Project">
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Description</h3>
            <p className="text-on-surface font-medium mb-6 leading-relaxed bg-white/30 p-4 rounded-xl border border-white/40">
              {project.description || "No description provided for this project."}
            </p>
            
            <div className="flex flex-wrap gap-6 text-sm font-semibold text-on-surface-variant bg-white/40 w-fit px-5 py-3 rounded-xl border border-white/50">
              {project.startDate && (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">flight_takeoff</span>
                  Start: <span className="text-on-surface">{new Date(project.startDate).toLocaleDateString()}</span>
                </span>
              )}
              {project.endDate && (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-error">flight_land</span>
                  Deadline: <span className="text-on-surface">{new Date(project.endDate).toLocaleDateString()}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[28px]">format_list_bulleted</span>
                Project Tasks
              </h2>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setTaskModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-xl font-bold shadow-[0_4px_12px_-4px_rgba(79,70,229,0.4)] hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5 transition-all whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[20px]">add_task</span>
                Create Task
              </button>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-white/60 mb-6 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">search</span>
                <input
                  className="w-full bg-white/70 border border-white/80 rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant shadow-sm"
                  placeholder="Search tasks..."
                  value={taskFilter.search}
                  onChange={(e) => setTaskFilter({ ...taskFilter, search: e.target.value })}
                />
              </div>
              <div className="relative">
                <select
                  className="appearance-none bg-white/70 border border-white/80 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer"
                  value={taskFilter.status}
                  onChange={(e) => setTaskFilter({ ...taskFilter, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
              </div>
              <div className="relative">
                <select
                  className="appearance-none bg-white/70 border border-white/80 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer"
                  value={taskFilter.priority}
                  onChange={(e) => setTaskFilter({ ...taskFilter, priority: e.target.value })}
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {tasks.length === 0 ? (
                <div className="text-center py-16 bg-white/40 rounded-2xl border border-white/50 border-dashed">
                  <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">checklist</span>
                  <p className="text-on-surface-variant font-medium text-lg">No tasks match your filters.</p>
                </div>
              ) : (
                tasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    onToggleComplete={handleToggleComplete}
                    onEdit={(task) => {
                      setEditingTask(task);
                      setTaskModalOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}
            </div>
          </div>
          
          {/* Activity Timeline Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-[104px]">
              <h2 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-secondary text-[28px]">history</span>
                Activity Log
              </h2>
              <div className="glass-panel rounded-2xl p-6 border border-white/60 shadow-md relative overflow-hidden">
                {user?.level < 3 ? (
                  <>
                    <div className="filter blur-md opacity-40 pointer-events-none select-none">
                      <ActivityTimeline logs={logs.slice(0, 3)} />
                    </div>
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 bg-surface/40 backdrop-blur-[2px]">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg mb-4 animate-bounce">
                        <span className="material-symbols-outlined text-4xl">lock</span>
                      </div>
                      <h3 className="text-xl font-bold text-on-surface mb-2">Treasure Locked</h3>
                      <p className="text-sm text-on-surface-variant font-medium">
                        Complete tasks to earn XP and reach <strong>Level 3</strong> to unlock project activity insights!
                      </p>
                      <div className="mt-4 px-4 py-2 rounded-lg bg-white/60 font-bold text-primary text-sm shadow-sm border border-white/80">
                        Current Level: {user?.level || 1}
                      </div>
                    </div>
                  </>
                ) : (
                  <ActivityTimeline logs={logs} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        initial={editingTask}
      />
      <ProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={handleProjectSubmit}
        initial={project}
      />
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
