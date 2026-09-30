import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { PromoCode } from '../models/PromoCode.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { generateOrderNumber } from '../utils/generateOrderNumber.js';
import { paymentService } from '../services/paymentService.js';
import { env } from '../config/env.js';

// 1. Yangi buyurtma berish (Checkout)
export const createOrder = catchAsync(async (req, res, next) => {
  const {
    items,
    shippingAddress,
    contact,
    promoCode: inputPromoCode,
    paymentMethod,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new ApiError(400, 'Buyurtma uchun mahsulotlar tanlanmagan'));
  }

  if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.street || !shippingAddress.city) {
    return next(new ApiError(400, 'Yetkazib berish manzilini to‘liq kiriting'));
  }

  if (!contact || !contact.email || !contact.phone) {
    return next(new ApiError(400, 'Aloqa ma‘lumotlarini (email va telefon) kiriting'));
  }

  if (!paymentMethod) {
    return next(new ApiError(400, 'To‘lov usulini tanlang'));
  }

  // 1. Serverda narx, stock va mahsulotlarni tekshirish
  const orderItems = [];
  let subtotal = 0;
  let totalWaterSaved = 0;

  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!item.productId || typeof item.variantSku !== 'string' || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return next(new ApiError(400, 'Buyurtmadagi mahsulot va miqdor ma‘lumotlari noto‘g‘ri'));
    }

    const product = await Product.findOne({ _id: item.productId, isActive: true });
    if (!product) {
      return next(new ApiError(404, `Mahsulot topilmadi: ${item.name || item.productId}`));
    }

    const variant = product.variants.find((v) => v.sku === item.variantSku);
    if (!variant) {
      return next(new ApiError(400, `${product.name} ning tanlangan o‘lchami topilmadi`));
    }

    if (variant.stock < quantity) {
      return next(
        new ApiError(
          400,
          `"${product.name}" (${variant.size}) mahsulotidan omborda faqat ${variant.stock} dona qolgan`
        )
      );
    }

    const unitPrice = product.price;
    const lineTotal = unitPrice * quantity;
    const waterSaved = (product.ecoImpact?.waterSavedLiters || 0) * quantity;

    subtotal += lineTotal;
    totalWaterSaved += waterSaved;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: item.image || product.images?.[0]?.url || '',
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
      quantity,
      unitPrice,
      lineTotal,
      ecoBadge: product.ecoBadge,
      waterSavedLitersPerItem: product.ecoImpact?.waterSavedLiters || 0,
    });
  }

  // 2. Promo kodni serverda hisoblash
  let discount = 0;
  let appliedPromo = null;

  if (inputPromoCode) {
    const promo = await PromoCode.findOne({
      code: inputPromoCode.toUpperCase().trim(),
      isActive: true,
    });

    if (!promo || (promo.expiresAt && promo.expiresAt < new Date()) || promo.usedCount >= promo.maxUses) {
      return next(new ApiError(400, 'Promo-kod mavjud emas, muddati o‘tgan yoki foydalanish chegarasiga yetgan'));
    }
    if (subtotal < promo.minOrderAmount) {
      return next(new ApiError(400, `Ushbu promo-kod uchun eng kam buyurtma summasi ${promo.minOrderAmount} so‘m`));
    }

    if (promo.type === 'percent') {
      discount = Math.round((subtotal * promo.value) / 100);
    } else if (promo.type === 'fixed') {
      discount = Math.min(subtotal, promo.value);
    }
    appliedPromo = promo;
  }

  // 3. Yetkazib berish va Soliq hisoblash
  const shipping = subtotal >= env.FREE_SHIPPING_THRESHOLD ? 0 : env.SHIPPING_FEE;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * env.VAT_RATE);
  const total = taxableAmount + shipping + tax;

  const reservedItems = [];
  const restoreStock = async () => {
    await Promise.all(reservedItems.map(async (item) => {
      const restored = await Product.findOneAndUpdate(
        { _id: item.product, 'variants.sku': item.sku },
        { $inc: { 'variants.$.stock': item.quantity, soldCount: -item.quantity } }
      );
      if (!restored) {
        throw new Error(`Mahsulot zaxirasini qaytara olmadik: ${item.name} (${item.size})`);
      }
    }));
    reservedItems.length = 0;
  };

  // 4. Zaxirani har bir variant uchun atomik kamaytirish
  for (const item of orderItems) {
    const updated = await Product.findOneAndUpdate(
      {
        _id: item.product,
        'variants.sku': item.sku,
        'variants.stock': { $gte: item.quantity },
      },
      {
        $inc: {
          'variants.$.stock': -item.quantity,
          soldCount: item.quantity,
        },
      },
      { new: true }
    );

    if (!updated) {
      await restoreStock();
      return next(
        new ApiError(
          400,
          `Xarid paytida zaxira yetarli bo‘lmadi: ${item.name} (${item.size})`
        )
      );
    }
    reservedItems.push(item);
  }

  // 5. Buyurtma raqamini generatsiya qilish
  const orderNumber = await generateOrderNumber();

  // 6. To‘lov usuli mavjud provayderda qayta tekshiriladi
  let paymentResult;
  try {
    paymentResult = await paymentService.processPayment({
      orderNumber,
      amount: total,
      paymentMethod,
    });
  } catch (payError) {
    await restoreStock();
    return next(payError);
  }

  // 7. Buyurtmani bazaga yozish
  let order;
  try {
    order = await Order.create({
      orderNumber,
      user: req.user._id,
      guestEmail: null,
      contact: {
        email: contact.email,
        phone: contact.phone,
      },
      items: orderItems,
      shippingAddress,
      pricing: {
        subtotal,
        discount,
        shipping,
        tax,
        total,
      },
      promoCode: appliedPromo ? appliedPromo.code : null,
      paymentMethod,
      payment: {
        status: paymentResult.status,
        providerRef: paymentResult.providerRef,
        paidAt: paymentResult.paidAt || (paymentResult.status === 'paid' ? new Date() : null),
      },
      status: paymentResult.status === 'paid' ? 'tasdiqlangan' : 'yangi',
      statusHistory: [
        {
          status: 'yangi',
          at: new Date(),
          note: 'Buyurtma rasmiylashtirildi',
        },
        ...(paymentResult.status === 'paid'
          ? [{ status: 'tasdiqlangan', at: new Date(), note: 'To‘lov muvaffaqiyatli qabul qilindi' }]
          : []),
      ],
      ecoImpactTotal: {
        waterSavedLiters: totalWaterSaved,
      },
    });
  } catch (error) {
    await restoreStock();
    return next(error);
  }

  // Agar promo kod ishlatilgan bo'lsa hisoblagichini oshirish
  if (appliedPromo) {
    await PromoCode.findByIdAndUpdate(appliedPromo._id, { $inc: { usedCount: 1 } });
  }

  // Agar login qilingan bo'lsa savatini tozalash
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], promoCode: null });

  res.status(201).json({
    success: true,
    message: 'Buyurtma muvaffaqiyatli qabul qilindi',
    data: {
      order,
    },
  });
});

// 2. Foydalanuvchining o'z buyurtmalarini olish
export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');

  res.status(200).json({
    success: true,
    data: {
      orders,
    },
  });
});

// 3. Buyurtma tafsilotlarini raqam bo'yicha olish
export const getOrderByNumber = catchAsync(async (req, res, next) => {
  const { orderNumber } = req.params;

  const order = await Order.findOne({ orderNumber });
  if (!order) {
    return next(new ApiError(404, 'Buyurtma topilmadi'));
  }

  // Faqat buyurtma egasi yoki admin ko'rishi mumkin (yoki mehmon o'z raqami bilan)
  if (
    order.user &&
    (!req.user || (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin'))
  ) {
    return next(new ApiError(403, 'Ushbu buyurtmani ko‘rish uchun ruxsatingiz yo‘q'));
  }

  res.status(200).json({
    success: true,
    data: {
      order,
    },
  });
});

// 4. Buyurtmani bekor qilish
export const cancelOrder = catchAsync(async (req, res, next) => {
  const { orderNumber } = req.params;

  const order = await Order.findOne({ orderNumber });
  if (!order) {
    return next(new ApiError(404, 'Buyurtma topilmadi'));
  }

  if (order.user && order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Sizda ushbu amal uchun ruxsat yo‘q'));
  }

  if (!['yangi', 'tasdiqlangan'].includes(order.status)) {
    return next(new ApiError(400, 'Ushbu holatdagi buyurtmani bekor qilib bo‘lmaydi'));
  }

  // Zaxiralarni qaytarish
  for (const item of order.items) {
    await Product.findOneAndUpdate(
      { _id: item.product, 'variants.sku': item.sku },
      {
        $inc: {
          'variants.$.stock': item.quantity,
          soldCount: -item.quantity,
        },
      }
    );
  }

  order.status = 'bekor_qilindi';
  order.statusHistory.push({
    status: 'bekor_qilindi',
    at: new Date(),
    note: req.body.reason || 'Mijoz tomonidan bekor qilindi',
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Buyurtma bekor qilindi',
    data: {
      order,
    },
  });
});
