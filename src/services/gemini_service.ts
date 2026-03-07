class GeminiService {
    // We are keeping the class name as GeminiService to avoid refactoring the controllers, 
    // but we are using OpenRouter as the provider under the hood.
    private apiKey: string = "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";

    private async callOpenRouter(prompt: string): Promise<string> {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // Use standard tier Gemini 2.0 Flash to avoid free-tier upstream rate limits
                    model: "google/gemini-2.0-flash-001",
                    messages: [
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                // Fallback to GPT-4o-mini
                const fallbackResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${this.apiKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "openai/gpt-4o-mini",
                        messages: [
                            { role: "user", content: prompt }
                        ]
                    })
                });

                if (!fallbackResponse.ok) {
                    console.error('OpenRouter Primary Error:', errText);
                    console.error('OpenRouter Fallback Error:', await fallbackResponse.text());
                    throw new Error('AI Provider error');
                }
                const fallbackData = await fallbackResponse.json() as any;
                return fallbackData.choices[0].message.content || '';
            }

            const data = await response.json() as any;
            return data.choices[0].message.content || '';
        } catch (error) {
            console.error('Network or Parsing Error with OpenRouter:', error);
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

            return await this.callOpenRouter(prompt);
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
You are a smart search assistant for MarketWatch, a financial social media platform where users share posts about markets, stocks, and investments. Users can create posts (with text and images), comment on posts, and have user profiles.

The user typed a search query. Your job is to understand what they are looking for and help the app find it.

User Query: "${query}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Please provide a JSON response with:
1. "analysis": A brief, helpful description of what the user seems to be looking for (1-2 sentences)
2. "keywords": Array of relevant search keywords to match against content in the database (5-10 single words or short phrases, lowercase)
3. "suggestions": Array of suggested follow-up searches the user might want to try (3-5 suggestions)
4. "intent": Array of content types to search. Valid values: "posts", "users", "comments". Include all that are relevant. For example if user asks about a person, include "users". If they ask about content or topics, include "posts" and "comments".

Respond ONLY with valid JSON, no markdown, no additional text.
`;

            const text = await this.callOpenRouter(prompt);

            // Try to parse JSON from the response
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

            // Fallback if JSON parsing fails
            return {
                analysis: text,
                keywords: this.extractKeywords(query),
                suggestions: [],
                intent: ['posts', 'users', 'comments']
            };
        } catch (error: any) {
            console.error('Error in smart search:', error);
            throw new Error('Smart search failed. Please try again later.');
        }
    }

    /**
     * Generate post content suggestions based on a topic
     */
    async generatePostSuggestions(topic: string): Promise<string[]> {
        try {
            const prompt = `
Generate 5 engaging post title suggestions for a financial social media platform about: "${topic}"

Each suggestion should be:
- Concise (under 100 characters)
- Engaging and professional
- Relevant to financial markets

Return as a JSON array of strings.
`;

            const text = await this.callOpenRouter(prompt);

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

            const text = await this.callOpenRouter(prompt);

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
