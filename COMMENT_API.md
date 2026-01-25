# Comment Feature - API Documentation

## Overview
The Comment feature allows authenticated users to comment on posts. Each comment has an owner, and only the owner can edit or delete their comments.

## Comment Model
```typescript
{
  content: string;      // Required, max 500 characters
  owner: ObjectId;      // Reference to User, required
  post: ObjectId;       // Reference to Post, required
  createdAt: Date;      // Auto-generated
  updatedAt: Date;      // Auto-generated
}
```

## API Endpoints

### 1. Create Comment
**POST** `/posts/:postId/comments`
- **Auth**: Required (Bearer token)
- **Body**: 
  ```json
  {
    "content": "This is a great post!"
  }
  ```
- **Response**: 201 Created with comment object (includes populated owner info)
- **Error**: 404 if post not found, 400 if content missing

### 2. Get Comments by Post
**GET** `/posts/:postId/comments`
- **Auth**: Not required
- **Response**: 200 OK with array of comments (sorted oldest first)
- **Includes**: Populated owner info (username, image)
- **Error**: 404 if post not found

### 3. Update Comment
**PUT** `/comments/:id`
- **Auth**: Required (Bearer token)
- **Ownership**: Only comment owner can update
- **Body**: 
  ```json
  {
    "content": "Updated comment text"
  }
  ```
- **Response**: 200 OK with updated comment
- **Error**: 403 if not owner, 404 if comment not found

### 4. Delete Comment
**DELETE** `/comments/:id`
- **Auth**: Required (Bearer token)
- **Ownership**: Only comment owner can delete
- **Response**: 200 OK with success message
- **Error**: 403 if not owner, 404 if comment not found

## Security Features
1. ✅ **Authentication**: Create, update, and delete require valid JWT token
2. ✅ **Ownership Validation**: Users can only edit/delete their own comments
3. ✅ **Input Validation**: Content is required and limited to 500 characters
4. ✅ **Post Validation**: Verifies post exists before creating comment

## Test Coverage
- ✅ Create comment on post
- ✅ Prevent creating comment without auth
- ✅ Prevent creating comment without content
- ✅ Prevent creating comment on non-existent post
- ✅ Get all comments for a post
- ✅ Handle posts with no comments
- ✅ Update own comment
- ✅ Prevent updating other user's comment
- ✅ Delete own comment
- ✅ Prevent deleting other user's comment

**Total: 13 comment-related tests, all passing**

## Usage Example

```typescript
// Create a comment
POST /posts/507f1f77bcf86cd799439011/comments
Authorization: Bearer <token>
{
  "content": "Great post!"
}

// Get all comments for a post
GET /posts/507f1f77bcf86cd799439011/comments

// Update a comment
PUT /comments/507f1f77bcf86cd799439012
Authorization: Bearer <token>
{
  "content": "Updated comment"
}

// Delete a comment
DELETE /comments/507f1f77bcf86cd799439012
Authorization: Bearer <token>
```
