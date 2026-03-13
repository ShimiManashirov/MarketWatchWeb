import app from './app';

const PORT = process.env.PORT || 3000;

/**
 * Start the Express server
 */
const server = app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`-----------------------------------------`);
});

import cronService from './services/cron_service';
import mongoose from 'mongoose';

const gracefulShutdown = async () => {
  console.log('\nShutting down gracefully...');
  cronService.stopCronJobs();
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

