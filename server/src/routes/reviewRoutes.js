import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/auth.js';

export const router = Router();

router.get('/products/:id/reviews', getProductReviews);
router.post('/products/:id/reviews', protect, createReview);
router.delete('/reviews/:id', protect, deleteReview);
