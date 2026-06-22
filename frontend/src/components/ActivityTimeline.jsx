import { formatDistanceToNow } from "date-fns";

export default function ActivityTimeline({ logs = [] }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-10 bg-white/40 rounded-2xl border border-white/50 border-dashed">
        <span className="material-symbols-outlined text-[40px] text-outline-variant mb-3">history</span>
        <p className="text-on-surface-variant font-medium text-sm">No recent activity found.</p>
      </div>
    );
  }

  const getActionStyles = (action) => {
    switch (action) {
      case "PROJECT_CREATED":
        return { icon: "star", color: "text-primary", bg: "bg-primary/10 border-primary/20" };
      case "PROJECT_UPDATED":
        return { icon: "edit", color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" };
      case "TASK_CREATED":
        return { icon: "add_task", color: "text-tertiary", bg: "bg-tertiary/10 border-tertiary/20" };
      case "TASK_UPDATED":
        return { icon: "edit_note", color: "text-on-surface-variant", bg: "bg-surface-variant/20 border-surface-variant/30" };
      case "TASK_COMPLETED":
        return { icon: "check_circle", color: "text-green-600", bg: "bg-green-100 border-green-200" };
      case "TASK_DELETED":
        return { icon: "delete", color: "text-error", bg: "bg-error/10 border-error/20" };
      default:
        return { icon: "info", color: "text-primary", bg: "bg-primary/10 border-primary/20" };
    }
  };

  const getActionTitle = (action) => {
    return action.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
  };

  return (
    <div className="relative pl-4 border-l-2 border-white/60 ml-4 py-2 space-y-6">
      {logs.map((log, index) => {
        const { icon, color, bg } = getActionStyles(log.action);
        
        return (
          <div key={log.id} className="relative group">
            {/* Timeline dot/icon */}
            <div className={`absolute -left-[35px] top-1 w-8 h-8 rounded-full flex items-center justify-center border ${bg} ${color} shadow-sm bg-white/80 backdrop-blur-sm group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-[16px]">{icon}</span>
            </div>
            
            {/* Content Card */}
            <div className="bg-white/50 border border-white/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow hover:bg-white/70">
              <div className="flex justify-between items-start mb-1.5 gap-4">
                <h4 className={`text-sm font-bold ${color}`}>{getActionTitle(log.action)}</h4>
                <span className="text-[11px] font-bold text-on-surface-variant whitespace-nowrap bg-white/60 px-2 py-0.5 rounded-md border border-white/80">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm font-medium text-on-surface leading-snug">
                {log.details || "No details provided."}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
