process.env.NODE_ENV = 'test';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/user_model';
import StockAlert from '../models/stock_alert_model';

const TEST_DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/market_watch_test_db';

jest.setTimeout(60000);

beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    try {
        await User.deleteMany({});
        await StockAlert.deleteMany({});
    } catch (err) {
        console.error('Cleanup failed:', err);
    }
});

describe('Stock Alert API', () => {
    const testUser = {
        email: 'alert_test@example.com',
        username: 'alertuser',
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

    describe('POST /stocks/alerts', () => {
        it('should create a new alert', async () => {
            const alertData = {
                symbol: 'AAPL',
                targetPrice: 200,
                condition: 'ABOVE'
            };

            const res = await request(app)
                .post('/stocks/alerts')
                .set('Authorization', `Bearer ${userToken}`)
                .send(alertData);

            expect(res.statusCode).toBe(201);
            expect(res.body.symbol).toBe('AAPL');
            expect(res.body.targetPrice).toBe(200);
            expect(res.body.condition).toBe('ABOVE');
            expect(res.body.user).toBe(userId);
        });

        it('should fail to create alert without authentication', async () => {
            const res = await request(app).post('/stocks/alerts').send({
                symbol: 'AAPL',
                targetPrice: 200,
                condition: 'ABOVE'
            });
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /stocks/alerts', () => {
        it('should get all alerts including triggered ones', async () => {
            // Create one active and one triggered alert
            const activeAlert = new StockAlert({
                user: userId,
                symbol: 'MSFT',
                targetPrice: 400,
                condition: 'ABOVE',
                isTriggered: false
            });
            await activeAlert.save();

            const triggeredAlert = new StockAlert({
                user: userId,
                symbol: 'GOOGL',
                targetPrice: 150,
                condition: 'BELOW',
                isTriggered: true
            });
            await triggeredAlert.save();

            const res = await request(app)
                .get('/stocks/alerts')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(2);
            
            const symbols = res.body.map((a: any) => a.symbol);
            expect(symbols).toContain('MSFT');
            expect(symbols).toContain('GOOGL');

            const triggered = res.body.find((a: any) => a.symbol === 'GOOGL');
            expect(triggered.isTriggered).toBe(true);
        });
    });

    describe('PUT /stocks/alerts/:id', () => {
        it('should update an alert', async () => {
            const alert = new StockAlert({
                user: userId,
                symbol: 'TSLA',
                targetPrice: 250,
                condition: 'ABOVE'
            });
            await alert.save();

            const res = await request(app)
                .put(`/stocks/alerts/${alert._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ targetPrice: 300 });

            expect(res.statusCode).toBe(200);
            expect(res.body.targetPrice).toBe(300);
        });
    });

    describe('DELETE /stocks/alerts/:id', () => {
        it('should delete an alert', async () => {
            const alert = new StockAlert({
                user: userId,
                symbol: 'AMD',
                targetPrice: 180,
                condition: 'BELOW'
            });
            await alert.save();

            const res = await request(app)
                .delete(`/stocks/alerts/${alert._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Alert deleted");

            // Verify it's gone
            const checkRes = await request(app)
                .get('/stocks/alerts')
                .set('Authorization', `Bearer ${userToken}`);
            expect(checkRes.body).toHaveLength(0);
        });
    });
});
