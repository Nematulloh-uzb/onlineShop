import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderByNumber,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect } from '../middlewares/auth.js';

export const router = Router();

// Mehmon yoki autentifikatsiya qilingan foydalanuvchi buyurtma bera oladi
router.post('/', protect, createOrder);

// Faqat login qilganlar
router.get('/my', protect, getMyOrders);
router.get('/:orderNumber', protect, getOrderByNumber);
router.patch('/:orderNumber/cancel', protect, cancelOrder);
