export default function StatCard({ icon, value, label, tone = "indigo" }) {
  const tones = {
    indigo: {
      bg: "from-indigo-500 to-indigo-600",
      text: "text-indigo-600",
      glow: "shadow-indigo-500/30",
      light: "bg-indigo-50"
    },
    emerald: {
      bg: "from-emerald-400 to-emerald-500",
      text: "text-emerald-600",
      glow: "shadow-emerald-400/30",
      light: "bg-emerald-50"
    },
    amber: {
      bg: "from-amber-400 to-amber-500",
      text: "text-amber-600",
      glow: "shadow-amber-400/30",
      light: "bg-amber-50"
    },
    red: {
      bg: "from-rose-400 to-rose-500",
      text: "text-rose-600",
      glow: "shadow-rose-400/30",
      light: "bg-rose-50"
    },
    blue: {
      bg: "from-blue-400 to-blue-500",
      text: "text-blue-600",
      glow: "shadow-blue-400/30",
      light: "bg-blue-50"
    },
  };

  const t = tones[tone];

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-xl transition-all duration-500 border border-white/60">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${t.bg} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`}></div>
      
      <div className={`p-3 rounded-xl w-fit mb-5 ${t.light} ${t.text} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <div className="relative z-10">
        <h3 className="text-4xl font-display font-extrabold text-on-surface mb-1 tracking-tight">
          {value}
        </h3>
        <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
      </div>
      
      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${t.bg} transition-all duration-500`}></div>
    </div>
  );
}
