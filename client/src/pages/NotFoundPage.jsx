import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 — AURA</title>
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-6 text-center">
        <div>
          <p className="font-['Playfair_Display'] text-[120px] font-bold text-[#F0F2E8] leading-none mb-4">
            404
          </p>
          <h1 className="font-['Playfair_Display'] text-[32px] font-bold text-[#1A1A1A] mb-3">
            Sahifa topilmadi
          </h1>
          <p className="font-['Inter'] text-[15px] text-[#6B6B6B] mb-8 max-w-sm mx-auto">
            Siz izlayotgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 h-12 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[15px] font-semibold rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </>
  );
}
