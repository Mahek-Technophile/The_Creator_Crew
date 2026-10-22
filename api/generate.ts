import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { prompt, tone = 'Aesthetic', customApiKey, styleProfile } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    return res.status(400).json({
      error: 'API Key missing',
      message: 'No GEMINI_API_KEY found in environment or request. Provide a valid Gemini API key.',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = `You are The Creator Crew AI Assistant.
The user wants social media captions, hooks, and hashtags for: "${prompt}".
Tone requested: "${tone}".
Style memory profile context: ${JSON.stringify(styleProfile || { dominantTone: tone, topKeywords: ['creator', 'studio', 'authentic'] })}.

Return ONLY a valid JSON object matching this schema:
{
  "variants": [
    {
      "id": "var-1",
      "hook": "Punchy 0-3s opening hook",
      "text": "Full caption body with pacing, line breaks, and clear message",
      "tone": "${tone}",
      "styleMatchScore": 95,
      "styleRankReason": "Aligned with creator tone and voice patterns",
      "hashtags": ["#Tag1", "#Tag2", "#Tag3"]
    },
    {
      "id": "var-2",
      "hook": "Alternative angle hook",
      "text": "Full caption body",
      "tone": "${tone}",
      "styleMatchScore": 90,
      "styleRankReason": "High engagement curiosity format",
      "hashtags": ["#Tag1", "#Tag2"]
    },
    {
      "id": "var-3",
      "hook": "Third distinctive hook",
      "text": "Full caption body",
      "tone": "${tone}",
      "styleMatchScore": 86,
      "styleRankReason": "Action-oriented structure",
      "hashtags": ["#Tag1", "#Tag2"]
    }
  ],
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5", "#Tag6", "#Tag7", "#Tag8"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);

    return res.status(200).json({
      success: true,
      variants: parsed.variants || [],
      hashtags: parsed.hashtags || [],
      provider: 'Google Gemini 3.8 Flash (Live API)',
    });
  } catch (error: any) {
    console.error('Gemini API Error in Vercel Handler:', error);
    return res.status(500).json({
      error: 'Gemini API call failed',
      message: error?.message || 'Error communicating with Gemini API',
      status: error?.status,
    });
  }
}
