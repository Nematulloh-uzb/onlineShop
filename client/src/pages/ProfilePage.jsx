import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getApiErrorMessage } from '../lib/api.js';

const formatPrice = (amount, currency = 'UZS') => new Intl.NumberFormat('uz-UZ', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(amount);

const formatDate = (date) => new Intl.DateTimeFormat('uz-UZ', {
  dateStyle: 'medium',
}).format(new Date(date));

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const ordersQuery = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my');
      return data.data.orders;
    },
  });

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      setLogoutError(getApiErrorMessage(error, 'Tizimdan chiqishda xatolik yuz berdi.'));
    }
  };

  return (
    <>
      <Helmet>
        <title>Mening profilim — AURA</title>
      </Helmet>

      <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-['Inter'] text-xs font-semibold uppercase tracking-widest text-[#8A9A5B]">
              Shaxsiy kabinet
            </span>
            <h1 className="mt-2 font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A]">
              Xush kelibsiz, {user?.name}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm font-semibold text-[#6B6B6B] transition-colors hover:border-[#8A9A5B] hover:text-[#56642B] sm:self-auto"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Chiqish
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <aside className="space-y-5">
            <section className="rounded-xl bg-white p-6 shadow-card">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0F2E8] font-['Playfair_Display'] text-xl font-bold text-[#56642B]">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <h2 className="font-['Inter'] text-lg font-semibold text-[#1A1A1A]">
                {[user?.name, user?.surname].filter(Boolean).join(' ')}
              </h2>
              <p className="mt-1 break-all font-['Inter'] text-sm text-[#6B6B6B]">{user?.email}</p>
              {user?.phone && <p className="mt-1 font-['Inter'] text-sm text-[#6B6B6B]">{user.phone}</p>}
              <Link
                to="/istaklar"
                className="mt-5 inline-flex items-center gap-2 font-['Inter'] text-sm font-semibold text-[#56642B] hover:text-[#8A9A5B]"
              >
                <span className="material-symbols-outlined text-lg">favorite</span>
                Istaklar ro‘yxatim
              </Link>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-card">
              <h2 className="font-['Playfair_Display'] text-xl font-semibold text-[#1A1A1A]">Manzillarim</h2>
              {user?.addresses?.length ? (
                <ul className="mt-4 space-y-4">
                  {user.addresses.map((address) => (
                    <li key={address._id} className="border-t border-[#F0EDED] pt-4">
                      <p className="font-['Inter'] text-sm font-semibold text-[#1A1A1A]">
                        {address.label || 'Manzil'}{address.isDefault ? ' · Asosiy' : ''}
                      </p>
                      <p className="mt-1 font-['Inter'] text-sm leading-relaxed text-[#6B6B6B]">
                        {[address.street, address.district, address.city, address.region].filter(Boolean).join(', ')}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 font-['Inter'] text-sm text-[#6B6B6B]">
                  Hozircha saqlangan manzil yo‘q. Buyurtma rasmiylashtirishda manzilni kiriting.
                </p>
              )}
            </section>
          </aside>

          <section className="lg:col-span-2">
            {logoutError && (
              <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 font-['Inter'] text-sm text-red-700">
                {logoutError}
              </p>
            )}
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#1A1A1A]">Buyurtmalarim</h2>
                <p className="mt-1 font-['Inter'] text-sm text-[#6B6B6B]">Buyurtma holati va tafsilotlari</p>
              </div>
              <Link to="/katalog" className="font-['Inter'] text-sm font-semibold text-[#56642B] hover:text-[#8A9A5B]">
                Xaridni davom ettirish
              </Link>
            </div>

            {ordersQuery.isLoading ? (
              <p className="rounded-xl bg-white p-8 font-['Inter'] text-sm text-[#6B6B6B]">Buyurtmalar yuklanmoqda…</p>
            ) : ordersQuery.isError ? (
              <div role="alert" className="rounded-xl bg-white p-8">
                <p className="font-['Inter'] text-sm text-red-700">
                  {getApiErrorMessage(ordersQuery.error, 'Buyurtmalarni yuklab bo‘lmadi.')}
                </p>
                <button
                  type="button"
                  onClick={() => ordersQuery.refetch()}
                  className="mt-4 rounded-lg bg-[#8A9A5B] px-4 py-2 font-['Inter'] text-sm font-semibold text-white"
                >
                  Qayta yuklash
                </button>
              </div>
            ) : ordersQuery.data.length === 0 ? (
              <div className="rounded-xl bg-white px-6 py-16 text-center shadow-card">
                <span className="material-symbols-outlined mb-3 text-5xl text-[#C6C8B8]">receipt_long</span>
                <h3 className="font-['Playfair_Display'] text-xl font-semibold text-[#1A1A1A]">Buyurtmalar hali yo‘q</h3>
                <p className="mx-auto mt-2 max-w-sm font-['Inter'] text-sm text-[#6B6B6B]">
                  Katalogdan mahsulot tanlang — buyurtmalaringiz shu yerda ko‘rinadi.
                </p>
                <Link
                  to="/katalog"
                  className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#8A9A5B] px-5 font-['Inter'] text-sm font-semibold text-white hover:bg-[#6E7A47]"
                >
                  Katalogni ochish
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {ordersQuery.data.map((order) => (
                  <li key={order._id} className="rounded-xl bg-white p-6 shadow-card">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-['Inter'] text-sm font-bold text-[#1A1A1A]">
                            #{order.orderNumber}
                          </span>
                          <span className="rounded-full bg-[#F0F2E8] px-3 py-1 font-['Inter'] text-xs font-semibold text-[#56642B]">
                            {order.status}
                          </span>
                        </div>
                        <p className="mt-2 font-['Inter'] text-sm text-[#6B6B6B]">
                          {formatDate(order.createdAt)} · {order.items.length} ta mahsulot
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span className="font-['Inter'] text-base font-bold text-[#1A1A1A]">
                          {formatPrice(order.pricing.total)}
                        </span>
                        <Link
                          to={`/buyurtma/${order.orderNumber}`}
                          className="inline-flex h-10 items-center rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm font-semibold text-[#56642B] hover:border-[#8A9A5B]"
                        >
                          Ko‘rish
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
