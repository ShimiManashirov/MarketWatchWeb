import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;
    private isInitialized: boolean = false;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your-gemini-api-key-here') {
            console.warn('GEMINI_API_KEY is not configured. AI features will be disabled.');
            return;
        }

        try {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize Gemini AI:', error);
        }
    }

    private checkInitialized(): void {
        if (!this.isInitialized || !this.model) {
            throw new Error('Gemini AI is not properly configured. Please set GEMINI_API_KEY in your .env file.');
        }
    }

    /**
     * Analyze a financial query and return insights
     */
    async analyzeFinancialQuery(query: string): Promise<string> {
        this.checkInitialized();

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

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error analyzing financial query:', error);
            throw new Error('Failed to analyze query with AI');
        }
    }

    /**
     * Smart search that understands natural language queries
     */
    async smartSearch(query: string, context?: any): Promise<{
        analysis: string;
        keywords: string[];
        suggestions: string[];
    }> {
        this.checkInitialized();

        try {
            const prompt = `
You are a smart search assistant for a financial social media platform.

User Query: "${query}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Please provide a JSON response with:
1. "analysis": A brief analysis of what the user is looking for
2. "keywords": Array of relevant search keywords (5-10 keywords)
3. "suggestions": Array of suggested follow-up questions (3-5 suggestions)

Respond ONLY with valid JSON, no additional text.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Try to parse JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback if JSON parsing fails
            return {
                analysis: text,
                keywords: this.extractKeywords(query),
                suggestions: []
            };
        } catch (error) {
            console.error('Error in smart search:', error);
            throw new Error('Failed to perform smart search');
        }
    }

    /**
     * Generate post content suggestions based on a topic
     */
    async generatePostSuggestions(topic: string): Promise<string[]> {
        this.checkInitialized();

        try {
            const prompt = `
Generate 5 engaging post title suggestions for a financial social media platform about: "${topic}"

Each suggestion should be:
- Concise (under 100 characters)
- Engaging and professional
- Relevant to financial markets

Return as a JSON array of strings.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return [];
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
        this.checkInitialized();

        try {
            const prompt = `
Analyze this financial post content:

"${content}"

Provide a JSON response with:
1. "sentiment": "positive", "negative", or "neutral"
2. "topics": Array of main topics discussed (3-5 topics)
3. "summary": A one-sentence summary

Respond ONLY with valid JSON.
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

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
