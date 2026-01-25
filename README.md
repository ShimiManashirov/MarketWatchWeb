# MarketWatchWeb API - Complete Documentation

## Overview
A full-featured social media backend with authentication, user profiles, posts, likes, and comments.

## Features
- ✅ **User Authentication** - Register, login, logout, token refresh
- ✅ **User Profiles** - View and update profile with image upload
- ✅ **Posts** - Create, read, update, delete posts with images
- ✅ **Likes** - Like/unlike posts
- ✅ **Comments** - Comment on posts with full CRUD operations
- ✅ **Ownership Validation** - Users can only edit/delete their own content
- ✅ **File Uploads** - Image upload support for profiles and posts

## Test Coverage
**Total: 43 tests, all passing ✅**
- 7 Authentication tests
- 4 User profile tests
- 19 Post tests (including likes)
- 13 Comment tests

## API Endpoints Summary

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get tokens
- `POST /auth/logout` - Logout (invalidate refresh token)
- `POST /auth/refresh` - Refresh access token

### User (`/user`)
- `GET /user/profile` - Get current user profile
- `PUT /user/update` - Update profile (username, image)

### Posts (`/posts`)
- `POST /posts` - Create post
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get specific post
- `GET /posts/owner/:ownerId` - Get posts by specific user
- `GET /posts/my-posts` - Get current user's posts
- `PUT /posts/:id` - Update post (owner only)
- `DELETE /posts/:id` - Delete post (owner only)
- `POST /posts/:id/like` - Like a post
- `DELETE /posts/:id/like` - Unlike a post

### Comments
- `POST /posts/:postId/comments` - Create comment on post
- `GET /posts/:postId/comments` - Get all comments for post
- `PUT /comments/:id` - Update comment (owner only)
- `DELETE /comments/:id` - Delete comment (owner only)

## Security
- JWT-based authentication
- Password hashing with bcrypt
- Refresh token rotation
- Ownership validation on all protected operations
- File upload restrictions (images only, 5MB limit)

## Tech Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Testing**: Jest + Supertest
- **Password Hashing**: bcryptjs

## Getting Started

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file:
```
MONGO_URI=mongodb://127.0.0.1:27017/market_watch_db
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
PORT=3000
```

### Run Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## Documentation Files
- [POST_API.md](./POST_API.md) - Detailed post and likes documentation
- [COMMENT_API.md](./COMMENT_API.md) - Detailed comment documentation
