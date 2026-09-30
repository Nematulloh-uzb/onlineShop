import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage } from '../lib/api.js';

const formatPrice = (price, currency = 'UZS') => new Intl.NumberFormat('uz-UZ', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(price);

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [promoCode, setPromoCode] = useState('');
  const [actionError, setActionError] = useState('');
  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      return data.data.cart;
    },
  });

  const cartMutation = useMutation({
    mutationFn: async ({ action, itemId, quantity, code }) => {
      if (action === 'update') {
        const { data } = await api.patch(`/cart/items/${itemId}`, { quantity });
        return data.data.cart;
      }
      if (action === 'remove') {
        const { data } = await api.delete(`/cart/items/${itemId}`);
        return data.data.cart;
      }
      const { data } = await api.post('/cart/promo', { code });
      return data.data.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setActionError('');
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error, 'Savatni yangilab bo‘lmadi.'));
    },
  });

  const cart = cartQuery.data;
  const items = cart?.items || [];
  const summary = cart?.summary;
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const updateItem = (action, item) => {
    setActionError('');
    if (action === 'decrease' && item.quantity === 1) {
      cartMutation.mutate({ action: 'remove', itemId: item._id });
      return;
    }
    cartMutation.mutate({
      action: 'update',
      itemId: item._id,
      quantity: item.quantity + (action === 'increase' ? 1 : -1),
    });
  };

  return (
    <>
      <Helmet>
        <title>Savat — AURA</title>
      </Helmet>

      <main className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <div className="mb-8">
          <p className="mb-2 font-['Inter'] text-xs font-semibold uppercase tracking-[0.16em] text-[#71814B]">
            Xaridlaringiz
          </p>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A] md:text-4xl">
            Savat{itemCount > 0 ? ` · ${itemCount} ta mahsulot` : ''}
          </h1>
        </div>

        {cartQuery.isLoading ? (
          <p className="rounded-xl bg-white p-10 text-center font-['Inter'] text-sm text-[#6B6B6B]">
            Savat yuklanmoqda…
          </p>
        ) : cartQuery.isError ? (
          <div role="alert" className="rounded-xl bg-white px-6 py-12 text-center">
            <p className="font-['Inter'] text-sm text-red-700">
              {getApiErrorMessage(cartQuery.error, 'Savatni yuklab bo‘lmadi.')}
            </p>
            <button
              type="button"
              onClick={() => cartQuery.refetch()}
              className="mt-5 rounded-lg bg-[#71814B] px-5 py-3 font-['Inter'] text-sm font-semibold text-white"
            >
              Qayta yuklash
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-card">
            <ShoppingBag size={36} className="mx-auto mb-4 text-[#C6C8B8]" aria-hidden="true" />
            <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1A1A1A]">Savat bo‘sh</h2>
            <p className="mx-auto mt-2 max-w-md font-['Inter'] text-sm leading-relaxed text-[#6B6B6B]">
              Katalogdan mahsulot tanlang. Tanlangan mahsulot va miqdor shu yerda saqlanadi.
            </p>
            <Link
              to="/katalog"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-[#71814B] px-5 font-['Inter'] text-sm font-semibold text-white hover:bg-[#56642B]"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Katalogga qaytish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <section className="space-y-4 lg:col-span-2" aria-label="Savatdagi mahsulotlar">
              {actionError && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-['Inter'] text-sm text-red-700">
                  {actionError}
                </p>
              )}
              {items.map((item) => {
                const product = item.product;
                const image = product?.images?.[0];
                const unitPrice = product?.price ?? item.priceSnapshot;
                return (
                  <article key={item._id} className="flex gap-4 rounded-xl bg-white p-4 shadow-card sm:gap-5 sm:p-5">
                    <Link
                      to={product ? `/mahsulot/${product.slug}` : '/katalog'}
                      aria-label={`${product?.name || 'Mahsulot'} tafsilotlari`}
                      className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-[#F0EDED] sm:h-36 sm:w-28"
                    >
                      {image?.url && (
                        <img src={image.url} alt={image.alt || product.name} className="h-full w-full object-cover" />
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h2 className="font-['Inter'] text-sm font-semibold text-[#1A1A1A]">
                              {product?.name || 'Mahsulot mavjud emas'}
                            </h2>
                            <p className="mt-1 font-['Inter'] text-xs text-[#6B6B6B]">
                              {item.color?.name} · O‘lcham {item.size}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={`${product?.name || 'Mahsulot'}ni savatdan olib tashlash`}
                            disabled={cartMutation.isPending}
                            onClick={() => cartMutation.mutate({ action: 'remove', itemId: item._id })}
                            className="rounded-md p-2 text-[#6B6B6B] hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 size={17} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex h-9 items-center rounded-lg border border-[#E5E5E5]">
                          <button
                            type="button"
                            aria-label="Miqdorni kamaytirish"
                            disabled={cartMutation.isPending}
                            onClick={() => updateItem('decrease', item)}
                            className="flex h-full w-9 items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A] disabled:opacity-40"
                          >
                            <Minus size={15} aria-hidden="true" />
                          </button>
                          <span className="w-8 text-center font-['Inter'] text-sm font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Miqdorni oshirish"
                            disabled={cartMutation.isPending || item.quantity >= 10}
                            onClick={() => updateItem('increase', item)}
                            className="flex h-full w-9 items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A] disabled:opacity-40"
                          >
                            <Plus size={15} aria-hidden="true" />
                          </button>
                        </div>
                        <span className="font-['Inter'] text-sm font-bold text-[#1A1A1A]">
                          {formatPrice(unitPrice * item.quantity, product?.currency)}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
              <Link to="/katalog" className="inline-flex items-center gap-2 py-2 font-['Inter'] text-sm font-semibold text-[#56642B] hover:text-[#8A9A5B]">
                <ArrowLeft size={16} aria-hidden="true" />
                Xaridni davom ettirish
              </Link>
            </section>

            <aside className="h-fit rounded-xl bg-white p-6 shadow-card lg:sticky lg:top-28">
              <h2 className="font-['Playfair_Display'] text-xl font-semibold text-[#1A1A1A]">Buyurtma xulosasi</h2>
              <form
                className="mt-5 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  cartMutation.mutate({ action: 'promo', code: promoCode.trim().toUpperCase() });
                }}
              >
                <label htmlFor="promo-code" className="sr-only">Promo-kod</label>
                <input
                  id="promo-code"
                  type="text"
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                  placeholder="Promo-kod"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-[#E5E5E5] px-3 font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                />
                <button
                  type="submit"
                  disabled={!promoCode.trim() || cartMutation.isPending}
                  className="h-11 rounded-lg bg-[#71814B] px-4 font-['Inter'] text-xs font-semibold text-white hover:bg-[#56642B] disabled:opacity-50"
                >
                  Qo‘llash
                </button>
              </form>
              {cart.promoCode && (
                <p className="mt-3 font-['Inter'] text-xs text-[#56642B]">
                  {cart.promoCode.code} promo-kodi tanlandi. Chegirma serverda buyurtma tasdiqlanganda tekshiriladi.
                </p>
              )}

              <dl className="mt-6 space-y-3 border-t border-[#E5E5E5] pt-5 font-['Inter'] text-sm">
                <div className="flex justify-between gap-3 text-[#6B6B6B]">
                  <dt>Mahsulotlar</dt><dd className="font-semibold text-[#1A1A1A]">{formatPrice(summary.subtotal)}</dd>
                </div>
                {summary.discount > 0 && (
                  <div className="flex justify-between gap-3 text-[#56642B]">
                    <dt>Chegirma</dt><dd className="font-semibold">−{formatPrice(summary.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3 text-[#6B6B6B]">
                  <dt>Yetkazib berish</dt><dd className="font-semibold text-[#1A1A1A]">{summary.shipping ? formatPrice(summary.shipping) : 'Bepul'}</dd>
                </div>
                <div className="flex justify-between gap-3 text-[#6B6B6B]">
                  <dt>Soliq</dt><dd className="font-semibold text-[#1A1A1A]">{formatPrice(summary.tax)}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-[#E5E5E5] pt-4 text-base font-bold text-[#1A1A1A]">
                  <dt>Jami</dt><dd>{formatPrice(summary.total)}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => navigate('/tolov')}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#71814B] px-5 font-['Inter'] text-sm font-semibold text-white transition-colors hover:bg-[#56642B]"
              >
                To‘lovni rasmiylashtirish
              </button>
              <p className="mt-4 flex items-center justify-center gap-2 text-center font-['Inter'] text-xs text-[#6B6B6B]">
                <ShieldCheck size={15} aria-hidden="true" />
                To‘lov usuli va yakuniy narx buyurtma oldidan tasdiqlanadi
              </p>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
