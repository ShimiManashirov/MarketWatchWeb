import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user_model';
import Post from './models/post_model';

dotenv.config();

const seedDatabase = async () => {
    try {
        const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/market_watch_db';
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Post.deleteMany({});
        console.log('Cleared existing data');

        // Create a test user
        const user = await User.create({
            email: 'test@example.com',
            username: 'MarketGuru',
            password: 'password123', // Note: In a real app, hash this! But for dev/seed it's okay if authService handles it or if we login via register
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarketGuru'
        });
        console.log('Created User:', user.username);

        // Create sample posts
        const posts = [
            {
                title: "S&P 500 Hits All-Time High",
                content: "The S&P 500 index reached a new record high today, driven by strong earnings from tech giants. Investors are optimistic about the upcoming quarter.",
                owner: user._id,
                image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?w=800&auto=format&fit=crop&q=60"
            },
            {
                title: "Bitcoin Surges Past $100k",
                content: "Crypto markets are rallying as institutional adoption grows. Is this the beginning of a new bull run?",
                owner: user._id,
                image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop&q=60"
            },
            {
                title: "Fed Interest Rate Decision",
                content: "The Federal Reserve is expected to announce its interest rate decision tomorrow. Analysts predict a pause in rate hikes.",
                owner: user._id,
                image: "https://images.unsplash.com/photo-1621501103258-0e1a126c8b71?w=800&auto=format&fit=crop&q=60"
            },
            {
                title: "Tech Sector Analysis",
                content: "We take a deep dive into the semiconductor industry and its impact on global supply chains.",
                owner: user._id,
                // No image for this one
            }
        ];

        await Post.insertMany(posts);
        console.log(`Created ${posts.length} posts`);

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
