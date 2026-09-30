import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Leaf, Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getApiErrorMessage } from '../lib/api.js';
import ImageWithFallback from '../components/UI/ImageWithFallback.jsx';
import WishlistToggle from '../components/UI/WishlistToggle.jsx';

const formatPrice = (price, currency = 'UZS') => new Intl.NumberFormat('uz-UZ', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(price);
const formatReviewDate = (date) => new Intl.DateTimeFormat('uz-UZ', {
  dateStyle: 'medium',
}).format(new Date(date));

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedVariantSku, setSelectedVariantSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  const productQuery = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${encodeURIComponent(slug)}`);
      return data.data.product;
    },
  });
  const product = productQuery.data;
  const reviewsQuery = useQuery({
    queryKey: ['reviews', product?._id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${product._id}/reviews`);
      return data.data.reviews;
    },
    enabled: Boolean(product),
  });

  useEffect(() => {
    if (!product) return;
    setSelectedVariantSku((current) => (
      product.variants.some(({ sku }) => sku === current)
        ? current
        : product.variants.find(({ stock }) => stock > 0)?.sku || product.variants[0]?.sku || ''
    ));
    setActiveImage(0);
    setQuantity(1);
  }, [product]);

  const selectedVariant = product?.variants.find(({ sku }) => sku === selectedVariantSku);
  const reviews = reviewsQuery.data || [];
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : null;
  const hasReviewed = Boolean(user && (
    reviewMessage === 'Sharhingiz qabul qilindi.' ||
    reviews.some((review) => review.user?._id === user.id)
  ));
  const colors = useMemo(() => {
    const uniqueColors = new Map();
    product?.variants.forEach(({ color }) => uniqueColors.set(color.name, color));
    return [...uniqueColors.values()];
  }, [product]);
  const selectedColor = selectedVariant?.color || colors[0];
  const sizes = product?.variants.filter(({ color }) => color.name === selectedColor?.name) || [];

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!selectedVariant || !selectedVariant.stock) {
        throw new Error('Tanlangan variant hozircha mavjud emas.');
      }
      const { data } = await api.post('/cart/items', {
        productId: product._id,
        variantSku: selectedVariant.sku,
        quantity,
      });
      return data.data.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setMessage('Mahsulot savatga qo‘shildi.');
      setErrorMessage('');
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, error.message || 'Savatga qo‘shib bo‘lmadi.'));
      setMessage('');
    },
  });
  const submitReview = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      return data.data.review;
    },
    onSuccess: () => {
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      setReviewMessage('Sharhingiz qabul qilindi.');
      queryClient.invalidateQueries({ queryKey: ['reviews', product._id] });
    },
    onError: (error) => setReviewMessage(getApiErrorMessage(error, 'Sharhni yuborib bo‘lmadi.')),
  });

  const handleAddToCart = () => {
    if (!user) {
      navigate('/kirish', { state: { from: location } });
      return;
    }
    setErrorMessage('');
    addToCart.mutate();
  };

  if (productQuery.isLoading) {
    return <p className="mx-auto my-16 max-w-5xl rounded-xl bg-white p-10 text-center font-['Inter'] text-sm text-[#6B6B6B]">Mahsulot yuklanmoqda…</p>;
  }

  if (productQuery.isError) {
    return (
      <div role="alert" className="mx-auto my-16 max-w-2xl rounded-xl bg-white p-10 text-center shadow-card">
        <h1 className="font-['Playfair_Display'] text-2xl font-semibold text-[#1A1A1A]">Mahsulot yuklanmadi</h1>
        <p className="mt-3 font-['Inter'] text-sm text-[#6B6B6B]">{getApiErrorMessage(productQuery.error, 'Serverga ulanib bo‘lmadi.')}</p>
        <button
          type="button"
          onClick={() => productQuery.refetch()}
          className="mt-5 rounded-lg bg-[#8A9A5B] px-5 py-3 font-['Inter'] text-sm font-semibold text-white"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  const images = product.images || [];
  const image = images[activeImage] || images[0];

  return (
    <>
      <Helmet>
        <title>{product.name} — AURA</title>
        <meta name="description" content={product.shortDescription || product.description} />
      </Helmet>

      <main className="mx-auto max-w-[1280px] px-6 py-8 md:px-10 md:py-12">
        <nav aria-label="Sahifa yo‘li" className="mb-8 flex items-center gap-2 font-['Inter'] text-xs text-[#6B6B6B]">
          <Link to="/" className="hover:text-[#56642B]">Bosh sahifa</Link>
          <span aria-hidden="true">/</span>
          <Link to="/katalog" className="hover:text-[#56642B]">Katalog</Link>
          <span aria-hidden="true">/</span>
          <span className="truncate font-medium text-[#1A1A1A]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <section
            aria-label="Mahsulot rasmlari"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#F0EDED] shadow-card lg:aspect-auto lg:h-[min(68vh,620px)]">
              <ImageWithFallback
                key={image?.url || product._id}
                src={image?.url}
                alt={image?.alt || product.name}
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/30 to-transparent px-5 pb-5 pt-16">
                <p className="font-['Inter'] text-sm font-medium text-white drop-shadow">
                  {product.name}
                </p>
              </div>
              {images.length > 1 && (
                <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 font-['Inter'] text-xs font-semibold text-[#38452A] shadow-sm">
                  {activeImage + 1} / {images.length}
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((item, index) => (
                  <button
                    key={item._id || item.url}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`${index + 1}-rasmni ko‘rish`}
                    aria-pressed={activeImage === index}
                    className={`h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      activeImage === index ? 'border-[#71814B] shadow-sm' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback
                      key={item.url}
                      src={item.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <p className="mb-3 font-['Inter'] text-xs font-semibold uppercase tracking-[0.16em] text-[#71814B]">
              {product.category?.name || product.ecoBadge}
            </p>
            <h1 className="font-['Playfair_Display'] text-3xl font-semibold leading-tight text-[#1A1A1A] md:text-4xl">
              {product.name}
            </h1>
            {averageRating !== null && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Star size={17} fill="currentColor" className="text-[#71814B]" aria-hidden="true" />
                <span className="font-['Inter'] text-sm font-semibold text-[#1A1A1A]">{averageRating.toFixed(1)}</span>
                <span className="font-['Inter'] text-sm text-[#6B6B6B]">{reviews.length} ta xaridor sharhi</span>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="font-['Inter'] text-2xl font-bold text-[#1A1A1A]">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.compareAtPrice > product.price && (
                <span className="font-['Inter'] text-base text-[#6B6B6B] line-through">
                  {formatPrice(product.compareAtPrice, product.currency)}
                </span>
              )}
            </div>

            {product.ecoImpact && (
              <div className="mt-6 flex gap-3 rounded-xl bg-[#F0F2E8] p-4">
                <Leaf size={22} className="mt-0.5 shrink-0 text-[#71814B]" aria-hidden="true" />
                <div>
                  <h2 className="font-['Inter'] text-sm font-semibold text-[#38452A]">Mahsulot xususiyatlari</h2>
                  <p className="mt-1 font-['Inter'] text-sm leading-relaxed text-[#56642B]">
                    {product.ecoBadge}. {product.ecoImpact.note}
                  </p>
                  {!!product.ecoImpact.waterSavedLiters && (
                    <p className="mt-2 font-['Inter'] text-xs text-[#56642B]">
                      Suv tejalishi: {product.ecoImpact.waterSavedLiters.toLocaleString('uz-UZ')} litr
                    </p>
                  )}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <fieldset className="mt-7">
                <legend className="mb-3 font-['Inter'] text-sm font-semibold text-[#1A1A1A]">
                  Rang: <span className="font-normal text-[#6B6B6B]">{selectedColor?.name}</span>
                </legend>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      title={color.name}
                      aria-label={color.name}
                      aria-pressed={selectedColor?.name === color.name}
                      onClick={() => {
                        const nextVariant = product.variants.find((variant) => (
                          variant.color.name === color.name && variant.stock > 0
                        )) || product.variants.find((variant) => variant.color.name === color.name);
                        setSelectedVariantSku(nextVariant?.sku || '');
                        setQuantity(1);
                        setErrorMessage('');
                      }}
                      className={`h-9 w-9 rounded-full border border-black/10 ${
                        selectedColor?.name === color.name ? 'outline outline-2 outline-offset-2 outline-[#71814B]' : ''
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </fieldset>
            )}

            {sizes.length > 0 && (
              <fieldset className="mt-7">
                <legend className="mb-3 font-['Inter'] text-sm font-semibold text-[#1A1A1A]">O‘lcham</legend>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((variant) => (
                    <button
                      key={variant.sku}
                      type="button"
                      disabled={variant.stock <= 0}
                      aria-pressed={selectedVariantSku === variant.sku}
                      onClick={() => {
                        setSelectedVariantSku(variant.sku);
                        setQuantity(1);
                        setErrorMessage('');
                      }}
                      className={`h-11 min-w-11 rounded-lg border px-3 font-['Inter'] text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        selectedVariantSku === variant.sku
                          ? 'border-[#71814B] bg-[#71814B] text-white'
                          : 'border-[#E5E5E5] text-[#1A1A1A] hover:border-[#71814B]'
                      }`}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <p className="mt-3 font-['Inter'] text-xs text-[#6B6B6B]" aria-live="polite">
              {selectedVariant?.stock > 0 ? `Omborda ${selectedVariant.stock} dona mavjud` : 'Bu rang va o‘lcham hozircha mavjud emas'}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-12 items-center rounded-lg border border-[#E5E5E5]">
                <button
                  type="button"
                  aria-label="Miqdorni kamaytirish"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="flex h-full w-12 items-center justify-center text-[#6B6B6B] disabled:opacity-40"
                >
                  <Minus size={17} aria-hidden="true" />
                </button>
                <span className="w-8 text-center font-['Inter'] text-sm font-semibold" aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  aria-label="Miqdorni oshirish"
                  disabled={!selectedVariant || quantity >= Math.min(selectedVariant.stock, 10)}
                  onClick={() => setQuantity((current) => Math.min(current + 1, selectedVariant?.stock || 1, 10))}
                  className="flex h-full w-12 items-center justify-center text-[#6B6B6B] disabled:opacity-40"
                >
                  <Plus size={17} aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedVariant?.stock || addToCart.isPending}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#71814B] px-5 font-['Inter'] text-sm font-semibold text-white transition-colors hover:bg-[#56642B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag size={18} aria-hidden="true" />
                {addToCart.isPending ? 'Savatga qo‘shilmoqda…' : 'Savatga qo‘shish'}
              </button>
              <WishlistToggle
                productId={product._id}
                className="h-12 w-12 shrink-0 rounded-lg border border-[#E5E5E5] text-[#56642B] hover:border-[#71814B]"
              />
            </div>

            {message && (
              <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-[#F0F2E8] px-4 py-3 font-['Inter'] text-sm text-[#38452A]">
                <Check size={17} aria-hidden="true" />
                {message}
              </p>
            )}
            {errorMessage && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 font-['Inter'] text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <div className="mt-8 border-t border-[#E5E5E5] pt-6">
              <h2 className="mb-3 font-['Inter'] text-sm font-semibold text-[#1A1A1A]">Mahsulot haqida</h2>
              <p className="font-['Inter'] text-sm leading-7 text-[#6B6B6B]">{product.description}</p>
              <dl className="mt-5 space-y-3">
                {[
                  ['Material', product.material],
                  ['Tarkibi', product.composition],
                  ['Ishlab chiqarilgan joy', product.origin],
                  ['Sertifikatlar', product.certifications?.join(', ')],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-3 font-['Inter'] text-sm">
                    <dt className="text-[#6B6B6B]">{label}</dt>
                    <dd className="text-[#1A1A1A]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <section className="mt-8 border-t border-[#E5E5E5] pt-6" aria-labelledby="product-reviews-title">
              <h2 id="product-reviews-title" className="font-['Playfair_Display'] text-xl font-semibold text-[#1A1A1A]">
                Xaridorlar sharhlari
              </h2>
              {reviewsQuery.isLoading ? (
                <p className="mt-4 font-['Inter'] text-sm text-[#6B6B6B]">Sharhlar yuklanmoqda…</p>
              ) : reviewsQuery.isError ? (
                <p role="alert" className="mt-4 font-['Inter'] text-sm text-red-700">
                  {getApiErrorMessage(reviewsQuery.error, 'Sharhlarni yuklab bo‘lmadi.')}
                </p>
              ) : reviews.length ? (
                <ul className="mt-4 space-y-4">
                  {reviews.map((review) => (
                    <li key={review._id} className="rounded-lg bg-[#F8F8F5] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-['Inter'] text-sm font-semibold text-[#1A1A1A]">
                            {[review.user?.name, review.user?.surname].filter(Boolean).join(' ') || 'Xaridor'}
                          </p>
                          {review.isVerifiedPurchase && (
                            <p className="mt-1 font-['Inter'] text-xs text-[#56642B]">Tasdiqlangan xarid</p>
                          )}
                        </div>
                        <span className="font-['Inter'] text-xs text-[#6B6B6B]">{formatReviewDate(review.createdAt)}</span>
                      </div>
                      <p className="mt-3 flex items-center gap-1 font-['Inter'] text-xs font-semibold text-[#71814B]">
                        <Star size={14} fill="currentColor" aria-hidden="true" /> {review.rating} / 5
                      </p>
                      <h3 className="mt-2 font-['Inter'] text-sm font-semibold text-[#1A1A1A]">{review.title}</h3>
                      <p className="mt-1 font-['Inter'] text-sm leading-relaxed text-[#6B6B6B]">{review.comment}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 font-['Inter'] text-sm text-[#6B6B6B]">
                  Bu mahsulotga hali sharh qoldirilmagan.
                </p>
              )}
              {hasReviewed ? (
                <p className="mt-5 rounded-lg bg-[#F0F2E8] px-4 py-3 font-['Inter'] text-sm text-[#56642B]">
                  Ushbu mahsulotga sharh qoldirgansiz.
                </p>
              ) : user ? (
                <form
                  className="mt-6 space-y-4 rounded-xl border border-[#E5E5E5] p-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setReviewMessage('');
                    submitReview.mutate();
                  }}
                >
                  <h3 className="font-['Inter'] text-sm font-semibold text-[#1A1A1A]">Sharh qoldiring</h3>
                  <div>
                    <label htmlFor="review-rating" className="mb-1 block font-['Inter'] text-xs font-semibold text-[#1A1A1A]">Baho</label>
                    <select
                      id="review-rating"
                      value={reviewRating}
                      onChange={(event) => setReviewRating(Number(event.target.value))}
                      className="h-10 rounded-lg border border-[#E5E5E5] bg-white px-3 font-['Inter'] text-sm"
                    >
                      {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="review-title" className="mb-1 block font-['Inter'] text-xs font-semibold text-[#1A1A1A]">Sarlavha</label>
                    <input
                      id="review-title"
                      required
                      maxLength={100}
                      value={reviewTitle}
                      onChange={(event) => setReviewTitle(event.target.value)}
                      className="h-11 w-full rounded-lg border border-[#E5E5E5] px-3 font-['Inter'] text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="review-comment" className="mb-1 block font-['Inter'] text-xs font-semibold text-[#1A1A1A]">Sharh</label>
                    <textarea
                      id="review-comment"
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={4}
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                      className="w-full resize-y rounded-lg border border-[#E5E5E5] p-3 font-['Inter'] text-sm"
                    />
                  </div>
                  {reviewMessage && (
                    <p role={submitReview.isError ? 'alert' : 'status'} className={`font-['Inter'] text-sm ${submitReview.isError ? 'text-red-700' : 'text-[#56642B]'}`}>
                      {reviewMessage}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submitReview.isPending}
                    className="h-11 rounded-lg bg-[#71814B] px-5 font-['Inter'] text-sm font-semibold text-white hover:bg-[#56642B] disabled:opacity-60"
                  >
                    {submitReview.isPending ? 'Yuborilmoqda…' : 'Sharhni yuborish'}
                  </button>
                </form>
              ) : (
                <p className="mt-5 font-['Inter'] text-sm text-[#6B6B6B]">
                  <Link to="/kirish" state={{ from: location }} className="font-semibold text-[#56642B] underline">
                    Kirish
                  </Link>{' '}
                  orqali sharh qoldirishingiz mumkin.
                </p>
              )}
            </section>
          </section>
        </div>
      </main>
    </>
  );
}
