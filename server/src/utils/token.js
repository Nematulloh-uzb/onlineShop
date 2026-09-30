import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, jti: randomUUID() }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

export const hashRefreshToken = (token) => createHash('sha256').update(token).digest('hex');

export const matchesRefreshToken = (token, tokenHash) => {
  if (!token || !tokenHash) return false;

  const candidate = Buffer.from(hashRefreshToken(token), 'hex');
  const stored = Buffer.from(tokenHash, 'hex');
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
};

const authCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
};

export const accessCookieOptions = () => ({
  ...authCookieOptions,
  expires: new Date(Date.now() + 15 * 60 * 1000),
});

export const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', authCookieOptions);
  res.clearCookie('refreshToken', authCookieOptions);
};

export const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, {
    ...authCookieOptions,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  res.cookie('accessToken', accessToken, accessCookieOptions());

  const userData = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    phone: user.phone,
    role: user.role,
    addresses: user.addresses || [],
    newsletterOptIn: user.newsletterOptIn,
  };

  res.status(statusCode).json({
    success: true,
    data: {
      user: userData,
      accessToken,
    },
  });
};
