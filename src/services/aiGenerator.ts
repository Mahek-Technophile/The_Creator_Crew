import { CaptionVariant, ToneType, StyleProfile } from '../types';

export interface GenerateOptions {
  prompt: string;
  tone: ToneType;
  styleProfile?: StyleProfile;
  platform?: 'instagram' | 'tiktok' | 'youtube';
}

export interface GenerationResponse {
  variants: CaptionVariant[];
  hashtags: string[];
  latencyMs: number;
  provider: string;
  styleReRanked: boolean;
}

export interface AIProvider {
  generate(options: GenerateOptions): Promise<GenerationResponse>;
}

// Concrete Mock Provider with intelligent template synthesis & Style Memory Ranking
export class MockAIProvider implements AIProvider {
  async generate(options: GenerateOptions): Promise<GenerationResponse> {
    const startTime = performance.now();

    // Simulate realistic sub-second generation (450ms - 850ms) well below the 3-second requirement
    await new Promise((resolve) => setTimeout(resolve, 620));

    const { prompt, tone, styleProfile } = options;

    const baseHashtags = this.generateTrendingHashtags(prompt, tone);
    const rawVariants = this.produceVariants(prompt, tone);

    // Apply Style Memory Ranking (FR-6)
    const rankedVariants = this.applyStyleMemoryRanking(rawVariants, styleProfile, tone);

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    return {
      variants: rankedVariants,
      hashtags: baseHashtags,
      latencyMs,
      provider: 'MockAIAdapter (Calibrated with Style Memory)',
      styleReRanked: Boolean(styleProfile && styleProfile.sampleCount >= 10),
    };
  }

  private produceVariants(prompt: string, tone: ToneType): CaptionVariant[] {
    const cleanPrompt = prompt.trim() || 'creating authentic content in my studio';

    if (tone === 'Funny') {
      return [
        {
          id: `var-funny-1-${Date.now()}`,
          tone: 'Funny',
          hook: 'I swore I was only going to sit down for 10 minutes...',
          text: `I swore I was only going to sit down for 10 minutes to work on "${cleanPrompt}". Four iced coffees, 3 existential crises, and 47 unsaved browser tabs later, here we are. Send help or more oat milk. ☕😂`,
          hashtags: ['#CreatorStruggles', '#RelatableCreator', '#ProcrastinationPro', '#SendCoffee'],
          styleMatchScore: 84,
        },
        {
          id: `var-funny-2-${Date.now()}`,
          tone: 'Funny',
          hook: 'Nobody talk to me, I am in my "figuring out the algorithm" era 🤡',
          text: `Nobody talk to me, I am in my "figuring out the algorithm" era. Currently treating "${cleanPrompt}" like a secret government decryption project. Results so far: My cat liked it.`,
          hashtags: ['#AlgorithmChaos', '#CreatorHumor', '#ContentLife', '#FailForward'],
          styleMatchScore: 78,
        },
        {
          id: `var-funny-3-${Date.now()}`,
          tone: 'Funny',
          hook: 'Expectation vs Reality of being a solo creator:',
          text: `Expectation: Aesthetic linen studio, gentle breeze, effortless creativity.\nReality: Frantically testing "${cleanPrompt}" while praying the camera battery doesn't blink red. Still wouldn't trade it for a 9-to-5 though. 🤷‍♂️`,
          hashtags: ['#ExpectationVsReality', '#SoloCreator', '#BehindTheScenes', '#DailyGrind'],
          styleMatchScore: 82,
        },
      ];
    }

    if (tone === 'Professional') {
      return [
        {
          id: `var-prof-1-${Date.now()}`,
          tone: 'Professional',
          hook: 'The highest-ROI shift we made this quarter wasn’t adding more output:',
          text: `The highest-ROI shift we made this quarter wasn’t adding more output: It was building clear operational boundaries around "${cleanPrompt}". Here are the 3 structural frameworks we implemented to maintain quality at scale.\n\n1. Standardized draft review gates\n2. Context-batching deep work blocks\n3. Objective engagement retro loops.`,
          hashtags: ['#ContentStrategy', '#CreatorEconomy', '#OperationalExcellence', '#MediaScaling'],
          styleMatchScore: 88,
        },
        {
          id: `var-prof-2-${Date.now()}`,
          tone: 'Professional',
          hook: 'Why most creators fail to scale past 50k: A breakdown.',
          text: `Why most creators fail to scale past 50k: They treat "${cleanPrompt}" as an improvised hobby rather than a reproducible media pipeline. When you systematize your hook formulas and distribution schedule, organic reach compounds predictably.`,
          hashtags: ['#AudienceBuilding', '#ExecutiveSummary', '#CreatorInsights', '#BusinessStrategy'],
          styleMatchScore: 85,
        },
        {
          id: `var-prof-3-${Date.now()}`,
          tone: 'Professional',
          hook: '3 metrics every modern creator team should track in 2026:',
          text: `Beyond vanity follower counts: 1. 3-second hook retention. 2. Share-to-save ratio on "${cleanPrompt}". 3. Audience conversion velocity. If your content doesn't drive saves or shares, the algorithm deprioritizes your reach. Let's fix your funnel.`,
          hashtags: ['#GrowthMetrics', '#DataDrivenContent', '#PerformanceMarketing', '#CreatorOps'],
          styleMatchScore: 81,
        },
      ];
    }

    // Default / Aesthetic
    return [
      {
        id: `var-aes-1-${Date.now()}`,
        tone: 'Aesthetic',
        hook: 'Stop scrolling: The secret to sustainable creation isn’t more hustle.',
        text: `Stop scrolling: The secret to sustainable creation isn’t more hustle, it’s intentional pacing. When you focus on "${cleanPrompt}", everything slows down into clarity. Warm lighting, minimal distractions, and shipping work you genuinely believe in. 🕯️✨`,
        hashtags: ['#StudioVibes', '#IntentionalLiving', '#SlowContent', '#MinimalAesthetic'],
        styleMatchScore: 94,
      },
      {
        id: `var-aes-2-${Date.now()}`,
        tone: 'Aesthetic',
        hook: 'A quiet morning in the studio with coffee and clean focus.',
        text: `A quiet morning in the studio with coffee and clean focus. Today’s rhythm is centered entirely on "${cleanPrompt}". Notice how much lighter the process feels when you strip away the algorithmic noise and just create for the 100 people who truly listen. ☕🌿`,
        hashtags: ['#StudioNotes', '#WarmLight', '#CreativeRitual', '#MindfulCreator'],
        styleMatchScore: 91,
      },
      {
        id: `var-aes-3-${Date.now()}`,
        tone: 'Aesthetic',
        hook: 'POV: You finally found the cadence where your craft feels effortless.',
        text: `POV: You finally found the cadence where your craft feels effortless. Deep diving into "${cleanPrompt}" with soft lo-fi in the background. Save this reminder for the next time creative burnout knocks on your door. 🕊️`,
        hashtags: ['#AestheticStudio', '#DeepWorkVibe', '#CreativeFlow', '#ArtOfPatience'],
        styleMatchScore: 89,
      },
    ];
  }

  private generateTrendingHashtags(prompt: string, tone: ToneType): string[] {
    const common = ['#CreatorCrew', '#SocialStrategy', '#ContentStrategy2026'];
    const pLower = prompt.toLowerCase();

    if (pLower.includes('desk') || pLower.includes('room') || pLower.includes('setup')) {
      return [...common, '#DeskSetup', '#WorkspaceInspo', '#StudioAesthetic', '#CleanDesk', '#MinimalistVibes', '#CozyWorkspace', '#TechDesk'];
    }
    if (pLower.includes('video') || pLower.includes('reel') || pLower.includes('tiktok')) {
      return [...common, '#ShortFormVideo', '#ReelStrategy', '#ViralHooks', '#VideoOptimization', '#WatchTimeHack', '#CreatorTips', '#Storytelling'];
    }
    if (tone === 'Funny') {
      return [...common, '#CreatorMemes', '#RelatableContent', '#SoloCreatorLife', '#SendCoffee', '#BurnoutChronicles', '#HumorDaily', '#BehindTheScenes'];
    }
    if (tone === 'Professional') {
      return [...common, '#CreatorEconomy', '#PersonalBranding', '#DigitalMarketing', '#AudienceGrowth', '#ContentOps', '#HighROI', '#SystematicCreation'];
    }

    return [...common, '#StudioVibes', '#AestheticLifestyle', '#WarmTones', '#SlowLiving', '#CreativeRoutine', '#AuthenticVoice', '#MinimalistContent'];
  }

  // FR-6: Re-ranking AI suggestions using Style Profile
  private applyStyleMemoryRanking(
    variants: CaptionVariant[],
    styleProfile: StyleProfile | undefined,
    currentTone: ToneType
  ): CaptionVariant[] {
    if (!styleProfile || styleProfile.sampleCount < 10) {
      return variants;
    }

    const { dominantTone, topKeywords, avgWordCount } = styleProfile;

    return variants
      .map((variant) => {
        let score = 70;

        // Tone compatibility bonus
        if (variant.tone === dominantTone || dominantTone === currentTone) {
          score += 15;
        }

        // Keyword overlap bonus
        const lowerText = variant.text.toLowerCase();
        let keywordHits = 0;
        topKeywords.forEach((kw) => {
          if (lowerText.includes(kw.toLowerCase())) {
            keywordHits++;
          }
        });
        score += Math.min(keywordHits * 4, 12);

        // Length affinity bonus (within 15 words of creator's average)
        const wordCount = variant.text.split(/\s+/).length;
        if (Math.abs(wordCount - avgWordCount) < 15) {
          score += 6;
        }

        // Hook strength heuristic
        if (variant.hook.includes(':') || variant.hook.includes('?') || variant.hook.includes('POV')) {
          score += 5;
        }

        const finalScore = Math.min(score, 99);
        const reason = `Ranked #${1} by Style Memory: Matches ${dominantTone} voice signature, optimal ${avgWordCount}-word pacing, and creator historical hook patterns.`;

        return {
          ...variant,
          styleMatchScore: finalScore,
          styleRankReason: reason,
        };
      })
      .sort((a, b) => b.styleMatchScore - a.styleMatchScore);
  }
}

export const aiProvider = new MockAIProvider();
