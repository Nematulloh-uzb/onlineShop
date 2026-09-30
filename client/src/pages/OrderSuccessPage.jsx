import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();

  return (
    <>
      <Helmet>
        <title>Buyurtma tasdiqlandi — AURA</title>
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-10 shadow-[0_20px_40px_rgba(0,0,0,0.08)] max-w-lg w-full text-center">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-[#F0F2E8] flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[40px] text-[#8A9A5B]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>

          <h1 className="font-['Playfair_Display'] text-[32px] font-bold text-[#1A1A1A] mb-3">
            Buyurtma tasdiqlandi!
          </h1>
          <p className="font-['Inter'] text-[15px] text-[#6B6B6B] leading-relaxed mb-2">
            Rahmat! Buyurtmangiz muvaffaqiyatli qabul qilindi.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#F0F2E8] rounded-lg px-4 py-2 mb-6">
            <span className="font-['Inter'] text-[13px] text-[#6B6B6B]">Buyurtma raqami:</span>
            <span className="font-['Inter'] text-[14px] font-bold text-[#8A9A5B]">
              {orderNumber || 'AUR-2026-0001'}
            </span>
          </div>

          {/* Eco Impact */}
          <div className="bg-[#F0F2E8] rounded-xl p-5 mb-7 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[22px] text-[#8A9A5B]">eco</span>
              <p className="font-['Inter'] text-[15px] font-semibold text-[#56642B]">
                Sizning ekologik ta'siringiz
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: 'water_drop', value: '2,700 L', label: 'Suv tejaldi' },
                { icon: 'co2', value: '3.5 kg', label: 'CO₂ kamaydi' },
              ].map(({ icon, value, label }) => (
                <div key={label} className="bg-white rounded-lg p-3 text-center">
                  <span className="material-symbols-outlined text-[22px] text-[#8A9A5B] block mb-1">{icon}</span>
                  <p className="font-['Inter'] text-[16px] font-bold text-[#1A1A1A]">{value}</p>
                  <p className="font-['Inter'] text-[12px] text-[#6B6B6B]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="font-['Inter'] text-[14px] text-[#6B6B6B] mb-7">
            Buyurtmangiz holati haqida elektron pochta orqali xabardor qilinasiz.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/katalog"
              className="flex-1 h-12 rounded-lg border-2 border-[#E5E5E5] font-['Inter'] text-[15px] font-semibold text-[#6B6B6B] hover:border-[#8A9A5B] hover:text-[#8A9A5B] transition-all flex items-center justify-center"
            >
              Xarid qilishni davom etish
            </Link>
            <Link
              to="/profil"
              className="flex-1 h-12 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[15px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Buyurtmalarim
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
