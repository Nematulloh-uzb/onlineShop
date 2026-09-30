import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Check, Leaf, PackageCheck, Truck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import WishlistToggle from '../components/UI/WishlistToggle.jsx';
import { api, getApiErrorMessage } from '../lib/api.js';

const formatPrice = (price, currency = 'UZS') => new Intl.NumberFormat('uz-UZ', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(price);

export default function HomePage() {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data.categories;
    },
  });
  const productsQuery = useQuery({
    queryKey: ['products', 'home-featured'],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: { limit: 4, featured: true, sort: 'mashhur' } });
      return data.data.products;
    },
  });

  const categories = (categoriesQuery.data || [])
    .filter(({ slug }) => ['ayollar', 'erkaklar', 'aksessuarlar'].includes(slug))
    .slice(0, 3);

  return (
    <>
      <Helmet>
        <title>AURA — Ongli tanlov, uzoq xizmat</title>
        <meta
          name="description"
          content="Tabiiy materiallardan yaratilgan AURA kiyimlari. Kolleksiyani ko‘ring va o‘zingizga mos mahsulotni toping."
        />
      </Helmet>

      <section className="relative isolate flex min-h-[660px] items-center overflow-hidden bg-[#263326] lg:min-h-[760px]">
        <img
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=2200&auto=format&fit=crop&q=85"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        <div className="mx-auto w-full max-w-[1280px] px-6 py-28 md:px-10">
          <div className="max-w-2xl text-white">
            <p className="mb-5 inline-flex items-center gap-2 font-['Inter'] text-xs font-semibold uppercase tracking-[0.2em] text-[#E2E8D1]">
              <Leaf size={16} aria-hidden="true" />
              Tabiiy materiallar · O‘ylangan dizayn
            </p>
            <h1 className="font-['Playfair_Display'] text-5xl font-medium leading-[1.08] md:text-7xl">
              Kamroq, yaxshiroq va uzoqroq.
            </h1>
            <p className="mt-6 max-w-xl font-['Inter'] text-base leading-7 text-white/85 md:text-lg">
              Kundalik hayot uchun qulay, puxta tanlangan materiallardan yaratilgan liboslar. O‘zingizga mos kolleksiyani kashf eting.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/katalog"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-[#8A9A5B] px-7 font-['Inter'] text-sm font-semibold text-white transition-colors hover:bg-[#6E7A47]"
              >
                Kolleksiyani ko‘rish
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="#bizning-tamoyillar"
                className="inline-flex h-14 items-center justify-center rounded-lg border border-white/60 px-7 font-['Inter'] text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Bizning yondashuv
              </a>
            </div>
          </div>
        </div>
        <a
          href="#kategoriyalar"
          aria-label="Kategoriyalarni ko‘rish"
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 font-['Inter'] text-xs font-medium text-white/80 transition-colors hover:text-white"
        >
          Pastga aylantiring
          <span className="material-symbols-outlined text-2xl">keyboard_arrow_down</span>
        </a>
      </section>

      <section id="kategoriyalar" className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 font-['Inter'] text-xs font-semibold uppercase tracking-[0.16em] text-[#71814B]">
                O‘zingizga mosini toping
              </p>
              <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[#1A1A1A] md:text-4xl">
                Kategoriyalar
              </h2>
            </div>
            <Link to="/katalog" className="inline-flex items-center gap-2 font-['Inter'] text-sm font-semibold text-[#56642B] hover:text-[#8A9A5B]">
              Barcha mahsulotlar
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          {categoriesQuery.isError ? (
            <p role="alert" className="rounded-xl bg-[#F9F9F9] p-6 font-['Inter'] text-sm text-[#6B6B6B]">
              {getApiErrorMessage(categoriesQuery.error, 'Kategoriyalarni yuklab bo‘lmadi.')}
            </p>
          ) : categoriesQuery.isLoading ? (
            <p className="rounded-xl bg-[#F9F9F9] p-6 font-['Inter'] text-sm text-[#6B6B6B]">Kategoriyalar yuklanmoqda…</p>
          ) : categories.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/katalog/${category.slug}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#EAE7E7]"
                >
                  {category.image && (
                    <img
                      src={category.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                    <div>
                      <h3 className="font-['Playfair_Display'] text-2xl font-semibold">{category.name}</h3>
                      {category.description && (
                        <p className="mt-1 max-w-xs font-['Inter'] text-xs text-white/80">{category.description}</p>
                      )}
                    </div>
                    <ArrowRight className="shrink-0 transition-transform group-hover:translate-x-1" size={20} aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-[#F9F9F9] p-6 font-['Inter'] text-sm text-[#6B6B6B]">
              Hozircha katalog kategoriyalari mavjud emas.
            </p>
          )}
        </div>
      </section>

      <section className="bg-[#F7F7F3] py-20 md:py-24">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 font-['Inter'] text-xs font-semibold uppercase tracking-[0.16em] text-[#71814B]">
                Ko‘p tanlangan
              </p>
              <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[#1A1A1A] md:text-4xl">
                Kolleksiyadan tanlov
              </h2>
            </div>
            <Link to="/katalog" className="inline-flex items-center gap-2 font-['Inter'] text-sm font-semibold text-[#56642B] hover:text-[#8A9A5B]">
              Katalogga o‘tish
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          {productsQuery.isError ? (
            <p role="alert" className="rounded-xl bg-white p-6 font-['Inter'] text-sm text-[#6B6B6B]">
              {getApiErrorMessage(productsQuery.error, 'Mahsulotlarni yuklab bo‘lmadi.')}
            </p>
          ) : productsQuery.isLoading ? (
            <p className="rounded-xl bg-white p-6 font-['Inter'] text-sm text-[#6B6B6B]">Mahsulotlar yuklanmoqda…</p>
          ) : productsQuery.data?.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {productsQuery.data.map((product) => {
                const image = product.images?.[0];
                return (
                  <article key={product._id} className="group overflow-hidden rounded-xl bg-white p-3 shadow-card">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#F0EDED]">
                          <Link
                            to={`/mahsulot/${product.slug}`}
                            aria-label={`${product.name} mahsulotini ko‘rish`}
                            className="block h-full"
                          >
                            {image?.url && (
                              <img
                                src={image.url}
                                alt={image.alt || product.name}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            )}
                          </Link>
                          <WishlistToggle
                            productId={product._id}
                            className="absolute right-3 top-3 z-10 h-10 w-10 rounded-full bg-white/95 text-[#56642B] shadow-sm hover:text-red-600"
                          />
                        </div>
                        <div className="px-1 pb-2 pt-4">
                      <p className="mb-1 font-['Inter'] text-[11px] font-semibold uppercase tracking-wider text-[#71814B]">
                        {product.ecoBadge}
                      </p>
                      <h3 className="font-['Inter'] text-sm font-semibold text-[#1A1A1A]">
                        <Link to={`/mahsulot/${product.slug}`} className="hover:text-[#56642B]">{product.name}</Link>
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-['Inter'] text-base font-bold text-[#1A1A1A]">
                          {formatPrice(product.price, product.currency)}
                        </span>
                        {product.compareAtPrice > product.price && (
                          <span className="font-['Inter'] text-xs text-[#6B6B6B] line-through">
                            {formatPrice(product.compareAtPrice, product.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl bg-white p-6 font-['Inter'] text-sm text-[#6B6B6B]">
              Hozircha tanlangan mahsulotlar yo‘q. Katalogni ko‘rib chiqing.
            </p>
          )}
        </div>
      </section>

      <section id="bizning-tamoyillar" className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 font-['Inter'] text-xs font-semibold uppercase tracking-[0.16em] text-[#71814B]">
              Tanlov ortidagi qadriyatlar
            </p>
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[#1A1A1A] md:text-4xl">
              Har bir detal o‘ylab tanlanadi
            </h2>
            <p className="mt-4 font-['Inter'] text-sm leading-relaxed text-[#6B6B6B]">
              Material, kelib chiqish va parvarish haqidagi ma’lumotlarni mahsulot sahifasida ochiq ko‘rsatamiz.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Leaf, title: 'Material haqida ochiqlik', text: 'Tarkib va material tafsilotlarini mahsulot sahifasida ko‘ring.' },
              { icon: Check, title: 'Tanlab olingan sifat', text: 'Har bir mahsulot o‘ziga xos tavsif va parvarish yo‘riqnomasi bilan.' },
              { icon: PackageCheck, title: 'Aniq buyurtma holati', text: 'Kirishdan so‘ng buyurtmalaringizni shaxsiy kabinetingizda kuzating.' },
              { icon: Truck, title: 'Yetkazib berish', text: 'Yetkazib berish narxi va shartlari buyurtmani tasdiqlashdan oldin ko‘rsatiladi.' },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="border-t border-[#E5E5E5] pt-5">
                <Icon size={23} strokeWidth={1.6} className="mb-4 text-[#71814B]" aria-hidden="true" />
                <h3 className="font-['Inter'] text-sm font-semibold text-[#1A1A1A]">{title}</h3>
                <p className="mt-2 font-['Inter'] text-sm leading-relaxed text-[#6B6B6B]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
