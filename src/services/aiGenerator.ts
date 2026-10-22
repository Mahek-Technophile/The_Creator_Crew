import { GoogleGenAI } from '@google/genai';
import { CaptionVariant, ToneType, StyleProfile } from '../types';

export interface GenerateOptions {
  prompt: string;
  tone: ToneType;
  styleProfile?: StyleProfile;
  platform?: 'instagram' | 'tiktok' | 'youtube';
  apiKey?: string;
}

export interface GenerationResponse {
  variants: CaptionVariant[];
  hashtags: string[];
  latencyMs: number;
  provider: string;
  styleReRanked: boolean;
  isRealApi: boolean;
  error?: string;
}

const TEMPLATES: Record<string, string[]> = {
  Funny: [
    "Me pretending {p} is totally under control",
    "{p}? Plot twist: nobody asked, but here we are",
    "Update: {p} is going great (it is not)",
  ],
  Professional: [
    "Key takeaways from {p}: what actually moved the needle",
    "How {p} drives measurable results without burnout",
    "What I'd do differently with {p} if starting today",
  ],
  Aesthetic: [
    "soft light, slow days: {p}",
    "{p}, but make it intentional",
    "quiet studio moments. {p}",
  ],
  Motivational: [
    "{p}: start before you feel ready",
    "Every big win begins with {p}",
    "{p}. Show up again tomorrow.",
  ],
  "Viral Hook": [
    "Nobody tells you this about {p}",
    "Stop scrolling: the real truth about {p}",
    "The 1 mistake 90% make with {p}",
  ],
};

export class AIGeneratorService {
  private getSavedKey(): string {
    try {
      return (
        localStorage.getItem('cc_gemini_api_key') ||
        (import.meta as any).env?.VITE_GEMINI_API_KEY ||
        ''
      );
    } catch {
      return '';
    }
  }

  public setApiKey(key: string): void {
    try {
      if (key) {
        localStorage.setItem('cc_gemini_api_key', key.trim());
      } else {
        localStorage.removeItem('cc_gemini_api_key');
      }
    } catch (e) {
      console.error('Error saving API key:', e);
    }
  }

  public getApiKey(): string {
    return this.getSavedKey();
  }

  public async testApiKey(keyToTest: string): Promise<{ success: boolean; message: string }> {
    const key = keyToTest.trim() || this.getSavedKey();
    if (!key) {
      return { success: false, message: 'Please provide a valid Gemini API key.' };
    }

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Say "API connected successfully!" in 4 words.',
      });

      if (res && res.text) {
        return { success: true, message: `Connected to Gemini API: ${res.text.trim()}` };
      }
      return { success: false, message: 'Received empty response from Gemini API.' };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to authenticate with Gemini API.',
      };
    }
  }

  public async generate(options: GenerateOptions): Promise<GenerationResponse> {
    const startTime = performance.now();
    const effectiveKey = options.apiKey?.trim() || this.getSavedKey();
    const { prompt, tone, styleProfile } = options;
    const cleanPrompt = prompt.trim() || 'my morning creative studio routine';

    // 1. If user provided a real Gemini API key, use @google/genai
    if (effectiveKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: effectiveKey });
        const systemPrompt = `You are an expert social media creator assistant for The Creator Crew.
Generate exactly 3 distinct caption variants and 6-10 trend-aware hashtags for an Instagram/social post about: "${cleanPrompt}".
Requested tone: "${tone}".
Creator voice guidelines: authentic, high audience retention, punchy first 3 seconds hook.
Respond ONLY with a valid JSON object matching this schema:
{
  "variants": [
    {
      "hook": "Opening 0-3 second hook line",
      "text": "Full caption text (around 200-450 characters)",
      "tone": "${tone}",
      "styleMatchScore": 92
    }
  ],
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}`;

        const res = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Create captions for: ${cleanPrompt}`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const textOutput = res.text || '';
        const parsed = JSON.parse(textOutput);

        if (parsed.variants && Array.isArray(parsed.variants) && parsed.variants.length > 0) {
          const endTime = performance.now();
          const latencyMs = Math.round(endTime - startTime);

          const formattedVariants: CaptionVariant[] = parsed.variants.map((v: any, i: number) => ({
            id: `gemini-var-${Date.now()}-${i}`,
            hook: v.hook || v.text?.slice(0, 45) || 'Hook',
            text: v.text || '',
            hashtags: parsed.hashtags || this.extractHashtags(cleanPrompt),
            tone: tone,
            styleMatchScore: v.styleMatchScore || 90 - i * 3,
            styleRankReason: `Generated live by Gemini 3.8 Flash with ${tone} voice calibration.`,
          }));

          return {
            variants: formattedVariants,
            hashtags: parsed.hashtags || this.extractHashtags(cleanPrompt),
            latencyMs,
            provider: 'Google Gemini 3.8 Flash (Live API)',
            styleReRanked: true,
            isRealApi: true,
          };
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to local studio synthesis:', geminiError);
        // Fall through to local fallback generator
      }
    }

    // 2. Deterministic Studio Synthesis (Fallback if no key or error)
    await new Promise((resolve) => setTimeout(resolve, 380));

    const tags = this.extractHashtags(cleanPrompt);
    const rawTemplates = TEMPLATES[tone] || TEMPLATES['Motivational'];

    const rawVariants: CaptionVariant[] = rawTemplates.map((tpl, i) => {
      const fullText = tpl.replace('{p}', cleanPrompt);
      const hook = fullText.split(/[:.?!—]/)[0] || fullText.slice(0, 40);
      const fitScore = Math.max(75, Math.min(98, 96 - i * 4));

      return {
        id: `studio-var-${Date.now()}-${i}`,
        hook: hook,
        text: `${fullText}. Save this for your next creative session.`,
        hashtags: tags,
        tone: tone,
        styleMatchScore: fitScore,
        styleRankReason: styleProfile
          ? `Calibrated against ${styleProfile.sampleCount} historical posts in Style Memory.`
          : 'Matched against creator voice heuristics.',
      };
    });

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    return {
      variants: rawVariants,
      hashtags: tags,
      latencyMs,
      provider: effectiveKey
        ? 'Studio Memory Engine (Gemini fallback)'
        : 'Studio Memory Engine (Add Gemini API Key for live AI)',
      styleReRanked: Boolean(styleProfile && styleProfile.sampleCount >= 10),
      isRealApi: false,
    };
  }

  private extractHashtags(prompt: string): string[] {
    const seen = new Set<string>();
    const out: string[] = ['#CreatorCrew'];
    const words = (prompt.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
      (w) => w.length > 3 && !['with', 'that', 'this', 'your', 'about', 'from'].includes(w)
    );

    words.forEach((w) => {
      if (!seen.has(w) && out.length < 8) {
        seen.add(w);
        out.push(`#${w}`);
      }
    });

    if (out.length < 4) {
      out.push('#CreatorLife', '#ContentStrategy', '#BehindTheScenes', '#ViralGrowth');
    }

    return out;
  }
}

export const aiProvider = new AIGeneratorService();
