"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comment_model_1 = __importDefault(require("../models/comment_model"));
const post_model_1 = __importDefault(require("../models/post_model"));
const createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.postId;
        const userId = req.user?._id;
        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }
        // Verify post exists
        const post = await post_model_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const comment = new comment_model_1.default({
            content,
            owner: userId,
            post: postId
        });
        await comment.save();
        // Populate owner info before returning
        const populatedComment = await comment_model_1.default.findById(comment._id)
            .populate('owner', 'username image');
        res.status(201).json(populatedComment);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create comment';
        res.status(400).json({ message });
    }
};
const getCommentsByPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        // Verify post exists
        const post = await post_model_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const comments = await comment_model_1.default.find({ post: postId })
            .populate('owner', 'username image')
            .sort({ createdAt: 1 }); // Oldest first for comments
        res.status(200).json(comments);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch comments';
        res.status(400).json({ message });
    }
};
const updateComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user?._id;
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }
        const comment = await comment_model_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        // Check ownership
        if (comment.owner.toString() !== userId) {
            return res.status(403).json({ message: "You can only edit your own comments" });
        }
        const updatedComment = await comment_model_1.default.findByIdAndUpdate(commentId, { content }, { new: true }).populate('owner', 'username image');
        res.status(200).json(updatedComment);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update comment';
        res.status(400).json({ message });
    }
};
const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user?._id;
        const comment = await comment_model_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        // Check ownership
        if (comment.owner.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }
        await comment_model_1.default.findByIdAndDelete(commentId);
        res.status(200).json({ message: "Comment deleted successfully" });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete comment';
        res.status(400).json({ message });
    }
};
exports.default = {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment
};
//# sourceMappingURL=comment_controller.js.map