export function Spinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-lg p-6 animate-pulse">
      <div className="w-12 h-12 rounded-lg bg-surface-container-high mb-4" />
      <div className="h-4 bg-surface-container-high rounded w-3/4 mb-2" />
      <div className="h-3 bg-surface-container-high rounded w-full mb-1" />
      <div className="h-3 bg-surface-container-high rounded w-2/3" />
    </div>
  );
}
