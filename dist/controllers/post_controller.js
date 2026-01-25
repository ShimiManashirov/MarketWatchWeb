"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = __importDefault(require("../models/post_model"));
const createPost = async (req, res) => {
    try {
        const { title, content, imageUrl } = req.body;
        const userId = req.user?._id;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }
        const postData = {
            title,
            content,
            owner: userId
        };
        // Handle image from file upload or URL
        if (req.file) {
            postData.image = req.file.path;
        }
        else if (imageUrl) {
            postData.image = imageUrl;
        }
        const post = new post_model_1.default(postData);
        await post.save();
        res.status(201).json(post);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create post';
        res.status(400).json({ message });
    }
};
const getAllPosts = async (req, res) => {
    try {
        const posts = await post_model_1.default.find()
            .populate('owner', 'username image')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch posts';
        res.status(400).json({ message });
    }
};
const getPostById = async (req, res) => {
    try {
        const post = await post_model_1.default.findById(req.params.id)
            .populate('owner', 'username image');
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(post);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch post';
        res.status(400).json({ message });
    }
};
const getPostsByOwner = async (req, res) => {
    try {
        const ownerId = req.params.ownerId || req.user?._id;
        const posts = await post_model_1.default.find({ owner: ownerId })
            .populate('owner', 'username image')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch posts';
        res.status(400).json({ message });
    }
};
const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user?._id;
        const post = await post_model_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        // Check ownership
        if (post.owner.toString() !== userId) {
            return res.status(403).json({ message: "You can only edit your own posts" });
        }
        const { title, content, imageUrl } = req.body;
        const updateData = {};
        if (title)
            updateData.title = title;
        if (content)
            updateData.content = content;
        // Handle image update
        if (req.file) {
            updateData.image = req.file.path;
        }
        else if (imageUrl) {
            updateData.image = imageUrl;
        }
        const updatedPost = await post_model_1.default.findByIdAndUpdate(postId, updateData, { new: true }).populate('owner', 'username image');
        res.status(200).json(updatedPost);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update post';
        res.status(400).json({ message });
    }
};
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user?._id;
        const post = await post_model_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        // Check ownership
        if (post.owner.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }
        await post_model_1.default.findByIdAndDelete(postId);
        res.status(200).json({ message: "Post deleted successfully" });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete post';
        res.status(400).json({ message });
    }
};
const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user?._id;
        const post = await post_model_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        // Check if user already liked the post
        if (post.likes.includes(userId)) {
            return res.status(400).json({ message: "You already liked this post" });
        }
        // Add user to likes array
        post.likes.push(userId);
        await post.save();
        const updatedPost = await post_model_1.default.findById(postId)
            .populate('owner', 'username image')
            .populate('likes', 'username');
        res.status(200).json(updatedPost);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to like post';
        res.status(400).json({ message });
    }
};
const unlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user?._id;
        const post = await post_model_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        // Check if user hasn't liked the post
        if (!post.likes.includes(userId)) {
            return res.status(400).json({ message: "You haven't liked this post" });
        }
        // Remove user from likes array
        post.likes = post.likes.filter(id => id.toString() !== userId);
        await post.save();
        const updatedPost = await post_model_1.default.findById(postId)
            .populate('owner', 'username image')
            .populate('likes', 'username');
        res.status(200).json(updatedPost);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to unlike post';
        res.status(400).json({ message });
    }
};
exports.default = {
    createPost,
    getAllPosts,
    getPostById,
    getPostsByOwner,
    updatePost,
    deletePost,
    likePost,
    unlikePost
};
//# sourceMappingURL=post_controller.js.map