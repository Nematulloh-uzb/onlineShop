import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import BrandLogo from '../UI/BrandLogo.jsx';
import ProfileAvatar from '../UI/ProfileAvatar.jsx';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, status } = useAuth();
  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      return data.data.cart;
    },
    enabled: status === 'authenticated',
  });
  const cartCount = cartQuery.data?.items?.reduce((count, item) => count + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: "Bosh sahifa", end: true },
    { to: '/katalog/erkaklar', label: 'Erkaklar' },
    { to: '/katalog/aksessuarlar', label: 'Aksessuarlar' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.06)]'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="h-20 max-w-[1280px] mx-auto px-6 md:px-10 flex items-center justify-between gap-4">
        <Link to="/" aria-label="AURA Eco Atelier bosh sahifa" className="group flex shrink-0 items-center">
          <BrandLogo className="h-10 w-auto max-w-[164px] text-[#1A1A1A] transition-transform group-hover:scale-105" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative py-1 font-['Inter'] text-[14px] font-semibold transition-colors
                after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#8A9A5B] after:transition-all after:duration-300
                ${isActive
                  ? 'text-[#8A9A5B] after:w-full'
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A] after:w-0 hover:after:w-full'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/katalog?search="
            aria-label="Qidiruv"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EDED] transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </Link>

          <Link
            to={user ? '/savat' : '/kirish'}
            state={user ? undefined : { from: { pathname: '/savat' } }}
            aria-label="Savat"
            className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EDED] transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#56642B] px-1 font-['Inter'] text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            to={user ? '/profil' : '/kirish'}
            aria-label={user ? 'Shaxsiy kabinet' : 'Kirish'}
            className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/5 transition-colors ${
              user ? 'hover:ring-[#8A9A5B]' : 'bg-[#8A9A5B] hover:bg-[#6E7A47]'
            }`}
          >
            {user ? (
              <ProfileAvatar user={user} className="h-full w-full" />
            ) : (
              <span className="material-symbols-outlined text-[18px] text-white">person</span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            aria-label="Menyu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="w-10 h-10 flex lg:hidden items-center justify-center rounded-full text-[#6B6B6B] hover:bg-[#F0EDED] transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav id="mobile-navigation" aria-label="Mobil navigatsiya" className="lg:hidden border-t border-[#F0EDED] bg-white/95 backdrop-blur-md px-6 py-4 flex flex-col gap-2 shadow-md">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `py-2 px-3 rounded-lg font-['Inter'] text-[14px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#F0F2E8] text-[#8A9A5B]'
                    : 'text-[#6B6B6B] hover:bg-[#F0EDED]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <NavLink
            to={user ? '/profil' : '/kirish'}
            onClick={() => setMobileOpen(false)}
            className="py-2 px-3 rounded-lg font-['Inter'] text-[14px] font-semibold text-[#6B6B6B] hover:bg-[#F0EDED] transition-colors"
          >
            {user ? 'Shaxsiy kabinet' : 'Kirish'}
          </NavLink>
        </nav>
      )}
    </header>
  );
}
