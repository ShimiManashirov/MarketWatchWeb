import express from 'express';
import userController from '../controllers/user_controller';
import { authMiddleware } from '../middleware/auth_middleware';
import upload from '../middleware/file_middleware';

const router = express.Router();

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/profile', authMiddleware, userController.getProfile);

/**
 * @swagger
 * /user/update:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 */
router.put('/update', authMiddleware, upload.single('image'), userController.updateProfile);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get specific user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/:id', authMiddleware, userController.getProfileById);

export default router;
