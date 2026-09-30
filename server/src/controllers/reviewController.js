import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Mahsulot sharhlarini olish
export const getProductReviews = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new ApiError(400, 'Mahsulot identifikatori noto‘g‘ri'));
  }

  const productExists = await Product.exists({ _id: id, isActive: true, gender: 'erkaklar' });
  if (!productExists) {
    return next(new ApiError(404, 'Mahsulot topilmadi'));
  }

  const reviews = await Review.find({ product: id })
    .populate('user', 'name surname')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: {
      reviews,
    },
  });
});

// Yangi sharh qoldirish
export const createReview = catchAsync(async (req, res, next) => {
  const { id } = req.params; // Product ID
  const { rating, title, comment } = req.body || {};

  if (!mongoose.isValidObjectId(id)) {
    return next(new ApiError(400, 'Mahsulot identifikatori noto‘g‘ri'));
  }
  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    typeof title !== 'string' ||
    !title.trim() ||
    title.trim().length > 100 ||
    typeof comment !== 'string' ||
    comment.trim().length < 10 ||
    comment.trim().length > 2000
  ) {
    return next(new ApiError(400, 'Baho, sarlavha va sharh matnini to‘g‘ri kiriting'));
  }

  const product = await Product.findOne({ _id: id, isActive: true, gender: 'erkaklar' });
  if (!product) {
    return next(new ApiError(404, 'Mahsulot topilmadi'));
  }

  // Foydalanuvchi allaqachon sharh qoldirganmi?
  const existingReview = await Review.findOne({ product: id, user: req.user._id });
  if (existingReview) {
    return next(new ApiError(400, 'Siz ushbu mahsulotga allaqachon sharh qoldirgansiz'));
  }

  // Haqiqiy xaridor ekanligini tekshirish
  const hasPurchased = await Order.exists({
    user: req.user._id,
    'items.product': id,
    'payment.status': 'paid',
  });

  const review = await Review.create({
    product: id,
    user: req.user._id,
    rating: Number(rating),
    title: title.trim(),
    comment: comment.trim(),
    isVerifiedPurchase: !!hasPurchased,
  });

  res.status(201).json({
    success: true,
    message: 'Sharhingiz muvaffaqiyatli qabul qilindi',
    data: {
      review,
    },
  });
});

// Sharhni o'chirish (Egasi yoki Admin)
export const deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    return next(new ApiError(404, 'Sharh topilmadi'));
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Siz ushbu sharhni o‘chira olmaysiz'));
  }

  await Review.findOneAndDelete({ _id: id });

  res.status(200).json({
    success: true,
    message: 'Sharh muvaffaqiyatli o‘chirildi',
  });
});
