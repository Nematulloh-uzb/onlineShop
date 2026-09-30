import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  mergeWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middlewares/auth.js';

export const router = Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/merge', mergeWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);
