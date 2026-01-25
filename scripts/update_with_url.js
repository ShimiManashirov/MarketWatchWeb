(async () => {
  try {
    const base = 'http://localhost:3000';
    const username = 'urluser_' + Date.now();
    const password = 'Pass1234!';
    const email = `${username}@example.com`;

    console.log('Registering', username);
    let r = await fetch(base + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    console.log('register', r.status, await r.text());

    r = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const loginBody = await r.json();
    console.log('login status', r.status);
    const token = loginBody.accessToken;
    if (!token) {
      console.error('No token from login', loginBody);
      return;
    }

    console.log('Updating profile with imageUrl');
    r = await fetch(base + '/user/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username: username + '_updated', imageUrl: 'https://example.com/avatar.png' }),
    });
    console.log('update status', r.status, await r.text());

    r = await fetch(base + '/user/profile', { headers: { Authorization: `Bearer ${token}` } });
    console.log('profile after', r.status, await r.text());
  } catch (err) {
    console.error(err);
  }
})();
