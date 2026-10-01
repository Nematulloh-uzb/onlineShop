import { Link } from 'react-router-dom';
import BrandLogo from '../UI/BrandLogo.jsx';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] py-14 text-white">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Link to="/" aria-label="VERDE Luxe Nature bosh sahifa" className="inline-flex">
              <BrandLogo className="h-12 w-auto max-w-[230px] text-white" />
            </Link>
            <p className="mt-4 max-w-sm font-['Inter'] text-sm leading-relaxed text-white/65">
              LUXE NATURE — tabiiy nafislik va puxta tanlangan erkaklar uslubi.
            </p>
          </div>

          <nav aria-label="Katalog havolalari">
            <h2 className="mb-4 font-['Inter'] text-xs font-semibold uppercase tracking-widest text-white/45">
              Katalog
            </h2>
            <ul className="space-y-3">
            {[
              ['Erkaklar kiyimi', '/katalog/erkaklar'],
              ['Aksessuarlar', '/katalog/aksessuarlar'],
              ['Barcha erkaklar mahsulotlari', '/katalog'],
            ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="font-['Inter'] text-sm text-white/65 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Shaxsiy kabinet havolalari">
            <h2 className="mb-4 font-['Inter'] text-xs font-semibold uppercase tracking-widest text-white/45">
              Hisobingiz
            </h2>
            <ul className="space-y-3">
              {[
                ['Kirish / ro‘yxatdan o‘tish', '/kirish'],
                ['Buyurtmalarim', '/profil'],
                ['Istaklar ro‘yxati', '/istaklar'],
                ['Savat', '/savat'],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="font-['Inter'] text-sm text-white/65 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 sm:flex-row">
          <p className="font-['Inter'] text-xs text-white/45">
            © {currentYear} VERDE. Barcha huquqlar himoyalangan.
          </p>
          <p className="font-['Inter'] text-xs text-white/45">
            Buyurtma va hisob ma’lumotlari faqat tizimga kirgan foydalanuvchiga ko‘rsatiladi.
          </p>
        </div>
      </div>
    </footer>
  );
}
