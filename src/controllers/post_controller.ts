import { Request, Response } from 'express';
import Post, { IPost } from '../models/post_model';
import { AuthRequest } from '../middleware/auth_middleware';
import GeminiService from '../services/gemini_service';

const createPost = async (req: Request, res: Response) => {
    try {
        const { title, content, imageUrl } = req.body;
        const userId = (req as AuthRequest).user?._id;

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
        
        // Generate embedding in background (don't block response if possible, or wait if needed for early consistency)
        try {
            const embeddingText = `${title} ${content}`;
            const embedding = await GeminiService.generateEmbedding(embeddingText);
            if (embedding.length > 0) {
                post.embedding = embedding;
            }
        } catch (embedError) {
            console.error("Failed to generate embedding for new post:", embedError);
        }

        await post.save();
        res.status(201).json(post);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create post';
        res.status(400).json({ message });
    }
};

const getAllPosts = async (req: Request, res: Response) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Get total count for pagination info
        const total = await Post.countDocuments();

        // Get posts with pagination
        const posts = await Post.find()
            .populate('owner', 'username image')
            .populate('commentCount')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total,
                postsPerPage: limit,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch posts';
        res.status(400).json({ message });
    }
};

const getPostById = async (req: Request, res: Response) => {
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

const getPostsByOwner = async (req: Request, res: Response) => {
    try {
        const ownerId = req.params.ownerId || (req as AuthRequest).user?._id;

        // Pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Get total count for pagination info
        const total = await Post.countDocuments({ owner: ownerId });

        // Get posts with pagination
        const posts = await Post.find({ owner: ownerId })
            .populate('owner', 'username image')
            .populate('commentCount')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total,
                postsPerPage: limit,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch posts';
        res.status(400).json({ message });
    }
};

const updatePost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const userId = (req as AuthRequest).user?._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check ownership
        if (post.owner.toString() !== userId) {
            return res.status(403).json({ message: "You can only edit your own posts" });
        }

        const { title, content, imageUrl } = req.body;
        const updateData: { title?: string; content?: string; image?: string; embedding?: number[] } = {};

        if (title) updateData.title = title;
        if (content) updateData.content = content;

        // Handle image update
        if (req.file) {
            updateData.image = req.file.path;
        } else if (imageUrl) {
            updateData.image = imageUrl;
        }

        // If content changed, update embedding
        if (title || content) {
            try {
                const finalTitle = title || post.title;
                const finalContent = content || post.content;
                const embeddingText = `${finalTitle} ${finalContent}`;
                const embedding = await GeminiService.generateEmbedding(embeddingText);
                if (embedding.length > 0) {
                    updateData.embedding = embedding;
                }
            } catch (embedError) {
                console.error("Failed to update embedding for post:", embedError);
            }
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

const deletePost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const userId = (req as AuthRequest).user?._id;

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

const likePost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const userId = (req as AuthRequest).user?._id;

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
            .populate('owner', 'username image');

        res.status(200).json(updatedPost);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to like post';
        res.status(400).json({ message });
    }
};

const unlikePost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const userId = (req as AuthRequest).user?._id;

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
            .populate('owner', 'username image');

        res.status(200).json(updatedPost);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to unlike post';
        res.status(400).json({ message });
    }
};

const searchPostsSemantic = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // 1. Generate embedding for the search query
        const queryEmbedding = await GeminiService.generateEmbedding(query);
        if (queryEmbedding.length === 0) {
            // Fallback to text search if embedding fails
            const posts = await Post.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { content: { $regex: query, $options: 'i' } }
                ]
            }).populate('owner', 'username image').limit(10);
            return res.status(200).json({ posts, method: 'keyword' });
        }

        // 2. Fetch posts that HAVE embeddings
        // In a real production apps with millions of posts, you'd use MongoDB Atlas Vector Search ($vectorSearch).
        // Here, we'll fetch the most recent posts and rank them by cosine similarity.
        const candidatePosts = await Post.find({ 
            embedding: { $exists: true, $ne: [] } 
        }).populate('owner', 'username image').limit(100);

        // 3. Rank by similarity
        const rankedPosts = candidatePosts
            .map(post => {
                const similarity = GeminiService.cosineSimilarity(queryEmbedding, post.embedding);
                return { post, similarity };
            })
            .sort((a, b) => b.similarity - a.similarity)
            .filter(item => item.similarity > 0.6) // Threshold for relevance
            .slice(0, 10)
            .map(item => item.post);

        res.status(200).json({ posts: rankedPosts, method: 'semantic' });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Semantic search failed';
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
    unlikePost,
    searchPostsSemantic
};
