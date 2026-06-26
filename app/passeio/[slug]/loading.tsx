export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-3 bg-[#E5E1DC] rounded w-48 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="h-72 bg-[#E5E1DC] rounded-2xl" />
          <div className="flex flex-col gap-3">
            <div className="h-3 bg-[#E5E1DC] rounded w-24" />
            <div className="h-8 bg-[#E5E1DC] rounded w-2/3" />
            <div className="h-4 bg-[#E5E1DC] rounded w-1/3" />
          </div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-32 bg-[#E5E1DC] rounded-full" />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-[#E5E1DC] rounded w-full" />
            <div className="h-4 bg-[#E5E1DC] rounded w-5/6" />
            <div className="h-4 bg-[#E5E1DC] rounded w-4/6" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="h-80 bg-[#E5E1DC] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
