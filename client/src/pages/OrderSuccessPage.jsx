import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, PackageCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { api, getApiErrorMessage } from '../lib/api.js';

const formatPrice = (price, currency = 'UZS') => new Intl.NumberFormat('uz-UZ', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(price);

const formatDate = (date) => new Intl.DateTimeFormat('uz-UZ', {
  dateStyle: 'long',
  timeStyle: 'short',
}).format(new Date(date));

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const orderQuery = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${encodeURIComponent(orderNumber)}`);
      return data.data.order;
    },
    enabled: Boolean(orderNumber),
  });
  const order = orderQuery.data;

  return (
    <>
      <Helmet>
        <title>{order ? `Buyurtma ${order.orderNumber} — AURA` : 'Buyurtma — AURA'}</title>
      </Helmet>

      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6 py-12">
        {orderQuery.isLoading ? (
          <p className="font-['Inter'] text-sm text-[#6B6B6B]">Buyurtma tekshirilmoqda…</p>
        ) : orderQuery.isError ? (
          <section role="alert" className="w-full rounded-2xl bg-white p-8 text-center shadow-card sm:p-12">
            <h1 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1A1A1A]">Buyurtma topilmadi</h1>
            <p className="mt-3 font-['Inter'] text-sm leading-relaxed text-[#6B6B6B]">
              {getApiErrorMessage(orderQuery.error, 'Buyurtma ma’lumotlarini yuklab bo‘lmadi.')}
            </p>
            <Link to="/profil" className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#71814B] px-5 font-['Inter'] text-sm font-semibold text-white">
              Shaxsiy kabinetga qaytish
            </Link>
          </section>
        ) : (
          <section className="w-full rounded-2xl bg-white p-6 shadow-card sm:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0F2E8] text-[#56642B]">
              {order.status === 'bekor_qilindi'
                ? <PackageCheck size={28} aria-hidden="true" />
                : <CheckCircle2 size={28} aria-hidden="true" />}
            </div>
            <p className="font-['Inter'] text-xs font-semibold uppercase tracking-[0.15em] text-[#71814B]">
              {order.status === 'bekor_qilindi' ? 'Buyurtma bekor qilingan' : 'Buyurtma ro‘yxatga olindi'}
            </p>
            <h1 className="mt-2 font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A]">
              {order.status === 'bekor_qilindi' ? 'Buyurtma holati' : 'Rahmat, buyurtmangiz qabul qilindi'}
            </h1>
            <p className="mt-3 font-['Inter'] text-sm leading-relaxed text-[#6B6B6B]">
              Yetkazib berganda to‘lash tanlandi. Buyurtma holatini shaxsiy kabinetingizdan kuzatishingiz mumkin.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-4 rounded-xl bg-[#F8F8F5] p-5 sm:grid-cols-2">
              <div>
                <p className="font-['Inter'] text-xs text-[#6B6B6B]">Buyurtma raqami</p>
                <p className="mt-1 font-['Inter'] text-sm font-bold text-[#1A1A1A]">#{order.orderNumber}</p>
              </div>
              <div>
                <p className="font-['Inter'] text-xs text-[#6B6B6B]">Sana</p>
                <p className="mt-1 font-['Inter'] text-sm font-semibold text-[#1A1A1A]">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="font-['Inter'] text-xs text-[#6B6B6B]">Holati</p>
                <p className="mt-1 font-['Inter'] text-sm font-semibold capitalize text-[#1A1A1A]">{order.status}</p>
              </div>
              <div>
                <p className="font-['Inter'] text-xs text-[#6B6B6B]">Jami</p>
                <p className="mt-1 font-['Inter'] text-sm font-bold text-[#1A1A1A]">
                  {formatPrice(order.pricing.total)}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-['Playfair_Display'] text-xl font-semibold text-[#1A1A1A]">Mahsulotlar</h2>
              <ul className="mt-4 divide-y divide-[#F0EDED]">
                {order.items.map((item) => (
                  <li key={item._id} className="flex justify-between gap-4 py-4">
                    <div>
                      <p className="font-['Inter'] text-sm font-semibold text-[#1A1A1A]">{item.name} × {item.quantity}</p>
                      <p className="mt-1 font-['Inter'] text-xs text-[#6B6B6B]">{item.color.name} · {item.size}</p>
                    </div>
                    <p className="whitespace-nowrap font-['Inter'] text-sm font-semibold text-[#1A1A1A]">
                      {formatPrice(item.lineTotal)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/katalog" className="inline-flex h-12 flex-1 items-center justify-center rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm font-semibold text-[#56642B] hover:border-[#71814B]">
                Xaridni davom ettirish
              </Link>
              <Link to="/profil" className="inline-flex h-12 flex-1 items-center justify-center rounded-lg bg-[#71814B] px-4 font-['Inter'] text-sm font-semibold text-white hover:bg-[#56642B]">
                Buyurtmalarim
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
