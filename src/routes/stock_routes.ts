import express from 'express';
import stockController from '../controllers/stock_controller';
import { authMiddleware } from '../middleware/auth_middleware';

const router = express.Router();

/**
 * @swagger
 * /stocks/search:
 *   get:
 *     summary: Search for stocks
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', authMiddleware, stockController.search);

/**
 * @swagger
 * /stocks/quote/{symbol}:
 *   get:
 *     summary: Get stock quote
 *     tags: [Stocks]
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
 *         description: Stock quote
 */
router.get('/quote/:symbol', authMiddleware, stockController.getQuote);

/**
 * @swagger
 * /stocks/history/{symbol}:
 *   get:
 *     summary: Get historical stock data
 *     tags: [Stocks]
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
 *         description: Historical data
 */
router.get('/history/:symbol', authMiddleware, stockController.getHistory);

/**
 * @swagger
 * /stocks/alerts:
 *   post:
 *     summary: Create a stock alert
 *     tags: [Stocks]
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
 *               targetPrice:
 *                 type: number
 *               condition:
 *                 type: string
 *     responses:
 *       201:
 *         description: Alert created
 */
router.post('/alerts', authMiddleware, stockController.createAlert);

/**
 * @swagger
 * /stocks/alerts:
 *   get:
 *     summary: Get user alerts
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get('/alerts', authMiddleware, stockController.getAlerts);

/**
 * @swagger
 * /stocks/alerts/{id}:
 *   put:
 *     summary: Update an alert
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetPrice:
 *                 type: number
 *               condition:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Alert updated
 */
router.put('/alerts/:id', authMiddleware, stockController.updateAlert);

/**
 * @swagger
 * /stocks/alerts/{id}:
 *   delete:
 *     summary: Delete an alert
 *     tags: [Stocks]
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
 *         description: Alert deleted
 */
/**
 * @swagger
 * /stocks/check-alerts:
 *   post:
 *     summary: Manually trigger alert check (Dev/Verif purposes)
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alert check triggered
 */
router.post('/check-alerts', authMiddleware, stockController.checkAlerts);

export default router;
