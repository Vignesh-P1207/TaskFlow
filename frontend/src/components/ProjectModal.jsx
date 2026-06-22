import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EMPTY = { name: "", description: "", status: "NOT_STARTED", startDate: "", endDate: "" };

export default function ProjectModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        description: initial.description || "",
        status: initial.status || "NOT_STARTED",
        startDate: initial.startDate ? initial.startDate.slice(0, 10) : "",
        endDate: initial.endDate ? initial.endDate.slice(0, 10) : "",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [initial, open]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Project name is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      e.endDate = "End date cannot be before start date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`relative glass-panel rounded-2xl p-8 w-full max-w-lg shadow-2xl transition-all duration-500 transform ${open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-10 scale-95 opacity-0'}`}>
        <header className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-[28px]">{initial ? "edit_document" : "add_box"}</span>
          </div>
          <div>
            <h2 className="text-2xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {initial ? "Edit Project" : "New Project"}
            </h2>
            <p className="text-on-surface-variant text-sm font-medium">{initial ? "Update project details below." : "Fill in the details to start a new project."}</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 group">
            <label className="text-sm font-semibold text-on-surface-variant ml-1 transition-colors group-focus-within:text-primary">
              Project Name
            </label>
            <input
              className="w-full px-4 py-3 bg-white/60 border border-white/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm font-medium text-on-surface placeholder:text-outline-variant"
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="text-error text-xs ml-1 font-medium animate-fade-in-up">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5 group">
            <label className="text-sm font-semibold text-on-surface-variant ml-1 transition-colors group-focus-within:text-primary">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 bg-white/60 border border-white/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm font-medium text-on-surface placeholder:text-outline-variant resize-none"
              placeholder="Briefly describe the project goals..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5 group">
            <label className="text-sm font-semibold text-on-surface-variant ml-1 transition-colors group-focus-within:text-primary">
              Status
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-white/60 border border-white/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm font-medium text-on-surface appearance-none cursor-pointer"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Enhanced Dates Panel */}
          <div className="bg-white/40 border border-white/60 rounded-2xl p-5 mt-2 shadow-inner">
            <label className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">date_range</span>
              Project Timeline
            </label>
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-1.5 group">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Start Date</label>
                <div className="relative datepicker-wrapper w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none z-10 text-[18px]">event</span>
                  <DatePicker
                    selected={form.startDate ? new Date(form.startDate) : null}
                    onChange={(date) => setForm({ ...form, startDate: date ? date.toISOString().slice(0, 10) : "" })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-white/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-medium text-on-surface cursor-pointer"
                    placeholderText="Select start date"
                    dateFormat="MMM d, yyyy"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-center pt-6 text-outline-variant">
                <span className="material-symbols-outlined text-[20px] bg-white/50 rounded-full p-1 shadow-sm">arrow_forward</span>
              </div>

              <div className="flex-1 flex flex-col gap-1.5 group">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">End Date</label>
                <div className="relative datepicker-wrapper w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-error pointer-events-none z-10 text-[18px]">event_available</span>
                  <DatePicker
                    selected={form.endDate ? new Date(form.endDate) : null}
                    onChange={(date) => setForm({ ...form, endDate: date ? date.toISOString().slice(0, 10) : "" })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-white/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-error/10 focus:border-error transition-all shadow-sm font-medium text-on-surface cursor-pointer"
                    placeholderText="Select end date"
                    dateFormat="MMM d, yyyy"
                    minDate={form.startDate ? new Date(form.startDate) : null}
                  />
                </div>
                {errors.endDate && <p className="text-error text-[11px] ml-1 font-medium animate-fade-in-up mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-white/50 hover:text-on-surface transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-primary to-primary-container text-on-primary hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">autorenew</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  Save Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
