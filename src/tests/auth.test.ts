import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/user_model';

const TEST_DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/market_watch_test_db';

jest.setTimeout(60000);

beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
    await mongoose.connection.close();
});

// Clear DB before each test
beforeEach(async () => {
    await User.deleteMany({});
});

describe('Auth API', () => {
    const testUser = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
    };

    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app).post('/auth/register').send(testUser);
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.username).toBe(testUser.username);
        });

        it('should fail to register with existing email', async () => {
            await request(app).post('/auth/register').send(testUser);
            const res = await request(app).post('/auth/register').send(testUser);
            expect(res.statusCode).toBe(400);
            expect(res.text).toBe("User already exists");
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/auth/register').send(testUser);
        });

        it('should login successfully with valid credentials', async () => {
            const res = await request(app).post('/auth/login').send({
                username: testUser.username,
                password: testUser.password
            });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
        });

        it('should fail login with invalid password', async () => {
            const res = await request(app).post('/auth/login').send({
                username: testUser.username,
                password: 'wrongpassword'
            });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('Token Management', () => {
        let refreshToken: string;
        let accessToken: string;

        beforeEach(async () => {
            // Register and login to get tokens
            await request(app).post('/auth/register').send(testUser);
            const res = await request(app).post('/auth/login').send({
                username: testUser.username,
                password: testUser.password
            });
            refreshToken = res.body.refreshToken;
            accessToken = res.body.accessToken;
        });

        it('should refresh access token using valid refresh token', async () => {
            const res = await request(app).post('/auth/refresh').send({ refreshToken });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
            expect(res.body.refreshToken).not.toBe(refreshToken); // Should rotate token
        });

        it('should fail refresh with invalid refresh token', async () => {
            const res = await request(app).post('/auth/refresh').send({ refreshToken: 'invalid_token' });
            expect(res.statusCode).toBe(403);
        });

        it('should logout successfully', async () => {
            const res = await request(app).post('/auth/logout').send({ refreshToken });
            expect(res.statusCode).toBe(200);

            // Try to refresh with the logged out token - should fail
            const refreshRes = await request(app).post('/auth/refresh').send({ refreshToken });
            expect(refreshRes.statusCode).toBe(403);
        });
    });
});
