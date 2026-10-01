import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getApiErrorMessage } from '../lib/api.js';
import BrandLogo from '../components/UI/BrandLogo.jsx';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyEmail({ email: email.trim().toLowerCase(), code });
      navigate('/profil', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Email tasdiqlanmadi. Kodni tekshirib, qayta urinib ko‘ring.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/resend-verification', { email: email.trim().toLowerCase() });
      setMessage(data.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Yangi kod yuborilmadi. Qayta urinib ko‘ring.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Helmet><title>Emailni tasdiqlash — VERDE</title></Helmet>
      <div className="flex min-h-[80vh] items-center justify-center px-6 py-12">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)] sm:p-10">
          <div className="mb-8 text-center">
            <BrandLogo className="mx-auto h-12 w-auto max-w-[220px] text-[#1A1A1A]" />
            <h1 className="mt-2 font-['Playfair_Display'] text-2xl font-semibold text-[#1A1A1A]">Emailingizni tasdiqlang</h1>
            <p className="mt-2 font-['Inter'] text-sm leading-relaxed text-[#6B6B6B]">
              Elektron pochtangizga yuborilgan 6 xonali kodni kiriting. Kod 10 daqiqa amal qiladi.
            </p>
          </div>
          {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 font-['Inter'] text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="mb-4 rounded-lg bg-[#F0F2E8] px-4 py-3 font-['Inter'] text-sm text-[#56642B]">{message}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="verify-email" className="mb-1 block font-['Inter'] text-sm font-semibold text-[#1A1A1A]">Elektron pochta</label>
              <input id="verify-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]" />
            </div>
            <div>
              <label htmlFor="verification-code" className="mb-1 block font-['Inter'] text-sm font-semibold text-[#1A1A1A]">Tasdiqlash kodi</label>
              <input id="verification-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 text-center font-['Inter'] text-lg tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]" />
            </div>
            <button type="submit" disabled={loading} className="mt-2 flex h-12 items-center justify-center rounded-lg bg-[#8A9A5B] font-['Inter'] text-sm font-semibold text-white transition-colors hover:bg-[#6E7A47] disabled:opacity-60">
              {loading ? 'Tekshirilmoqda…' : 'Emailni tasdiqlash'}
            </button>
          </form>
          <button type="button" onClick={handleResend} disabled={resending || !email.trim()} className="mt-4 w-full py-2 font-['Inter'] text-sm font-semibold text-[#56642B] hover:text-[#8A9A5B] disabled:opacity-50">
            {resending ? 'Yuborilmoqda…' : 'Yangi kod yuborish'}
          </button>
          <p className="mt-4 text-center font-['Inter'] text-sm text-[#6B6B6B]"><Link to="/kirish" className="font-semibold text-[#56642B] hover:text-[#8A9A5B]">Kirish sahifasiga qaytish</Link></p>
        </section>
      </div>
    </>
  );
}
