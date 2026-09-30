import { Router } from 'express';
import { router as authRoutes } from './authRoutes.js';
import { router as productRoutes } from './productRoutes.js';
import { router as categoryRoutes } from './categoryRoutes.js';
import { router as cartRoutes } from './cartRoutes.js';
import { router as wishlistRoutes } from './wishlistRoutes.js';
import { router as reviewRoutes } from './reviewRoutes.js';
import { router as userRoutes } from './userRoutes.js';
import { router as orderRoutes } from './orderRoutes.js';
import { router as adminRoutes } from './adminRoutes.js';
import { router as promoRoutes } from './promoRoutes.js';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/promo', promoRoutes);

// Reviews routes already embedded in reviewRoutes (uses /products/:id/reviews path)
router.use('/', reviewRoutes);
