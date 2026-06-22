import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";
import { SkeletonCard } from "../components/Loader";
import VirtualTree from "../components/VirtualTree";
import ActivityHeatmap from "../components/ActivityHeatmap";
import { getDashboardStats } from "../api/dashboard";
import { getProjects } from "../api/projects";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      // 1. Optimistic UI: Try to load from cache instantly
      const cachedStats = localStorage.getItem("taskflow_dash_stats");
      const cachedProjects = localStorage.getItem("taskflow_dash_projects");
      
      if (cachedStats && cachedProjects) {
        setStats(JSON.parse(cachedStats));
        setProjects(JSON.parse(cachedProjects).slice(0, 3));
        setLoading(false); // Instantly remove skeleton loaders!
      } else {
        setLoading(true);
      }

      setError("");
      try {
        // 2. Fetch fresh data in the background
        const [statsRes, projectsRes] = await Promise.all([
          getDashboardStats(),
          getProjects(),
        ]);
        if (!active) return;
        
        // 3. Update cache with fresh data
        localStorage.setItem("taskflow_dash_stats", JSON.stringify(statsRes.data));
        localStorage.setItem("taskflow_dash_projects", JSON.stringify(projectsRes.data));

        // 4. Update UI with fresh data
        setStats(statsRes.data);
        setProjects(projectsRes.data.slice(0, 3));
      } catch (err) {
        if (active && !cachedStats) setError("Couldn't load dashboard data. Please refresh.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-surface/30">
      {/* Premium Background Blurs */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-secondary-container/10 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

      <Navbar />
      <main className="relative z-10 pt-[104px] pb-16 px-8 max-w-7xl mx-auto">

        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/40 p-8 rounded-3xl border border-white/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="relative z-10 flex-1">
            <h1 className="text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-on-surface to-on-surface-variant mb-2 tracking-tight">
              Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
            </h1>
            <p className="text-on-surface-variant font-medium text-lg mb-6">Here's what's happening with your work today.</p>
            
            <div className="bg-white/60 backdrop-blur-sm border border-white/80 w-fit px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 text-sm font-bold text-primary">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          <div className="relative z-10 md:w-1/3 min-w-[300px]">
            <VirtualTree />
          </div>
        </header>

        {error && (
          <div className="bg-error-container/80 backdrop-blur-sm border border-error/20 text-on-error-container text-sm font-medium rounded-xl px-4 py-3 mb-8 flex items-center gap-3 shadow-sm animate-fade-in-up">
            <span className="material-symbols-outlined text-error">error</span>
            {error}
          </div>
        )}

        <section className="mb-12">
          <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {loading || !stats ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                <StatCard icon="folder" value={stats.totalProjects} label="Total Projects" tone="indigo" />
                <StatCard icon="checklist" value={stats.totalTasks} label="Total Tasks" tone="blue" />
                <StatCard icon="task_alt" value={stats.completedTasks} label="Completed Tasks" tone="emerald" />
                <StatCard icon="pending_actions" value={stats.pendingTasks} label="Pending Tasks" tone="red" />
                <StatCard icon="timelapse" value={stats.projectsInProgress} label="Projects In Progress" tone="amber" />
              </>
            )}
          </div>
        </section>

        {/* Activity Heatmap Tracker */}
        <section className="mb-12">
          {!loading && stats && (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <ActivityHeatmap activityMap={stats.activityMap || {}} />
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-end mb-6 border-b border-white/50 pb-4">
            <h2 className="text-2xl font-display font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">recent_actors</span>
              Recent Projects
            </h2>
            <Link to="/projects" className="text-primary font-bold text-sm flex items-center gap-1 hover:text-primary-container transition-colors group">
              View All 
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : projects.length === 0 ? (
              <div className="col-span-full glass-panel rounded-2xl border border-white/60 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-[40px]">inventory_2</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2">No projects yet</h3>
                <p className="text-on-surface-variant font-medium max-w-md mb-6">
                  Get started by creating your first project to organize your tasks and collaborate with your team.
                </p>
                <Link to="/projects" className="px-6 py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary-container shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
                  Create Project
                </Link>
              </div>
            ) : (
              projects.map((p) => <ProjectCard key={p.id} project={p} />)
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
