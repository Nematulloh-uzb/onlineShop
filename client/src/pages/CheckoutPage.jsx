import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, LockKeyhole, ShoppingBag } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getApiErrorMessage } from '../lib/api.js';

const STEPS = ['Aloqa', 'Yetkazib berish', 'Tasdiqlash'];
const formatPrice = (price, currency = 'UZS') => new Intl.NumberFormat('uz-UZ', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(price);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    firstName: user?.name || '',
    lastName: user?.surname || '',
    street: '',
    city: '',
    region: '',
    zip: '',
  });

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      return data.data.cart;
    },
  });
  const cart = cartQuery.data;

  useEffect(() => {
    const address = user?.addresses?.find((item) => item.isDefault) || user?.addresses?.[0];
    if (!address) return;
    setForm((current) => ({
      ...current,
      firstName: current.firstName || address.firstName || '',
      lastName: current.lastName || address.lastName || '',
      street: current.street || address.street || '',
      city: current.city || address.city || '',
      region: current.region || address.region || '',
      zip: current.zip || address.postalCode || '',
      phone: current.phone || address.phone || '',
    }));
  }, [user]);

  const orderMutation = useMutation({
    mutationFn: async () => {
      const items = cart.items.map((item) => ({
        productId: item.product?._id,
        variantSku: item.variantSku,
        quantity: item.quantity,
      }));
      if (items.some(({ productId }) => !productId)) {
        throw new Error('Savatdagi mahsulotlardan biri endi mavjud emas. Savatni tekshirib ko‘ring.');
      }

      const { data } = await api.post('/orders', {
        items,
        contact: { email: form.email.trim(), phone: form.phone.trim() },
        shippingAddress: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          street: form.street.trim(),
          city: form.city.trim(),
          region: form.region.trim(),
          postalCode: form.zip.trim(),
          phone: form.phone.trim(),
        },
        promoCode: cart.promoCode?.code,
        paymentMethod: 'cash',
      });
      return data.data.order;
    },
    onSuccess: (order) => {
      queryClient.setQueryData(['cart'], undefined);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      navigate(`/buyurtma/${encodeURIComponent(order.orderNumber)}`, { replace: true });
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, error.message || 'Buyurtmani rasmiylashtirib bo‘lmadi.'));
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    if (step < STEPS.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    orderMutation.mutate();
  };

  if (cartQuery.isLoading) {
    return <p className="mx-auto my-16 max-w-5xl rounded-xl bg-white p-10 text-center font-['Inter'] text-sm text-[#6B6B6B]">Savat tekshirilmoqda…</p>;
  }

  if (cartQuery.isError) {
    return (
      <div role="alert" className="mx-auto my-16 max-w-2xl rounded-xl bg-white p-10 text-center">
        <p className="font-['Inter'] text-sm text-red-700">
          {getApiErrorMessage(cartQuery.error, 'Savatni tekshirib bo‘lmadi.')}
        </p>
        <button type="button" onClick={() => cartQuery.refetch()} className="mt-5 rounded-lg bg-[#71814B] px-5 py-3 font-['Inter'] text-sm font-semibold text-white">
          Qayta urinish
        </button>
      </div>
    );
  }

  if (!cart?.items.length) {
    return (
      <div className="mx-auto my-16 max-w-2xl rounded-xl bg-white px-6 py-14 text-center shadow-card">
        <ShoppingBag size={36} className="mx-auto mb-4 text-[#C6C8B8]" aria-hidden="true" />
        <h1 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1A1A1A]">Savat bo‘sh</h1>
        <p className="mt-2 font-['Inter'] text-sm text-[#6B6B6B]">Buyurtmani rasmiylashtirishdan oldin mahsulot tanlang.</p>
        <Link to="/katalog" className="mt-5 inline-flex h-11 items-center rounded-lg bg-[#71814B] px-5 font-['Inter'] text-sm font-semibold text-white">Katalogga o‘tish</Link>
      </div>
    );
  }

  const summary = cart.summary;

  return (
    <>
      <Helmet>
        <title>Buyurtmani rasmiylashtirish — VERDE</title>
      </Helmet>

      <main className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <Link to="/savat" className="mb-5 inline-flex items-center gap-2 font-['Inter'] text-sm font-semibold text-[#56642B] hover:text-[#8A9A5B]">
          <ArrowLeft size={17} aria-hidden="true" />
          Savatga qaytish
        </Link>
        <h1 className="mb-8 font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A] md:text-4xl">
          Buyurtmani rasmiylashtirish
        </h1>

        <ol aria-label="Buyurtma bosqichlari" className="mb-9 flex max-w-2xl items-center">
          {STEPS.map((label, index) => (
            <li key={label} className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}>
              <div className="flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full font-['Inter'] text-xs font-bold ${
                  index <= step ? 'bg-[#71814B] text-white' : 'bg-[#EAE7E7] text-[#6B6B6B]'
                }`}>
                  {index < step ? <Check size={15} aria-hidden="true" /> : index + 1}
                </span>
                <span className={`hidden whitespace-nowrap font-['Inter'] text-xs font-semibold sm:inline ${
                  index <= step ? 'text-[#56642B]' : 'text-[#6B6B6B]'
                }`}>
                  {label}
                </span>
              </div>
              {index < STEPS.length - 1 && <span className="mx-3 h-px flex-1 bg-[#E5E5E5]" />}
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="rounded-xl bg-white p-5 shadow-card sm:p-8">
              {step === 0 && (
                <fieldset className="space-y-5">
                  <legend className="mb-5 font-['Playfair_Display'] text-xl font-semibold text-[#1A1A1A]">Aloqa ma’lumotlari</legend>
                  <div>
                    <label htmlFor="checkout-email" className="mb-1 block font-['Inter'] text-sm font-semibold text-[#1A1A1A]">Elektron pochta</label>
                    <input id="checkout-email" name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={handleChange} className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]" />
                  </div>
                  <div>
                    <label htmlFor="checkout-phone" className="mb-1 block font-['Inter'] text-sm font-semibold text-[#1A1A1A]">Telefon</label>
                    <input id="checkout-phone" name="phone" type="tel" autoComplete="tel" required maxLength={30} value={form.phone} onChange={handleChange} placeholder="+998 90 123 45 67" className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]" />
                  </div>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset className="space-y-5">
                  <legend className="mb-5 font-['Playfair_Display'] text-xl font-semibold text-[#1A1A1A]">Yetkazib berish manzili</legend>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="checkout-firstName" className="mb-1 block font-['Inter'] text-sm font-semibold">Ism</label>
                      <input id="checkout-firstName" name="firstName" autoComplete="given-name" required maxLength={60} value={form.firstName} onChange={handleChange} className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]" />
                    </div>
                    <div>
                      <label htmlFor="checkout-lastName" className="mb-1 block font-['Inter'] text-sm font-semibold">Familiya</label>
                      <input id="checkout-lastName" name="lastName" autoComplete="family-name" required maxLength={60} value={form.lastName} onChange={handleChange} className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="checkout-street" className="mb-1 block font-['Inter'] text-sm font-semibold">Ko‘cha va uy</label>
                    <input id="checkout-street" name="street" autoComplete="street-address" required maxLength={200} value={form.street} onChange={handleChange} className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="checkout-city" className="mb-1 block font-['Inter'] text-sm font-semibold">Shahar / tuman</label>
                      <input id="checkout-city" name="city" autoComplete="address-level2" required maxLength={80} value={form.city} onChange={handleChange} className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]" />
                    </div>
                    <div>
                      <label htmlFor="checkout-region" className="mb-1 block font-['Inter'] text-sm font-semibold">Viloyat / hudud</label>
                      <input id="checkout-region" name="region" autoComplete="address-level1" required maxLength={80} value={form.region} onChange={handleChange} className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="checkout-zip" className="mb-1 block font-['Inter'] text-sm font-semibold">Pochta indeksi <span className="font-normal text-[#6B6B6B]">(ixtiyoriy)</span></label>
                    <input id="checkout-zip" name="zip" autoComplete="postal-code" maxLength={20} value={form.zip} onChange={handleChange} className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] sm:max-w-xs" />
                  </div>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset>
                  <legend className="mb-5 font-['Playfair_Display'] text-xl font-semibold text-[#1A1A1A]">To‘lov usuli</legend>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-[#71814B] bg-[#F5F7F0] p-5">
                    <input type="radio" checked readOnly aria-label="Yetkazib berganda to‘lash" className="mt-1 accent-[#71814B]" />
                    <span>
                      <span className="block font-['Inter'] text-sm font-semibold text-[#1A1A1A]">Yetkazib berganda to‘lash</span>
                      <span className="mt-1 block font-['Inter'] text-xs leading-relaxed text-[#6B6B6B]">
                        Buyurtma hozir ro‘yxatdan o‘tadi. To‘lovni mahsulot yetkazilganda amalga oshirasiz.
                      </span>
                    </span>
                  </label>
                  <p className="mt-4 font-['Inter'] text-xs leading-relaxed text-[#6B6B6B]">
                    Onlayn karta va Payme/Click to‘lovlari provayder integratsiyasi yoqilmagani uchun vaqtincha mavjud emas.
                  </p>
                  <div className="mt-6 rounded-lg bg-[#F9F9F9] p-4 font-['Inter'] text-sm text-[#1A1A1A]">
                    <p className="font-semibold">Yetkazib berish manzili</p>
                    <p className="mt-2 text-[#6B6B6B]">{form.firstName} {form.lastName}, {form.street}, {form.city}, {form.region}</p>
                    <p className="mt-1 text-[#6B6B6B]">{form.phone} · {form.email}</p>
                  </div>
                </fieldset>
              )}

              {errorMessage && (
                <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 font-['Inter'] text-sm text-red-700">
                  {errorMessage}
                </p>
              )}

              <div className="mt-8 flex items-center justify-between gap-3">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => current - 1)}
                    disabled={orderMutation.isPending}
                    className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#E5E5E5] px-5 font-['Inter'] text-sm font-semibold text-[#56642B] hover:border-[#71814B]"
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                    Orqaga
                  </button>
                ) : <span />}
                <button
                  type="submit"
                  disabled={orderMutation.isPending}
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#71814B] px-6 font-['Inter'] text-sm font-semibold text-white hover:bg-[#56642B] disabled:opacity-60"
                >
                  {step === STEPS.length - 1
                    ? (orderMutation.isPending ? 'Buyurtma yuborilmoqda…' : 'Buyurtmani tasdiqlash')
                    : 'Davom etish'}
                  {step === STEPS.length - 1 ? <LockKeyhole size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
                </button>
              </div>
            </form>
          </section>

          <aside className="h-fit rounded-xl bg-white p-6 shadow-card lg:sticky lg:top-28">
            <h2 className="font-['Playfair_Display'] text-xl font-semibold text-[#1A1A1A]">Buyurtma</h2>
            <ul className="mt-5 space-y-4">
              {cart.items.map((item) => (
                <li key={item._id} className="flex justify-between gap-3 border-b border-[#F0EDED] pb-4">
                  <div>
                    <p className="font-['Inter'] text-sm font-semibold text-[#1A1A1A]">
                      {item.product?.name || 'Mahsulot'} × {item.quantity}
                    </p>
                    <p className="mt-1 font-['Inter'] text-xs text-[#6B6B6B]">{item.color?.name} · {item.size}</p>
                  </div>
                  <span className="whitespace-nowrap font-['Inter'] text-sm font-semibold text-[#1A1A1A]">
                    {formatPrice((item.product?.price ?? item.priceSnapshot) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-3 font-['Inter'] text-sm">
              <div className="flex justify-between gap-3 text-[#6B6B6B]"><dt>Mahsulotlar</dt><dd>{formatPrice(summary.subtotal)}</dd></div>
              {summary.discount > 0 && <div className="flex justify-between gap-3 text-[#56642B]"><dt>Chegirma</dt><dd>−{formatPrice(summary.discount)}</dd></div>}
              <div className="flex justify-between gap-3 text-[#6B6B6B]"><dt>Yetkazib berish</dt><dd>{summary.shipping ? formatPrice(summary.shipping) : 'Bepul'}</dd></div>
              <div className="flex justify-between gap-3 text-[#6B6B6B]"><dt>Soliq</dt><dd>{formatPrice(summary.tax)}</dd></div>
              <div className="flex justify-between gap-3 border-t border-[#E5E5E5] pt-4 text-base font-bold text-[#1A1A1A]"><dt>Jami</dt><dd>{formatPrice(summary.total)}</dd></div>
            </dl>
          </aside>
        </div>
      </main>
    </>
  );
}
