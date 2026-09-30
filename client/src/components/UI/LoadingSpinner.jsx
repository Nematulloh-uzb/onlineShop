export default function LoadingSpinner({ fullPage = true }) {
  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#F0F2E8] border-t-[#8A9A5B] animate-spin" />
          <p className="font-['Inter'] text-[14px] text-[#6B6B6B]">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 rounded-full border-4 border-[#F0F2E8] border-t-[#8A9A5B] animate-spin" />
    </div>
  );
}
