import { PromoCode } from '../models/PromoCode.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Promo kodni tekshirish va hisoblash
export const validatePromo = catchAsync(async (req, res, next) => {
  const { code, orderAmount = 0 } = req.body;

  if (!code) {
    return next(new ApiError(400, 'Promo-kodni kiriting'));
  }

  const promo = await PromoCode.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
  });

  if (!promo) {
    return next(new ApiError(404, 'Bunday promo-kod mavjud emas yoki faol emas'));
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return next(new ApiError(400, 'Ushbu promo-kod muddati o‘tgan'));
  }

  if (promo.usedCount >= promo.maxUses) {
    return next(new ApiError(400, 'Ushbu promo-kod maksimal foydalanish soniga yetgan'));
  }

  const amount = Number(orderAmount);
  if (promo.minOrderAmount && amount < promo.minOrderAmount) {
    return next(
      new ApiError(
        400,
        `Ushbu promo-koddan foydalanish uchun buyurtma summasi kamida ${promo.minOrderAmount.toLocaleString('uz-UZ')} so‘m bo‘lishi kerak`
      )
    );
  }

  let discountAmount = 0;
  if (promo.type === 'percent') {
    discountAmount = Math.round((amount * promo.value) / 100);
  } else if (promo.type === 'fixed') {
    discountAmount = Math.min(amount, promo.value);
  }

  res.status(200).json({
    success: true,
    data: {
      valid: true,
      promo: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        discountAmount,
        minOrderAmount: promo.minOrderAmount,
      },
    },
  });
});

// Admin: Barcha promo kodlarni ko'rish
export const getPromoCodes = catchAsync(async (req, res) => {
  const promos = await PromoCode.find().sort('-createdAt');

  res.status(200).json({
    success: true,
    data: {
      promos,
    },
  });
});

// Admin: Yangi promo kod yaratish
export const createPromoCode = catchAsync(async (req, res, next) => {
  const { code, type, value, minOrderAmount, maxUses, expiresAt } = req.body;

  const existing = await PromoCode.findOne({ code: code.toUpperCase() });
  if (existing) {
    return next(new ApiError(409, 'Ushbu kodli promo-kod allaqachon mavjud'));
  }

  const newPromo = await PromoCode.create({
    code: code.toUpperCase(),
    type,
    value,
    minOrderAmount: minOrderAmount || 0,
    maxUses: maxUses || 1000,
    expiresAt: expiresAt || null,
  });

  res.status(201).json({
    success: true,
    data: {
      promo: newPromo,
    },
  });
});

// Admin: Promo kodni tahrirlash
export const updatePromoCode = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updated = await PromoCode.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    return next(new ApiError(404, 'Promo-kod topilmadi'));
  }

  res.status(200).json({
    success: true,
    data: {
      promo: updated,
    },
  });
});

// Admin: Promo kodni o'chirish
export const deletePromoCode = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deleted = await PromoCode.findByIdAndDelete(id);
  if (!deleted) {
    return next(new ApiError(404, 'Promo-kod topilmadi'));
  }

  res.status(200).json({
    success: true,
    message: 'Promo-kod o‘chirildi',
  });
});
