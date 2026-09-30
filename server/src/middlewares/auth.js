import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let decoded;
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new ApiError(401, 'Ushbu amalni bajarish uchun tizimga kirishingiz lozim'));
    }

    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (error) {
    return next(new ApiError(401, 'Autentifikatsiya xatosi: yaroqsiz token'));
  }

  if (!decoded || typeof decoded !== 'object' || !decoded.id) {
    return next(new ApiError(401, 'Autentifikatsiya xatosi: yaroqsiz token'));
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Foydalanuvchi topilmadi yoki hisob faol emas'));
    }
    req.user = user;
  } catch (error) {
    return next(error);
  }
  next();
};

// Ixtiyoriy autentifikatsiya (masalan, mehmon yoki login qilingan foydalanuvchi uchun)
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Agar token xato bo'lsa ham mehmon sifatida davom etadi
  }
  next();
};
