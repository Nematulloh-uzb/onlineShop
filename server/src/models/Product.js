import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    color: {
      name: { type: String, required: true },
      hex: { type: String, required: true },
    },
    size: {
      type: String,
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'STANDART'],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Zaxira miqdori 0 dan kam bo‘lmasligi kerak'],
      default: 0,
    },
  },
  { _id: true }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: 'AURA ekologik mahsulot' },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Mahsulot nomini kiritish shart'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug kiritish shart'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Mahsulot tavsifini kiritish shart'],
    },
    shortDescription: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Toifani tanlash shart'],
    },
    gender: {
      type: String,
      enum: ['ayollar', 'erkaklar', 'uniseks'],
      default: 'uniseks',
    },
    price: {
      type: Number,
      required: [true, 'Narxni kiritish shart'],
      min: [0, 'Narx musbat son bo‘lishi lozim'],
    },
    compareAtPrice: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      default: 'UZS',
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    ecoBadge: {
      type: String,
      default: '100% Organik',
    },
    material: {
      type: String,
      default: 'Organik zig‘ir',
    },
    composition: {
      type: String,
      default: '100% Organik sertifikatlangan tola',
    },
    careInstructions: {
      type: [String],
      default: ['30°C haroratda nozik yuvish', 'Oqartiruvchi moddalardan saqlaning', 'Past haroratda dazmollang'],
    },
    origin: {
      type: String,
      default: 'O‘zbekistonda mehr bilan tayyorlangan',
    },
    certifications: {
      type: [String],
      default: ['GOTS', 'OEKO-TEX Standard 100'],
    },
    ecoImpact: {
      waterSavedLiters: { type: Number, default: 2400 },
      co2SavedKg: { type: Number, default: 3.5 },
      note: { type: String, default: 'An‘anaviy ishlab chiqarishga nisbatan 70% kam resurs sarflangan' },
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: [0, 'Reyting manfiy bo‘lishi mumkin emas'],
      max: [5, 'Reyting ko‘pi bilan 5 bo‘lishi kerak'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual maydon: Chegirma foizi
productSchema.virtual('discountPercent').get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Indekslar
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ isFeatured: 1, isNewArrival: 1 });
productSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  material: 'text',
});

export const Product = mongoose.model('Product', productSchema);
