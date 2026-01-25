"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user_controller"));
const auth_middleware_1 = require("../middleware/auth_middleware");
const file_middleware_1 = __importDefault(require("../middleware/file_middleware"));
const router = express_1.default.Router();
// Get current user profile (Protected)
router.get('/profile', auth_middleware_1.authMiddleware, user_controller_1.default.getProfile);
// Update profile name and image (Protected + File Upload)
router.put('/update', auth_middleware_1.authMiddleware, file_middleware_1.default.single('image'), user_controller_1.default.updateProfile);
exports.default = router;
//# sourceMappingURL=user_routes.js.map