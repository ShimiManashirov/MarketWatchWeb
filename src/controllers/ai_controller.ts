import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth_middleware';
import geminiService from '../services/gemini_service';
import Post from '../models/post_model';
import User from '../models/user_model';
import Comment from '../models/comment_model';

const analyzeQuery = async (req: Request, res: Response) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }

        const analysis = await geminiService.analyzeFinancialQuery(query);

        res.status(200).json({
            query,
            analysis,
            timestamp: new Date()
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to analyze query';
        res.status(500).json({ message });
    }
};

const smartSearch = async (req: Request, res: Response) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }

        // Get AI analysis with intent detection
        const aiResult = await geminiService.smartSearch(query);
        const keywords = aiResult.keywords.join('|');
        const intent = aiResult.intent || ['posts'];

        // Build results object based on AI-determined intent
        const results: {
            posts?: any[];
            users?: any[];
            comments?: any[];
        } = {};

        // Use an OR condition so that if the AI generates multiple keywords, we return content matching ANY of them.
        const keywordConditions = aiResult.keywords.map(kw => ({ $regex: kw, $options: 'i' }));

        // Search Posts if intent includes posts (or as default)
        if (intent.includes('posts') || intent.length === 0) {
            results.posts = await Post.find(
                keywordConditions.length > 0 ? {
                    $or: keywordConditions.map(regex => ({
                        $or: [
                            { title: regex },
                            { content: regex }
                        ]
                    }))
                } : {}
            )
                .populate('owner', 'username image')
                .limit(10)
                .sort({ createdAt: -1 });
        }

        // Search Users if intent includes users
        if (intent.includes('users')) {
            results.users = await User.find(
                keywordConditions.length > 0 ? {
                    $or: keywordConditions.map(regex => ({
                        username: regex
                    }))
                } : {}
            )
                .select('username image createdAt')
                .limit(10);
        }

        // Search Comments if intent includes comments
        if (intent.includes('comments')) {
            results.comments = await Comment.find(
                keywordConditions.length > 0 ? {
                    $or: keywordConditions.map(regex => ({
                        content: regex
                    }))
                } : {}
            )
                .populate('owner', 'username image')
                .populate('post', 'title')
                .limit(10)
                .sort({ createdAt: -1 });
        }

        const totalResults =
            (results.posts?.length || 0) +
            (results.users?.length || 0) +
            (results.comments?.length || 0);

        res.status(200).json({
            query,
            analysis: aiResult.analysis,
            keywords: aiResult.keywords,
            suggestions: aiResult.suggestions,
            intent,
            results,
            resultCount: totalResults
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to perform smart search';
        res.status(500).json({ message });
    }
};

const generateSuggestions = async (req: Request, res: Response) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ message: "Topic is required" });
        }

        const suggestions = await geminiService.generatePostSuggestions(topic);

        res.status(200).json({
            topic,
            suggestions
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate suggestions';
        res.status(500).json({ message });
    }
};

const analyzePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const analysis = await geminiService.analyzePostContent(
            `${post.title}\n\n${post.content}`
        );

        res.status(200).json({
            postId,
            analysis
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to analyze post';
        res.status(500).json({ message });
    }
};

export default {
    analyzeQuery,
    smartSearch,
    generateSuggestions,
    analyzePost
};
