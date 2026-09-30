import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Istaklar ro'yxatini olish
export const getWishlist = catchAsync(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
    path: 'products',
    match: { isActive: true },
    populate: { path: 'category', select: 'name slug' },
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  res.status(200).json({
    success: true,
    data: {
      wishlist: wishlist.products,
    },
  });
});

// Istaklarga qo'shish
export const addToWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    return next(new ApiError(404, 'Mahsulot topilmadi'));
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  res.status(200).json({
    success: true,
    message: 'Mahsulot istaklarga qo‘shildi',
    data: {
      wishlist: wishlist.products,
    },
  });
});

// Istaklardan o'chirish
export const removeFromWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    return next(new ApiError(404, 'Istaklar ro‘yxati topilmadi'));
  }

  wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Mahsulot istaklardan olib tashlandi',
    data: {
      wishlist: wishlist.products,
    },
  });
});

// Mehmon istaklarini birlashtirish
export const mergeWishlist = catchAsync(async (req, res, next) => {
  const { productIds } = req.body;

  if (!Array.isArray(productIds)) {
    return next(new ApiError(400, 'productIds massiv bo‘lishi lozim'));
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  for (const pid of productIds) {
    if (!wishlist.products.map((p) => p.toString()).includes(pid)) {
      const exists = await Product.exists({ _id: pid, isActive: true });
      if (exists) {
        wishlist.products.push(pid);
      }
    }
  }

  await wishlist.save();

  res.status(200).json({
    success: true,
    data: {
      wishlist: wishlist.products,
    },
  });
});
