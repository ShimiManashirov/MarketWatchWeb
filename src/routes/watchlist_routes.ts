import express from 'express';
import watchlistController from '../controllers/watchlist_controller';
import { authMiddleware } from '../middleware/auth_middleware';

const router = express.Router();

/**
 * @swagger
 * /watchlist:
 *   get:
 *     summary: Get user watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of watched stock symbols
 */
router.get('/', authMiddleware, watchlistController.getWatchlist);

/**
 * @swagger
 * /watchlist:
 *   post:
 *     summary: Add stock to watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbol:
 *                 type: string
 *     responses:
 *       201:
 *         description: Added to watchlist
 */
router.post('/', authMiddleware, watchlistController.addToWatchlist);

/**
 * @swagger
 * /watchlist/{symbol}:
 *   delete:
 *     summary: Remove stock from watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed from watchlist
 */
router.delete('/:symbol', authMiddleware, watchlistController.removeFromWatchlist);

export default router;
