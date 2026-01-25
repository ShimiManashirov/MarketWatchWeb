import express from 'express';
import commentController from '../controllers/comment_controller';
import { authMiddleware } from '../middleware/auth_middleware';

const router = express.Router();

// Create a comment on a post (Protected)
router.post('/posts/:postId/comments', authMiddleware, commentController.createComment);

// Get all comments for a post
router.get('/posts/:postId/comments', commentController.getCommentsByPost);

// Update a comment (Protected + Ownership Check)
router.put('/comments/:id', authMiddleware, commentController.updateComment);

// Delete a comment (Protected + Ownership Check)
router.delete('/comments/:id', authMiddleware, commentController.deleteComment);

export default router;
