import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/role.js';

export const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin yo'nalishlari
router.post('/', protect, restrictTo('admin'), createCategory);
router.put('/:id', protect, restrictTo('admin'), updateCategory);
router.delete('/:id', protect, restrictTo('admin'), deleteCategory);
