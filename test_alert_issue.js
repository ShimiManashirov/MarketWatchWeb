
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function test() {
    try {
        // 1. Login or register to get token
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: 'alertuser',
            password: 'password123'
        });
        const token = loginRes.data.accessToken;
        console.log('Logged in successfully');

        // 2. Clear existing alerts for this user (indirectly or just check what we have)
        console.log('Getting initial alerts...');
        const initialAlerts = await axios.get(`${API_URL}/stocks/alerts`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Initial alerts count:', initialAlerts.data.length);

        // 3. Create a new alert
        console.log('Creating alert...');
        const createRes = await axios.post(`${API_URL}/stocks/alerts`, {
            symbol: 'AAPL',
            targetPrice: 10,
            condition: 'ABOVE'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Alert created:', createRes.data._id);

        // 4. Manual check
        console.log('Triggering check...');
        await axios.post(`${API_URL}/stocks/check-alerts`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Check triggered');

        // 5. Get alerts again
        console.log('Getting alerts after check...');
        const finalAlerts = await axios.get(`${API_URL}/stocks/alerts`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Final alerts count:', finalAlerts.data.length);
        console.log('Alerts:', JSON.stringify(finalAlerts.data, null, 2));

    } catch (err) {
        console.error('Test failed:', err.response ? err.response.data : err.message);
    }
}

test();
