import { env } from '../config/env.js';

export const cartWithSummary = (cart) => {
  const data = cart.toObject();
  const subtotal = data.items.reduce((total, item) => {
    const price = item.product?.price ?? item.priceSnapshot;
    return total + price * item.quantity;
  }, 0);
  const promo = data.promoCode;
  let discount = 0;

  if (
    promo
    && promo.isActive
    && (!promo.expiresAt || promo.expiresAt >= new Date())
    && promo.usedCount < promo.maxUses
    && subtotal >= (promo.minOrderAmount || 0)
  ) {
    discount = promo.type === 'percent'
      ? Math.round((subtotal * promo.value) / 100)
      : Math.min(subtotal, promo.value);
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const shipping = subtotal >= env.FREE_SHIPPING_THRESHOLD ? 0 : env.SHIPPING_FEE;
  const tax = Math.round(taxableAmount * env.VAT_RATE);

  return {
    ...data,
    summary: {
      subtotal,
      discount,
      shipping,
      tax,
      total: taxableAmount + shipping + tax,
      currency: 'UZS',
    },
  };
};
