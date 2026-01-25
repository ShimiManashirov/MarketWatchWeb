"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_controller_1 = __importDefault(require("../controllers/post_controller"));
const auth_middleware_1 = require("../middleware/auth_middleware");
const file_middleware_1 = __importDefault(require("../middleware/file_middleware"));
const router = express_1.default.Router();
// Create a new post (Protected + Optional File Upload)
router.post('/', auth_middleware_1.authMiddleware, file_middleware_1.default.single('image'), post_controller_1.default.createPost);
// Get all posts
router.get('/', post_controller_1.default.getAllPosts);
// Get posts by owner (must come before /:id to avoid conflict)
router.get('/owner/:ownerId', auth_middleware_1.authMiddleware, post_controller_1.default.getPostsByOwner);
// Get own posts
router.get('/my-posts', auth_middleware_1.authMiddleware, post_controller_1.default.getPostsByOwner);
// Get a specific post by ID
router.get('/:id', post_controller_1.default.getPostById);
// Update a post (Protected + Optional File Upload + Ownership Check)
router.put('/:id', auth_middleware_1.authMiddleware, file_middleware_1.default.single('image'), post_controller_1.default.updatePost);
// Like a post (Protected)
router.post('/:id/like', auth_middleware_1.authMiddleware, post_controller_1.default.likePost);
// Unlike a post (Protected)
router.delete('/:id/like', auth_middleware_1.authMiddleware, post_controller_1.default.unlikePost);
// Delete a post (Protected + Ownership Check)
router.delete('/:id', auth_middleware_1.authMiddleware, post_controller_1.default.deletePost);
exports.default = router;
//# sourceMappingURL=post_routes.js.map