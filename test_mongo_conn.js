const mongoose = require('mongoose');

const uri = 'mongodb://admin:market_watch_pass@127.0.0.1:27017/test_db?authSource=admin';

console.log('Connecting to:', uri);

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed:', err);
    process.exit(1);
  });

setTimeout(() => {
  console.log('Timed out waiting for connection (10s)');
  process.exit(1);
}, 10000);
