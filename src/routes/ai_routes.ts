import express from 'express';
import aiController from '../controllers/ai_controller';
import { authMiddleware } from '../middleware/auth_middleware';

const router = express.Router();

// Analyze a financial query (Protected)
router.post('/analyze', authMiddleware, aiController.analyzeQuery);

// Smart search with AI (Protected)
router.post('/search', authMiddleware, aiController.smartSearch);

// Generate post suggestions (Protected)
router.post('/suggestions', authMiddleware, aiController.generateSuggestions);

// Analyze a specific post (Protected)
router.get('/analyze-post/:postId', authMiddleware, aiController.analyzePost);

export default router;
