import { Router } from 'express';
import {
  getStats,
  getOrders,
  updateOrderStatus,
  getUsers,
  updateUserRole,
} from '../controllers/adminController.js';
import { protect } from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/role.js';

export const router = Router();

// Barcha admin marshrutlari himoyalangan
router.use(protect, restrictTo('admin'));

router.get('/stats', getStats);
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
