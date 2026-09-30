import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: "Bosh sahifa", end: true },
    { to: '/katalog', label: "Do'kon" },
    { to: '/katalog/kolleksiyalar', label: "Kolleksiyalar" },
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
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/logo.svg"
            alt="Aura Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="font-['Playfair_Display'] text-[22px] font-semibold tracking-widest text-[#1A1A1A] uppercase">
            AURA
          </span>
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
          <button
            aria-label="Qidiruv"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EDED] transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>

          <Link
            to="/savat"
            aria-label="Savat"
            className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0EDED] transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
          </Link>

          <Link
            to="/kirish"
            className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-[#8A9A5B] hover:bg-[#6E7A47] transition-colors"
          >
            <span className="material-symbols-outlined text-white text-[18px]">person</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            aria-label="Menyu"
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
        <div className="lg:hidden border-t border-[#F0EDED] bg-white/95 backdrop-blur-md px-6 py-4 flex flex-col gap-2 shadow-md">
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
            to="/kirish"
            onClick={() => setMobileOpen(false)}
            className="py-2 px-3 rounded-lg font-['Inter'] text-[14px] font-semibold text-[#6B6B6B] hover:bg-[#F0EDED] transition-colors"
          >
            Kirish
          </NavLink>
        </div>
      )}
    </header>
  );
}
