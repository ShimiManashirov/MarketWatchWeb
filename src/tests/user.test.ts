import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/user_model';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/market_watch_test_db';

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
});

describe('User API', () => {
    const testUser = {
        email: 'user@example.com',
        username: 'originalUser',
        password: 'password123',
    };

    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
        // Create user and get token
        const registerRes = await request(app).post('/auth/register').send(testUser);
        userId = registerRes.body._id;

        const loginRes = await request(app).post('/auth/login').send({
            username: testUser.username,
            password: testUser.password
        });
        accessToken = loginRes.body.accessToken;
    });

    describe('GET /user/profile', () => {
        it('should return user profile when authenticated', async () => {
            const res = await request(app)
                .get('/user/profile')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe(testUser.username);
            expect(res.body.email).toBe(testUser.email);
            expect(res.body.password).toBeUndefined(); // Password should not be returned
        });

        it('should deny access without token', async () => {
            const res = await request(app).get('/user/profile');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /user/update', () => {
        it('should update username successfully', async () => {
            const newUsername = 'updatedUser';
            const res = await request(app)
                .put('/user/update')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ username: newUsername });

            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe(newUsername);

            // Verify in DB
            const user = await User.findById(userId);
            expect(user?.username).toBe(newUsername);
        });

        it('should update image URL successfully', async () => {
            const newImage = 'http://example.com/avatar.png';
            const res = await request(app)
                .put('/user/update')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ imageUrl: newImage });

            expect(res.statusCode).toBe(200);
            expect(res.body.image).toBe(newImage);
        });
    });
});
