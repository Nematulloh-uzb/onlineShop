import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { api, getApiErrorMessage } from '../lib/api.js';
import BrandLogo from '../components/UI/BrandLogo.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setMessage(data.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Parolni tiklash so‘rovi yuborilmadi. Qayta urinib ko‘ring.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Parolni tiklash — VERDE</title></Helmet>
      <div className="flex min-h-[80vh] items-center justify-center px-6 py-12">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)] sm:p-10">
          <div className="mb-8 text-center">
            <BrandLogo className="mx-auto h-12 w-auto max-w-[220px] text-[#1A1A1A]" />
            <h1 className="mt-2 font-['Playfair_Display'] text-2xl font-semibold text-[#1A1A1A]">Parolni tiklash</h1>
            <p className="mt-2 font-['Inter'] text-sm leading-relaxed text-[#6B6B6B]">Hisobingizda qayd etilgan va tasdiqlangan elektron pochta manziliga parolni yangilash havolasi yuboriladi. Xatni ochib, havolaga kiring.</p>
          </div>
          {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 font-['Inter'] text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="mb-4 rounded-lg bg-[#F0F2E8] px-4 py-3 font-['Inter'] text-sm text-[#56642B]">{message}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="forgot-email" className="mb-1 block font-['Inter'] text-sm font-semibold text-[#1A1A1A]">Elektron pochta</label>
              <input id="forgot-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]" />
            </div>
            <button type="submit" disabled={loading} className="mt-2 h-12 rounded-lg bg-[#8A9A5B] font-['Inter'] text-sm font-semibold text-white transition-colors hover:bg-[#6E7A47] disabled:opacity-60">
              {loading ? 'Yuborilmoqda…' : 'Tiklash havolasini yuborish'}
            </button>
          </form>
          <p className="mt-6 text-center font-['Inter'] text-sm text-[#6B6B6B]"><Link to="/kirish" className="font-semibold text-[#56642B] hover:text-[#8A9A5B]">Kirish sahifasiga qaytish</Link></p>
        </section>
      </div>
    </>
  );
}
