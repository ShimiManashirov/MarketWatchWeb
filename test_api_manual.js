const API_URL = 'http://localhost:3000';

async function test() {
    try {
        console.log('--- Logging in ---');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Shimi',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        
        if (!token) {
            console.error('Login failed:', loginData);
            return;
        }
        console.log('Login successful');

        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('\n--- Creating Alert ---');
        const createRes = await fetch(`${API_URL}/stocks/alerts`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                symbol: 'AAPL',
                targetPrice: 200,
                condition: 'ABOVE'
            })
        });
        const createdAlert = await createRes.json();
        const alertId = createdAlert._id;
        console.log('Alert created:', createdAlert);

        console.log('\n--- Getting Alerts ---');
        const getRes = await fetch(`${API_URL}/stocks/alerts`, { headers });
        const alerts = await getRes.data || await getRes.json(); // Handling axios vs fetch style
        console.log('Alerts retrieved (count):', alerts.length);
        console.log('Alert details:', alerts);

        console.log('\n--- Deleting Alert ---');
        const deleteRes = await fetch(`${API_URL}/stocks/alerts/${alertId}`, {
            method: 'DELETE',
            headers
        });
        console.log('Delete status:', deleteRes.status);
        const deleteData = await deleteRes.json();
        console.log('Delete response:', deleteData);

        console.log('\n--- Verifying Deletion ---');
        const finalGetRes = await fetch(`${API_URL}/stocks/alerts`, { headers });
        const finalAlerts = await finalGetRes.json();
        console.log('Alerts remaining:', finalAlerts.length);

        console.log('\n✅ Manual API Verification SUCCESSFUL');
    } catch (err) {
        console.error('\n❌ Manual API Verification FAILED');
        console.error(err.message);
    }
}

test();
