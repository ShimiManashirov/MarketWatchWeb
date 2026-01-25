"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comment_controller_1 = __importDefault(require("../controllers/comment_controller"));
const auth_middleware_1 = require("../middleware/auth_middleware");
const router = express_1.default.Router();
// Create a comment on a post (Protected)
router.post('/posts/:postId/comments', auth_middleware_1.authMiddleware, comment_controller_1.default.createComment);
// Get all comments for a post
router.get('/posts/:postId/comments', comment_controller_1.default.getCommentsByPost);
// Update a comment (Protected + Ownership Check)
router.put('/comments/:id', auth_middleware_1.authMiddleware, comment_controller_1.default.updateComment);
// Delete a comment (Protected + Ownership Check)
router.delete('/comments/:id', auth_middleware_1.authMiddleware, comment_controller_1.default.deleteComment);
exports.default = router;
//# sourceMappingURL=comment_routes.js.map