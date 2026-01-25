import express, { Express } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth_routes';
import * as userRoutesModule from './routes/user_routes';



dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded files (Images)
app.use('/uploads', express.static('src/uploads'));

// Routes
app.use('/auth', authRoutes);
const userRoutes = userRoutesModule.default;
app.use('/user', userRoutes);
import postRoutes from './routes/post_routes';
app.use('/posts', postRoutes);
import commentRoutes from './routes/comment_routes';
app.use('/', commentRoutes);

// DB Connection
const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/market_watch_db';

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(mongoUrl)
    .then(() => console.log('Connected to Local MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
}

export default app;
