export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 animate-pulse">
      {/* Category bar skeleton */}
      <div className="flex gap-3 py-4 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-20 h-16 bg-[#E5E1DC] rounded-2xl" />
        ))}
      </div>
      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white">
            <div className="h-48 bg-[#E5E1DC]" />
            <div className="p-4 flex flex-col gap-3">
              <div className="h-4 bg-[#E5E1DC] rounded w-3/4" />
              <div className="h-3 bg-[#E5E1DC] rounded w-1/2" />
              <div className="h-4 bg-[#E5E1DC] rounded w-1/4 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
