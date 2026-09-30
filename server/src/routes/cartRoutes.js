import { Router } from 'express';
import {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  applyPromo,
  removePromo,
  mergeCart,
} from '../controllers/cartController.js';
import { protect } from '../middlewares/auth.js';

export const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:itemId', updateItemQuantity);
router.delete('/items/:itemId', removeItem);
router.post('/promo', applyPromo);
router.delete('/promo', removePromo);
router.post('/merge', mergeCart);
