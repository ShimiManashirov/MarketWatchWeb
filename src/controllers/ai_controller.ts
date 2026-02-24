import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth_middleware';
import geminiService from '../services/gemini_service';
import Post from '../models/post_model';

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

        // Get AI analysis
        const aiResult = await geminiService.smartSearch(query);

        // Search posts using keywords
        const keywords = aiResult.keywords.join('|');
        const posts = await Post.find({
            $or: [
                { title: { $regex: keywords, $options: 'i' } },
                { content: { $regex: keywords, $options: 'i' } }
            ]
        })
            .populate('owner', 'username image')
            .limit(10)
            .sort({ createdAt: -1 });

        res.status(200).json({
            query,
            analysis: aiResult.analysis,
            keywords: aiResult.keywords,
            suggestions: aiResult.suggestions,
            results: posts,
            resultCount: posts.length
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
