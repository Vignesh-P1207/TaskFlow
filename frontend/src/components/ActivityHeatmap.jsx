import { useMemo } from "react";

export default function ActivityHeatmap({ activityMap }) {
  const weeks = useMemo(() => {
    if (!activityMap) return [];
    
    // We want to show roughly the last 6 months (26 weeks = 182 days)
    const daysToView = 182;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToView);
    
    // Roll back to the previous Sunday to ensure columns align perfectly
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // Include all of today

    const generatedWeeks = [];
    let currentWeek = [];
    const curr = new Date(startDate);

    while (curr <= today) {
      // YYYY-MM-DD in local time is safer, but ISO string split is fine if timezone aligns.
      // Better to manually format to avoid timezone shift bugs at midnight:
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      // Look up activity count in our map
      const count = activityMap[dateStr] || 0;
      
      currentWeek.push({ date: dateStr, count });
      
      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }
      
      curr.setDate(curr.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      generatedWeeks.push(currentWeek);
    }

    return generatedWeeks;
  }, [activityMap]);

  // GitHub style color grading
  const getColor = (count) => {
    if (count === 0) return "bg-gray-200 dark:bg-gray-800/40";
    if (count <= 2) return "bg-primary/30";
    if (count <= 5) return "bg-primary/60";
    if (count <= 8) return "bg-primary/80";
    return "bg-primary";
  };

  const totalContributions = useMemo(() => {
    if (!activityMap) return 0;
    return Object.values(activityMap).reduce((acc, curr) => acc + curr, 0);
  }, [activityMap]);

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/60 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
          Activity Tracker
        </h2>
        <span className="text-sm font-medium text-on-surface-variant bg-surface-variant/20 px-3 py-1 rounded-full">
          {totalContributions} total activities
        </span>
      </div>

      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-[4px] min-w-max">
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col gap-[4px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-[14px] h-[14px] rounded-[3px] transition-all hover:scale-125 hover:ring-2 hover:ring-primary/50 cursor-crosshair ${getColor(day.count)}`}
                  title={`${day.count} activities on ${day.date}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2 mt-2 text-xs text-on-surface-variant">
        <span>Less</span>
        <div className="flex gap-[4px]">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-gray-200 dark:bg-gray-800/40" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-primary/30" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-primary/60" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-primary/80" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-primary" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
