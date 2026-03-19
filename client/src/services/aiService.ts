import api from './api';
import type { Post } from './postService';

export interface SearchUser {
    _id: string;
    username: string;
    image?: string;
    createdAt: string;
}

export interface SearchComment {
    _id: string;
    content: string;
    owner: { _id: string; username: string; image?: string };
    post: { _id: string; title: string };
    createdAt: string;
}

export interface AISearchResults {
    posts?: Post[];
    users?: SearchUser[];
    comments?: SearchComment[];
}

export interface AIAnalysisResponse {
    query: string;
    analysis: string;
    keywords: string[];
    suggestions: string[];
    intent: string[];
    results: AISearchResults;
    resultCount: number;
}

export const smartSearch = async (query: string) => {
    return api.post<AIAnalysisResponse>('/ai/search', { query });
};

export const generateSuggestions = async (topic: string) => {
    return api.post<{ topic: string, suggestions: string[] }>('/ai/suggestions', { topic });
};
export const semanticSearch = async (query: string) => {
    return api.get<{ posts: Post[], method: string }>('/posts/search/semantic', { params: { q: query } });
};
