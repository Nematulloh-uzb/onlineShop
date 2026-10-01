import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiErrorMessage } from '../lib/api.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', surname: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Parollar bir-biriga mos kelmadi.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await register({
        name: form.name.trim(),
        surname: form.surname.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (result.data?.email) {
        navigate(`/emailni-tasdiqlash?email=${encodeURIComponent(result.data.email)}`, { replace: true });
        return;
      }
      navigate('/profil', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Hisob yaratilmadi. Iltimos, qayta urinib ko‘ring.'));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Ism', placeholder: 'Dilnoza', type: 'text' },
    { name: 'surname', label: 'Familiya', placeholder: 'Karimova', type: 'text' },
    { name: 'email', label: 'Elektron pochta', placeholder: 'siz@email.com', type: 'email' },
    { name: 'password', label: 'Parol', placeholder: '••••••••', type: 'password' },
    { name: 'confirm', label: 'Parolni tasdiqlang', placeholder: '••••••••', type: 'password' },
  ];

  return (
    <>
      <Helmet>
        <title>Ro'yxatdan o'tish — AURA</title>
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-2xl p-10 shadow-[0_20px_40px_rgba(0,0,0,0.08)] w-full max-w-md">
          <div className="text-center mb-8">
            <span className="font-['Playfair_Display'] text-[28px] font-bold tracking-widest uppercase text-[#1A1A1A]">
              AURA
            </span>
            <h1 className="font-['Playfair_Display'] text-[24px] font-semibold text-[#1A1A1A] mt-2">
              Hisob yarating
            </h1>
            <p className="font-['Inter'] text-[14px] text-[#6B6B6B] mt-1">
              Aura hamjamiyatiga qo'shiling
            </p>
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 font-['Inter'] text-[13px] text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map(({ name, label, placeholder, type }) => (
              <div key={name}>
                <label htmlFor={`register-${name}`} className="font-['Inter'] text-[13px] font-semibold text-[#1A1A1A] block mb-1">
                  {label}
                </label>
                <input
                  id={`register-${name}`}
                  name={name}
                  type={type}
                  autoComplete={{
                    name: 'given-name',
                    surname: 'family-name',
                    email: 'email',
                    password: 'new-password',
                    confirm: 'new-password',
                  }[name]}
                  minLength={type === 'password' ? 8 : undefined}
                  required
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full h-12 px-4 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] transition-all"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#8A9A5B] hover:bg-[#6E7A47] disabled:opacity-70 text-white font-['Inter'] text-[15px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Ro'yxatdan o'tish"
              )}
            </button>
          </form>

          <p className="font-['Inter'] text-[14px] text-[#6B6B6B] text-center mt-6">
            Hisobingiz bormi?{' '}
            <Link to="/kirish" className="text-[#8A9A5B] hover:text-[#6E7A47] font-semibold transition-colors">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
