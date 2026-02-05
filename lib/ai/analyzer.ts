import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface PageContent {
  title: string;
  headings: string[];
  paragraphs: string[];
  pricing?: string[];
}

export async function scrapePage(url: string): Promise<PageContent> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FounderFeedbackBot/1.0)',
      },
    });

    const $ = cheerio.load(response.data);

    // Remove script and style tags
    $('script, style, nav, footer').remove();

    const title = $('title').text() || $('h1').first().text();
    const headings = $('h1, h2, h3')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((text) => text.length > 0);
    const paragraphs = $('p')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((text) => text.length > 20);

    return {
      title,
      headings,
      paragraphs: paragraphs.slice(0, 20), // Limit to first 20 paragraphs
    };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Failed to fetch page content');
  }
}

interface AnalysisResult {
  positioning: {
    score: number;
    feedback: string;
    suggestions: string[];
    improvementDelta?: number;
  };
  icp: {
    score: number;
    feedback: string;
    suggestions: string[];
    improvementDelta?: number;
  };
  differentiation: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  pricing: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  competitors: {
    name: string;
    description: string;
    weakness: string;
    strength: string;
  }[];
  headlineSuggestions: string[];
}

export async function analyzeProduct(
  pageContent: PageContent,
  targetCustomer: string,
  valueProp: string,
  pricingContent?: PageContent,
  previousScores?: { positioning: number; icp: number }
): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an expert startup advisor and high-conversion copywriter. Analyze this founder's product positioning and landing page.

LANDING PAGE CONTENT:
Title: ${pageContent.title}
Headings: ${pageContent.headings.join(' | ')}
Key Content: ${pageContent.paragraphs.slice(0, 10).join(' ')}

FOUNDER'S INPUT:
Target Customer: ${targetCustomer}
Value Proposition: ${valueProp}

${previousScores ? `PREVIOUS SCORES (for improvement tracking):
- Positioning: ${previousScores.positioning}/10
- ICP Clarity: ${previousScores.icp}/10` : ''}

${pricingContent ? `PRICING PAGE CONTENT:\nHeadings: ${pricingContent.headings.join(' | ')}\nContent: ${pricingContent.paragraphs.slice(0, 5).join(' ')}` : ''}

Analyze this product across 4 dimensions. For each, provide:
1. A score from 1-10
2. Specific, actionable feedback (2-3 sentences)
3. 2-3 concrete suggestions

ADDITIONAL ADVANCED ANALYSIS:
1. COMPETITIVE BENCHMARK: Identify the top 3 direct or indirect competitors. For each, state their name, a brief description, their weakness compared to this product, and their strength.
2. COPY EDITOR: Provide 3 alternative, high-conversion headlines for this landing page that better communicate the value proposition to the target customer.
3. IMPROVEMENT DELTA (IF PREVIOUS SCORES PROVIDED): Quantify the improvement (or regression) in scores. For example, if positioning went from 5 to 7, the delta is 2.0.

DIMENSIONS:

1. POSITIONING CLARITY
- Can someone tell who this is for in 5 seconds?
- Is the problem clear and specific?

2. ICP (Ideal Customer Profile) CLARITY
- Is the target audience too broad?
- Does the copy speak to a specific role or pain?

3. DIFFERENTIATION
- Does this sound like 50 other tools?
- Clear "why you vs alternatives"?

4. PRICING LOGIC
- Does pricing match the target customer?

Return ONLY valid JSON in this exact format:
{
  "positioning": {
    "score": <number>,
    "feedback": "<string>",
    "suggestions": ["<string>"],
    "improvementDelta": <number | null>
  },
  "icp": {
    "score": <number>,
    "feedback": "<string>",
    "suggestions": ["<string>"],
    "improvementDelta": <number | null>
  },
  "differentiation": {
    "score": <number>,
    "feedback": "<string>",
    "suggestions": ["<string>"]
  },
  "pricing": {
    "score": <number>,
    "feedback": "<string>",
    "suggestions": ["<string>"]
  },
  "competitors": [
    { "name": "<string>", "description": "<string>", "weakness": "<string>", "strength": "<string>" }
  ],
  "headlineSuggestions": ["<headline 1>", "<headline 2>", "<headline 3>"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.replace(/```json\n|\n```/g, "").replace(/```/g, "");
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('AI Analysis error:', error);
    throw new Error('Failed to analyze product');
  }
}
