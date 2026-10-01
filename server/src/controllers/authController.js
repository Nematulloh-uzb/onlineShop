import bcrypt from 'bcryptjs';
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
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
import { isEmailConfigured, sendPasswordResetLink, sendVerificationCode } from '../services/emailService.js';
import { isValidEmail, normalizeEmail } from '../utils/email.js';

const hashVerificationCode = (code) => createHmac('sha256', env.JWT_ACCESS_SECRET).update(code).digest('hex');

const shouldRequireEmail = () => env.NODE_ENV !== 'test';
const emailConfigurationError = () => (
  isEmailConfigured()
    ? null
    : new ApiError(
      503,
      'Email yuborilmadi: Gmail SMTP sozlanmagan. Lokal ishga tushirishda server/.env, Dockerda loyiha boshidagi .env fayliga SMTP_USER (Gmail manzili) va SMTP_PASS (Google App Password) kiriting, so‘ng serverni qayta ishga tushiring.',
    )
);

const issueVerificationCode = async (user) => {
  const code = String(randomInt(100000, 1000000));
  user.emailVerificationCodeHash = hashVerificationCode(code);
  user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.emailVerificationAttempts = 0;
  await user.save();
  await sendVerificationCode({ email: user.email, name: user.name, code });
};

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

  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return next(new ApiError(400, 'To‘g‘ri elektron pochta manzilini kiriting'));
  }

  if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    return next(new ApiError(400, 'Parol kamida 8 ta belgidan iborat bo‘lishi, kamida bitta harf va bitta raqamni o‘z ichiga olishi kerak'));
  }

  // Keep unit tests independent of external email delivery.
  if (!shouldRequireEmail()) {
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
    return;
  }

  const configurationError = emailConfigurationError();
  if (configurationError) return next(configurationError);

  let existingUser = await User.findOne({ email: normalizedEmail })
    .select('+emailVerificationCodeHash +emailVerificationExpires +emailVerificationAttempts');
  if (existingUser && existingUser.emailVerified !== false) {
    return next(new ApiError(409, 'Ushbu elektron pochta manzili allaqachon ro‘yxatdan o‘tgan'));
  }

  const user = existingUser || await User.create({
    name: name.trim(),
    surname: typeof surname === 'string' ? surname.trim() : '',
    email: normalizedEmail,
    phone: typeof phone === 'string' ? phone.trim() : '',
    passwordHash: await bcrypt.hash(password, 10),
    newsletterOptIn: !!newsletterOptIn,
    role: 'customer',
    emailVerified: false,
  });

  await issueVerificationCode(user);
  res.status(existingUser ? 200 : 201).json({
    success: true,
    message: 'Tasdiqlash kodi elektron pochtangizga yuborildi.',
    data: { email: user.email },
  });
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const { email, code } = req.body || {};
  if (typeof email !== 'string' || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return next(new ApiError(400, 'Elektron pochta va 6 xonali tasdiqlash kodini kiriting'));
  }

  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return next(new ApiError(400, 'To‘g‘ri elektron pochta manzilini kiriting'));
  }

  const user = await User.findOne({ email: normalizedEmail })
    .select('+emailVerificationCodeHash +emailVerificationExpires +emailVerificationAttempts');
  if (!user || user.emailVerified || !user.emailVerificationCodeHash) {
    return next(new ApiError(400, 'Tasdiqlash kodi yaroqsiz yoki uning muddati o‘tgan'));
  }
  if (!user.emailVerificationExpires || user.emailVerificationExpires.getTime() <= Date.now()) {
    return next(new ApiError(400, 'Tasdiqlash kodi yaroqsiz yoki uning muddati o‘tgan'));
  }
  if (user.emailVerificationAttempts >= 5) {
    return next(new ApiError(429, 'Urinishlar chegarasi tugadi. Yangi kod so‘rang.'));
  }

  const submittedHash = Buffer.from(hashVerificationCode(code), 'hex');
  const savedHash = Buffer.from(user.emailVerificationCodeHash, 'hex');
  const matches = submittedHash.length === savedHash.length && timingSafeEqual(submittedHash, savedHash);
  if (!matches) {
    user.emailVerificationAttempts += 1;
    await user.save();
    return next(new ApiError(400, 'Tasdiqlash kodi noto‘g‘ri'));
  }

  user.emailVerified = true;
  user.emailVerificationCodeHash = undefined;
  user.emailVerificationExpires = undefined;
  user.emailVerificationAttempts = 0;
  await user.save();
  await sendTokenResponse(user, 200, res);
});

export const resendVerificationCode = catchAsync(async (req, res, next) => {
  const { email } = req.body || {};
  if (typeof email !== 'string' || !email.trim()) {
    return next(new ApiError(400, 'Elektron pochta manzilini kiriting'));
  }
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return next(new ApiError(400, 'To‘g‘ri elektron pochta manzilini kiriting'));
  }
  if (!shouldRequireEmail()) {
    return res.status(200).json({
      success: true,
      message: 'Agar tasdiqlanishi kerak bo‘lgan hisob mavjud bo‘lsa, yangi kod yuborildi.',
    });
  }
  const configurationError = emailConfigurationError();
  if (configurationError) return next(configurationError);

  const user = await User.findOne({ email: normalizedEmail })
    .select('+emailVerificationCodeHash +emailVerificationExpires +emailVerificationAttempts');
  if (user && !user.emailVerified) {
    await issueVerificationCode(user);
  }
  res.status(200).json({
    success: true,
    message: 'Agar tasdiqlanishi kerak bo‘lgan hisob mavjud bo‘lsa, yangi kod yuborildi.',
  });
});

// 2. Tizimga kirish
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return next(new ApiError(400, 'Elektron pochta va parolni kiriting'));
  }

  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return next(new ApiError(400, 'To‘g‘ri elektron pochta manzilini kiriting'));
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user || !user.isActive) {
    return next(new ApiError(401, 'Elektron pochta yoki parol noto‘g‘ri'));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ApiError(401, 'Elektron pochta yoki parol noto‘g‘ri'));
  }
  // Only block if emailVerified is explicitly false (backwards compatible with undefined).
  if (user.emailVerified === false) {
    return next(new ApiError(403, 'Davom etish uchun avval elektron pochtangizni tasdiqlang.'));
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
        avatarUrl: req.user.avatarUrl || '',
        role: req.user.role,
        addresses: req.user.addresses || [],
        newsletterOptIn: req.user.newsletterOptIn,
      },
    },
  });
});

// 6. Parolni unutdim
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body || {};
  if (typeof email !== 'string' || !email.trim()) {
    return next(new ApiError(400, 'Elektron pochta manzilini kiriting'));
  }
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return next(new ApiError(400, 'To‘g‘ri elektron pochta manzilini kiriting'));
  }

  // Unit tests do not contact external mail providers.
  if (!shouldRequireEmail()) {
    return next(new ApiError(503, 'Parolni tiklash xizmati hozircha mavjud emas'));
  }
  const configurationError = emailConfigurationError();
  if (configurationError && env.NODE_ENV !== 'development') {
    return next(configurationError);
  }

  const user = await User.findOne({ email: normalizedEmail })
    .select('+resetPasswordTokenHash +resetPasswordExpires');

  if (configurationError && env.NODE_ENV === 'development') {
    const token = randomBytes(32).toString('hex');
    if (user && user.isActive && user.emailVerified !== false) {
      user.resetPasswordTokenHash = createHash('sha256').update(token).digest('hex');
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Lokal sinov havolasi tayyor. Bu havola emailga yuborilmadi va faqat development muhitida ko‘rsatiladi.',
      data: {
        developmentResetUrl: `${env.CLIENT_URL.replace(/\/$/, '')}/parolni-tiklash/${encodeURIComponent(token)}`,
      },
    });
  }

  if (user && user.isActive && user.emailVerified !== false) {
    const token = randomBytes(32).toString('hex');
    user.resetPasswordTokenHash = createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    try {
      await sendPasswordResetLink({ email: user.email, name: user.name, token });
    } catch (error) {
      user.resetPasswordTokenHash = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      throw error;
    }
  }
  res.status(200).json({
    success: true,
    message: 'Agar bu manzil bilan hisob mavjud bo‘lsa, parolni tiklash havolasi yuborildi.',
  });
});

// 7. Parolni tiklash
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params || {};
  const { password } = req.body || {};

  if (typeof password !== 'string' || password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    return next(new ApiError(400, 'Parol kamida 8 ta belgidan iborat bo‘lishi, kamida bitta harf va bitta raqamni o‘z ichiga olishi kerak'));
  }

  if (typeof token !== 'string' || !token) {
    return next(new ApiError(400, 'Havola yaroqsiz yoki uning muddati o‘tgan'));
  }

  const resetPasswordTokenHash = createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordTokenHash,
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
