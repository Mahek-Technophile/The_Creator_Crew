import React, { useState, useEffect } from 'react';
import { CreatorState, saveState, VaultDraft, avgOf, creatorData } from '../services/creatorData';
import { aiProvider } from '../services/aiGenerator';
import { ToneType } from '../types';

interface CreateViewProps {
  state: CreatorState;
  onUpdateState: (newState: CreatorState) => void;
  initialPrompt?: string;
  initialDraftId?: number | null;
  onShowToast: (msg: string) => void;
  onOpenSchedule: (draftId: number) => void;
  onOpenApiKey: () => void;
}

const TONES: ToneType[] = ['Funny', 'Professional', 'Aesthetic', 'Motivational'];

const TEMPLATES: Record<string, string[]> = {
  Funny: [
    'Me pretending {p} is totally under control',
    '{p}? Plot twist: nobody asked, but here we are',
    'Update: {p} is going great (it is not)',
  ],
  Professional: [
    "Key takeaways from {p}: what actually moved the needle",
    "How {p} drives measurable results without burnout",
    "What I'd do differently with {p} if starting today",
  ],
  Aesthetic: [
    'soft light, slow days: {p}',
    '{p}, but make it dreamy',
    'quiet moments. {p}',
  ],
  Motivational: [
    '{p}: start before you feel ready',
    'Every big win begins with {p}',
    '{p}. Show up again tomorrow.',
  ],
};

function extractTags(text: string): string {
  const seen: Record<string, boolean> = {};
  const out: string[] = [];
  const words = text.toLowerCase().match(/[a-z0-9]+/g) || [];
  for (const w of words) {
    if (w.length > 3 && !seen[w] && ['with', 'that', 'this', 'your'].indexOf(w) < 0) {
      seen[w] = true;
      out.push('#' + w);
    }
  }
  return out.slice(0, 5).join(' ');
}

function countTags(str: string): number {
  return (str.match(/#\w+/g) || []).length;
}

export const CreateView: React.FC<CreateViewProps> = ({
  state,
  onUpdateState,
  initialPrompt = '',
  initialDraftId = null,
  onShowToast,
  onOpenSchedule,
  onOpenApiKey,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [tone, setTone] = useState<ToneType>('Motivational');
  const [isLoading, setIsLoading] = useState(false);
  const [isRealApiActive, setIsRealApiActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Variants and editing state
  const [variants, setVariants] = useState<
    { text: string; tags: string; fit: number }[] | null
  >(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeText, setActiveText] = useState('');
  const [activeTags, setActiveTags] = useState('');
  const [currentDraftId, setCurrentDraftId] = useState<number | null>(initialDraftId);

  // Calculate creator average caption length for fit score
  const avgLen = Math.round(
    avgOf(
      creatorData.posts
        .slice()
        .sort((a, b) => b.vsAvg - a.vsAvg)
        .slice(0, 10)
        .map((p) => ({ l: p.caption.length + 55 })),
      'l'
    )
  );

  const calculateFit = (text: string) => {
    return Math.max(
      35,
      Math.min(98, Math.round(100 - (Math.abs(text.length - avgLen) / avgLen) * 70))
    );
  };

  // If initialDraftId was provided (e.g. from Vault edit), load it
  useEffect(() => {
    if (initialDraftId) {
      const draft = state.drafts.find((d) => d.id === initialDraftId);
      if (draft) {
        setPrompt('');
        setTone((draft.tone as ToneType) || 'Motivational');
        setActiveText(draft.text);
        setActiveTags(draft.tags);
        setCurrentDraftId(draft.id);
        const fitScore = calculateFit(draft.text);
        setVariants([{ text: draft.text, tags: draft.tags, fit: fitScore }]);
        setSelectedVariantIndex(0);
      }
    } else if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialDraftId, initialPrompt]);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setErrorMsg('Describe the post first. Even a few words work.');
      setVariants(null);
      return;
    }
    if (trimmed.length > 500) {
      setErrorMsg(
        `That's ${trimmed.length - 500} characters over the 500 limit. Shorten the description.`
      );
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      // Call real Gemini API through aiProvider
      const res = await aiProvider.generate({
        prompt: trimmed,
        tone,
      });

      setIsRealApiActive(res.isRealApi);

      if (res.variants && res.variants.length > 0) {
        const generatedTags = res.hashtags.length > 0 ? res.hashtags.join(' ') : extractTags(trimmed);
        const mappedVariants = res.variants.map((v, i: number) => {
          const fitScore = v.styleMatchScore || Math.max(40, calculateFit(v.text) - i * 3);
          return {
            text: v.text,
            tags: generatedTags,
            fit: fitScore,
          };
        }).sort((a: { fit: number }, b: { fit: number }) => b.fit - a.fit);

        setVariants(mappedVariants);
        setSelectedVariantIndex(0);
        setActiveText(mappedVariants[0].text);
        setActiveTags(generatedTags);
        setCurrentDraftId(null);
      } else {
        // Fallback to local studio templates
        const tg = extractTags(trimmed);
        const templates = TEMPLATES[tone] || TEMPLATES.Motivational;
        const localVariants = templates.map((t, i) => {
          const text = t.replace('{p}', trimmed);
          return { text, tags: tg, fit: calculateFit(text) - i * 3 };
        }).sort((a, b) => b.fit - a.fit);

        setVariants(localVariants);
        setSelectedVariantIndex(0);
        setActiveText(localVariants[0].text);
        setActiveTags(tg);
        setCurrentDraftId(null);
      }
    } catch (err: any) {
      // Graceful fallback on error (e.g. quota limit)
      const tg = extractTags(trimmed);
      const templates = TEMPLATES[tone] || TEMPLATES.Motivational;
      const localVariants = templates.map((t, i) => {
        const text = t.replace('{p}', trimmed);
        return { text, tags: tg, fit: calculateFit(text) - i * 3 };
      }).sort((a, b) => b.fit - a.fit);

      setVariants(localVariants);
      setSelectedVariantIndex(0);
      setActiveText(localVariants[0].text);
      setActiveTags(tg);
      setCurrentDraftId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVariant = (index: number) => {
    if (!variants) return;
    setSelectedVariantIndex(index);
    setActiveText(variants[index].text);
  };

  const validateDraft = (): boolean => {
    if (!activeText.trim()) {
      setSaveErrorMsg('The caption is empty. Pick a version or write one.');
      return false;
    }
    if ((activeText + ' ' + activeTags).length > 2200) {
      setSaveErrorMsg('Instagram captions are limited to 2,200 characters. Shorten yours.');
      return false;
    }
    const tagsNum = countTags(activeTags);
    if (tagsNum > 30) {
      setSaveErrorMsg(`Instagram allows up to 30 hashtags. Remove ${tagsNum - 30}.`);
      return false;
    }
    setSaveErrorMsg('');
    return true;
  };

  const persistDraft = (): VaultDraft => {
    if (currentDraftId) {
      const existing = state.drafts.find((x) => x.id === currentDraftId);
      if (existing) {
        existing.text = activeText.trim();
        existing.tags = activeTags;
        existing.tone = tone;
        const newDrafts = state.drafts.map((d) => (d.id === existing.id ? existing : d));
        const newState = { ...state, drafts: newDrafts };
        onUpdateState(newState);
        saveState(newState);
        return existing;
      }
    }

    const newDraft: VaultDraft = {
      id: state.nextId,
      text: activeText.trim(),
      tags: activeTags,
      tone,
    };

    const newState = {
      ...state,
      nextId: state.nextId + 1,
      drafts: [newDraft, ...state.drafts],
    };
    setCurrentDraftId(newDraft.id);
    onUpdateState(newState);
    saveState(newState);
    return newDraft;
  };

  const handleSaveDraft = () => {
    if (!validateDraft()) return;
    persistDraft();
    onShowToast('Draft saved');
  };

  const handleScheduleDraft = () => {
    if (!validateDraft()) return;
    const saved = persistDraft();
    onOpenSchedule(saved.id);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Create</h1>
          <p className="muted">
            Describe the post, pick a tone, and choose the version that sounds most like you.
          </p>
        </div>
        <button
          className="btn ghost small"
          onClick={onOpenApiKey}
          title="Configure Gemini API Key"
        >
          {aiProvider.getApiKey() ? 'API Key Connected' : 'Connect Gemini API Key'}
        </button>
      </div>

      <div className="grid g2">
        {/* Left Column: Input and Tone */}
        <div>
          <label htmlFor="pr">What is the post about?</label>
          <textarea
            id="pr"
            maxLength={600}
            rows={4}
            placeholder="Example: my 5 AM morning routine as a creator"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="muted small">
            <span
              id="pc"
              style={{ color: prompt.trim().length > 500 ? 'var(--rec)' : undefined }}
            >
              {prompt.trim().length}
            </span>{' '}
            / 500 characters
          </div>

          <label id="tl" style={{ marginTop: '16px' }}>
            Tone
          </label>
          <div className="row" role="group" aria-labelledby="tl">
            {TONES.map((t) => (
              <button
                key={t}
                className="chip"
                data-t={t}
                aria-pressed={tone === t}
                onClick={() => setTone(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div id="ce" style={{ marginTop: '12px' }}>
              <p className="err" role="alert">
                {errorMsg}
              </p>
            </div>
          )}

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn"
              id="gen"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? 'Generating captions…' : 'Generate captions'}
            </button>
            {isRealApiActive && (
              <span className="muted small" style={{ color: 'var(--good)' }}>
                ● Powered by Gemini 3.8 Flash
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Ranked Variants & Editor */}
        <div id="out">
          {variants ? (
            <div>
              <h3 style={{ marginBottom: '10px' }}>Pick a version</h3>
              <div className="stack">
                {variants.map((v, i) => (
                  <button
                    key={i}
                    className="variant"
                    data-v={i}
                    aria-pressed={selectedVariantIndex === i}
                    onClick={() => handleSelectVariant(i)}
                  >
                    <div>{v.text}</div>
                    <div className="muted small" style={{ marginTop: '6px' }}>
                      Matches your voice: <b>{v.fit}%</b>
                    </div>
                  </button>
                ))}
              </div>

              <label htmlFor="ct" style={{ marginTop: '16px' }}>
                Edit before you save
              </label>
              <textarea
                id="ct"
                rows={5}
                value={activeText}
                onChange={(e) => setActiveText(e.target.value)}
              />
              <div className="muted small">
                <span
                  id="cc"
                  style={{ color: activeText.length > 2200 ? 'var(--rec)' : undefined }}
                >
                  {activeText.length}
                </span>{' '}
                / 2,200 characters
              </div>

              <label htmlFor="tg" style={{ marginTop: '14px' }}>
                Hashtags
              </label>
              <input
                type="text"
                id="tg"
                value={activeTags}
                onChange={(e) => setActiveTags(e.target.value)}
              />
              <div className="muted small">
                <span
                  id="tc2"
                  style={{ color: countTags(activeTags) > 30 ? 'var(--rec)' : undefined }}
                >
                  {countTags(activeTags)}
                </span>{' '}
                / 30 hashtags
              </div>

              {saveErrorMsg && (
                <div id="se" style={{ marginTop: '10px' }}>
                  <p className="err" role="alert">
                    {saveErrorMsg}
                  </p>
                </div>
              )}

              <div className="row" style={{ marginTop: '16px' }}>
                <button className="btn" id="sd" onClick={handleSaveDraft}>
                  Save draft
                </button>
                <button className="btn ghost" id="sc" onClick={handleScheduleDraft}>
                  Schedule
                </button>
              </div>
            </div>
          ) : (
            <div className="empty">
              Your three caption options will appear here, ranked by how well they match your voice.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
