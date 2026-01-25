import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/user_model';
import Post from '../models/post_model';
import Comment from '../models/comment_model';

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
    await Post.deleteMany({});
    await Comment.deleteMany({});
});

describe('Comment API', () => {
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
    let postId: string;

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

        // Create a post
        const postRes = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ title: 'Test Post', content: 'Test Content' });
        postId = postRes.body._id;
    });

    describe('POST /posts/:postId/comments', () => {
        it('should create a comment on a post', async () => {
            const commentData = {
                content: 'This is a great post!'
            };

            const res = await request(app)
                .post(`/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send(commentData);

            expect(res.statusCode).toBe(201);
            expect(res.body.content).toBe(commentData.content);
            expect(res.body.owner._id).toBe(user2Id);
            expect(res.body.post).toBe(postId);
        });

        it('should fail to create comment without authentication', async () => {
            const res = await request(app)
                .post(`/posts/${postId}/comments`)
                .send({ content: 'Test comment' });
            expect(res.statusCode).toBe(401);
        });

        it('should fail to create comment without content', async () => {
            const res = await request(app)
                .post(`/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send({});
            expect(res.statusCode).toBe(400);
        });

        it('should fail to create comment on non-existent post', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/posts/${fakeId}/comments`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send({ content: 'Test comment' });
            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /posts/:postId/comments', () => {
        beforeEach(async () => {
            // Create some comments
            await request(app)
                .post(`/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ content: 'First comment' });

            await request(app)
                .post(`/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send({ content: 'Second comment' });
        });

        it('should get all comments for a post with pagination', async () => {
            const res = await request(app).get(`/posts/${postId}/comments`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('comments');
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.comments.length).toBe(2);
            expect(res.body.comments[0].content).toBe('First comment');
            expect(res.body.pagination.totalComments).toBe(2);
        });

        it('should return empty array for post with no comments', async () => {
            const newPostRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ title: 'New Post', content: 'Content' });

            const res = await request(app).get(`/posts/${newPostRes.body._id}/comments`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('comments');
            expect(res.body.comments.length).toBe(0);
            expect(res.body.pagination.totalComments).toBe(0);
        });

        it('should return 404 for non-existent post', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/posts/${fakeId}/comments`);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /comments/:id', () => {
        let commentId: string;

        beforeEach(async () => {
            const commentRes = await request(app)
                .post(`/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ content: 'Original comment' });
            commentId = commentRes.body._id;
        });

        it('should update own comment', async () => {
            const res = await request(app)
                .put(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ content: 'Updated comment' });

            expect(res.statusCode).toBe(200);
            expect(res.body.content).toBe('Updated comment');
        });

        it('should not allow updating another user\'s comment', async () => {
            const res = await request(app)
                .put(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send({ content: 'Hacked comment' });

            expect(res.statusCode).toBe(403);
        });

        it('should fail to update without content', async () => {
            const res = await request(app)
                .put(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({});

            expect(res.statusCode).toBe(400);
        });
    });

    describe('DELETE /comments/:id', () => {
        let commentId: string;

        beforeEach(async () => {
            const commentRes = await request(app)
                .post(`/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ content: 'Comment to delete' });
            commentId = commentRes.body._id;
        });

        it('should delete own comment', async () => {
            const res = await request(app)
                .delete(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${user1Token}`);

            expect(res.statusCode).toBe(200);

            // Verify comment is deleted
            const comments = await Comment.findById(commentId);
            expect(comments).toBeNull();
        });

        it('should not allow deleting another user\'s comment', async () => {
            const res = await request(app)
                .delete(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${user2Token}`);

            expect(res.statusCode).toBe(403);
        });

        it('should return 404 for non-existent comment', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/comments/${fakeId}`)
                .set('Authorization', `Bearer ${user1Token}`);

            expect(res.statusCode).toBe(404);
        });
    });
});
