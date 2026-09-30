import mongoose from 'mongoose';
import { Product } from './Product.js';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Mahsulot ko‘rsatilishi shart'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Foydalanuvchi ko‘rsatilishi shart'],
    },
    rating: {
      type: Number,
      required: [true, 'Bahoni kiritish shart'],
      min: [1, 'Eng past baho 1'],
      max: [5, 'Eng yuqori baho 5'],
    },
    title: {
      type: String,
      required: [true, 'Sharh sarlavhasini kiriting'],
      trim: true,
      maxlength: [100, 'Sarlavha 100 belgidan oshmasligi kerak'],
    },
    comment: {
      type: String,
      required: [true, 'Sharh matnini kiriting'],
      trim: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Bitta foydalanuvchi bitta mahsulotga bitta sharh
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// O'rtacha reytingni qayta hisoblash
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingCount: stats[0].nRatings,
      ratingAverage: Math.round(stats[0].avgRating * 10) / 10,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingCount: 0,
      ratingAverage: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product);
  }
});

export const Review = mongoose.model('Review', reviewSchema);
