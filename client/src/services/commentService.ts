import api from './api';

export interface Comment {
    _id: string;
    content: string;
    owner: {
        _id: string;
        username: string;
        image?: string;
    };
    post: string;
    createdAt: string;
}

export interface CommentsResponse {
    comments: Comment[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalComments: number;
        commentsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    }
}

export const getComments = async (postId: string, page = 1, limit = 10) => {
    return api.get<CommentsResponse>(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
};

export const createComment = async (postId: string, content: string) => {
    return api.post<Comment>(`/posts/${postId}/comments`, { content });
};

export const updateComment = async (commentId: string, content: string) => {
    return api.put<Comment>(`/comments/${commentId}`, { content });
};

export const deleteComment = async (commentId: string) => {
    return api.delete(`/comments/${commentId}`);
};
