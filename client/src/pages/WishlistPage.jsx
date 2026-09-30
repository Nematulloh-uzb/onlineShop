import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const WISHLIST = [
  { name: "Zig'ir ko'ylak", price: '$120.00', slug: 'zigir-koylak', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbZfRhZ8ljS3J5KLjchqPNfMObsBefdPxBvT9ITDFx7nIxczO63NxOvhsXNdY8lGY-553Ro2-MX18QjtHwaPSJAjDYvwj-ERsbhXTrrOiXPOG7tAtkJTWUSo0YlrN-_zbyhBfq1ZwsO4bjbtQv5E-i4ZFNuNkqEQYQvdZztgKCeNL_S5kMCLGtlwfYsbF5D4LQbdVYiUdbaezLBKZa9M54-uIW0gHkQHjnUgSm86zxX24HkN5voOkvnQ' },
  { name: 'Jun palto', price: '$280.00', slug: 'jun-palto', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAeFl5pxoMuRsZj0MMy4ZH_LrKSePpCtMmj-a1PHRkXaW-Gavnh2SCudeWAR1-lrH8VWvodDne_SxD9KVM2XaLnCLR028K8OZiyga460QgYDFHHBAWNJuNF4ivfj378fO3l6_2eHLawqiCH5EyNtuUUtxBibL2zEsoD9ZFolkTCgRjkzWHqVSmsKCv_loJJgxDH6DC_HuFsW8bOVTtSMT_ZAY9CebS55Smp5kkSJWIAQ0KZIBu0SiY7w' },
];

export default function WishlistPage() {
  return (
    <>
      <Helmet>
        <title>Istaklar ro'yxati — AURA</title>
      </Helmet>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10">
        <h1 className="font-['Playfair_Display'] text-[36px] font-bold text-[#1A1A1A] mb-8">
          Istaklar ro'yxati
        </h1>

        {WISHLIST.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-[64px] text-[#E5E5E5] mb-4">favorite</span>
            <h2 className="font-['Playfair_Display'] text-[24px] font-semibold text-[#1A1A1A] mb-2">
              Istaklar ro'yxatingiz bo'sh
            </h2>
            <p className="font-['Inter'] text-[15px] text-[#6B6B6B] mb-6">
              Yoqtiрgan mahsulotlarni yurak belgisini bosib saqlang
            </p>
            <Link
              to="/katalog"
              className="px-8 h-12 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[15px] font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              Mahsulotlarni ko'rish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WISHLIST.map(({ name, price, slug, image }) => (
              <div
                key={slug}
                className="group bg-white rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#F0EDED] mb-3">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${image}')` }}
                  />
                  <button
                    aria-label="Istakdan olib tashlash"
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </button>
                  <Link
                    to={`/mahsulot/${slug}`}
                    className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 h-12 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                    Savatga qo'shish
                  </Link>
                </div>
                <div className="px-1">
                  <Link to={`/mahsulot/${slug}`}>
                    <h4 className="font-['Inter'] text-[16px] font-semibold text-[#1A1A1A] hover:text-[#8A9A5B] transition-colors mb-1">
                      {name}
                    </h4>
                  </Link>
                  <span className="font-['Inter'] text-[16px] font-semibold text-[#1A1A1A]">{price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
