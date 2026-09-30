import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

// 1. Mahsulotlar ro'yxatini olish (filtrlar, saralash, sahifalash)
export const getProducts = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    sort = 'yangi',
    category,
    gender,
    minPrice,
    maxPrice,
    size,
    color,
    eco,
    certified,
    q,
    featured,
    new: isNew,
  } = req.query;

  const queryObj = { isActive: true };

  // Toifa bo'yicha
  if (category && category !== 'barchasi') {
    let catId = category;
    if (!category.match(/^[0-9a-fA-F]{24}$/)) {
      const foundCat = await Category.findOne({ slug: category });
      if (foundCat) catId = foundCat._id;
    }
    queryObj.category = catId;
  }

  // Jins bo'yicha
  if (gender && ['ayollar', 'erkaklar', 'uniseks'].includes(gender)) {
    queryObj.gender = { $in: [gender, 'uniseks'] };
  }

  // Narx oralig'i
  if (minPrice || maxPrice) {
    queryObj.price = {};
    if (minPrice) queryObj.price.$gte = Number(minPrice);
    if (maxPrice) queryObj.price.$lte = Number(maxPrice);
  }

  // O'lcham
  if (size) {
    queryObj['variants.size'] = size.toUpperCase();
  }

  // Rang
  if (color) {
    queryObj['variants.color.name'] = { $regex: new RegExp(color, 'i') };
  }

  // Ekologik sertifikatlangan
  if (certified === 'true') {
    queryObj.certifications = { $exists: true, $not: { $size: 0 } };
  }

  // Eko-nishon
  if (eco === 'true') {
    queryObj.ecoBadge = { $exists: true, $ne: '' };
  }

  // Tanlanganlar / Yangi kelganlar
  if (featured === 'true') {
    queryObj.isFeatured = true;
  }
  if (isNew === 'true') {
    queryObj.isNewArrival = true;
  }

  // Matnli qidiruv
  if (q && q.trim()) {
    const searchRegex = new RegExp(q.trim(), 'i');
    queryObj.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { material: searchRegex },
      { tags: searchRegex },
      { ecoBadge: searchRegex },
    ];
  }

  // Saralash
  let sortCriteria = { createdAt: -1 };
  if (sort === 'narx_osish') {
    sortCriteria = { price: 1 };
  } else if (sort === 'narx_kamayish') {
    sortCriteria = { price: -1 };
  } else if (sort === 'mashhur') {
    sortCriteria = { soldCount: -1 };
  } else if (sort === 'reyting') {
    sortCriteria = { ratingAverage: -1 };
  } else if (sort === 'yangi') {
    sortCriteria = { createdAt: -1 };
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(queryObj)
      .populate('category', 'name slug')
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(queryObj),
  ]);

  res.status(200).json({
    success: true,
    data: {
      products,
    },
    meta: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
    },
  });
});

// 2. Mahsulotni slug bo'yicha olish
export const getProductBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, isActive: true }).populate('category', 'name slug description');

  if (!product) {
    return next(new ApiError(404, 'Mahsulot topilmadi'));
  }

  res.status(200).json({
    success: true,
    data: {
      product,
    },
  });
});

// 3. Aloqador mahsulotlar (O'xshash tovarlar — joriy mahsulotdan tashqari)
export const getRelatedProducts = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const currentProduct = await Product.findOne({ slug, isActive: true });
  if (!currentProduct) {
    return next(new ApiError(404, 'Mahsulot topilmadi'));
  }

  const related = await Product.find({
    _id: { $ne: currentProduct._id },
    category: currentProduct.category,
    isActive: true,
  })
    .populate('category', 'name slug')
    .limit(4);

  // Agar toifada kam mahsulot bo'lsa, umumiy ommabop mahsulotlar bilan to'ldirish
  if (related.length < 4) {
    const additional = await Product.find({
      _id: { $nin: [currentProduct._id, ...related.map((p) => p._id)] },
      isActive: true,
    })
      .populate('category', 'name slug')
      .limit(4 - related.length);

    related.push(...additional);
  }

  res.status(200).json({
    success: true,
    data: {
      products: related,
    },
  });
});

// 4. Qidiruv takliflari (Avtomatik takliflar)
export const getSearchSuggestions = catchAsync(async (req, res) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    return res.status(200).json({
      success: true,
      data: { suggestions: [] },
    });
  }

  const regex = new RegExp(q.trim(), 'i');
  const products = await Product.find({
    isActive: true,
    $or: [{ name: regex }, { material: regex }, { tags: regex }],
  })
    .select('name slug price images ecoBadge category')
    .populate('category', 'name slug')
    .limit(6);

  const suggestions = products.map((p) => ({
    name: p.name,
    slug: p.slug,
    price: p.price,
    image: p.images?.[0]?.url || '',
    ecoBadge: p.ecoBadge,
  }));

  res.status(200).json({
    success: true,
    data: {
      suggestions,
    },
  });
});

// 5. Yangi mahsulot qo'shish (Admin)
export const createProduct = catchAsync(async (req, res, next) => {
  const existing = await Product.findOne({ slug: req.body.slug });
  if (existing) {
    return next(new ApiError(409, 'Bunday slug bilan mahsulot mavjud'));
  }

  const newProduct = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: {
      product: newProduct,
    },
  });
});

// 6. Mahsulotni tahrirlash (Admin)
export const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updated = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    return next(new ApiError(404, 'Mahsulot topilmadi'));
  }

  res.status(200).json({
    success: true,
    data: {
      product: updated,
    },
  });
});

// 7. Mahsulotni o'chirish (Admin - yumshoq o'chirish)
export const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deleted = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!deleted) {
    return next(new ApiError(404, 'Mahsulot topilmadi'));
  }

  res.status(200).json({
    success: true,
    message: 'Mahsulot muvaffaqiyatli nofaol qilindi',
  });
});

// 8. Mahsulot rasmini yuklash (Admin)
export const uploadProductImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'Iltimos, rasm faylini tanlang'));
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    data: {
      url: imageUrl,
    },
  });
});
