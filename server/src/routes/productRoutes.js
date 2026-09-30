import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  getSearchSuggestions,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../controllers/productController.js';
import { protect } from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/role.js';
import { upload } from '../middlewares/upload.js';

export const router = Router();

router.get('/', getProducts);
router.get('/search/suggest', getSearchSuggestions);
router.get('/:slug', getProductBySlug);
router.get('/:slug/related', getRelatedProducts);

// Admin yo'nalishlari
router.post('/', protect, restrictTo('admin'), createProduct);
router.put('/:id', protect, restrictTo('admin'), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);
router.post('/upload-image', protect, restrictTo('admin'), upload.single('image'), uploadProductImage);
