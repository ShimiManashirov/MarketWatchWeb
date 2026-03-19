import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from '../models/post_model';
import User from '../models/user_model';
import GeminiService from '../services/gemini_service';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/market_watch_db';

async function syncEmbeddings() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        // 1. Sync Posts
        const posts = await Post.find({ $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }] });
        console.log(`Found ${posts.length} posts without embeddings.`);

        for (const post of posts) {
            console.log(`Generating embedding for post: ${post.title}`);
            const text = `${post.title} ${post.content}`;
            const embedding = await GeminiService.generateEmbedding(text);
            if (embedding.length > 0) {
                post.embedding = embedding;
                await post.save();
                console.log('Saved.');
            }
            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 2. Sync Users (optional, based on your implementation)
        const users = await User.find({ $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }] });
        console.log(`Found ${users.length} users without embeddings.`);
        
        for (const user of users) {
             console.log(`Generating embedding for user: ${user.username}`);
             // Use username and maybe some profile text if available
             const text = `User profile: ${user.username}`;
             const embedding = await GeminiService.generateEmbedding(text);
             if (embedding.length > 0) {
                 user.embedding = embedding;
                 await user.save();
                 console.log('Saved.');
             }
             await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('Synchronization complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

syncEmbeddings();
