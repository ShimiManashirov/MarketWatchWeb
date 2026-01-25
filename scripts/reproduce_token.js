(async () => {
  try {
    const username = 'testuser_' + Date.now();
    const password = 'Pass1234!';
    const email = `${username}@example.com`;

    const base = 'http://localhost:3000';

    console.log('Registering user', username);
    let r = await fetch(base + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    console.log('Register status:', r.status);
    console.log('Register body:', await r.text());

    console.log('Logging in');
    r = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const loginText = await r.text();
    console.log('Login status:', r.status);
    console.log('Login body:', loginText);

    let token = '';
    try { token = JSON.parse(loginText).accessToken; } catch (e) {}
    console.log('Extracted token length:', token ? token.length : 0);

    console.log('Calling /user/profile with token');
    r = await fetch(base + '/user/profile', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log('/user/profile status:', r.status);
    console.log('/user/profile body:', await r.text());

  } catch (err) {
    console.error('Error in script:', err);
  }
})();
