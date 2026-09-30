import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDRuFZNBX3pzFy4kqRoTt2J30I4-Z65XpUDq5eHPvIni9CcxAeUkw03oM5gr315J3SBDrZ2xByfgpgLf8UcyAyHHqn9u0LjCMW-mtS6dxh_gLRxIAP4a8pe992YLQfbEP0_AhJaNlXu4VD4zj-3gffFr8jAAWYGlUu8fnqil80cq3z9spTJMmNux2KXazd-NtiLttULXT-Er9u4o7JXrX-DOyAP9VtUURZ-HBVRy0fCDIeDZrxGjQm12g';

const CATEGORIES = [
  {
    title: 'Ayollar',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfT6HYO6v0s2eke3LcgLa9uxNs3xZ-kiw6lVxIjswMetWEf8-jhn2QY_j3SfiNjanbGfucYbrOPz7TycBw8KgZhcFWZn4YAMLoxkkviKSjxh0tcx5ksfVAgCiTMTP1pzuTbUfi3luDZYcH2kATBsvUNPT671vPyzVSGVmes2-oB87rMjjQyE7VqIEba-kunLWJ6WJsbfR2h3ci9H1cXslBVrJhqn6i8aPYcEh482Iye-vV1qyIQhA78w',
  },
  {
    title: 'Erkaklar',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCa2pPcn_Euzszz2bTJFL9Ep7lGf4hpalct-0zLca2MYuVhst1-nxK61cojGDAOMhTj6tyRA6WjkfPec_NJURUfDIlWNoqlncK9g5zsDN75J73OrRJEi-Fu66UerMKneFYWONh0QvNpBzijZHxes7UmrpnZVue2fA_r8ecmaw_Zt23k3nVRjW8d7NaHidF5ou842qRdWix0HNWmaDRz6iJsDgltyhuiKZ6m6N2htY7_myF8-45sNWQMrw',
  },
  {
    title: 'Aksessuarlar',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4OdYJs9dJAmFCQCBBxUdzkGTxbKSpKBfIPgfkc2GjPxJF7wol1pZ5_5KM33fodISEQg7ncQb_KA6hGhTgvbxDHSeZNkxIM8pJFmukV4jF_fngnGgnLyrR7FS4G6Nsw6dWcNlnspdY8aAl_FNtngS5GaeDnRFgfBbx8xBM_RRkxiuQ9K3l7oZ2QT1zIxXnk1bLURR4kZQeruYMowkvoPCVRJvJrBegwbajs5Dh8tWQX3GYqrS4VLfrtw',
  },
];

const PRODUCTS = [
  { name: "Zig'ir ko'ylak", price: '$120.00', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbZfRhZ8ljS3J5KLjchqPNfMObsBefdPxBvT9ITDFx7nIxczO63NxOvhsXNdY8lGY-553Ro2-MX18QjtHwaPSJAjDYvwj-ERsbhXTrrOiXPOG7tAtkJTWUSo0YlrN-_zbyhBfq1ZwsO4bjbtQv5E-i4ZFNuNkqEQYQvdZztgKCeNL_S5kMCLGtlwfYsbF5D4LQbdVYiUdbaezLBKZa9M54-uIW0gHkQHjnUgSm86zxX24HkN5voOkvnQ', slug: 'zigir-koylak' },
  { name: 'Paxta futbolka', price: '$45.00', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrtfuxAqNwPIXymAOOOAnEiIivPUZ619lTg3EpkRQayCdwP4MEeviQwU6H0Mb6Vp0USDIvtMQOf0PuMRzlv8UIjHg7zhz0GMrH-UmzjltqEX74DRdNFDYU4Jp49kb_B8ko9OIGez5Mjr22w98SfbGesJFAxyBJiKWXIGf5NCYnx5dxpvTeln3izXpfB3JX2ksLmHhvjrvOJQCrpVSX4yyTTWj6SFE5JqhzXmNOdgc-lUF2QMFnHADohg', slug: 'paxta-futbolka' },
  { name: 'Jun palto', price: '$280.00', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAeFl5pxoMuRsZj0MMy4ZH_LrKSePpCtMmj-a1PHRkXaW-Gavnh2SCudeWAR1-lrH8VWvodDne_SxD9KVM2XaLnCLR028K8OZiyga460QgYDFHHBAWNJuNF4ivfj378fO3l6_2eHLawqiCH5EyNtuUUtxBibL2zEsoD9ZFolkTCgRjkzWHqVSmsKCv_loJJgxDH6DC_HuFsW8bOVTtSMT_ZAY9CebS55Smp5kkSJWIAQ0KZIBu0SiY7w', slug: 'jun-palto' },
  { name: 'Ipak bluzka', price: '$150.00', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBo1t5eThbUXz1wkp4sNn2efaAT3CDwzpv-DARk5tEJYjJkc3Q_j3DKZfCaVJlHGfg5XpqneMkIpslcsOmlrv_LjgrKo2RpQJQaktodbmwCanaR3XYPEb-NwI2D9vbeGeiaG15pF-pwsnqKA0lDIrwJrnqSPQziH83DLWKUkW4JP6ZQmCPn5KRXpFhR8Us_2bDQxYtWsSpUWHY44JNntMdSKyW1W8uKoFOmUD3PWeGCEPFuj5guuJ7bNQ', slug: 'ipak-bluzka' },
];

const TESTIMONIALS = [
  { name: 'Dilnoza A.', location: 'Toshkent', initials: 'DA', text: '"Sifat juda yuqori. Zig\'ir ko\'ylak bir necha yuvishdan keyin ham o\'z shaklini saqlab qoldi. Albatta yana xarid qilaman!"' },
  { name: 'Sardor M.', location: 'Samarqand', initials: 'SM', text: '"Yetkazib berish juda tez bo\'ldi. Qadoqlash ham ekologik toza edi. Bu brendga ishonch to\'liq!"' },
  { name: 'Nilufar K.', location: 'Buxoro', initials: 'NK', text: '"Narxlar biroz qimmat, lekin sifat bunga arziydi. Har bir tiyin o\'zini oqlaydi."' },
];

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>AURA — Barqaror Hashamatli Moda</title>
        <meta name="description" content="Aura — Barqaror kelajak uchun ongli moda. Sof ekologik tozalik va nafis hashamat uyg'unligi." />
      </Helmet>

      {/* HERO */}
      <section className="relative w-full min-h-[850px] lg:h-screen -mt-20 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100 hover:scale-105"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 pt-28 pb-16 flex flex-col items-center text-center">
          <span className="font-['Inter'] text-[14px] font-semibold uppercase tracking-[0.15em] text-white drop-shadow-sm mb-4">
            YANGI KOLLEKSIYA 2026
          </span>
          <h1 className="font-['Playfair_Display'] text-[40px] md:text-[64px] font-bold text-white max-w-[860px] leading-[1.1] mb-6 drop-shadow-md">
            Zamonaviy davr uchun ongli moda
          </h1>
          <p className="font-['Inter'] text-[16px] md:text-[18px] text-white/90 max-w-[620px] leading-relaxed mb-10">
            Tabiat bilan uyg'unlikda yaratilgan har bir kiyim. Sifatli materiallar, adolatli mehnat va barqaror kelajak uchun.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/katalog"
              className="px-10 h-14 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[16px] font-semibold rounded-lg transition-all duration-300 shadow-md flex items-center justify-center gap-2"
            >
              Kolleksiyani ko'rish
            </Link>
            <a
              href="#kategoriyalar"
              className="px-10 h-14 bg-transparent border-2 border-white text-white font-['Inter'] text-[16px] font-semibold rounded-lg hover:bg-white hover:text-[#1A1A1A] transition-all duration-300 flex items-center justify-center"
            >
              Batafsil ma'lumot
            </a>
          </div>
        </div>
        <a
          href="#kategoriyalar"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/80 hover:text-white transition-colors animate-bounce flex flex-col items-center"
          aria-label="Pastga"
        >
          <span className="material-symbols-outlined text-[32px]">keyboard_arrow_down</span>
        </a>
      </section>

      {/* CATEGORIES */}
      <section id="kategoriyalar" className="w-full py-24 bg-[#F9F9F9]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-['Inter'] text-[12px] font-semibold uppercase text-[#8A9A5B] tracking-widest block mb-2">
              Tanlov imkoniyati
            </span>
            <h2 className="font-['Playfair_Display'] text-[32px] md:text-[40px] font-bold text-[#1A1A1A] leading-tight">
              Kategoriyalar bo'yicha xarid qiling
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {CATEGORIES.map(({ title, image }) => (
              <Link
                key={title}
                to="/katalog"
                className="group relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 block"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url('${image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-500" />
                <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col items-start gap-1 text-white">
                  <h3 className="font-['Playfair_Display'] text-[28px] font-semibold">{title}</h3>
                  <span className="font-['Inter'] text-[14px] font-semibold flex items-center gap-1 text-[#D9EAA3] group-hover:translate-x-1.5 transition-transform duration-300">
                    Xarid qilish{' '}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="w-full py-24 bg-[#F9F9F9]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between items-start gap-3 mb-12">
            <div>
              <span className="font-['Inter'] text-[12px] font-semibold uppercase text-[#8A9A5B] tracking-widest block mb-2">
                Eng so'nggi namunalar
              </span>
              <h2 className="font-['Playfair_Display'] text-[32px] md:text-[40px] font-bold text-[#1A1A1A] leading-tight">
                Yangi kelganlar
              </h2>
            </div>
            <Link
              to="/katalog"
              className="font-['Inter'] text-[16px] text-[#8A9A5B] hover:text-[#6E7A47] font-semibold flex items-center gap-1 group transition-colors"
            >
              Barchasini ko'rish{' '}
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {PRODUCTS.map(({ name, price, image, slug }) => (
              <div
                key={slug}
                className="group bg-white rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#F0EDED] mb-3">
                  <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#8A9A5B] text-white font-['Inter'] text-[12px] font-semibold rounded-full tracking-wider">
                    YANGI
                  </span>
                  <button
                    aria-label="Istaklarga qo'shish"
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur text-[#6B6B6B] hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                  </button>
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${image}')` }}
                  />
                  <Link
                    to={`/mahsulot/${slug}`}
                    className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 h-12 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[14px] font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                    Savatga qo'shish
                  </Link>
                </div>
                <div className="px-1 pb-1 flex flex-col gap-1">
                  <Link to={`/mahsulot/${slug}`}>
                    <h4 className="font-['Inter'] text-[16px] font-semibold text-[#1A1A1A] hover:text-[#8A9A5B] transition-colors">
                      {name}
                    </h4>
                  </Link>
                  <span className="font-['Inter'] text-[16px] text-[#1A1A1A] font-semibold">{price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section id="bizning-hikoyamiz" className="w-full py-24 bg-[#F9F9F9] overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0 items-center">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4DfKKN3v6T22d4ir8Rr95rLf_e0garYIV2sATmzDoYrm37PTxfroYiuyKUuZEwO9wdo5gZ5dVofoZrxXOhNZ-aJ7S358mxFHy9GQcu5nx3GFa1wvknB9_0pV4YFaaIWdzRX9r3SbOueLu6rUFPAcKcOAkafUDqqAQbM0-xC7I8THatOOoljyxj24zZu83oF598-DF93KQ2lPRiBSchN8kt9wG74YwpBK8hHhGELkVSD89Vdet0JYZ1g')" }}
              />
            </div>
            <div className="flex flex-col lg:pl-20 items-start">
              <span className="font-['Inter'] text-[12px] uppercase tracking-[0.15em] text-[#8A9A5B] mb-3 font-semibold">
                BIZNING HIKOYAMIZ
              </span>
              <h2 className="font-['Playfair_Display'] text-[32px] md:text-[40px] font-bold text-[#1A1A1A] mb-4 leading-tight">
                Maqsad bilan yaratilgan
              </h2>
              <p className="font-['Inter'] text-[16px] text-[#6B6B6B] leading-relaxed mb-6 max-w-xl">
                2018-yildan beri biz barqaror moda harakatining bir qismimiz. Har bir kiyim tabiiy materiallardan, adolatli mehnat sharoitida va atrof-muhitga zarar yetkazmasdan yaratiladi.
              </p>
              <div className="bg-white rounded-xl p-4 mb-6 w-full max-w-md flex items-center gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                <div className="w-12 h-12 rounded-full bg-[#8A9A5B]/15 flex items-center justify-center text-[#8A9A5B] shrink-0">
                  <span className="material-symbols-outlined text-[24px]">eco</span>
                </div>
                <div>
                  <p className="font-['Inter'] text-[16px] text-[#1A1A1A] font-semibold">
                    100% Organik & Qayta ishlanuvchi
                  </p>
                  <p className="font-['Inter'] text-[14px] text-[#6B6B6B]">
                    Har bir xarid orqali tabiatga karbon izini kamaytirasiz.
                  </p>
                </div>
              </div>
              <Link
                to="/katalog"
                className="font-['Inter'] text-[16px] font-semibold text-[#8A9A5B] hover:text-[#6E7A47] flex items-center gap-2 group transition-colors"
              >
                Bizning tariximizni o'qing{' '}
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1.5 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="w-full py-24 bg-[#F9F9F9]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-['Inter'] text-[12px] font-semibold uppercase text-[#8A9A5B] tracking-widest block mb-2">
              Haqiqiy fikrlar
            </span>
            <h2 className="font-['Playfair_Display'] text-[32px] md:text-[40px] font-bold text-[#1A1A1A]">
              Mijozlarimiz nima deydi
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {TESTIMONIALS.map(({ name, location, initials, text }) => (
              <div
                key={name}
                className="relative bg-white rounded-xl p-8 shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden"
              >
                <span className="absolute -right-2 -bottom-6 select-none text-[120px] leading-none font-serif text-[#8A9A5B] opacity-[0.08]">
                  "
                </span>
                <div className="relative z-10 flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-1 text-[#8A9A5B]">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <p className="font-['Inter'] text-[16px] text-[#6B6B6B] leading-relaxed italic">{text}</p>
                </div>
                <div className="relative z-10 flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-[#8A9A5B]/20 flex items-center justify-center text-[#56642B] font-['Inter'] text-[14px] font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="font-['Inter'] text-[16px] text-[#1A1A1A] font-semibold">{name}</p>
                    <p className="font-['Inter'] text-[14px] text-[#6B6B6B]">{location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="w-full py-24 bg-[#F0F2E8]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-col items-center text-center">
          <span className="w-12 h-12 rounded-full bg-[#8A9A5B]/15 flex items-center justify-center text-[#8A9A5B] mb-4">
            <span className="material-symbols-outlined text-[24px]">mail</span>
          </span>
          <h2 className="font-['Playfair_Display'] text-[32px] md:text-[40px] font-bold text-[#1A1A1A] mb-2 leading-tight">
            Aura hamjamiyatiga qo'shiling
          </h2>
          <p className="font-['Inter'] text-[16px] text-[#6B6B6B] max-w-lg mb-8 leading-relaxed">
            Yangi kolleksiyalar, chegirmalar va ekologik moda yangiliklari haqida birinchilardan bo'lib xabar toping.
          </p>
          <form className="w-full max-w-md flex flex-col sm:flex-row gap-2 items-center" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Elektron pochtangizni kiriting"
              required
              className="w-full h-12 px-4 rounded-lg bg-white text-[#1A1A1A] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] font-['Inter'] text-[14px] border border-[#E5E2E1]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 h-12 px-8 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[16px] font-semibold rounded-lg transition-all shadow-md"
            >
              Obuna bo'lish
            </button>
          </form>
          <p className="font-['Inter'] text-[12px] text-[#6B6B6B] mt-3">
            Spam yo'q. Istalgan vaqt obunani bekor qilishingiz mumkin.
          </p>
        </div>
      </section>
    </>
  );
}
