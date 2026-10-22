import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { GoogleGenAI } from '@google/genai';

function geminiDevApiPlugin(): Plugin {
  return {
    name: 'gemini-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              status: 'healthy',
              service: 'The Creator Crew API (Vite Dev)',
              geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY),
            })
          );
          return;
        }

        if (req.url === '/api/generate' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });

          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const { prompt, tone = 'Aesthetic', customApiKey, styleProfile } = body;

              const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;

              if (!apiKey) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: 'API Key missing',
                    message:
                      'No GEMINI_API_KEY found in server environment or request body. Enter your Gemini API key in the UI settings or .env.',
                  })
                );
                return;
              }

              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });

              const systemInstruction = `You are the AI Assistant for "The Creator Crew", an expert social media studio for creators.
The creator requested social media captions, hooks, and hashtags for: "${prompt}".
Tone requested: "${tone}".
Style profile context: ${JSON.stringify(styleProfile || {})}.

Return ONLY a valid JSON object matching this schema:
{
  "variants": [
    {
      "id": "var-1",
      "hook": "Punchy 0-3s opening hook",
      "text": "Full caption body with structured spacing, tone flourishes, and actionable value",
      "tone": "${tone}",
      "styleMatchScore": 95,
      "styleRankReason": "High alignment with ${tone} voice signature",
      "hashtags": ["#Topic1", "#Topic2", "#Topic3"]
    },
    {
      "id": "var-2",
      "hook": "Alternative curiosity hook",
      "text": "Full caption body",
      "tone": "${tone}",
      "styleMatchScore": 90,
      "styleRankReason": "Strong mobile scroll-stopping tension",
      "hashtags": ["#Topic1", "#Topic2"]
    },
    {
      "id": "var-3",
      "hook": "Third distinctive hook angle",
      "text": "Full caption body",
      "tone": "${tone}",
      "styleMatchScore": 86,
      "styleRankReason": "Action-oriented structure with clear question CTA",
      "hashtags": ["#Topic1", "#Topic2"]
    }
  ],
  "hashtags": ["#CreatorCrew", "#TrendingTag1", "#TrendingTag2", "#ViralStrategy", "#GrowthMindset", "#ContentCreation", "#StudioLife", "#Storytelling"]
}`;

              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: systemInstruction,
                config: {
                  responseMimeType: 'application/json',
                  temperature: 0.7,
                },
              });

              const responseText = response.text || '{}';
              const parsed = JSON.parse(responseText);

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  variants: parsed.variants || [],
                  hashtags: parsed.hashtags || [],
                  provider: 'Google Gemini 3.8 Flash (Live API)',
                })
              );
            } catch (err: any) {
              console.error('Gemini Dev Server API Error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'Gemini API call failed',
                  message: err?.message || 'Error communicating with Gemini API',
                  status: err?.status,
                })
              );
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), geminiDevApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
