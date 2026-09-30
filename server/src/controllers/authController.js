import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import {
  accessCookieOptions,
  clearAuthCookies,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  matchesRefreshToken,
  refreshCookieOptions,
  sendTokenResponse,
} from '../utils/token.js';
import { env } from '../config/env.js';

// 1. Ro'yxatdan o'tish
export const register = catchAsync(async (req, res, next) => {
  const { name, surname, email, phone, password, newsletterOptIn } = req.body || {};

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof name !== 'string' ||
    !email.trim() ||
    !password ||
    !name.trim()
  ) {
    return next(new ApiError(400, 'Ism, email va parol kiritilishi shart'));
  }

  if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    return next(new ApiError(400, 'Parol kamida 8 ta belgidan iborat bo‘lishi, kamida bitta harf va bitta raqamni o‘z ichiga olishi kerak'));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(new ApiError(409, 'Ushbu elektron pochta manzili allaqachon ro‘yxatdan o‘tgan'));
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    surname: surname || '',
    email: normalizedEmail,
    phone: phone || '',
    passwordHash,
    newsletterOptIn: !!newsletterOptIn,
    role: 'customer',
  });

  await sendTokenResponse(newUser, 201, res);
});

// 2. Tizimga kirish
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return next(new ApiError(400, 'Elektron pochta va parolni kiriting'));
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user || !user.isActive) {
    return next(new ApiError(401, 'Elektron pochta yoki parol noto‘g‘ri'));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ApiError(401, 'Elektron pochta yoki parol noto‘g‘ri'));
  }

  await sendTokenResponse(user, 200, res);
});

// 3. Tizimdan chiqish
export const logout = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (typeof token === 'string' && token) {
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch {
      // Logout remains successful even when the presented token is expired or invalid.
    }
    if (decoded && typeof decoded === 'object' && decoded.id) {
      try {
        await User.updateOne(
          { _id: decoded.id, refreshTokenHash: hashRefreshToken(token) },
          { $unset: { refreshTokenHash: 1 } }
        );
      } catch (error) {
        clearAuthCookies(res);
        throw error;
      }
    }
  }

  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    message: 'Tizimdan muvaffaqiyatli chiqildi',
  });
});

// 4. Access tokenni yangilash
export const refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return next(new ApiError(401, 'Refresh token topilmadi, qayta kiring'));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch {
    clearAuthCookies(res);
    return next(new ApiError(401, 'Refresh token yaroqsiz yoki muddati o‘tgan'));
  }

  if (!decoded || typeof decoded !== 'object' || !decoded.id) {
    clearAuthCookies(res);
    return next(new ApiError(401, 'Refresh token yaroqsiz yoki muddati o‘tgan'));
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user || !user.isActive || !matchesRefreshToken(token, user.refreshTokenHash)) {
    clearAuthCookies(res);
    return next(new ApiError(401, 'Refresh token yaroqsiz yoki muddati o‘tgan'));
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);
  user.refreshTokenHash = hashRefreshToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', newRefreshToken, refreshCookieOptions());
  res.cookie('accessToken', newAccessToken, accessCookieOptions());

  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken,
    },
  });
});

// 5. Joriy foydalanuvchi ma'lumotlari
export const getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        surname: req.user.surname,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        addresses: req.user.addresses || [],
        newsletterOptIn: req.user.newsletterOptIn,
      },
    },
  });
});

// 6. Parolni unutdim (Mock / email konsolga)
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiError(400, 'Elektron pochta manzilini kiriting'));
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Xavfsizlik nuqtai nazaridan xuddi xat ketgandek javob beriladi
    return res.status(200).json({
      success: true,
      message: 'Agar ushbu pochta ro‘yxatdan o‘tgan bo‘lsa, tiklash havolasi yuborildi',
    });
  }

  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  user.resetPasswordTokenHash = await bcrypt.hash(resetToken, 10);
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 daqiqa
  await user.save({ validateBeforeSave: false });

  console.log(`[Email Mock] Parolni tiklash havolasi (${user.email}): /reset-password/${resetToken}`);

  res.status(200).json({
    success: true,
    message: 'Parolni tiklash havolasi pochtangizga yuborildi (konsolda ko‘rsatildi)',
    mockToken: env.NODE_ENV === 'development' ? resetToken : undefined,
  });
});

// 7. Parolni tiklash
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    return next(new ApiError(400, 'Yangi parol kamida 8 ta belgidan iborat bo‘lishi shart'));
  }

  const user = await User.findOne({
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+passwordHash +resetPasswordTokenHash +resetPasswordExpires');

  if (!user) {
    return next(new ApiError(400, 'Havola yaroqsiz yoki uning muddati o‘tgan'));
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await sendTokenResponse(user, 200, res);
});
