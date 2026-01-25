import express from 'express';
import userController from '../controllers/user_controller';
import { authMiddleware } from '../middleware/auth_middleware';
import upload from '../middleware/file_middleware';

const router = express.Router();

// Get current user profile (Protected)
router.get('/profile', authMiddleware, userController.getProfile);

// Update profile name and image (Protected + File Upload)
router.put('/update', authMiddleware, upload.single('image'), userController.updateProfile);

export default router;
