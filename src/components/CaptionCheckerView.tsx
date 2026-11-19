import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clipboard, Hash, Sparkles } from 'lucide-react';
import type { CreatorState } from '../services/creatorData';

interface CaptionCheckerViewProps {
  state: CreatorState;
  onShowToast: (message: string) => void;
}

export const CaptionCheckerView: React.FC<CaptionCheckerViewProps> = ({ state, onShowToast }) => {
  const [caption, setCaption] = useState('');
  const [platform, setPlatform] = useState<'Instagram' | 'TikTok'>('Instagram');

  const analysis = useMemo(() => {
    const words = caption.trim() ? caption.trim().split(/\s+/).length : 0;
    const hashtags = caption.match(/#[\p{L}\p{N}_]+/gu) || [];
    const banned = state.brandGuard.bannedWords.filter((word) =>
      new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(caption)
    );
    const hasCta = /\b(save|share|comment|follow|tell me|let me know|click|try this)\b/i.test(caption);
    const lengthOk = platform === 'Instagram' ? words >= 8 && words <= 150 : words >= 5 && words <= 80;
    return { words, hashtags, banned, hasCta, lengthOk };
  }, [caption, platform, state.brandGuard.bannedWords]);

  const checks = [
    { label: 'Caption length', detail: analysis.words + ' words', ok: analysis.lengthOk },
    { label: 'Call to action', detail: analysis.hasCta ? 'A clear engagement prompt is present' : 'Consider adding a save, share, or comment prompt', ok: analysis.hasCta },
    { label: 'Hashtags', detail: analysis.hashtags.length + ' found', ok: analysis.hashtags.length >= 1 && analysis.hashtags.length <= (platform === 'Instagram' ? 5 : 3) },
    { label: 'Brand-safe language', detail: analysis.banned.length ? 'Flagged: ' + analysis.banned.join(', ') : 'No configured banned words found', ok: analysis.banned.length === 0 },
  ];
  const score = Math.round((checks.filter((check) => check.ok).length / checks.length) * 100);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      onShowToast('Caption copied to clipboard');
    } catch {
      onShowToast('Clipboard access was blocked by your browser');
    }
  };

  return (
    <section className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <header>
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 mb-2"><Sparkles size={16} /> CONTENT QUALITY TOOL</div>
        <h1 className="text-3xl font-bold">Caption checker</h1>
        <p className="muted mt-2">Give your caption a quick quality and brand-safety check before it goes live.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="caption-platform" className="font-semibold">Platform</label>
            <select id="caption-platform" className="input" value={platform} onChange={(event) => setPlatform(event.target.value as 'Instagram' | 'TikTok')}>
              <option>Instagram</option>
              <option>TikTok</option>
            </select>
          </div>
          <textarea
            aria-label="Caption to analyze"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Paste or write your caption here…"
            rows={12}
            className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
          <div className="flex items-center justify-between text-xs muted">
            <span>{analysis.words} words · {caption.length} characters · {analysis.hashtags.length} hashtags</span>
            <button className="btn ghost small" onClick={() => setCaption('')} disabled={!caption}>Clear</button>
          </div>
          <button className="btn primary" onClick={handleCopy} disabled={!caption.trim()}><Clipboard size={15} className="inline mr-2" />Copy caption</button>
        </div>

        <aside className="md:col-span-2 rounded-2xl border border-slate-200 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Quality score</h2>
            <span className="text-2xl font-bold tabular-nums">{score}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: score + '%' }} /></div>
          <p className="text-xs muted">A lightweight checklist, not a prediction of reach or engagement.</p>
          <div className="space-y-4">
            {checks.map((check) => (
              <div key={check.label} className="flex items-start gap-3">
                {check.ok ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />}
                <div><div className="text-sm font-semibold">{check.label}</div><div className="text-xs muted mt-1">{check.detail}</div></div>
              </div>
            ))}
          </div>
          {analysis.banned.length > 0 && <p className="text-xs text-rose-600">Remove or replace the flagged terms to follow your Brand Guard settings.</p>}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2 text-sm font-semibold mb-2"><Hash size={15} /> Hashtag tip</div>
            <p className="text-xs muted">Use a small set of specific, relevant hashtags rather than adding tags just to fill space.</p>
          </div>
        </aside>
      </div>
    </section>
  );
};
