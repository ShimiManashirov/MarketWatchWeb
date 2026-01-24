import express from 'express';
const router = express.Router();
import authController from '../controllers/auth_controller';
import { authMiddleware, AuthRequest } from '../middleware/auth_middleware';

/**
 * @route POST /auth/register
 * @desc Register a new user
 */
router.post('/register', authController.register);

/**
 * @route POST /auth/login
 * @desc Login user and return tokens
 */
router.post('/login', authController.login);

/**
 * @route POST /auth/logout
 * @desc Logout user and remove refresh token from DB
 */
router.post('/logout', authController.logout);
/**
 * @route POST /auth/refresh
 * @desc Refresh access token using refresh token
 */
router.post('/refresh', authController.refresh);

/**
 * @route GET /auth/test-protected
 * @desc Test protected route with JWT
 */
router.get('/test-protected', authMiddleware, (req: AuthRequest, res) => {
    res.status(200).json({ message: 'Access granted to protected route', user: req.user });
});

export default router;
