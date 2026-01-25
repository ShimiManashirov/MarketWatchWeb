import { Response } from 'express';
import Comment from '../models/comment_model';
import Post from '../models/post_model';
import { AuthRequest } from '../middleware/auth_middleware';

const createComment = async (req: AuthRequest, res: Response) => {
    try {
        const { content } = req.body;
        const postId = req.params.postId;
        const userId = req.user?._id;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = new Comment({
            content,
            owner: userId,
            post: postId
        });

        await comment.save();

        // Populate owner info before returning
        const populatedComment = await Comment.findById(comment._id)
            .populate('owner', 'username image');

        res.status(201).json(populatedComment);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create comment';
        res.status(400).json({ message });
    }
};

const getCommentsByPost = async (req: AuthRequest, res: Response) => {
    try {
        const postId = req.params.postId;

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comments = await Comment.find({ post: postId })
            .populate('owner', 'username image')
            .sort({ createdAt: 1 }); // Oldest first for comments

        res.status(200).json(comments);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch comments';
        res.status(400).json({ message });
    }
};

const updateComment = async (req: AuthRequest, res: Response) => {
    try {
        const commentId = req.params.id;
        const userId = req.user?._id;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check ownership
        if (comment.owner.toString() !== userId) {
            return res.status(403).json({ message: "You can only edit your own comments" });
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true }
        ).populate('owner', 'username image');

        res.status(200).json(updatedComment);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update comment';
        res.status(400).json({ message });
    }
};

const deleteComment = async (req: AuthRequest, res: Response) => {
    try {
        const commentId = req.params.id;
        const userId = req.user?._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check ownership
        if (comment.owner.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }

        await Comment.findByIdAndDelete(commentId);
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete comment';
        res.status(400).json({ message });
    }
};

export default {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment
};
