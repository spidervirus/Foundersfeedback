import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function scrapePage(url: string) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        const $ = cheerio.load(response.data);

        // Remove scripts and styles
        $('script, style').remove();

        return {
            title: $('title').text(),
            metaDescription: $('meta[name="description"]').attr('content'),
            h1: $('h1').map((_, el) => $(el).text()).get().join(' | '),
            h2: $('h2').map((_, el) => $(el).text()).get().join(' | '),
            text: $('p, li').text().substring(0, 5000), // Get first 5000 chars of text
        };
    } catch (error) {
        console.error(`Scraping error for ${url}:`, error);
        return null;
    }
}

export async function generateFounderReport(startupInfo: {
    building: string;
    whoIsFor: string;
    painPoint: string;
    stage: string;
    urlContent?: any;
}) {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `
    You are a brutally honest startup advisor focused on speed, clarity, and execution. 
    Your goal is to tell the founder exactly what to do next, not just give vague feedback.
    
    Startup Information:
    - What they are building: ${startupInfo.building}
    - Who it is for: ${startupInfo.whoIsFor}
    - Primary pain/problem: ${startupInfo.painPoint}
    - Current stage: ${startupInfo.stage}
    ${startupInfo.urlContent ? `- Landing Page Content: ${JSON.stringify(startupInfo.urlContent)}` : ''}

    Rules:
    - Make decisions, do not hedge.
    - Avoid generic advice.
    - Optimize for immediate progress.
    - Assume the founder is overwhelmed.
    - Reduce options instead of expanding them.

    Output a JSON object with the following structure:
    {
      "positioningVerdict": "A single, decisive statement: 'You are building X for Y who struggle with Z.'",
      "brutalTruth": "A short, honest assessment of what is weak or risky.",
      "focusAreas": ["3-5 concrete priorities for this week"],
      "ignoreAreas": ["Items the founder should ignore for now to reduce anxiety"],
      "sevenDayPlan": [
        {"day": 1, "task": "Task description"},
        {"day": 2, "task": "Task description"},
        {"day": 3, "task": "Task description"},
        {"day": 4, "task": "Task description"},
        {"day": 5, "task": "Task description"},
        {"day": 6, "task": "Task description"},
        {"day": 7, "task": "Task description"}
      ]
    }
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to generate valid JSON report');

    return JSON.parse(jsonMatch[0]);
}
