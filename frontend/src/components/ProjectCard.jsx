import { Link } from "react-router-dom";
import Badge from "./Badge";

const ICONS = { NOT_STARTED: "hourglass_empty", IN_PROGRESS: "autorenew", COMPLETED: "task_alt" };

export default function ProjectCard({ project, onEdit, onDelete }) {
  const taskCount = project._count?.tasks ?? 0;

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-6 flex flex-col group hover:-translate-y-1 hover:shadow-xl transition-all duration-500 border border-white/60">
      
      {/* Decorative gradient blur in background */}
      <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-2xl group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-700"></div>

      <div className="relative z-10 flex justify-between items-start mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center text-primary shadow-sm border border-indigo-100/50 group-hover:scale-110 transition-transform duration-500">
          <span className="material-symbols-outlined text-[26px]">
            {ICONS[project.status] || "folder"}
          </span>
        </div>
        <Badge value={project.status} />
      </div>

      <Link to={`/projects/${project.id}`} className="relative z-10 group/link inline-block w-fit">
        <h3 className="text-xl font-display font-bold text-on-surface mb-2 group-hover/link:text-primary transition-colors duration-300">
          {project.name}
        </h3>
      </Link>
      
      <p className="relative z-10 text-sm font-medium text-on-surface-variant mb-4 flex-1 line-clamp-2 leading-relaxed">
        {project.description || "No description provided."}
      </p>

      {/* Progress Bar */}
      <div className="relative z-10 mb-6">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Progress</span>
          <span className="text-xs font-bold text-primary">{project.percent ?? 0}%</span>
        </div>
        <div className="w-full h-2 bg-error/20 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-green-500 transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${project.percent ?? 0}%` }}
          ></div>
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-center pt-4 border-t border-white/50 text-sm font-semibold text-on-surface-variant">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 rounded-lg shadow-sm">
          <span className="material-symbols-outlined text-[18px] text-primary">checklist</span>
          {project.totalTasks ?? 0} task{(project.totalTasks ?? 0) === 1 ? "" : "s"}
        </span>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            {onEdit && (
              <button onClick={() => onEdit(project)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/60 hover:bg-white text-on-surface-variant hover:text-primary shadow-sm transition-all" title="Edit">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(project)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/60 hover:bg-error/10 text-on-surface-variant hover:text-error shadow-sm transition-all" title="Delete">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Bottom accent border */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
    </div>
  );
}
