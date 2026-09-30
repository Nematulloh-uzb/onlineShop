import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

// 1. Dashboard statistikasi
export const getStats = catchAsync(async (req, res) => {
  const [
    totalOrders,
    paidOrders,
    totalUsers,
    totalProducts,
    popularProducts,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.find({ 'payment.status': 'paid' }),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true }),
    Product.find({ isActive: true }).sort('-soldCount').limit(5),
    Order.find().sort('-createdAt').limit(6),
  ]);

  const totalRevenue = paidOrders.reduce((sum, ord) => sum + (ord.pricing?.total || 0), 0);
  const totalWaterSaved = paidOrders.reduce(
    (sum, ord) => sum + (ord.ecoImpactTotal?.waterSavedLiters || 0),
    0
  );

  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      totalWaterSaved,
      totalUsers,
      totalProducts,
      popularProducts,
      recentOrders,
    },
  });
});

// 2. Buyurtmalar ro'yxati (Admin)
export const getOrders = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 15, search } = req.query;

  const query = {};
  if (status && status !== 'barchasi') {
    query.status = status;
  }
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [
      { orderNumber: regex },
      { 'contact.email': regex },
      { 'shippingAddress.firstName': regex },
      { 'shippingAddress.lastName': regex },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(query).sort('-createdAt').skip(skip).limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      orders,
    },
    meta: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
    },
  });
});

// 3. Buyurtma holatini yangilash (Admin)
export const updateOrderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const validStatuses = ['yangi', 'tasdiqlangan', 'yigilmoqda', 'yo‘lda', 'yetkazildi', 'bekor_qilindi', 'qaytarildi'];
  if (!validStatuses.includes(status)) {
    return next(new ApiError(400, 'Noto‘g‘ri buyurtma holati tanlandi'));
  }

  const order = await Order.findById(id);
  if (!order) {
    return next(new ApiError(404, 'Buyurtma topilmadi'));
  }

  order.status = status;
  order.statusHistory.push({
    status,
    at: new Date(),
    note: note || `Admin tomonidan o‘zgartirildi`,
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Buyurtma holati yangilandi',
    data: {
      order,
    },
  });
});

// 4. Foydalanuvchilar ro'yxati (Admin)
export const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;

  const query = {};
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: regex }, { surname: regex }, { email: regex }, { phone: regex }];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query).select('-passwordHash').sort('-createdAt').skip(skip).limit(limitNum),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
    },
    meta: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
    },
  });
});

// 5. Foydalanuvchi rolini o'zgartirish (Admin)
export const updateUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role, isActive } = req.body;

  if (role && !['customer', 'admin'].includes(role)) {
    return next(new ApiError(400, 'Noto‘g‘ri rol tanlandi'));
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!updatedUser) {
    return next(new ApiError(404, 'Foydalanuvchi topilmadi'));
  }

  res.status(200).json({
    success: true,
    data: {
      user: updatedUser,
    },
  });
});
