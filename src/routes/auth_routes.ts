import express from 'express';
const router = express.Router();
import authController from '../controllers/auth_controller';
import { authMiddleware, AuthRequest } from '../middleware/auth_middleware';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and return tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and remove refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New tokens generated
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /auth/test-protected:
 *   get:
 *     summary: Test protected route with JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted to protected route
 */
router.get('/test-protected', authMiddleware, (req: express.Request, res) => {
    const authReq = req as AuthRequest;
    res.status(200).json({ message: 'Access granted to protected route', user: authReq.user });
});

/**
 * @route GET /auth/google
 * @desc Initiate Google OAuth
 */
import passport from 'passport';
import jwt from 'jsonwebtoken';

router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

/**
 * @route GET /auth/google/callback
 * @desc Google OAuth callback
 */
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`
    }),
    (req: any, res) => {
        // Generate JWT tokens for the authenticated user
        const user = req.user;
        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '1h' }
        );
        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret',
            { expiresIn: '7d' }
        );

        // Save refresh token to user
        user.refreshTokens = user.refreshTokens || [];
        user.refreshTokens.push(refreshToken);
        user.save();

        // Redirect to frontend with tokens
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
);

/*
router.get('/facebook',
    passport.authenticate('facebook', {
        scope: ['email'],
        session: false
    })
);

router.get('/facebook/callback',
    passport.authenticate('facebook', {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`
    }),
    (req: any, res) => {
        const user = req.user;
        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '1h' }
        );
        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret',
            { expiresIn: '7d' }
        );

        user.refreshTokens = user.refreshTokens || [];
        user.refreshTokens.push(refreshToken);
        user.save();

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
);
*/

export default router;
