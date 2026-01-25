import { Response } from 'express';
import Post from '../models/post_model';
import { AuthRequest } from '../middleware/auth_middleware';

const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, imageUrl } = req.body;
        const userId = req.user?._id;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const postData: any = {
            title,
            content,
            owner: userId
        };

        // Handle image from file upload or URL
        if (req.file) {
            postData.image = req.file.path;
        } else if (imageUrl) {
            postData.image = imageUrl;
        }

        const post = new Post(postData);
        await post.save();

        res.status(201).json(post);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create post';
        res.status(400).json({ message });
    }
};

const getAllPosts = async (req: AuthRequest, res: Response) => {
    try {
        const posts = await Post.find()
            .populate('owner', 'username image')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch posts';
        res.status(400).json({ message });
    }
};

const getPostById = async (req: AuthRequest, res: Response) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('owner', 'username image');

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(post);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch post';
        res.status(400).json({ message });
    }
};

const getPostsByOwner = async (req: AuthRequest, res: Response) => {
    try {
        const ownerId = req.params.ownerId || req.user?._id;
        const posts = await Post.find({ owner: ownerId })
            .populate('owner', 'username image')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch posts';
        res.status(400).json({ message });
    }
};

const updatePost = async (req: AuthRequest, res: Response) => {
    try {
        const postId = req.params.id;
        const userId = req.user?._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check ownership
        if (post.owner.toString() !== userId) {
            return res.status(403).json({ message: "You can only edit your own posts" });
        }

        const { title, content, imageUrl } = req.body;
        const updateData: { title?: string; content?: string; image?: string } = {};

        if (title) updateData.title = title;
        if (content) updateData.content = content;

        // Handle image update
        if (req.file) {
            updateData.image = req.file.path;
        } else if (imageUrl) {
            updateData.image = imageUrl;
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            updateData,
            { new: true }
        ).populate('owner', 'username image');

        res.status(200).json(updatedPost);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update post';
        res.status(400).json({ message });
    }
};

const deletePost = async (req: AuthRequest, res: Response) => {
    try {
        const postId = req.params.id;
        const userId = req.user?._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check ownership
        if (post.owner.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete post';
        res.status(400).json({ message });
    }
};

const likePost = async (req: AuthRequest, res: Response) => {
    try {
        const postId = req.params.id;
        const userId = req.user?._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user already liked the post
        if (post.likes.includes(userId as any)) {
            return res.status(400).json({ message: "You already liked this post" });
        }

        // Add user to likes array
        post.likes.push(userId as any);
        await post.save();

        const updatedPost = await Post.findById(postId)
            .populate('owner', 'username image')
            .populate('likes', 'username');

        res.status(200).json(updatedPost);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to like post';
        res.status(400).json({ message });
    }
};

const unlikePost = async (req: AuthRequest, res: Response) => {
    try {
        const postId = req.params.id;
        const userId = req.user?._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user hasn't liked the post
        if (!post.likes.includes(userId as any)) {
            return res.status(400).json({ message: "You haven't liked this post" });
        }

        // Remove user from likes array
        post.likes = post.likes.filter(id => id.toString() !== userId);
        await post.save();

        const updatedPost = await Post.findById(postId)
            .populate('owner', 'username image')
            .populate('likes', 'username');

        res.status(200).json(updatedPost);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to unlike post';
        res.status(400).json({ message });
    }
};

export default {
    createPost,
    getAllPosts,
    getPostById,
    getPostsByOwner,
    updatePost,
    deletePost,
    likePost,
    unlikePost
};
