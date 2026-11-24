export function ResultsSkeleton() {
  return (
    <div
      className="results-skeleton"
      role="status"
      aria-label="Loading scan results"
    >
      <span className="sr-only">Loading scan results</span>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div className="panel p-6" key={n}>
            <div className="skeleton h-3 w-24 mb-5" />
            <div className="skeleton h-9 w-16" />
          </div>
        ))}
      </div>
      <div className="panel p-6 mt-5">
        <div className="skeleton h-5 w-40 mb-8" />
        {[1, 2, 3, 4].map((n) => (
          <div className="flex gap-6 py-5 border-t border-line" key={n}>
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-4 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
