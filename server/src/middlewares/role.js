import { ApiError } from '../utils/ApiError.js';

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Sizda ushbu amalni bajarish uchun ruxsat yo‘q'));
    }
    next();
  };
};
