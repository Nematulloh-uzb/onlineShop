import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const PRODUCTS = [
  { name: "Zig'ir ko'ylak", price: '$120.00', category: 'Ayollar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbZfRhZ8ljS3J5KLjchqPNfMObsBefdPxBvT9ITDFx7nIxczO63NxOvhsXNdY8lGY-553Ro2-MX18QjtHwaPSJAjDYvwj-ERsbhXTrrOiXPOG7tAtkJTWUSo0YlrN-_zbyhBfq1ZwsO4bjbtQv5E-i4ZFNuNkqEQYQvdZztgKCeNL_S5kMCLGtlwfYsbF5D4LQbdVYiUdbaezLBKZa9M54-uIW0gHkQHjnUgSm86zxX24HkN5voOkvnQ', slug: 'zigir-koylak' },
  { name: 'Paxta futbolka', price: '$45.00', category: 'Erkaklar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrtfuxAqNwPIXymAOOOAnEiIivPUZ619lTg3EpkRQayCdwP4MEeviQwU6H0Mb6Vp0USDIvtMQOf0PuMRzlv8UIjHg7zhz0GMrH-UmzjltqEX74DRdNFDYU4Jp49kb_B8ko9OIGez5Mjr22w98SfbGesJFAxyBJiKWXIGf5NCYnx5dxpvTeln3izXpfB3JX2ksLmHhvjrvOJQCrpVSX4yyTTWj6SFE5JqhzXmNOdgc-lUF2QMFnHADohg', slug: 'paxta-futbolka' },
  { name: 'Jun palto', price: '$280.00', category: 'Ayollar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAeFl5pxoMuRsZj0MMy4ZH_LrKSePpCtMmj-a1PHRkXaW-Gavnh2SCudeWAR1-lrH8VWvodDne_SxD9KVM2XaLnCLR028K8OZiyga460QgYDFHHBAWNJuNF4ivfj378fO3l6_2eHLawqiCH5EyNtuUUtxBibL2zEsoD9ZFolkTCgRjkzWHqVSmsKCv_loJJgxDH6DC_HuFsW8bOVTtSMT_ZAY9CebS55Smp5kkSJWIAQ0KZIBu0SiY7w', slug: 'jun-palto' },
  { name: 'Ipak bluzka', price: '$150.00', category: 'Ayollar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBo1t5eThbUXz1wkp4sNn2efaAT3CDwzpv-DARk5tEJYjJkc3Q_j3DKZfCaVJlHGfg5XpqneMkIpslcsOmlrv_LjgrKo2RpQJQaktodbmwCanaR3XYPEb-NwI2D9vbeGeiaG15pF-pwsnqKA0lDIrwJrnqSPQziH83DLWKUkW4JP6ZQmCPn5KRXpFhR8Us_2bDQxYtWsSpUWHY44JNntMdSKyW1W8uKoFOmUD3PWeGCEPFuj5guuJ7bNQ', slug: 'ipak-bluzka' },
  { name: 'Keng shim', price: '$95.00', category: 'Erkaklar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnlneYaKpJq-XvSjh97ImN8IRz4R38HFBsZKy-1Prn1OCsSxKH-yNW-8qt05I6ijMNcK3U5RasPQS4-29F1HwSxxStFXyuC7618P-6-APAzBot2Tdrr-5QIf1k4fl0aW16TV7MOkmD396Cj_j6Ug5dNFefFfZmmozWrZ_5G6dsoDFo-61w5M4yvYBkbp3n3TFUijqGS-hqKlPNVKZuj_kMm0jwZ6Q8q1_A_cgv_c_f01q4yIDGI3WELw', slug: 'keng-shim' },
  { name: 'Trikotaj kardigan', price: '$180.00', category: 'Ayollar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6oIJskcCP8bbqrLFxQ1ULKMCoDBKLIuK-MuZ889o37ZjDKYGCiff3HwIkEZLtD3uv2OEoi0TBR_STsL2RzeE2MGof_PFOAfg2jrlx_OSa_tt7hSxQLTp_PaUexHnEoF_Su4w3P7WqeX4d8tUchHpAn5cC_9Qs4kxNdc5zVHex282IYoquGYteNRWIP00W4jZGDPXIoCs0b1wZ5GziNP7ylMnfkVWzmdKVmzox741c5ISOs_9A9HIS-w', slug: 'trikotaj-kardigan' },
  { name: 'Charm kamar', price: '$65.00', category: 'Aksessuarlar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-8iCV5uJPzKTNOk95ae2DBlwXExWIsElQjIo1cHaTmyOKJSHVTFtPumzSpNPfU6clf03YMVqXNcdq_YyCisGtkG7T45hq7vleWO5meNkJ36ctWIeJfn3-Z5qFApI3hkzRtT-sJFAYgYLjX8K-zn8oO2DtUZXT6ENZAMPAmvu8MnEni07g9hPX7jXukUzm1WsuHf7i5uyzjmMjL0Cx1pRMra8jHEajyyKpghCDH2P8HrYw47hJcZkmjA', slug: 'charm-kamar' },
  { name: "Yozgi ko'ylak", price: '$135.00', category: 'Ayollar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmHkcCf9qRIQha12NFPqS_FLd5RVoHQAmRviyJ4LYi0nO4RtvQ_QbqJ-XI_mf9w1xMM3d03DMTG84CT6zgfjOP5G_AW9n4PrieHMg-kXBVPXzZwWZ8YF-atI8evtIvmyXDEnehSVl4lc9RzWJ7_SqSTNWSvhCDfm4lskRbbUWaNmXWKgVFf1eQBXmi9VJFCdCkrGugPcJK0nQByQa26uQ1TbPzJ4aHHOpO3j5y963dyK4GvQkUfSguAg', slug: 'yozgi-koylak' },
];

const FILTERS = ['Barchasi', 'Ayollar', 'Erkaklar', 'Aksessuarlar'];
const SORT_OPTIONS = ["Yangilar", "Narx: kamdan ko'p", "Narx: ko'pdan kam"];

export default function CatalogPage() {
  const [activeFilter, setActiveFilter] = useState('Barchasi');
  const [sortBy, setSortBy] = useState('Yangilar');

  const filtered = PRODUCTS.filter(
    (p) => activeFilter === 'Barchasi' || p.category === activeFilter
  );

  return (
    <>
      <Helmet>
        <title>Katalog — AURA</title>
        <meta name="description" content="Barqaror va ekologik toza kiyim-kechaklar katalogi. Ayollar, erkaklar va aksessuarlar." />
      </Helmet>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10">
        {/* Header */}
        <div className="mb-8">
          <span className="font-['Inter'] text-[12px] font-semibold uppercase text-[#8A9A5B] tracking-widest block mb-2">
            AURA KOLLEKSIYASI
          </span>
          <h1 className="font-['Playfair_Display'] text-[36px] md:text-[48px] font-bold text-[#1A1A1A] leading-tight">
            Barcha mahsulotlar
          </h1>
        </div>

        {/* Filters + Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`h-9 px-4 rounded-full font-['Inter'] text-[13px] font-semibold border transition-all ${
                  activeFilter === filter
                    ? 'bg-[#8A9A5B] border-[#8A9A5B] text-white'
                    : 'bg-white border-[#E5E5E5] text-[#6B6B6B] hover:border-[#8A9A5B] hover:text-[#1A1A1A]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[#E5E5E5] font-['Inter'] text-[13px] text-[#1A1A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(({ name, price, image, slug }) => (
            <div
              key={slug}
              className="group bg-white rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#F0EDED] mb-3">
                <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#8A9A5B] text-white font-['Inter'] text-[12px] font-semibold rounded-full">
                  YANGI
                </span>
                <button
                  aria-label="Istaklarga qo'shish"
                  className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 text-[#6B6B6B] hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${image}')` }}
                />
                <Link
                  to={`/mahsulot/${slug}`}
                  className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 h-12 bg-[#8A9A5B] hover:bg-[#6E7A47] text-white font-['Inter'] text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  Savatga qo'shish
                </Link>
              </div>
              <div className="px-1 pb-1">
                <Link to={`/mahsulot/${slug}`}>
                  <h4 className="font-['Inter'] text-[16px] font-semibold text-[#1A1A1A] hover:text-[#8A9A5B] transition-colors mb-1">
                    {name}
                  </h4>
                </Link>
                <span className="font-['Inter'] text-[16px] text-[#1A1A1A] font-semibold">{price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
