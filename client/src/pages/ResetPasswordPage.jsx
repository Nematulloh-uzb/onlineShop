import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiErrorMessage } from '../lib/api.js';
import PasswordInput from '../components/UI/PasswordInput.jsx';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirm) {
      setError('Parollar bir-biriga mos kelmadi.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(token, { password: form.password });
      navigate('/profil', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Parolni yangilab bo‘lmadi. Havola eskirgan bo‘lishi mumkin.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Yangi parol — AURA</title></Helmet>
      <div className="flex min-h-[80vh] items-center justify-center px-6 py-12">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)] sm:p-10">
          <div className="mb-8 text-center">
            <span className="font-['Playfair_Display'] text-[28px] font-bold tracking-widest text-[#1A1A1A]">AURA</span>
            <h1 className="mt-2 font-['Playfair_Display'] text-2xl font-semibold text-[#1A1A1A]">Yangi parol yarating</h1>
            <p className="mt-2 font-['Inter'] text-sm text-[#6B6B6B]">Parol kamida 8 belgi, harf va raqamdan iborat bo‘lsin.</p>
          </div>
          {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 font-['Inter'] text-sm text-red-700">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              ['password', 'Yangi parol', 'new-password'],
              ['confirm', 'Yangi parolni tasdiqlang', 'new-password'],
            ].map(([name, label, autoComplete]) => (
              <div key={name}>
                <label htmlFor={`reset-${name}`} className="mb-1 block font-['Inter'] text-sm font-semibold text-[#1A1A1A]">{label}</label>
                <PasswordInput id={`reset-${name}`} autoComplete={autoComplete} minLength={8} required value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} className="h-12 w-full rounded-lg border border-[#E5E5E5] px-4 font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]" />
              </div>
            ))}
            <button type="submit" disabled={loading} className="mt-2 h-12 rounded-lg bg-[#8A9A5B] font-['Inter'] text-sm font-semibold text-white transition-colors hover:bg-[#6E7A47] disabled:opacity-60">
              {loading ? 'Saqlanmoqda…' : 'Parolni yangilash'}
            </button>
          </form>
          <p className="mt-6 text-center font-['Inter'] text-sm text-[#6B6B6B]"><Link to="/parolni-tiklash" className="font-semibold text-[#56642B] hover:text-[#8A9A5B]">Yangi tiklash havolasini so‘rash</Link></p>
        </section>
      </div>
    </>
  );
}
