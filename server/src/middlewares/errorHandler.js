import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Mongoose noto'g'ri ObjectId
  if (err.name === 'CastError') {
    const message = `Noto'g'ri identifikator formati: ${err.value}`;
    error = new ApiError(400, message);
  }

  // Mongoose dublikat kalit xatosi (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'maydon';
    const message = `Ushbu ${field} allaqachon ro'yxatdan o'tgan`;
    error = new ApiError(409, message);
  }

  // Mongoose validatsiya xatosi
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = messages.join(', ');
    error = new ApiError(400, message, messages);
  }

  // JWT xatoliklari
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Yaroqsiz xavfsizlik tokeni');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token muddati tugagan, iltimos qayta kiring');
  }

  const response = {
    success: false,
    message: error.message || 'Serverda ichki xatolik yuz berdi',
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(error.statusCode || 500).json(response);
};
