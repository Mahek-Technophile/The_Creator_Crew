import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiProvider } from '../services/aiGenerator';
import { storage } from '../services/storage';
import { CaptionVariant, ToneType } from '../types';
import {
  Zap,
  Copy,
  Check,
  BookmarkPlus,
  Clock,
  Send,
  SlidersHorizontal,
  Brain,
  RotateCcw,
} from 'lucide-react';

interface ComposeViewProps {
  onDraftSaved?: (draftId: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const ComposeView: React.FC<ComposeViewProps> = ({ onDraftSaved, onNavigateToTab }) => {
  const { currentUser, updateTone } = useAuth();

  const [prompt, setPrompt] = useState(
    'My 8 AM studio focus block routine and why protecting early mornings doubled my output'
  );
  const [selectedTone, setSelectedTone] = useState<ToneType>(currentUser.brandTone || 'Aesthetic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<CaptionVariant[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [copiedVariantId, setCopiedVariantId] = useState<string | null>(null);
  const [savedDraftMsg, setSavedDraftMsg] = useState<string | null>(null);
  const [styleProfileActive, setStyleProfileActive] = useState(true);

  const styleProfile = storage.getStyleProfile(currentUser.id);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setSavedDraftMsg(null);

    try {
      const response = await aiProvider.generate({
        prompt,
        tone: selectedTone,
        styleProfile: styleProfileActive ? styleProfile : undefined,
      });

      setVariants(response.variants);
      setHashtags(response.hashtags);
      setLatencyMs(response.latencyMs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyVariant = (variant: CaptionVariant) => {
    const fullText = `${variant.text}\n\n${variant.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedVariantId(variant.id);
    setTimeout(() => setCopiedVariantId(null), 2000);
  };

  const handleSaveToDraftVault = (variant: CaptionVariant) => {
    const fullText = `${variant.text}\n\n${variant.hashtags.join(' ')}`;
    const saved = storage.saveDraft(fullText);
    setSavedDraftMsg(`Saved to Draft Vault under category "${saved.tag}"`);
    setTimeout(() => setSavedDraftMsg(null), 3000);
    if (onDraftSaved) {
      onDraftSaved(saved.id);
    }
  };

  const handleToneChange = (tone: ToneType) => {
    setSelectedTone(tone);
    updateTone(tone);
  };

  const samplePrompts = [
    'My 8 AM studio focus block routine and why protecting early mornings doubled my output',
    '3 things I stopped doing this month to avoid creative burnout',
    'Minimalist desk setup audit: The warm linen lighting trick',
    'When your first video hook stops viewers in their tracks',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Pillar 1: Smart Composer</span>
            <span aria-hidden="true">·</span>
            <span>Caption & Hook Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Caption & Hook Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Generates high-retention copy variants and trend-aligned hashtags in under 3 seconds,
            calibrated against your historical creator voice.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-right">
            <div className="text-[11px] text-slate-500 font-medium">Style Profile</div>
            <div className="text-xs font-semibold text-slate-900 mt-0.5">
              Active ({styleProfile.sampleCount} analyzed posts)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Compose & Tone Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Content Concept
              </span>
              <span className="text-[11px] text-slate-400">Step 1 of 2</span>
            </div>

            {/* Prompt Textarea */}
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Topic or Video Idea
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your video, reel, or post concept..."
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white transition resize-none leading-relaxed"
                />
              </div>

              {/* Sample Prompt Chips */}
              <div>
                <div className="text-[11px] text-slate-500 mb-1.5 font-medium">Quick suggestions:</div>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((sp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(sp)}
                      className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition truncate max-w-[260px] text-left"
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                    <span>Brand Tone</span>
                  </label>
                  <span className="text-xs text-slate-500 font-medium">Selected: {selectedTone}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['Funny', 'Professional', 'Aesthetic'] as ToneType[]).map((tone) => {
                    const isSelected = selectedTone === tone;
                    return (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => handleToneChange(tone)}
                        className={`p-2.5 rounded-lg border text-left transition ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold">{tone}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {tone === 'Funny'
                            ? 'Relatable humor'
                            : tone === 'Professional'
                            ? 'Framework-first'
                            : 'Clean & warm'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Style Profile Re-ranking toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="font-semibold text-slate-800">Style Profile Calibration</div>
                  <div className="text-[11px] text-slate-500">
                    Weights suggestions using {styleProfile.sampleCount} analyzed past posts
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={styleProfileActive}
                  onChange={(e) => setStyleProfileActive(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-0 w-4 h-4 border-slate-300 cursor-pointer"
                />
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Generating variants...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Generate Variants</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Measured Server Latency */}
          {latencyMs !== null && (
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Response Latency:</span>
              </div>
              <div className="font-mono tabular-nums font-semibold text-slate-900">
                {latencyMs}ms <span className="text-[11px] font-normal text-slate-500">(target &lt;3,000ms)</span>
              </div>
            </div>
          )}

          {savedDraftMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{savedDraftMsg}</span>
              </div>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('vault')}
                  className="underline hover:text-emerald-950 font-semibold text-[11px]"
                >
                  View in Vault →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Generated Variants & Hashtags */}
        <div className="lg:col-span-7 space-y-4">
          {variants.length === 0 && !isGenerating ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                <Zap className="w-5 h-5 text-slate-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No suggestions generated yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Enter your topic prompt on the left and click "Generate Variants" to generate
                at least 3 ranked variants and up to 10 hashtags.
              </p>
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
              >
                Run Sample Generation
              </button>
            </div>
          ) : isGenerating ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin mx-auto" />
              <div className="text-xs font-semibold text-slate-800">
                Synthesizing {selectedTone.toLowerCase()} tone variants...
              </div>
              <p className="text-[11px] text-slate-500">Aligning with style profile vocabulary</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between px-1 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">
                  {variants.length} Generated Variants
                </span>
                <span>Ranked by Style Match</span>
              </div>

              {/* Variants List */}
              <div className="space-y-3">
                {variants.map((v, index) => (
                  <div
                    key={v.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition shadow-xs space-y-3"
                  >
                    {/* Variant Top Meta */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {index === 0 ? 'Top Recommendation' : `Option ${index + 1}`}
                        </span>
                      </div>

                      <div className="text-xs font-mono tabular-nums text-slate-600 font-medium">
                        {v.styleMatchScore}% match
                      </div>
                    </div>

                    {/* Hook Callout */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">
                        Opening Hook (0–3s):
                      </div>
                      <div className="text-xs font-semibold text-slate-900">{v.hook}</div>
                    </div>

                    {/* Caption Body */}
                    <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {v.text}
                    </div>

                    {/* Style Memory Reason */}
                    {v.styleRankReason && (
                      <div className="text-[11px] text-slate-500 italic bg-slate-50/50 px-2.5 py-1.5 rounded border border-slate-100">
                        {v.styleRankReason}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyVariant(v)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
                        >
                          {copiedVariantId === v.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveToDraftVault(v)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs"
                          title="Save to Draft Vault"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>Save to Vault</span>
                        </button>
                      </div>

                      {onNavigateToTab && (
                        <button
                          type="button"
                          onClick={() => {
                            handleSaveToDraftVault(v);
                            onNavigateToTab('scheduler');
                          }}
                          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium transition"
                        >
                          <span>Schedule This</span>
                          <Send className="w-3 h-3 text-slate-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trend-Aware Hashtags */}
              {hashtags.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800">
                      Recommended Hashtags ({hashtags.length} Tags)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(hashtags.join(' '));
                        alert('Hashtags copied to clipboard');
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium underline"
                    >
                      Copy All
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono select-all hover:bg-slate-200 transition cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
