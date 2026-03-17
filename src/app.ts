import express, { Express } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import authRoutes from './routes/auth_routes';
import * as userRoutesModule from './routes/user_routes';
import { setupSwagger } from './swagger';
import { setupPassport } from './config/passport';



dotenv.config();

const app: Express = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // allow images to be served cross origin
}));

// Rate limiting to prevent brute force / DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite default dev port
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    process.env.CLIENT_URL || ''
  ].filter(Boolean),
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
setupPassport();
app.use(passport.initialize());

// Static folder for uploaded files (Images)
app.use('/uploads', express.static('src/uploads'));

// Serve frontend static files BEFORE API routes to prevent overlapping paths (like /watchlist)
// from hitting the backend API instead of the React app on direct browser navigation.
if (process.env.NODE_ENV !== 'development') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // SPA Fallback: intercept HTML requests before backend routes catch them
  app.use((req, res, next) => {
    // Check if it's a browser navigation asking for HTML
    const wantsHtml = req.method === 'GET' && req.headers.accept?.includes('text/html');
    // Exclude /auth/google because the browser navigates to it to trigger OAuth
    const isGoogleAuth = req.url.startsWith('/auth/google');
    
    if (wantsHtml && !isGoogleAuth) {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    } else {
      next();
    }
  });
}

// Swagger Documentation
setupSwagger(app);

// Serve Jest Test Report
app.get('/test-report', (req, res) => {
  const reportPath = path.join(__dirname, '../test-report.html');
  if (fs.existsSync(reportPath)) {
    res.sendFile(reportPath);
  } else {
    res.status(404).send('<h1>Test Report Not Available</h1><p>Run <code>npm test</code> to generate the latest report.</p>');
  }
});

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
if (process.env.NODE_ENV !== 'test') {
  cronService.initCronJobs();
}

// DB Connection
const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/market_watch_db';

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(mongoUrl)
    .then(() => console.log('Connected to Local MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
}

export default app;
