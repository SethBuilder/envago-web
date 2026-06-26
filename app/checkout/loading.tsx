export default function Loading() {
  return (
    <div className="min-h-screen bg-[#EFEDE8] animate-pulse">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E1DC] px-6 py-4">
        <div className="h-11 w-32 bg-[#E5E1DC] rounded-lg" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left: form skeleton */}
        <div className="flex flex-col gap-6">
          {/* Step indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#E5E1DC]" />
              <div className="h-3 w-20 bg-[#E5E1DC] rounded" />
            </div>
            <div className="h-3 w-8 bg-[#E5E1DC] rounded" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#E5E1DC]" />
              <div className="h-3 w-20 bg-[#E5E1DC] rounded" />
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-[#E5E1DC] p-6 flex flex-col gap-5">
            <div className="h-6 w-2/3 bg-[#E5E1DC] rounded" />
            <div className="h-3 w-1/2 bg-[#E5E1DC] rounded" />
            <div className="flex flex-col gap-4 mt-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-3 w-24 bg-[#E5E1DC] rounded" />
                  <div className="h-11 bg-[#E5E1DC] rounded-xl" />
                </div>
              ))}
            </div>
            <div className="h-12 bg-[#E5E1DC] rounded-xl mt-2" />
          </div>
        </div>

        {/* Right: order summary skeleton */}
        <div className="bg-white rounded-2xl border border-[#E5E1DC] p-6 flex flex-col gap-4">
          <div className="h-40 bg-[#E5E1DC] rounded-xl" />
          <div className="h-5 w-3/4 bg-[#E5E1DC] rounded" />
          <div className="h-3 w-1/2 bg-[#E5E1DC] rounded" />
          <div className="border-t border-[#E5E1DC] pt-4 flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-1/3 bg-[#E5E1DC] rounded" />
                <div className="h-3 w-1/4 bg-[#E5E1DC] rounded" />
              </div>
            ))}
          </div>
          <div className="h-5 w-1/2 bg-[#E5E1DC] rounded mt-2" />
        </div>
      </div>
    </div>
  );
}
