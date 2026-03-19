const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/test_db';

console.log('Connecting to (no auth):', uri);

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB (no auth)!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed (no auth):', err.message);
    process.exit(1);
  });

setTimeout(() => {
  console.log('Timed out waiting for connection (10s)');
  process.exit(1);
}, 10000);
