const STYLES = {
  NOT_STARTED: "bg-surface-container-high text-on-surface-variant",
  IN_PROGRESS: "bg-amber-100/70 text-amber-700",
  COMPLETED: "bg-emerald-100/70 text-emerald-700",
  PENDING: "bg-surface-container-high text-on-surface-variant",
  LOW: "bg-emerald-100/70 text-emerald-700",
  MEDIUM: "bg-amber-100/70 text-amber-700",
  HIGH: "bg-error-container/60 text-on-error-container",
};

const LABELS = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  PENDING: "Pending",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export default function Badge({ value }) {
  if (!value) return null;
  return (
    <span
      className={`font-medium text-xs px-2 py-1 rounded-full border border-white/40 ${
        STYLES[value] || "bg-surface-container text-on-surface-variant"
      }`}
    >
      {LABELS[value] || value}
    </span>
  );
}
