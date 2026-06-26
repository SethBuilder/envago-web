export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-3 bg-[#E5E1DC] rounded w-32 mb-8" />
      <div className="flex items-center gap-5 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-[#E5E1DC] flex-shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="h-6 bg-[#E5E1DC] rounded w-48" />
          <div className="h-4 bg-[#E5E1DC] rounded w-32" />
        </div>
      </div>
      <div className="flex gap-3 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-[#E5E1DC] rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white">
            <div className="h-40 bg-[#E5E1DC]" />
            <div className="p-4 flex flex-col gap-2">
              <div className="h-4 bg-[#E5E1DC] rounded w-3/4" />
              <div className="h-3 bg-[#E5E1DC] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
