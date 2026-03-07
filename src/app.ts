import express, { Express } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import authRoutes from './routes/auth_routes';
import * as userRoutesModule from './routes/user_routes';
import { setupSwagger } from './swagger';
import { setupPassport } from './config/passport';



dotenv.config();

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize Passport

// Initialize Passport
setupPassport();
app.use(passport.initialize());

// Static folder for uploaded files (Images)
app.use('/uploads', express.static('src/uploads'));

// Swagger Documentation
setupSwagger(app);

// Routes
app.use('/auth', authRoutes);
const userRoutes = userRoutesModule.default;
app.use('/user', userRoutes);
import postRoutes from './routes/post_routes';
app.use('/posts', postRoutes);
import commentRoutes from './routes/comment_routes';
app.use('/', commentRoutes);
import aiRoutes from './routes/ai_routes';
app.use('/ai', aiRoutes);
import stockRoutes from './routes/stock_routes';
app.use('/stocks', stockRoutes);
import watchlistRoutes from './routes/watchlist_routes';
app.use('/watchlist', watchlistRoutes);

import cronService from './services/cron_service';
cronService.initCronJobs();

import path from 'path';

// ... (keep routes)

// Serve frontend static files
if (process.env.NODE_ENV !== 'development') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // SPA Fallback: generic middleware to avoid Express 5 path restrictions
  app.use((req, res, next) => {
    if (req.method === 'GET' && req.accepts('html')) {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    } else {
      next();
    }
  });
}

// DB Connection
const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/market_watch_db';

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(mongoUrl)
    .then(() => console.log('Connected to Local MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
}

export default app;
