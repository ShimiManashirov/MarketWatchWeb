import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/user_model';
import Post from '../models/post_model';

const TEST_DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/market_watch_test_db';

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

describe('Post API', () => {
    const testUser1 = {
        email: 'user1@example.com',
        username: 'user1',
        password: 'password123',
    };

    const testUser2 = {
        email: 'user2@example.com',
        username: 'user2',
        password: 'password123',
    };

    let user1Token: string;
    let user1Id: string;
    let user2Token: string;
    let user2Id: string;

    beforeEach(async () => {
        // Create two users
        const reg1 = await request(app).post('/auth/register').send(testUser1);
        user1Id = reg1.body._id;
        const login1 = await request(app).post('/auth/login').send({
            username: testUser1.username,
            password: testUser1.password
        });
        user1Token = login1.body.accessToken;

        const reg2 = await request(app).post('/auth/register').send(testUser2);
        user2Id = reg2.body._id;
        const login2 = await request(app).post('/auth/login').send({
            username: testUser2.username,
            password: testUser2.password
        });
        user2Token = login2.body.accessToken;
    });

    describe('POST /posts', () => {
        it('should create a new post when authenticated', async () => {
            const postData = {
                title: 'My First Post',
                content: 'This is the content of my first post'
            };

            const res = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send(postData);

            expect(res.statusCode).toBe(201);
            expect(res.body.title).toBe(postData.title);
            expect(res.body.content).toBe(postData.content);
            expect(res.body.owner).toBe(user1Id);
        });

        it('should fail to create post without authentication', async () => {
            const postData = {
                title: 'My First Post',
                content: 'This is the content'
            };

            const res = await request(app).post('/posts').send(postData);
            expect(res.statusCode).toBe(401);
        });

        it('should fail to create post without title or content', async () => {
            const res = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'Only Title' });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /posts', () => {
        beforeEach(async () => {
            // Create some posts
            await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'Post 1', content: 'Content 1' });

            await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user2Token}`)
                .send({ title: 'Post 2', content: 'Content 2' });
        });

        it('should get all posts with pagination', async () => {
            const res = await request(app).get('/posts');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('posts');
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.posts.length).toBe(2);
            expect(res.body.pagination.totalPosts).toBe(2);
        });
    });

    describe('GET /posts/:id', () => {
        it('should get a specific post by ID', async () => {
            const createRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'Test Post', content: 'Test Content' });

            const postId = createRes.body._id;

            const res = await request(app).get(`/posts/${postId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.title).toBe('Test Post');
        });

        it('should return 404 for non-existent post', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/posts/${fakeId}`);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /posts/:id', () => {
        it('should update own post', async () => {
            const createRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'Original Title', content: 'Original Content' });

            const postId = createRes.body._id;

            const res = await request(app)
                .put(`/posts/${postId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'Updated Title' });

            expect(res.statusCode).toBe(200);
            expect(res.body.title).toBe('Updated Title');
            expect(res.body.content).toBe('Original Content');
        });

        it('should not allow updating another user\'s post', async () => {
            const createRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'User1 Post', content: 'Content' });

            const postId = createRes.body._id;

            const res = await request(app)
                .put(`/posts/${postId}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send({ title: 'Hacked Title' });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('DELETE /posts/:id', () => {
        it('should delete own post', async () => {
            const createRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'To Delete', content: 'Content' });

            const postId = createRes.body._id;

            const res = await request(app)
                .delete(`/posts/${postId}`)
                .set('Authorization', `Bearer ${user1Token}`);

            expect(res.statusCode).toBe(200);

            // Verify post is deleted
            const getRes = await request(app).get(`/posts/${postId}`);
            expect(getRes.statusCode).toBe(404);
        });

        it('should not allow deleting another user\'s post', async () => {
            const createRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'User1 Post', content: 'Content' });

            const postId = createRes.body._id;

            const res = await request(app)
                .delete(`/posts/${postId}`)
                .set('Authorization', `Bearer ${user2Token}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /posts/owner/:ownerId', () => {
        beforeEach(async () => {
            // User1 creates 2 posts
            await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'User1 Post 1', content: 'Content 1' });

            await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'User1 Post 2', content: 'Content 2' });

            // User2 creates 1 post
            await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user2Token}`)
                .send({ title: 'User2 Post', content: 'Content' });
        });

        it('should get posts by specific owner with pagination', async () => {
            const res = await request(app)
                .get(`/posts/owner/${user1Id}`)
                .set('Authorization', `Bearer ${user1Token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('posts');
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.posts.length).toBe(2);
            expect(res.body.pagination.totalPosts).toBe(2);
        });

        it('should get own posts when using /my-posts with pagination', async () => {
            const res = await request(app)
                .get('/posts/my-posts')
                .set('Authorization', `Bearer ${user2Token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('posts');
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.posts.length).toBe(1);
            expect(res.body.pagination.totalPosts).toBe(1);
        });
    });

    describe('POST /posts/:id/like', () => {
        let postId: string;

        beforeEach(async () => {
            const createRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'Post to Like', content: 'Content' });
            postId = createRes.body._id;
        });

        it('should like a post', async () => {
            const res = await request(app)
                .post(`/posts/${postId}/like`)
                .set('Authorization', `Bearer ${user2Token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.likes).toHaveLength(1);
            expect(res.body.likes[0]._id).toBe(user2Id);
        });

        it('should not allow liking the same post twice', async () => {
            await request(app)
                .post(`/posts/${postId}/like`)
                .set('Authorization', `Bearer ${user2Token}`);

            const res = await request(app)
                .post(`/posts/${postId}/like`)
                .set('Authorization', `Bearer ${user2Token}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("You already liked this post");
        });

        it('should fail to like without authentication', async () => {
            const res = await request(app).post(`/posts/${postId}/like`);
            expect(res.statusCode).toBe(401);
        });

        it('should return 404 for non-existent post', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/posts/${fakeId}/like`)
                .set('Authorization', `Bearer ${user2Token}`);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /posts/:id/like', () => {
        let postId: string;

        beforeEach(async () => {
            const createRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'Post to Unlike', content: 'Content' });
            postId = createRes.body._id;

            // Like the post first
            await request(app)
                .post(`/posts/${postId}/like`)
                .set('Authorization', `Bearer ${user2Token}`);
        });

        it('should unlike a post', async () => {
            const res = await request(app)
                .delete(`/posts/${postId}/like`)
                .set('Authorization', `Bearer ${user2Token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.likes).toHaveLength(0);
        });

        it('should not allow unliking a post that was not liked', async () => {
            const res = await request(app)
                .delete(`/posts/${postId}/like`)
                .set('Authorization', `Bearer ${user1Token}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("You haven't liked this post");
        });

        it('should fail to unlike without authentication', async () => {
            const res = await request(app).delete(`/posts/${postId}/like`);
            expect(res.statusCode).toBe(401);
        });
    });
});
