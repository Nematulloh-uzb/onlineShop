import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Profil ma'lumotlarini yangilash
export const updateMe = catchAsync(async (req, res, next) => {
  const { name, surname, phone, newsletterOptIn } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(name && { name }),
      ...(surname !== undefined && { surname }),
      ...(phone !== undefined && { phone }),
      ...(newsletterOptIn !== undefined && { newsletterOptIn: !!newsletterOptIn }),
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: {
      user: updatedUser,
    },
  });
});

// Parolni o'zgartirish
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ApiError(400, 'Joriy va yangi parolni kiriting'));
  }

  if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
    return next(new ApiError(400, 'Yangi parol kamida 8 ta belgi, kamida bitta harf va bitta raqamdan iborat bo‘lishi lozim'));
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new ApiError(401, 'Joriy parol noto‘g‘ri kiritildi'));
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Parol muvaffaqiyatli yangilandi',
  });
});

// Manzil qo'shish
export const addAddress = catchAsync(async (req, res, next) => {
  const { label, firstName, lastName, street, city, region, district, postalCode, phone, isDefault } = req.body;

  if (!firstName || !lastName || !street || !city || !region || !phone) {
    return next(new ApiError(400, 'Barcha zarur manzil maydonlarini to‘ldiring'));
  }

  const user = await User.findById(req.user._id);

  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({
    label: label || 'Manzil',
    firstName,
    lastName,
    street,
    city,
    region,
    district: district || '',
    postalCode: postalCode || '',
    phone,
    isDefault: isDefault || user.addresses.length === 0,
  });

  await user.save();

  res.status(201).json({
    success: true,
    data: {
      addresses: user.addresses,
    },
  });
});

// Manzilni tahrirlash
export const updateAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(id);
  if (!address) {
    return next(new ApiError(404, 'Manzil topilmadi'));
  }

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  Object.assign(address, req.body);
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      addresses: user.addresses,
    },
  });
});

// Manzilni o'chirish
export const deleteAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(id);
  if (!address) {
    return next(new ApiError(404, 'Manzil topilmadi'));
  }

  user.addresses.pull(id);

  // Agar o'chirilgan manzil asosiy bo'lgan bo'lsa, birinchisini asosiy qilish
  if (address.isDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Manzil muvaffaqiyatli o‘chirildi',
    data: {
      addresses: user.addresses,
    },
  });
});
