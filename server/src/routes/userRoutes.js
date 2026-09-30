import { Router } from 'express';
import {
  updateMe,
  updateAvatar,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import { upload, validateUploadedImage } from '../middlewares/upload.js';

export const router = Router();

router.use(protect);

router.patch('/me', updateMe);
router.patch('/me/avatar', upload.single('avatar'), validateUploadedImage, updateAvatar);
router.patch('/me/password', changePassword);
router.post('/me/addresses', addAddress);
router.patch('/me/addresses/:id', updateAddress);
router.delete('/me/addresses/:id', deleteAddress);
