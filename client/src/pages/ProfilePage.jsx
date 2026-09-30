import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const ORDERS = [
  {
    orderNumber: 'AUR-2026-0001',
    date: '30 Sentyabr 2026',
    status: 'Yetkazildi',
    total: '$245.00',
    items: 3,
  },
];

export default function ProfilePage() {
  return (
    <>
      <Helmet>
        <title>Mening profilim — AURA</title>
      </Helmet>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)] mb-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#8A9A5B] flex items-center justify-center mb-3">
                  <span className="font-['Playfair_Display'] text-[28px] font-bold text-white">D</span>
                </div>
                <h2 className="font-['Inter'] text-[18px] font-semibold text-[#1A1A1A]">Dilnoza K.</h2>
                <p className="font-['Inter'] text-[13px] text-[#6B6B6B]">dilnoza@email.com</p>
              </div>
            </div>

            <nav className="bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
              {[
                { icon: 'receipt_long', label: 'Buyurtmalarim', active: true },
                { icon: 'favorite', label: 'Istaklar ro\'yxati' },
                { icon: 'location_on', label: 'Manzillarim' },
                { icon: 'manage_accounts', label: 'Profil sozlamalari' },
              ].map(({ icon, label, active }) => (
                <button
                  key={label}
                  className={`w-full flex items-center gap-3 px-5 py-4 font-['Inter'] text-[14px] font-semibold transition-colors border-b border-[#F0EDED] last:border-0 ${
                    active ? 'text-[#8A9A5B] bg-[#F0F2E8]' : 'text-[#6B6B6B] hover:bg-[#F9F9F9]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <h1 className="font-['Playfair_Display'] text-[28px] font-bold text-[#1A1A1A] mb-6">
              Buyurtmalarim
            </h1>

            {ORDERS.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-[0_4px_12px_rgba(0,0,0,0.06)] text-center">
                <span className="material-symbols-outlined text-[48px] text-[#E5E5E5] block mb-3">receipt_long</span>
                <p className="font-['Inter'] text-[16px] text-[#6B6B6B] mb-4">
                  Hali hech qanday buyurtma yo'q
                </p>
                <Link
                  to="/katalog"
                  className="inline-flex items-center gap-2 px-6 h-11 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[14px] font-semibold rounded-lg transition-colors"
                >
                  Xarid qilishni boshlash
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {ORDERS.map((order) => (
                  <div
                    key={order.orderNumber}
                    className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-['Inter'] text-[16px] font-bold text-[#1A1A1A]">
                            #{order.orderNumber}
                          </span>
                          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 font-['Inter'] text-[12px] font-semibold rounded-full">
                            {order.status}
                          </span>
                        </div>
                        <p className="font-['Inter'] text-[13px] text-[#6B6B6B]">
                          {order.date} • {order.items} ta mahsulot
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-['Inter'] text-[18px] font-bold text-[#1A1A1A]">
                          {order.total}
                        </span>
                        <Link
                          to={`/buyurtma/${order.orderNumber}`}
                          className="h-9 px-4 rounded-lg border-2 border-[#E5E5E5] font-['Inter'] text-[13px] font-semibold text-[#6B6B6B] hover:border-[#8A9A5B] hover:text-[#8A9A5B] transition-all flex items-center"
                        >
                          Ko'rish
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
