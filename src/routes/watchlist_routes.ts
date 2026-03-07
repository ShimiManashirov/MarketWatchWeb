import express from 'express';
import watchlistController from '../controllers/watchlist_controller';
import { authMiddleware } from '../middleware/auth_middleware';

const router = express.Router();

router.get('/', authMiddleware, watchlistController.getWatchlist);
router.post('/', authMiddleware, watchlistController.addToWatchlist);
router.delete('/:symbol', authMiddleware, watchlistController.removeFromWatchlist);

export default router;
