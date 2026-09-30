import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Kontakt', 'Manzil', "To'lov"];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [form, setForm] = useState({
    email: '', phone: '',
    firstName: '', lastName: '', street: '', city: '', zip: '',
    cardName: '', cardNumber: '', cardExpiry: '', cardCvv: '',
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      navigate('/buyurtma/AUR-2026-0001');
    }
  };

  return (
    <>
      <Helmet>
        <title>To'lov — AURA</title>
      </Helmet>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10">
        <h1 className="font-['Playfair_Display'] text-[36px] font-bold text-[#1A1A1A] mb-8">
          Buyurtmani rasmiylashtirish
        </h1>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-['Inter'] text-[13px] font-bold transition-colors ${
                  i <= step ? 'bg-[#8A9A5B] text-white' : 'bg-[#E5E5E5] text-[#6B6B6B]'
                }`}
              >
                {i < step ? (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`font-['Inter'] text-[14px] font-semibold ${
                  i <= step ? 'text-[#8A9A5B]' : 'text-[#6B6B6B]'
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="w-12 h-px bg-[#E5E5E5] mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
              {/* Step 0: Contact */}
              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-['Playfair_Display'] text-[22px] font-semibold text-[#1A1A1A] mb-2">
                    Aloqa ma'lumotlari
                  </h2>
                  <div>
                    <label className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                      Elektron pochta *
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="siz@email.com"
                      className="w-full h-12 px-4 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                    />
                  </div>
                  <div>
                    <label className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                      Telefon *
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+998 90 123 45 67"
                      className="w-full h-12 px-4 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Address */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-['Playfair_Display'] text-[22px] font-semibold text-[#1A1A1A] mb-2">
                    Yetkazib berish manzili
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'firstName', label: 'Ism', placeholder: 'Dilnoza' },
                      { name: 'lastName', label: 'Familiya', placeholder: 'Karimova' },
                    ].map(({ name, label, placeholder }) => (
                      <div key={name}>
                        <label className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                          {label} *
                        </label>
                        <input
                          name={name}
                          required
                          value={form[name]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className="w-full h-12 px-4 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                      Ko'cha manzili *
                    </label>
                    <input
                      name="street"
                      required
                      value={form.street}
                      onChange={handleChange}
                      placeholder="Mustaqillik ko'chasi, 1-uy"
                      className="w-full h-12 px-4 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                        Shahar *
                      </label>
                      <input
                        name="city"
                        required
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Toshkent"
                        className="w-full h-12 px-4 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                      />
                    </div>
                    <div>
                      <label className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                        Pochta indeksi
                      </label>
                      <input
                        name="zip"
                        value={form.zip}
                        onChange={handleChange}
                        placeholder="100000"
                        className="w-full h-12 px-4 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-['Playfair_Display'] text-[22px] font-semibold text-[#1A1A1A] mb-2">
                    To'lov usuli
                  </h2>

                  {/* Payment methods */}
                  <div className="flex flex-col gap-3 mb-2">
                    {[
                      { id: 'card', label: "Kredit/Debit karta", icon: 'credit_card' },
                      { id: 'payme', label: "Payme", icon: 'phone_iphone' },
                      { id: 'click', label: "Click", icon: 'touch_app' },
                      { id: 'cash', label: "Yetkazib berganda to'lash", icon: 'local_shipping' },
                    ].map(({ id, label, icon }) => (
                      <label
                        key={id}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === id
                            ? 'border-[#8A9A5B] bg-[#F0F2E8]'
                            : 'border-[#E5E5E5] hover:border-[#8A9A5B]/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={id}
                          checked={paymentMethod === id}
                          onChange={() => setPaymentMethod(id)}
                          className="sr-only"
                        />
                        <span className="material-symbols-outlined text-[22px] text-[#8A9A5B]">{icon}</span>
                        <span className="font-['Inter'] text-[15px] font-semibold text-[#1A1A1A]">{label}</span>
                        {paymentMethod === id && (
                          <span className="ml-auto material-symbols-outlined text-[20px] text-[#8A9A5B]">check_circle</span>
                        )}
                      </label>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="flex flex-col gap-3 border border-[#E5E5E5] rounded-xl p-4">
                      <div>
                        <label className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                          Karta raqami
                        </label>
                        <input
                          name="cardNumber"
                          value={form.cardNumber}
                          onChange={handleChange}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          className="w-full h-12 px-4 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] font-mono tracking-widest"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                            Muddati (MM/YY)
                          </label>
                          <input
                            name="cardExpiry"
                            value={form.cardExpiry}
                            onChange={handleChange}
                            placeholder="12/28"
                            maxLength={5}
                            className="w-full h-12 px-4 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                          />
                        </div>
                        <div>
                          <label className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                            CVV
                          </label>
                          <input
                            name="cardCvv"
                            value={form.cardCvv}
                            onChange={handleChange}
                            placeholder="•••"
                            maxLength={4}
                            type="password"
                            className="w-full h-12 px-4 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="h-12 px-6 rounded-lg border-2 border-[#E5E5E5] font-['Inter'] text-[15px] font-semibold text-[#6B6B6B] hover:border-[#8A9A5B] hover:text-[#8A9A5B] transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Orqaga
                  </button>
                )}
                <button
                  type="submit"
                  className="ml-auto h-12 px-8 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[15px] font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {step === 2 ? (
                    <>
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      Buyurtmani tasdiqlash
                    </>
                  ) : (
                    <>
                      Davom etish
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)] sticky top-28">
              <h2 className="font-['Playfair_Display'] text-[20px] font-semibold text-[#1A1A1A] mb-5">
                Buyurtma
              </h2>
              <div className="flex flex-col gap-3 mb-5">
                {[
                  { name: "Zig'ir ko'ylak", size: 'M', price: '$120.00', qty: 1 },
                  { name: 'Paxta futbolka', size: 'L', price: '$45.00', qty: 2 },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-['Inter'] text-[14px] font-semibold text-[#1A1A1A]">
                        {item.name} × {item.qty}
                      </p>
                      <p className="font-['Inter'] text-[12px] text-[#6B6B6B]">O'lcham: {item.size}</p>
                    </div>
                    <span className="font-['Inter'] text-[14px] font-semibold text-[#1A1A1A]">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E5E5E5] pt-4 space-y-2 font-['Inter'] text-[14px]">
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Jami</span><span>$210.00</span>
                </div>
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Yetkazib berish</span><span>$35.00</span>
                </div>
                <div className="flex justify-between font-bold text-[16px] text-[#1A1A1A] pt-1 border-t border-[#E5E5E5]">
                  <span>Umumiy</span><span>$245.00</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[#6B6B6B] font-['Inter'] text-[12px]">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                256-bit SSL shifrlash
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
