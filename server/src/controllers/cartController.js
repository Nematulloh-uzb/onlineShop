import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { PromoCode } from '../models/PromoCode.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Foydalanuvchi savatini olish
export const getCart = catchAsync(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product')
    .populate('promoCode');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json({
    success: true,
    data: {
      cart,
    },
  });
});

// Savatga mahsulot qo'shish
export const addItem = catchAsync(async (req, res, next) => {
  const { productId, variantSku, quantity = 1 } = req.body;

  if (!productId || !variantSku) {
    return next(new ApiError(400, 'Mahsulot va variant ma‘lumotlarini kiriting'));
  }

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    return next(new ApiError(404, 'Mahsulot topilmadi'));
  }

  const variant = product.variants.find((v) => v.sku === variantSku);
  if (!variant) {
    return next(new ApiError(404, 'Mahsulot varianti topilmadi'));
  }

  if (variant.stock < quantity) {
    return next(new ApiError(400, `Ushbu o‘lchamdan omborda faqat ${variant.stock} dona mavjud`));
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex((item) => item.variantSku === variantSku);

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + Number(quantity);
    if (newQty > variant.stock) {
      return next(new ApiError(400, `Omborda jami ${variant.stock} dona mavjud, ortiqcha qo‘shib bo‘lmaydi`));
    }
    if (newQty > 10) {
      return next(new ApiError(400, 'Bitta buyurtmada ko‘pi bilan 10 dona tanlash mumkin'));
    }
    cart.items[existingItemIndex].quantity = newQty;
    cart.items[existingItemIndex].priceSnapshot = product.price;
  } else {
    cart.items.push({
      product: product._id,
      variantSku: variant.sku,
      color: variant.color,
      size: variant.size,
      quantity: Number(quantity),
      priceSnapshot: product.price,
    });
  }

  await cart.save();
  cart = await Cart.findById(cart._id).populate('items.product').populate('promoCode');

  res.status(200).json({
    success: true,
    data: {
      cart,
    },
  });
});

// Miqdorni o'zgartirish
export const updateItemQuantity = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const qty = Number(quantity);
  if (!qty || qty < 1 || qty > 10) {
    return next(new ApiError(400, 'Miqdor 1 va 10 oralig‘ida bo‘lishi shart'));
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError(404, 'Savat topilmadi'));
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return next(new ApiError(404, 'Savatdagi mahsulot topilmadi'));
  }

  const product = await Product.findById(item.product);
  if (product) {
    const variant = product.variants.find((v) => v.sku === item.variantSku);
    if (variant && variant.stock < qty) {
      return next(new ApiError(400, `Omborda faqat ${variant.stock} dona mavjud`));
    }
  }

  item.quantity = qty;
  await cart.save();
  cart = await Cart.findById(cart._id).populate('items.product').populate('promoCode');

  res.status(200).json({
    success: true,
    data: {
      cart,
    },
  });
});

// Mahsulotni savatdan o'chirish
export const removeItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError(404, 'Savat topilmadi'));
  }

  cart.items.pull(itemId);
  await cart.save();
  cart = await Cart.findById(cart._id).populate('items.product').populate('promoCode');

  res.status(200).json({
    success: true,
    data: {
      cart,
    },
  });
});

// Promo kod qo'llash
export const applyPromo = catchAsync(async (req, res, next) => {
  const { code } = req.body;

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
    return next(new ApiError(400, 'Ushbu promo-kod foydalanish chegarasiga yetgan'));
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    return next(new ApiError(400, 'Savat bo‘sh'));
  }

  cart.promoCode = promo._id;
  await cart.save();
  cart = await Cart.findById(cart._id).populate('items.product').populate('promoCode');

  res.status(200).json({
    success: true,
    message: 'Promo-kod muvaffaqiyatli qo‘llandi',
    data: {
      cart,
    },
  });
});

// Promo kodni olib tashlash
export const removePromo = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError(404, 'Savat topilmadi'));
  }

  cart.promoCode = null;
  await cart.save();
  cart = await Cart.findById(cart._id).populate('items.product').populate('promoCode');

  res.status(200).json({
    success: true,
    data: {
      cart,
    },
  });
});

// Mehmon savatini birlashtirish (Login qilinganda)
export const mergeCart = catchAsync(async (req, res, next) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return next(new ApiError(400, 'Items massiv bo‘lishi lozim'));
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  for (const guestItem of items) {
    const product = await Product.findOne({ _id: guestItem.productId, isActive: true });
    if (!product) continue;

    const variant = product.variants.find((v) => v.sku === guestItem.variantSku);
    if (!variant || variant.stock < 1) continue;

    const existingIndex = cart.items.findIndex((item) => item.variantSku === guestItem.variantSku);

    if (existingIndex > -1) {
      const combinedQty = Math.min(
        variant.stock,
        10,
        cart.items[existingIndex].quantity + (guestItem.quantity || 1)
      );
      cart.items[existingIndex].quantity = combinedQty;
    } else {
      cart.items.push({
        product: product._id,
        variantSku: variant.sku,
        color: variant.color,
        size: variant.size,
        quantity: Math.min(variant.stock, 10, guestItem.quantity || 1),
        priceSnapshot: product.price,
      });
    }
  }

  await cart.save();
  cart = await Cart.findById(cart._id).populate('items.product').populate('promoCode');

  res.status(200).json({
    success: true,
    data: {
      cart,
    },
  });
});
