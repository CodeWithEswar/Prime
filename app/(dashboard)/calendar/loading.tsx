export default function CalendarLoading() {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse select-none">
      {/* Header Skeleton */}
      <div className="h-16 bg-[#0A0A0A] rounded-md border border-[#161616]" />

      {/* Grid + Lens Skeleton */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full space-y-3">
          <div className="h-8 bg-[#090909] rounded border border-[#141414]" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="h-20 bg-[#080808] rounded-md border border-[#141414]"
              />
            ))}
          </div>
        </div>

        <div className="hidden lg:block w-[380px] h-[520px] bg-[#0A0A0A] rounded-lg border border-[#181818]" />
      </div>
    </div>
  );
}

