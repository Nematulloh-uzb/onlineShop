import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 daqiqa
  max: 15,
  message: {
    success: false,
    message: 'Juda ko‘p so‘rov yuborildi. Iltimos, 1 daqiqadan so‘ng qayta urinib ko‘ring.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: {
    success: false,
    message: 'So‘rovlar chegarasi oshdi. Iltimos, birozdan so‘ng urinib ko‘ring.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
