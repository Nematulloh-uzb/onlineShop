import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiErrorMessage } from '../lib/api.js';
import PasswordInput from '../components/UI/PasswordInput.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setLoading(true);
    try {
      await login({ email: form.email.trim().toLowerCase(), password: form.password });
      const destination = location.state?.from;
      navigate(destination ? `${destination.pathname}${destination.search || ''}${destination.hash || ''}` : '/profil', {
        replace: true,
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Kirish amalga oshmadi. Ma’lumotlarni tekshirib, qayta urinib ko‘ring.'));
      setNeedsVerification(requestError.response?.status === 403);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Kirish — AURA</title>
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-2xl p-10 shadow-[0_20px_40px_rgba(0,0,0,0.08)] w-full max-w-md">
          <div className="text-center mb-8">
            <span className="font-['Playfair_Display'] text-[28px] font-bold tracking-widest uppercase text-[#1A1A1A]">
              AURA
            </span>
            <h1 className="font-['Playfair_Display'] text-[24px] font-semibold text-[#1A1A1A] mt-2">
              Hisobingizga kiring
            </h1>
            <p className="font-['Inter'] text-[14px] text-[#6B6B6B] mt-1">
              Shaxsiy kabinetingizga xush kelibsiz
            </p>
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 font-['Inter'] text-[13px] text-red-700">
              {error}
            </p>
          )}
          {needsVerification && (
            <Link
              to={`/emailni-tasdiqlash?email=${encodeURIComponent(form.email.trim().toLowerCase())}`}
              className="mb-4 block rounded-lg bg-[#F0F2E8] px-4 py-3 font-['Inter'] text-sm font-semibold text-[#56642B] hover:text-[#8A9A5B]"
            >
              Tasdiqlash kodini kiriting yoki qayta yuboring
            </Link>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                Elektron pochta
              </label>
              <input
                id="login-email"
                autoComplete="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="siz@email.com"
                className="w-full h-12 px-4 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] transition-all"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="login-password" className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A]">
                  Parol
                </label>
                <Link to="/parolni-tiklash" className="font-['Inter'] text-xs font-semibold text-[#56642B] hover:text-[#8A9A5B]">
                  Parolni unutdingizmi?
                </Link>
              </div>
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-[14px] transition-all focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#8A9A5B] hover:bg-[#6E7A47] disabled:opacity-70 text-white font-['Inter'] text-[15px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Kirish'
              )}
            </button>
          </form>

          <p className="font-['Inter'] text-[14px] text-[#6B6B6B] text-center mt-6">
            Hisobingiz yo'qmi?{' '}
            <Link to="/royxat" className="text-[#8A9A5B] hover:text-[#6E7A47] font-semibold transition-colors">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
