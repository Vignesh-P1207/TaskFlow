import Badge from "./Badge";
import { useState } from "react";

export default function TaskRow({ task, onToggleComplete, onEdit, onDelete }) {
  const isDone = task.status === "COMPLETED";
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    await onToggleComplete(task);
    setIsToggling(false);
  };

  return (
    <div className={`glass-card rounded-lg p-4 flex items-center gap-4 ${isToggling ? 'opacity-70 pointer-events-none' : ''}`}>
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95 ${
          isDone ? "bg-primary border-primary shadow-[0_0_8px_rgba(79,70,229,0.5)]" : "border-outline hover:border-primary/60"
        } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
        title={isDone ? "Completed" : "Mark as complete"}
      >
        {isDone && <span className="material-symbols-outlined text-white text-[14px] animate-fade-in-up">check</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium ${isDone ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
          {task.name}
        </p>
        {task.description && (
          <p className="text-xs text-on-surface-variant truncate">{task.description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="w-[85px] flex justify-end">
          <Badge value={task.priority} />
        </div>
        <div className="w-[100px] flex justify-end">
          <Badge value={task.status} />
        </div>
        
        <div className="w-[85px] flex justify-end">
          {task.dueDate ? (
            <span className="hidden sm:flex items-center gap-1 text-xs text-outline">
              <span className="material-symbols-outlined text-[14px]">event</span>
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          ) : (
            <span className="hidden sm:inline-block w-full"></span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2">
        <button onClick={() => onEdit(task)} className="hover:text-primary transition-colors" title="Edit">
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button onClick={() => onDelete(task)} className="hover:text-error transition-colors" title="Delete">
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}
