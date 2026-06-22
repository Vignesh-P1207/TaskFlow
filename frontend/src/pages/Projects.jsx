import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
import Toast from "../components/Toast";
import { SkeletonCard } from "../components/Loader";
import { getProjects, createProject, updateProject, deleteProject } from "../api/projects";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    // Optimistic UI for instant load
    const cachedProjects = localStorage.getItem("taskflow_projects_list");
    if (cachedProjects && !search && status === "all") {
      setProjects(JSON.parse(cachedProjects));
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const params = {};
      if (status !== "all") params.status = status;
      if (search) params.search = search;
      const res = await getProjects(params);
      
      // Cache the result if no filters are applied
      if (!search && status === "all") {
        localStorage.setItem("taskflow_projects_list", JSON.stringify(res.data));
      }
      setProjects(res.data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load projects" });
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    if (!search) {
      load();
      return;
    }
    const t = setTimeout(load, 300); // debounce search
    return () => clearTimeout(t);
  }, [load, search]);

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditing(project);
    setModalOpen(true);
  };

  const handleSubmit = async (form) => {
    try {
      if (editing) {
        await updateProject(editing.id, form);
        setToast({ type: "success", message: "Project updated" });
      } else {
        await createProject(form);
        setToast({ type: "success", message: "Project created" });
      }
      setModalOpen(false);
      localStorage.removeItem("taskflow_dash_projects");
      localStorage.removeItem("taskflow_dash_stats");
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Save failed" });
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete "${project.name}"? This will also delete its tasks.`)) return;
    try {
      await deleteProject(project.id);
      setToast({ type: "success", message: "Project deleted" });
      localStorage.removeItem("taskflow_dash_projects");
      localStorage.removeItem("taskflow_dash_stats");
      load();
    } catch (err) {
      setToast({ type: "error", message: "Failed to delete project" });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-surface/30">
      {/* Premium Background Blurs */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-secondary-container/10 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

      <Navbar />
      <main className="relative z-10 pt-[104px] pb-10 px-8 max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/50 pb-6">
          <div>
            <h1 className="text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-on-surface to-on-surface-variant mb-2 tracking-tight">
              Projects
            </h1>
            <p className="text-on-surface-variant font-medium text-lg">Manage and track your projects.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative bg-white/60 backdrop-blur-sm border border-white/80 rounded-xl flex-1 md:w-64 shadow-sm group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors text-[20px]">
                search
              </span>
              <input
                className="w-full bg-transparent border-none focus:ring-0 pl-10 pr-4 py-2.5 text-on-surface font-medium placeholder:text-outline-variant focus:outline-none"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <select
                className="appearance-none bg-white/60 backdrop-blur-sm border border-white/80 rounded-xl py-2.5 pl-4 pr-10 text-on-surface font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
            </div>

            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-xl font-bold shadow-[0_4px_12px_-4px_rgba(79,70,229,0.4)] hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5 transition-all whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Project
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : projects.length === 0 ? (
            <div className="col-span-full glass-panel rounded-2xl border border-white/60 p-16 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-5">
                <span className="material-symbols-outlined text-[48px]">folder_off</span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">No projects found</h3>
              <p className="text-on-surface-variant font-medium text-lg max-w-md">
                Try adjusting your search or filters, or create a new project to get started.
              </p>
            </div>
          ) : (
            projects.map((p) => (
              <ProjectCard key={p.id} project={p} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          )}
        </div>
      </main>

      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
