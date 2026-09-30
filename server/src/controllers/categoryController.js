import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

const publicCategorySlugs = ['erkaklar', 'aksessuarlar'];

// Barcha faol toifalarni olish
export const getCategories = catchAsync(async (req, res) => {
  const categories = await Category.find({
    isActive: true,
    slug: { $in: publicCategorySlugs },
  }).sort('order');

  res.status(200).json({
    success: true,
    data: {
      categories,
    },
  });
});

// Toifani slug bo'yicha olish
export const getCategoryBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const category = publicCategorySlugs.includes(slug)
    ? await Category.findOne({ slug, isActive: true })
    : null;

  if (!category) {
    return next(new ApiError(404, 'Toifa topilmadi'));
  }

  res.status(200).json({
    success: true,
    data: {
      category,
    },
  });
});

// Yangi toifa yaratish (Admin)
export const createCategory = catchAsync(async (req, res, next) => {
  const { name, slug, description, image, order } = req.body;

  const existing = await Category.findOne({ slug });
  if (existing) {
    return next(new ApiError(409, 'Bunday slug bilan toifa allaqachon mavjud'));
  }

  const newCategory = await Category.create({
    name,
    slug,
    description: description || '',
    image: image || '',
    order: order || 0,
  });

  res.status(201).json({
    success: true,
    data: {
      category: newCategory,
    },
  });
});

// Toifani yangilash (Admin)
export const updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updated = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    return next(new ApiError(404, 'Toifa topilmadi'));
  }

  res.status(200).json({
    success: true,
    data: {
      category: updated,
    },
  });
});

// Toifani o'chirish (Admin)
export const deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deleted = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!deleted) {
    return next(new ApiError(404, 'Toifa topilmadi'));
  }

  res.status(200).json({
    success: true,
    message: 'Toifa muvaffaqiyatli nofaol qilindi',
  });
});
