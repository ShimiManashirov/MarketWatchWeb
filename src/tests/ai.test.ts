import 'dotenv/config';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/user_model';
import Post from '../models/post_model';

const TEST_DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/market_watch_test_db';

jest.setTimeout(60000);

// Check if AI API keys are configured
const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here';
const hasOpenRouterKey = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.startsWith('sk-or-');
const hasAIKey = hasGeminiKey || hasOpenRouterKey;

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(TEST_DB_URI);
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
});

const describeIfConfigured = hasAIKey ? describe : describe.skip;

describeIfConfigured('AI API (requires GEMINI_API_KEY)', () => {
    const testUser = {
        email: 'ai@example.com',
        username: 'aiuser',
        password: 'password123',
    };

    let userToken: string;
    let userId: string;

    beforeEach(async () => {
        const reg = await request(app).post('/auth/register').send(testUser);
        userId = reg.body._id;
        const login = await request(app).post('/auth/login').send({
            username: testUser.username,
            password: testUser.password
        });
        userToken = login.body.accessToken;
    });

    describe('POST /ai/analyze', () => {
        it('should analyze a financial query', async () => {
            const res = await request(app)
                .post('/ai/analyze')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ query: 'What are the best tech stocks?' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('analysis');
            expect(res.body).toHaveProperty('query');
        });

        it('should fail without query', async () => {
            const res = await request(app)
                .post('/ai/analyze')
                .set('Authorization', `Bearer ${userToken}`)
                .send({});

            expect(res.statusCode).toBe(400);
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .post('/ai/analyze')
                .send({ query: 'test' });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /ai/search', () => {
        beforeEach(async () => {
            // Create some test posts
            await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: 'Stock Market Analysis', content: 'Investment tips' });
        });

        it('should perform smart search', async () => {
            const res = await request(app)
                .post('/ai/search')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ query: 'stock market trends' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('analysis');
            expect(res.body).toHaveProperty('keywords');
            expect(res.body).toHaveProperty('suggestions');
            expect(res.body).toHaveProperty('results');
        });
    });

    describe('POST /ai/suggestions', () => {
        it('should generate post suggestions', async () => {
            const res = await request(app)
                .post('/ai/suggestions')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ topic: 'cryptocurrency' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('suggestions');
            expect(Array.isArray(res.body.suggestions)).toBe(true);
        });
    });

    describe('GET /ai/analyze-post/:postId', () => {
        it('should analyze a post', async () => {
            const postRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: 'Test Post', content: 'Test content about stocks' });

            const postId = postRes.body._id;

            const res = await request(app)
                .get(`/ai/analyze-post/${postId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('analysis');
        });

        it('should return 404 for non-existent post', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/ai/analyze-post/${fakeId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(404);
        });
    });
});

// Always run these basic tests
describe('AI API - Basic Tests', () => {
    const testUser = {
        email: 'ai@example.com',
        username: 'aiuser',
        password: 'password123',
    };

    let userToken: string;

    beforeEach(async () => {
        const reg = await request(app).post('/auth/register').send(testUser);
        const login = await request(app).post('/auth/login').send({
            username: testUser.username,
            password: testUser.password
        });
        userToken = login.body.accessToken;
    });

    it('should require authentication for AI endpoints', async () => {
        const res = await request(app)
            .post('/ai/analyze')
            .send({ query: 'test' });

        expect(res.statusCode).toBe(401);
    });

    it('should validate input for analyze endpoint', async () => {
        const res = await request(app)
            .post('/ai/analyze')
            .set('Authorization', `Bearer ${userToken}`)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    it('should validate input for search endpoint', async () => {
        const res = await request(app)
            .post('/ai/search')
            .set('Authorization', `Bearer ${userToken}`)
            .send({});

        expect(res.statusCode).toBe(400);
    });
});
