export default function TodayLoading() {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      <div className="h-16 bg-[#0A0A0A] rounded-md border border-[#161616]" />
      <div className="h-20 bg-[#080808] rounded-md border border-[#141414]" />
      <div className="h-44 bg-[#0A0A0A] rounded-md border border-[#1A1A1A]" />
      <div className="space-y-3 pt-2">
        <div className="h-4 w-32 bg-[#141414] rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-[#080808] rounded-md border border-[#141414]" />
        ))}
      </div>
    </div>
  );
}

