import api from './api';
import type { Post } from './postService';

export interface AIAnalysisResponse {
    query: string;
    analysis: string;
    keywords: string[];
    suggestions: string[];
    results: Post[];
    resultCount: number;
}

export const smartSearch = async (query: string) => {
    return api.post<AIAnalysisResponse>('/ai/search', { query });
};

export const generateSuggestions = async (topic: string) => {
    return api.post<{ topic: string, suggestions: string[] }>('/ai/suggestions', { topic });
};
