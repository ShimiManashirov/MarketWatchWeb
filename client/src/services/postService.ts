import api from './api';

export interface Post {
    _id: string;
    title?: string;
    content?: string; // Analysis/Description
    owner?: {
        _id: string;
        username: string;
        image?: string; // Optional user image
    }; // Populated user
    image?: string; // Post image URL
    likes: string[]; // Array of user IDs
    comments: string[]; // Array of specific comments IDs
    createdAt: string;
}

export interface PostsResponse {
    posts: Post[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalPosts: number;
        postsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    }
}

export const getAllPosts = async (page = 1, limit = 10) => {
    return api.get<PostsResponse>(`/posts?page=${page}&limit=${limit}`);
};

export const createPost = async (postData: FormData) => {
    return api.post<Post>('/posts', postData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getPostsByOwner = async (ownerId: string) => {
    return api.get(`/posts/owner/${ownerId}`);
};

export const likePost = async (postId: string) => {
    return api.post(`/posts/${postId}/like`);
};

export const unlikePost = async (postId: string) => {
    return api.delete(`/posts/${postId}/like`);
};
