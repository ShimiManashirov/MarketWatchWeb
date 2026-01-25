import express from 'express';
import postController from '../controllers/post_controller';
import { authMiddleware } from '../middleware/auth_middleware';
import upload from '../middleware/file_middleware';

const router = express.Router();

// Create a new post (Protected + Optional File Upload)
router.post('/', authMiddleware, upload.single('image'), postController.createPost);

// Get all posts
router.get('/', postController.getAllPosts);

// Get posts by owner (must come before /:id to avoid conflict)
router.get('/owner/:ownerId', authMiddleware, postController.getPostsByOwner);

// Get own posts
router.get('/my-posts', authMiddleware, postController.getPostsByOwner);

// Get a specific post by ID
router.get('/:id', postController.getPostById);

// Update a post (Protected + Optional File Upload + Ownership Check)
router.put('/:id', authMiddleware, upload.single('image'), postController.updatePost);

// Like a post (Protected)
router.post('/:id/like', authMiddleware, postController.likePost);

// Unlike a post (Protected)
router.delete('/:id/like', authMiddleware, postController.unlikePost);

// Delete a post (Protected + Ownership Check)
router.delete('/:id', authMiddleware, postController.deletePost);

export default router;
