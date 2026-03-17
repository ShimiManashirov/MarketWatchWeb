import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user_model';
import Post from './models/post_model';
import Comment from './models/comment_model';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedDatabase = async () => {
    try {
        const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/market_watch_db';
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Post.deleteMany({});
        await Comment.deleteMany({});
        console.log('Cleared existing data');

        const salt = await bcrypt.genSalt(10);
        const hashedHash = await bcrypt.hash('password123', salt);

        // Create Users
        const users = await User.insertMany([
            {
                email: 'shimi@example.com',
                username: 'Shimi',
                password: hashedHash,
                image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shimi'
            },
            {
                email: 'marketguru@example.com',
                username: 'MarketGuru',
                password: hashedHash,
                image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarketGuru'
            },
            {
                email: 'tech_analyst@example.com',
                username: 'TechAnalyst',
                password: hashedHash,
                image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech'
            }
        ]);
        console.log(`Created ${users.length} users`);

        const shimi = users[0];
        const guru = users[1];
        const tech = users[2];

        // Create Sample Posts
        const posts = await Post.insertMany([
            {
                title: "S&P 500 Hits All-Time High",
                content: "The S&P 500 index reached a new record high today, driven by strong earnings from tech giants. Investors are optimistic about the upcoming quarter.",
                owner: guru._id,
                image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?w=800&auto=format&fit=crop&q=60"
            },
            {
                title: "Bitcoin Surges Past $100k",
                content: "Crypto markets are rallying as institutional adoption grows. Is this the beginning of a new bull run?",
                owner: shimi._id,
                image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop&q=60"
            },
            {
                title: "Fed Interest Rate Decision",
                content: "The Federal Reserve is expected to announce its interest rate decision tomorrow. Analysts predict a pause in rate hikes.",
                owner: guru._id,
                image: "https://images.unsplash.com/photo-1621501103258-0e1a126c8b71?w=800&auto=format&fit=crop&q=60"
            },
            {
                title: "Semiconductor Industry Analysis",
                content: "Deep dive into NVIDIA and AMD. The AI boom is just getting started.",
                owner: tech._id,
                image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60"
            }
        ]);
        console.log(`Created ${posts.length} posts`);

        // Create Sample Comments
        const comments = await Comment.insertMany([
            {
                content: "Great analysis on the Fed! I also think they will pause.",
                owner: tech._id,
                post: posts[2]._id
            },
            {
                content: "Bitcoin to the moon! 🚀",
                owner: guru._id,
                post: posts[1]._id
            },
            {
                content: "I'm keeping an eye on tech earnings.",
                owner: shimi._id,
                post: posts[0]._id
            }
        ]);
        console.log(`Created ${comments.length} comments`);

        console.log('Seeding complete! All users have password: password123');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
