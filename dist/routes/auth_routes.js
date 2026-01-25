"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_controller_1 = __importDefault(require("../controllers/auth_controller"));
const auth_middleware_1 = require("../middleware/auth_middleware");
/**
 * @route POST /auth/register
 * @desc Register a new user
 */
router.post('/register', auth_controller_1.default.register);
/**
 * @route POST /auth/login
 * @desc Login user and return tokens
 */
router.post('/login', auth_controller_1.default.login);
/**
 * @route POST /auth/logout
 * @desc Logout user and remove refresh token from DB
 */
router.post('/logout', auth_controller_1.default.logout);
/**
 * @route POST /auth/refresh
 * @desc Refresh access token using refresh token
 */
router.post('/refresh', auth_controller_1.default.refresh);
/**
 * @route GET /auth/test-protected
 * @desc Test protected route with JWT
 */
router.get('/test-protected', auth_middleware_1.authMiddleware, (req, res) => {
    res.status(200).json({ message: 'Access granted to protected route', user: req.user });
});
exports.default = router;
//# sourceMappingURL=auth_routes.js.map