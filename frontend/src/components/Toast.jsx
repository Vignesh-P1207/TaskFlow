export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  const styles =
    type === "error"
      ? "bg-error-container text-on-error-container border-error/30"
      : "bg-emerald-100 text-emerald-800 border-emerald-300";

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border ${styles}`}
      role="status"
    >
      <span className="material-symbols-outlined text-[18px]">
        {type === "error" ? "error" : "check_circle"}
      </span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}
