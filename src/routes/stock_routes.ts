import express from 'express';
import stockController from '../controllers/stock_controller';
import { authMiddleware } from '../middleware/auth_middleware';

const router = express.Router();

// Search stocks (Public or Protected? Making it protected to encourage login)
router.get('/search', authMiddleware, stockController.search);

// Get quote
router.get('/quote/:symbol', authMiddleware, stockController.getQuote);

// Alerts
router.post('/alerts', authMiddleware, stockController.createAlert);
router.get('/alerts', authMiddleware, stockController.getAlerts);
router.put('/alerts/:id', authMiddleware, stockController.updateAlert);
router.delete('/alerts/:id', authMiddleware, stockController.deleteAlert);

export default router;
