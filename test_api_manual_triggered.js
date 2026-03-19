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
        console.log('Login successful');

        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('\n--- Creating an Alert that will be triggered (AAPL > 100) ---');
        const createRes = await fetch(`${API_URL}/stocks/alerts`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                symbol: 'AAPL',
                targetPrice: 100,
                condition: 'ABOVE'
            })
        });
        const createdAlert = await createRes.json();
        const alertId = createdAlert._id;
        console.log('Alert created:', alertId);

        console.log('\n--- Triggering Alert Check ---');
        const checkRes = await fetch(`${API_URL}/stocks/check-alerts`, {
            method: 'POST',
            headers
        });
        console.log('Check status:', checkRes.status);

        console.log('\n--- Verifying that TRIGGERED alert is still returned ---');
        const getRes = await fetch(`${API_URL}/stocks/alerts`, { headers });
        const alerts = await getRes.json();
        console.log('Total alerts retrieved:', alerts.length);
        
        const myAlert = alerts.find(a => a._id === alertId);
        if (myAlert) {
            console.log('Alert found in results!');
            console.log('isTriggered status:', myAlert.isTriggered);
            if (myAlert.isTriggered === true) {
                console.log('✅ SUCCESS: Triggered alert was retrieved!');
            } else {
                console.warn('⚠️ WARNING: Alert was not triggered yet. Maybe price is below 100?');
            }
        } else {
            console.error('❌ FAILURE: Triggered alert DISAPPEARED from results!');
        }

        console.log('\n--- Cleaning up ---');
        await fetch(`${API_URL}/stocks/alerts/${alertId}`, {
            method: 'DELETE',
            headers
        });

        console.log('\nManual Verification Completed');
    } catch (err) {
        console.error('\n❌ Manual API Verification FAILED');
        console.error(err.message);
    }
}

test();
