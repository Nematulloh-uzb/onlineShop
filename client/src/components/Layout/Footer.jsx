import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-['Playfair_Display'] text-[22px] font-semibold tracking-widest uppercase">
                AURA
              </span>
            </div>
            <p className="font-['Inter'] text-[14px] text-white/60 leading-relaxed mb-5">
              Barqaror kelajak uchun ongli moda. Sof ekologik tozalik va nafis hashamat uyg'unligi.
            </p>
            <div className="flex items-center gap-3">
              {['instagram', 'facebook', 'pinterest'].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  aria-label={icon}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-['Inter'] text-[12px] uppercase tracking-widest text-white/40 mb-4 font-semibold">
              Do'kon
            </h4>
            <ul className="space-y-2">
              {["Ayollar kiyimi", "Erkaklar kiyimi", "Aksessuarlar", "Yangi kelganlar", "Chegirmalar"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/katalog"
                      className="font-['Inter'] text-[14px] text-white/60 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-['Inter'] text-[12px] uppercase tracking-widest text-white/40 mb-4 font-semibold">
              Kompaniya
            </h4>
            <ul className="space-y-2">
              {["Biz haqimizda", "Barqarorlik", "Jurnal", "Aloqa", "Hamkorlik"].map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="font-['Inter'] text-[14px] text-white/60 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-['Inter'] text-[12px] uppercase tracking-widest text-white/40 mb-4 font-semibold">
              Obuna bo'ling
            </h4>
            <p className="font-['Inter'] text-[14px] text-white/60 leading-relaxed mb-4">
              Yangi kolleksiyalar va ekologik moda yangiliklari.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email manzilingiz"
                className="flex-1 h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-['Inter'] text-[13px] focus:outline-none focus:border-[#8A9A5B] transition-colors"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-lg bg-[#8A9A5B] hover:bg-[#6E7A47] transition-colors font-['Inter'] text-[13px] font-semibold"
              >
                OK
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-['Inter'] text-[12px] text-white/40">
            © 2026 AURA. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center gap-4">
            {["Maxfiylik siyosati", "Foydalanish shartlari"].map((item) => (
              <a
                key={item}
                href="#"
                className="font-['Inter'] text-[12px] text-white/40 hover:text-white/70 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
