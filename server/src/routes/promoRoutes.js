import { Router } from 'express';
import {
  validatePromo,
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
} from '../controllers/promoController.js';
import { protect } from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/role.js';

export const router = Router();

// Har kim tekshira oladi (savat sahifasida)
router.post('/validate', validatePromo);

// Faqat adminlar
router.get('/', protect, restrictTo('admin'), getPromoCodes);
router.post('/', protect, restrictTo('admin'), createPromoCode);
router.patch('/:id', protect, restrictTo('admin'), updatePromoCode);
router.delete('/:id', protect, restrictTo('admin'), deletePromoCode);
