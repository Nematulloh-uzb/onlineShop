import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PRODUCT = {
  name: "Zig'ir ko'ylak",
  price: 120,
  originalPrice: 150,
  discount: 20,
  rating: 4.9,
  reviewCount: 128,
  description:
    "Organik zig'ir tolasidan tayyorlangan bu ko'ylak nafaqat zamonaviy dizayni, balki ekologik tozoligiga ham ko'ra ajralib turadi. Qo'lda tikib, tabiiy bo'yoqlar bilan bo'yalgan ushbu ko'ylak tabiatga hurmat belgisidir.",
  ecoImpact: { waterSaved: 2700, co2Reduced: 3.5, organicCertified: true },
  materials: ['100% Organik zig\'ir', 'Ekologik bo\'yoqlar', 'Qayta ishlanuvchi qadoqlash'],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  colors: [
    { name: 'Zaytun yashil', hex: '#8A9A5B' },
    { name: 'Qora', hex: '#1A1A1A' },
    { name: 'Bej', hex: '#D8CBB5' },
  ],
  images: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCbZfRhZ8ljS3J5KLjchqPNfMObsBefdPxBvT9ITDFx7nIxczO63NxOvhsXNdY8lGY-553Ro2-MX18QjtHwaPSJAjDYvwj-ERsbhXTrrOiXPOG7tAtkJTWUSo0YlrN-_zbyhBfq1ZwsO4bjbtQv5E-i4ZFNuNkqEQYQvdZztgKCeNL_S5kMCLGtlwfYsbF5D4LQbdVYiUdbaezLBKZa9M54-uIW0gHkQHjnUgSm86zxX24HkN5voOkvnQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDrtfuxAqNwPIXymAOOOAnEiIivPUZ619lTg3EpkRQayCdwP4MEeviQwU6H0Mb6Vp0USDIvtMQOf0PuMRzlv8UIjHg7zhz0GMrH-UmzjltqEX74DRdNFDYU4Jp49kb_B8ko9OIGez5Mjr22w98SfbGesJFAxyBJiKWXIGf5NCYnx5dxpvTeln3izXpfB3JX2ksLmHhvjrvOJQCrpVSX4yyTTWj6SFE5JqhzXmNOdgc-lUF2QMFnHADohg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAAeFl5pxoMuRsZj0MMy4ZH_LrKSePpCtMmj-a1PHRkXaW-Gavnh2SCudeWAR1-lrH8VWvodDne_SxD9KVM2XaLnCLR028K8OZiyga460QgYDFHHBAWNJuNF4ivfj378fO3l6_2eHLawqiCH5EyNtuUUtxBibL2zEsoD9ZFolkTCgRjkzWHqVSmsKCv_loJJgxDH6DC_HuFsW8bOVTtSMT_ZAY9CebS55Smp5kkSJWIAQ0KZIBu0SiY7w',
  ],
};

export default function ProductPage() {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(PRODUCT.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Iltimos, o'lcham tanlang");
      return;
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>{PRODUCT.name} — AURA</title>
        <meta name="description" content={PRODUCT.description} />
      </Helmet>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 font-['Inter'] text-[13px] text-[#6B6B6B]">
          <button onClick={() => navigate('/')} className="hover:text-[#8A9A5B] transition-colors">Bosh sahifa</button>
          <span>/</span>
          <button onClick={() => navigate('/katalog')} className="hover:text-[#8A9A5B] transition-colors">Katalog</button>
          <span>/</span>
          <span className="text-[#1A1A1A] font-semibold">{PRODUCT.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div>
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#F0EDED] mb-3">
              {PRODUCT.discount > 0 && (
                <span className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-red-500 text-white font-['Inter'] text-[13px] font-bold rounded-full">
                  -{PRODUCT.discount}%
                </span>
              )}
              <div
                className="w-full h-full bg-cover bg-center transition-opacity duration-300"
                style={{ backgroundImage: `url('${PRODUCT.images[activeImage]}')` }}
              />
            </div>
            <div className="flex gap-2">
              {PRODUCT.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-[#8A9A5B]' : 'border-transparent'
                  }`}
                >
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${img}')` }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 text-[#8A9A5B]">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
              </div>
              <span className="font-['Inter'] text-[13px] text-[#6B6B6B]">
                {PRODUCT.rating} ({PRODUCT.reviewCount} ta sharh)
              </span>
            </div>

            <h1 className="font-['Playfair_Display'] text-[36px] md:text-[42px] font-bold text-[#1A1A1A] leading-tight mb-4">
              {PRODUCT.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="font-['Inter'] text-[28px] font-bold text-[#1A1A1A]">
                ${PRODUCT.price}.00
              </span>
              {PRODUCT.originalPrice && (
                <span className="font-['Inter'] text-[18px] text-[#6B6B6B] line-through">
                  ${PRODUCT.originalPrice}.00
                </span>
              )}
            </div>

            {/* Eco Impact */}
            <div className="bg-[#F0F2E8] rounded-xl p-4 mb-6 flex items-start gap-3">
              <span className="material-symbols-outlined text-[24px] text-[#8A9A5B] shrink-0">eco</span>
              <div>
                <p className="font-['Inter'] text-[14px] font-semibold text-[#56642B] mb-1">
                  Ekologik ta'sir
                </p>
                <p className="font-['Inter'] text-[13px] text-[#6B6B6B]">
                  Bu mahsulot {PRODUCT.ecoImpact.waterSaved.toLocaleString()} litr suv tejaydi va {PRODUCT.ecoImpact.co2Reduced} kg CO₂ ni kamaytiради.
                </p>
              </div>
            </div>

            {/* Color */}
            <div className="mb-5">
              <p className="font-['Inter'] text-[14px] font-semibold text-[#1A1A1A] mb-2">
                Rang: <span className="font-normal">{selectedColor.name}</span>
              </p>
              <div className="flex items-center gap-2">
                {PRODUCT.colors.map((color) => (
                  <button
                    key={color.name}
                    aria-label={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-7 h-7 rounded-full transition-all ${
                      selectedColor.name === color.name
                        ? 'outline outline-2 outline-[#8A9A5B] outline-offset-2'
                        : ''
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="font-['Inter'] text-[14px] font-semibold text-[#1A1A1A]">O'lcham</p>
                <button className="font-['Inter'] text-[13px] text-[#8A9A5B] underline">
                  O'lcham jadvali
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRODUCT.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg font-['Inter'] text-[14px] font-semibold border-2 transition-all ${
                      selectedSize === size
                        ? 'bg-[#8A9A5B] border-[#8A9A5B] text-white'
                        : 'bg-white border-[#E5E5E5] text-[#1A1A1A] hover:border-[#8A9A5B]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex items-center border border-[#E5E5E5] rounded-lg h-14 overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-14 h-full flex items-center justify-center text-[#6B6B6B] hover:bg-[#F0EDED] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <span className="w-12 text-center font-['Inter'] text-[16px] font-semibold text-[#1A1A1A]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-14 h-full flex items-center justify-center text-[#6B6B6B] hover:bg-[#F0EDED] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 h-14 rounded-lg font-['Inter'] text-[16px] font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-[#8A9A5B] hover:bg-[#6E7A47] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {addedToCart ? 'check_circle' : 'shopping_bag'}
                </span>
                {addedToCart ? "Savatga qo'shildi!" : "Savatga qo'shish"}
              </button>
              <button
                aria-label="Istaklar"
                className="w-14 h-14 rounded-lg border-2 border-[#E5E5E5] flex items-center justify-center text-[#6B6B6B] hover:text-red-500 hover:border-red-200 transition-all"
              >
                <span className="material-symbols-outlined text-[22px]">favorite</span>
              </button>
            </div>

            {/* Description */}
            <div className="border-t border-[#E5E5E5] pt-5">
              <p className="font-['Inter'] text-[15px] text-[#6B6B6B] leading-relaxed mb-4">
                {PRODUCT.description}
              </p>
              <ul className="space-y-2">
                {PRODUCT.materials.map((m) => (
                  <li key={m} className="flex items-center gap-2 font-['Inter'] text-[14px] text-[#6B6B6B]">
                    <span className="material-symbols-outlined text-[16px] text-[#8A9A5B]">check</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
