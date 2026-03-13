import express from 'express';
import aiController from '../controllers/ai_controller';
import { authMiddleware } from '../middleware/auth_middleware';

const router = express.Router();

/**
 * @swagger
 * /ai/analyze:
 *   post:
 *     summary: Analyze a financial query
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: Analysis result
 */
router.post('/analyze', authMiddleware, aiController.analyzeQuery);

/**
 * @swagger
 * /ai/search:
 *   post:
 *     summary: Smart search with AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.post('/search', authMiddleware, aiController.smartSearch);

/**
 * @swagger
 * /ai/suggestions:
 *   post:
 *     summary: Generate post suggestions
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Generated suggestions
 */
router.post('/suggestions', authMiddleware, aiController.generateSuggestions);

/**
 * @swagger
 * /ai/analyze-post/{postId}:
 *   get:
 *     summary: Analyze a specific post
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analysis result
 */
router.get('/analyze-post/:postId', authMiddleware, aiController.analyzePost);

export default router;
