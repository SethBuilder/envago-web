export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F7F5F2] animate-pulse">
      {/* Navbar skeleton */}
      <div className="bg-white border-b border-[#E5E1DC] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="h-8 w-32 bg-[#E5E1DC] rounded-lg" />
        <div className="flex gap-3">
          <div className="h-8 w-20 bg-[#E5E1DC] rounded-full" />
          <div className="h-8 w-8 bg-[#E5E1DC] rounded-full" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero text skeleton */}
        <div className="py-10 sm:py-14 flex flex-col gap-4">
          <div className="h-9 bg-[#E5E1DC] rounded w-3/4" />
          <div className="h-9 bg-[#E5E1DC] rounded w-1/2" />
          <div className="h-4 bg-[#E5E1DC] rounded w-full max-w-xl mt-1" />
          <div className="h-4 bg-[#E5E1DC] rounded w-4/5 max-w-xl" />
        </div>

        {/* Category bar skeleton — matches icon + label pill layout */}
        <div className="flex gap-2 py-4 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 w-20">
              <div className="w-8 h-8 bg-[#E5E1DC] rounded-full" />
              <div className="h-2.5 w-12 bg-[#E5E1DC] rounded" />
            </div>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-2 pb-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="h-48 bg-[#E5E1DC]" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-4 bg-[#E5E1DC] rounded w-3/4" />
                <div className="h-3 bg-[#E5E1DC] rounded w-1/2" />
                <div className="flex items-center justify-between mt-1">
                  <div className="h-5 bg-[#E5E1DC] rounded w-1/3" />
                  <div className="h-4 bg-[#E5E1DC] rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
