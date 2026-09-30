import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const CART_ITEMS = [
  {
    id: '1',
    name: "Zig'ir ko'ylak",
    price: 120,
    size: 'M',
    color: 'Zaytun yashil',
    quantity: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbZfRhZ8ljS3J5KLjchqPNfMObsBefdPxBvT9ITDFx7nIxczO63NxOvhsXNdY8lGY-553Ro2-MX18QjtHwaPSJAjDYvwj-ERsbhXTrrOiXPOG7tAtkJTWUSo0YlrN-_zbyhBfq1ZwsO4bjbtQv5E-i4ZFNuNkqEQYQvdZztgKCeNL_S5kMCLGtlwfYsbF5D4LQbdVYiUdbaezLBKZa9M54-uIW0gHkQHjnUgSm86zxX24HkN5voOkvnQ',
  },
  {
    id: '2',
    name: 'Paxta futbolka',
    price: 45,
    size: 'L',
    color: 'Oq',
    quantity: 2,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrtfuxAqNwPIXymAOOOAnEiIivPUZ619lTg3EpkRQayCdwP4MEeviQwU6H0Mb6Vp0USDIvtMQOf0PuMRzlv8UIjHg7zhz0GMrH-UmzjltqEX74DRdNFDYU4Jp49kb_B8ko9OIGez5Mjr22w98SfbGesJFAxyBJiKWXIGf5NCYnx5dxpvTeln3izXpfB3JX2ksLmHhvjrvOJQCrpVSX4yyTTWj6SFE5JqhzXmNOdgc-lUF2QMFnHADohg',
  },
];

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(CART_ITEMS);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => setItems((prev) => prev.filter((item) => item.id !== id));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal >= 1000 ? 0 : 35;
  const total = subtotal - discount + shipping;

  return (
    <>
      <Helmet>
        <title>Savat — AURA</title>
      </Helmet>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10">
        <h1 className="font-['Playfair_Display'] text-[36px] font-bold text-[#1A1A1A] mb-8">
          Xaridlar savati
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-[64px] text-[#E5E5E5] mb-4">shopping_bag</span>
            <h2 className="font-['Playfair_Display'] text-[24px] font-semibold text-[#1A1A1A] mb-2">
              Savatingiz bo'sh
            </h2>
            <p className="font-['Inter'] text-[15px] text-[#6B6B6B] mb-6">
              Katalogga o'tib yangi mahsulotlar qo'shing
            </p>
            <Link
              to="/katalog"
              className="px-8 h-12 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[15px] font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Xarid qilishni davom etish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex gap-4"
                >
                  <Link to="/mahsulot/zigir-koylak" className="w-24 h-28 rounded-lg overflow-hidden bg-[#F0EDED] shrink-0">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link to="/mahsulot/zigir-koylak">
                          <h3 className="font-['Inter'] text-[16px] font-semibold text-[#1A1A1A] hover:text-[#8A9A5B] transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#6B6B6B] hover:text-red-500 transition-colors shrink-0"
                          aria-label="O'chirish"
                        >
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      </div>
                      <p className="font-['Inter'] text-[13px] text-[#6B6B6B] mt-1">
                        O'lcham: {item.size} • Rang: {item.color}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#E5E5E5] rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-9 h-9 flex items-center justify-center text-[#6B6B6B] hover:bg-[#F0EDED] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </button>
                        <span className="w-8 text-center font-['Inter'] text-[14px] font-semibold text-[#1A1A1A]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-9 h-9 flex items-center justify-center text-[#6B6B6B] hover:bg-[#F0EDED] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      </div>
                      <span className="font-['Inter'] text-[18px] font-bold text-[#1A1A1A]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                to="/katalog"
                className="font-['Inter'] text-[14px] text-[#8A9A5B] hover:text-[#6E7A47] font-semibold flex items-center gap-1 transition-colors mt-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Xarid qilishni davom etish
              </Link>
            </div>

            {/* Summary */}
            <div>
              <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)] sticky top-28">
                <h2 className="font-['Playfair_Display'] text-[22px] font-semibold text-[#1A1A1A] mb-5">
                  Buyurtma xulosasi
                </h2>

                {/* Promo */}
                <div className="flex gap-2 mb-5">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Promo-kod"
                    className="flex-1 h-10 px-3 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                  />
                  <button
                    onClick={() => promoCode && setPromoApplied(true)}
                    className="h-10 px-4 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[13px] font-semibold rounded-lg transition-colors"
                  >
                    Qo'llash
                  </button>
                </div>
                {promoApplied && (
                  <div className="flex items-center gap-2 bg-[#F0F2E8] rounded-lg px-3 py-2 mb-5">
                    <span className="material-symbols-outlined text-[16px] text-[#8A9A5B]">check_circle</span>
                    <span className="font-['Inter'] text-[13px] text-[#56642B] font-semibold">{promoCode} — 10% chegirma qo'llandi</span>
                  </div>
                )}

                {/* Breakdown */}
                <div className="space-y-3 font-['Inter'] text-[14px] mb-5">
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Jami ({items.reduce((s, i) => s + i.quantity, 0)} ta)</span>
                    <span className="font-semibold text-[#1A1A1A]">${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Chegirma</span>
                      <span className="font-semibold">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Yetkazib berish</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-[#1A1A1A]'}`}>
                      {shipping === 0 ? 'Bepul' : `$${shipping}`}
                    </span>
                  </div>
                  <div className="border-t border-[#E5E5E5] pt-3 flex justify-between">
                    <span className="text-[16px] font-bold text-[#1A1A1A]">Umumiy</span>
                    <span className="text-[18px] font-bold text-[#1A1A1A]">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/tolov')}
                  className="w-full h-14 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[16px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                  To'lovga o'tish
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[#6B6B6B] font-['Inter'] text-[12px]">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  Xavfsiz va shifrlangan to'lov
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
