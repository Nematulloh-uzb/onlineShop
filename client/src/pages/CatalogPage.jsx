import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ImageWithFallback from '../components/UI/ImageWithFallback.jsx';
import WishlistToggle from '../components/UI/WishlistToggle.jsx';
import { api, getApiErrorMessage } from '../lib/api.js';

const FILTERS = [
  { label: 'Barchasi', slug: '' },
  { label: 'Ayollar', slug: 'ayollar' },
  { label: 'Erkaklar', slug: 'erkaklar' },
  { label: 'Aksessuarlar', slug: 'aksessuarlar' },
];
const SORT_OPTIONS = [
  { label: 'Yangilar', value: 'yangi' },
  { label: "Narx: kamdan ko'p", value: 'narx_osish' },
  { label: "Narx: ko'pdan kam", value: 'narx_kamayish' },
  { label: 'Mashhurlar', value: 'mashhur' },
];
const CATEGORIES = new Map(FILTERS.map(({ label, slug }) => [slug, label]));

const formatPrice = (price, currency = 'UZS') => new Intl.NumberFormat('uz-UZ', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(price);

export default function CatalogPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = useRef(null);
  const categoryIsValid = CATEGORIES.has(categorySlug || '');
  const activeCategory = categoryIsValid ? categorySlug || '' : '';
  const activeFilter = CATEGORIES.get(activeCategory) || 'Barchasi';
  const searchQuery = searchParams.get('search') || '';
  const requestedSort = searchParams.get('sort');
  const sortBy = SORT_OPTIONS.some(({ value }) => value === requestedSort)
    ? requestedSort
    : 'yangi';

  useEffect(() => {
    if (searchParams.has('search') && document.activeElement !== searchInput.current) {
      searchInput.current?.focus();
    }
  }, [searchParams]);

  const productsQuery = useQuery({
    queryKey: ['products', activeCategory, searchQuery, sortBy],
    queryFn: async () => {
      const { data } = await api.get('/products', {
        params: {
          limit: 100,
          ...(activeCategory && { category: activeCategory }),
          ...(searchQuery.trim() && { q: searchQuery.trim() }),
          sort: sortBy,
        },
      });
      return data;
    },
  });

  const products = useMemo(() => productsQuery.data?.data.products || [], [productsQuery.data]);

  const updateSearch = (value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set('search', value);
      else next.delete('search');
      return next;
    }, { replace: true });
  };

  const updateSort = (value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value === 'yangi') next.delete('sort');
      else next.set('sort', value);
      return next;
    }, { replace: true });
  };

  const selectCategory = (slug) => {
    const query = searchParams.toString();
    navigate(`/katalog${slug ? `/${slug}` : ''}${query ? `?${query}` : ''}`);
  };

  return (
    <>
      <Helmet>
        <title>{activeFilter === 'Barchasi' ? 'Katalog' : activeFilter} — AURA</title>
        <meta name="description" content="AURA ekologik moda kolleksiyasidan sifatli kiyim va aksessuarlarni toping." />
      </Helmet>

      <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <div className="mb-8">
          <span className="mb-2 block font-['Inter'] text-xs font-semibold uppercase tracking-widest text-[#8A9A5B]">
            AURA KOLLEKSIYASI
          </span>
          <h1 className="font-['Playfair_Display'] text-4xl font-bold leading-tight text-[#1A1A1A] md:text-5xl">
            {activeFilter === 'Barchasi' ? 'Barcha mahsulotlar' : activeFilter}
          </h1>
          <p className="mt-3 max-w-2xl font-['Inter'] text-sm leading-relaxed text-[#6B6B6B]">
            Kundalik qulaylik va uzoq xizmat qiladigan tabiiy materiallardan tanlang.
          </p>
        </div>

        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map(({ label, slug }) => (
              <button
                key={label}
                type="button"
                onClick={() => selectCategory(slug)}
                aria-pressed={activeCategory === slug}
                className={`h-10 rounded-full border px-4 font-['Inter'] text-[13px] font-semibold transition-colors ${
                  activeCategory === slug
                    ? 'border-[#8A9A5B] bg-[#8A9A5B] text-white'
                    : 'border-[#E5E5E5] bg-white text-[#6B6B6B] hover:border-[#8A9A5B] hover:text-[#1A1A1A]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="catalog-search">Mahsulot qidirish</label>
            <input
              ref={searchInput}
              id="catalog-search"
              type="search"
              value={searchQuery}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Mahsulot qidirish"
              className="h-11 min-w-0 rounded-lg border border-[#E5E5E5] bg-white px-3 font-['Inter'] text-[13px] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] sm:w-60"
            />
            <label className="sr-only" htmlFor="catalog-sort">Saralash</label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(event) => updateSort(event.target.value)}
              className="h-11 rounded-lg border border-[#E5E5E5] bg-white px-3 font-['Inter'] text-[13px] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
            >
              {SORT_OPTIONS.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {productsQuery.isLoading ? (
          <p className="rounded-xl bg-white p-10 text-center font-['Inter'] text-sm text-[#6B6B6B]">
            Katalog yuklanmoqda…
          </p>
        ) : productsQuery.isError ? (
          <div role="alert" className="rounded-xl bg-white px-6 py-12 text-center shadow-card">
            <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1A1A1A]">
              Katalogni yuklab bo‘lmadi
            </h2>
            <p className="mt-2 font-['Inter'] text-sm text-[#6B6B6B]">
              {getApiErrorMessage(productsQuery.error, 'Serverga ulanib bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.')}
            </p>
            <button
              type="button"
              onClick={() => productsQuery.refetch()}
              className="mt-5 rounded-lg bg-[#8A9A5B] px-5 py-3 font-['Inter'] text-sm font-semibold text-white hover:bg-[#6E7A47]"
            >
              Qayta yuklash
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 font-['Inter'] text-sm text-[#6B6B6B]" aria-live="polite">
              {productsQuery.data.meta.total} ta mahsulot
            </p>
            {products.length ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => {
                  const image = product.images?.[0];
                  const available = product.variants?.some((variant) => variant.stock > 0);
                  return (
                    <article
                      key={product._id}
                      className="group min-w-0 overflow-hidden rounded-xl bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover"
                    >
                      <Link
                        to={`/mahsulot/${product.slug}`}
                        aria-label={`${product.name} mahsulotini ko‘rish`}
                        className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-[#F0EDED]"
                      >
                        <ImageWithFallback
                          src={image?.url}
                          alt={image?.alt || product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {product.discountPercent > 0 && (
                          <span className="absolute left-3 top-3 rounded-full bg-[#8A9A5B] px-3 py-1 font-['Inter'] text-xs font-semibold text-white">
                            −{product.discountPercent}%
                          </span>
                        )}
                        <WishlistToggle
                          productId={product._id}
                          className="absolute right-3 top-3 z-10 h-10 w-10 rounded-full bg-white/95 text-[#56642B] shadow-sm hover:text-red-600"
                        />
                        {!available && (
                          <span className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-center font-['Inter'] text-xs font-semibold text-white">
                            Hozircha mavjud emas
                          </span>
                        )}
                      </Link>
                      <div className="px-1 pb-2 pt-4">
                        <p className="mb-1 font-['Inter'] text-[11px] font-semibold uppercase tracking-wider text-[#8A9A5B]">
                          {product.category?.name || product.ecoBadge}
                        </p>
                        <Link to={`/mahsulot/${product.slug}`}>
                          <h2 className="font-['Inter'] text-sm font-semibold text-[#1A1A1A] hover:text-[#56642B]">
                            {product.name}
                          </h2>
                        </Link>
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
              <div className="rounded-xl border border-dashed border-[#C6C8B8] bg-white px-6 py-16 text-center">
                <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1A1A1A]">
                  Mahsulot topilmadi
                </h2>
                <p className="mt-2 font-['Inter'] text-sm text-[#6B6B6B]">
                  Qidiruv so‘zini yoki tanlangan kategoriyani o‘zgartirib ko‘ring.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/katalog')}
                  className="mt-5 rounded-lg bg-[#8A9A5B] px-5 py-3 font-['Inter'] text-sm font-semibold text-white hover:bg-[#6E7A47]"
                >
                  Barcha mahsulotlarni ko‘rish
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
