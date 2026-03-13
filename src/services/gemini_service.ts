import {
    Settings,
    Document,
    VectorStoreIndex
} from "llamaindex";
import { OpenAI } from "@llamaindex/openai";
import { Gemini, GEMINI_MODEL } from "@llamaindex/google";

class GeminiService {
    private llm: any;

    constructor() {
        this.initializeAI();
    }

    private initializeAI() {
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        if (openRouterKey && openRouterKey.startsWith("sk-or-")) {
            console.log("Initializing LlamaIndex with OpenRouter");
            this.llm = new OpenAI({
                apiKey: openRouterKey,
                model: "google/gemini-2.0-flash-001",
                additionalChatOptions: {
                    // @ts-ignore
                    headers: {
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "MarketWatchWeb"
                    }
                },
                baseURL: "https://openrouter.ai/api/v1"
            });
        } else if (geminiKey) {
            console.log("Initializing LlamaIndex with Google Gemini");
            this.llm = new Gemini({
                apiKey: geminiKey,
                model: GEMINI_MODEL.GEMINI_2_0_FLASH
            });
        } else {
            console.warn("No AI API keys found. Please set OPENROUTER_API_KEY or GEMINI_API_KEY in .env");
        }

        if (this.llm) {
            Settings.llm = this.llm;
        }
    }

    private async callAI(prompt: string): Promise<string> {
        if (!this.llm) {
            throw new Error("AI service not initialized. Check API keys.");
        }
        try {
            const response = await this.llm.chat({
                messages: [{ role: "user", content: prompt }]
            });
            return response.message.content.toString();
        } catch (error) {
            console.error('Error calling AI through LlamaIndex:', error);
            throw error;
        }
    }

    /**
     * Analyze a financial query and return insights
     */
    async analyzeFinancialQuery(query: string): Promise<string> {
        try {
            const prompt = `
You are a financial analysis expert. Analyze the following query and provide detailed financial insights:

Query: "${query}"

Please provide:
1. Key financial concepts mentioned
2. Relevant market analysis
3. Potential risks and opportunities
4. Actionable recommendations

Keep the response professional, concise, and data-driven.
`;

            return await this.callAI(prompt);
        } catch (error) {
            console.error('Error analyzing financial query:', error);
            throw new Error('Failed to analyze query with AI');
        }
    }

    /**
     * Smart search that understands natural language queries
     * and determines which app content types to search
     */
    async smartSearch(query: string, context?: any): Promise<{
        analysis: string;
        keywords: string[];
        suggestions: string[];
        intent: string[];
    }> {
        try {
            const prompt = `
You are a smart search assistant for MarketWatch, a financial social media platform.
User Query: "${query}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Analyze the query and provide a JSON response with:
1. "analysis": A brief, helpful description of the user's intent (1-2 sentences).
2. "keywords": Array of 5-8 relevant search keywords for database matching (lowercase). Avoid generic words like "search" or "user".
3. "suggestions": 3-5 suggested follow-up searches.
4. "intent": Content types to search. Valid values: ["posts", "users", "comments"].

Respond ONLY with valid JSON.
`;

            const text = await this.callAI(prompt);

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    analysis: parsed.analysis || '',
                    keywords: parsed.keywords || this.extractKeywords(query),
                    suggestions: parsed.suggestions || [],
                    intent: parsed.intent || ['posts']
                };
            }

            return {
                analysis: text,
                keywords: this.extractKeywords(query),
                suggestions: [],
                intent: ['posts', 'users', 'comments']
            };
        } catch (error: any) {
            console.error('Error in smart search:', error);
            // Fallback to basic keyword matching if LLM fails
            return {
                analysis: "Basic keyword search (AI currently unavailable)",
                keywords: this.extractKeywords(query),
                suggestions: [],
                intent: ['posts', 'users', 'comments']
            };
        }
    }

    /**
     * Generate post content suggestions based on a topic
     */
    async generatePostSuggestions(topic: string): Promise<string[]> {
        try {
            const prompt = `
Generate 5 engaging post title suggestions for a financial social media platform about: "${topic}"
Return as a JSON array of strings.
`;

            const text = await this.callAI(prompt);
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        } catch (error) {
            console.error('Error generating post suggestions:', error);
            throw new Error('Failed to generate suggestions');
        }
    }

    /**
     * Analyze post content for sentiment and topics
     */
    async analyzePostContent(content: string): Promise<{
        sentiment: 'positive' | 'negative' | 'neutral';
        topics: string[];
        summary: string;
    }> {
        try {
            const prompt = `
Analyze this financial post content: "${content}"
Provide a JSON response with:
1. "sentiment": "positive", "negative", or "neutral"
2. "topics": Array of main topics (3-5)
3. "summary": One-sentence summary

Respond ONLY with valid JSON.
`;

            const text = await this.callAI(prompt);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return {
                sentiment: 'neutral',
                topics: [],
                summary: content.substring(0, 100)
            };
        } catch (error) {
            console.error('Error analyzing post content:', error);
            throw new Error('Failed to analyze content');
        }
    }

    /**
     * Simple keyword extraction fallback
     */
    private extractKeywords(text: string): string[] {
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
        return words
            .filter(word => word.length > 3 && !stopWords.includes(word))
            .slice(0, 10);
    }
}

export default new GeminiService();
