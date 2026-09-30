import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingBag } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import ImageWithFallback from '../components/UI/ImageWithFallback.jsx';
import { api, getApiErrorMessage } from '../lib/api.js';
import WishlistToggle from '../components/UI/WishlistToggle.jsx';

const formatPrice = (price, currency = 'UZS') => new Intl.NumberFormat('uz-UZ', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(price);

export default function WishlistPage() {
  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await api.get('/wishlist');
      return data.data.wishlist;
    },
  });

  return (
    <>
      <Helmet>
        <title>Istaklar ro‘yxati — AURA</title>
      </Helmet>

      <main className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <div className="mb-8 flex items-center gap-3">
          <Heart size={24} className="text-[#71814B]" aria-hidden="true" />
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A] md:text-4xl">
            Istaklar ro‘yxati
          </h1>
        </div>

        {wishlistQuery.isLoading ? (
          <p className="rounded-xl bg-white p-10 text-center font-['Inter'] text-sm text-[#6B6B6B]">
            Saqlangan mahsulotlar yuklanmoqda…
          </p>
        ) : wishlistQuery.isError ? (
          <div role="alert" className="rounded-xl bg-white px-6 py-12 text-center">
            <p className="font-['Inter'] text-sm text-red-700">
              {getApiErrorMessage(wishlistQuery.error, 'Istaklar ro‘yxatini yuklab bo‘lmadi.')}
            </p>
            <button
              type="button"
              onClick={() => wishlistQuery.refetch()}
              className="mt-5 rounded-lg bg-[#8A9A5B] px-5 py-3 font-['Inter'] text-sm font-semibold text-white"
            >
              Qayta yuklash
            </button>
          </div>
        ) : wishlistQuery.data.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-card">
            <Heart size={36} className="mx-auto mb-4 text-[#C6C8B8]" aria-hidden="true" />
            <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1A1A1A]">
              Saqlangan mahsulot yo‘q
            </h2>
            <p className="mx-auto mt-2 max-w-md font-['Inter'] text-sm leading-relaxed text-[#6B6B6B]">
              Katalogda yurak belgisini bosib, keyin ko‘rmoqchi bo‘lgan mahsulotlaringizni shu yerda saqlang.
            </p>
            <Link
              to="/katalog"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-[#71814B] px-5 font-['Inter'] text-sm font-semibold text-white hover:bg-[#56642B]"
            >
              <ShoppingBag size={17} aria-hidden="true" />
              Katalogni ko‘rish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {wishlistQuery.data.map((product) => {
              const image = product.images?.[0];
              return (
                <article key={product._id} className="group overflow-hidden rounded-xl bg-white p-3 shadow-card">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#F0EDED]">
                    <Link to={`/mahsulot/${product.slug}`} className="block h-full">
                      <ImageWithFallback
                        src={image?.url}
                        alt={image?.alt || product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    <WishlistToggle
                      productId={product._id}
                      className="absolute right-3 top-3 z-10 h-10 w-10 rounded-full bg-white/95 text-red-600 shadow-sm"
                    />
                  </div>
                  <div className="px-1 pb-2 pt-4">
                    <p className="mb-1 font-['Inter'] text-[11px] font-semibold uppercase tracking-wider text-[#71814B]">
                      {product.category?.name || product.ecoBadge}
                    </p>
                    <Link to={`/mahsulot/${product.slug}`}>
                      <h2 className="font-['Inter'] text-sm font-semibold text-[#1A1A1A] hover:text-[#56642B]">
                        {product.name}
                      </h2>
                    </Link>
                    <p className="mt-2 font-['Inter'] text-base font-bold text-[#1A1A1A]">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
