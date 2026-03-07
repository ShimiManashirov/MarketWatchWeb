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
        failureRedirect: '/login'
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
        res.redirect(`http://localhost:3001/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
);

/**
 * @route GET /auth/facebook
 * @desc Initiate Facebook OAuth
 */
router.get('/facebook',
    passport.authenticate('facebook', {
        scope: ['email'],
        session: false
    })
);

/**
 * @route GET /auth/facebook/callback
 * @desc Facebook OAuth callback
 */
router.get('/facebook/callback',
    passport.authenticate('facebook', {
        session: false,
        failureRedirect: '/login'
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
        res.redirect(`http://localhost:3001/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
);

export default router;
