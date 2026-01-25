# Post Feature - API Documentation

## Overview
The Post feature allows authenticated users to create, read, update, and delete content posts. Each post has an owner, and only the owner can edit or delete their posts.

## Post Model
```typescript
{
  title: string;        // Required, max 200 characters
  content: string;      // Required
  owner: ObjectId;      // Reference to User, required
  image?: string;       // Optional image URL or path
  likes: ObjectId[];    // Array of User IDs who liked the post
  createdAt: Date;      // Auto-generated
  updatedAt: Date;      // Auto-generated
}
```

## API Endpoints

### 1. Create Post
**POST** `/posts`
- **Auth**: Required (Bearer token)
- **Body**: 
  ```json
  {
    "title": "Post Title",
    "content": "Post content here",
    "imageUrl": "optional-image-url"
  }
  ```
- **File Upload**: Optional `image` field (multipart/form-data)
- **Response**: 201 Created with post object

### 2. Get All Posts
**GET** `/posts`
- **Auth**: Not required
- **Response**: 200 OK with array of posts (sorted by newest first)
- **Includes**: Populated owner info (username, image)

### 3. Get Post by ID
**GET** `/posts/:id`
- **Auth**: Not required
- **Response**: 200 OK with post object, or 404 if not found
- **Includes**: Populated owner info

### 4. Get Posts by Owner
**GET** `/posts/owner/:ownerId`
- **Auth**: Required
- **Response**: 200 OK with array of posts by that owner

### 5. Get My Posts
**GET** `/posts/my-posts`
- **Auth**: Required
- **Response**: 200 OK with array of current user's posts

### 6. Update Post
**PUT** `/posts/:id`
- **Auth**: Required (Bearer token)
- **Ownership**: Only post owner can update
- **Body**: 
  ```json
  {
    "title": "Updated title",
    "content": "Updated content",
    "imageUrl": "optional-new-image"
  }
  ```
- **File Upload**: Optional `image` field
- **Response**: 200 OK with updated post, or 403 if not owner

### 7. Delete Post
**DELETE** `/posts/:id`
- **Auth**: Required (Bearer token)
- **Ownership**: Only post owner can delete
- **Response**: 200 OK with success message, or 403 if not owner

### 8. Like Post
**POST** `/posts/:id/like`
- **Auth**: Required (Bearer token)
- **Response**: 200 OK with updated post (includes populated likes array)
- **Error**: 400 if already liked, 404 if post not found

### 9. Unlike Post
**DELETE** `/posts/:id/like`
- **Auth**: Required (Bearer token)
- **Response**: 200 OK with updated post (likes array updated)
- **Error**: 400 if not previously liked, 404 if post not found

## Security Features
1. ✅ **Authentication**: Create, update, and delete require valid JWT token
2. ✅ **Ownership Validation**: Users can only edit/delete their own posts
3. ✅ **Input Validation**: Title and content are required
4. ✅ **File Upload Security**: Images only, 5MB limit

## Test Coverage
- ✅ Create post (authenticated & unauthenticated)
- ✅ Get all posts
- ✅ Get post by ID
- ✅ Get posts by owner
- ✅ Update own post
- ✅ Prevent updating other user's post
- ✅ Delete own post
- ✅ Prevent deleting other user's post
- ✅ Like a post
- ✅ Prevent double-liking
- ✅ Unlike a post
- ✅ Prevent unliking when not liked

**Total: 19 post-related tests, all passing**
