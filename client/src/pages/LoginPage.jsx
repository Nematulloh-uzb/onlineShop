import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/profil');
    }, 1000);
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                Elektron pochta
              </label>
              <input
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
              <div className="flex items-center justify-between mb-1">
                <label className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A]">
                  Parol
                </label>
                <Link to="/" className="font-['Inter'] text-[12px] text-[#8A9A5B] hover:text-[#6E7A47] transition-colors">
                  Parolni unutdingizmi?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] transition-all"
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
