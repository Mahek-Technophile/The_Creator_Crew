import React, { useState } from 'react';
import { storage } from '../services/storage';
import { attentionOptimizer } from '../services/attentionOptimizer';
import { Draft, AttentionAnalysisResult } from '../types';
import {
  Gauge,
  Sparkles,
  TrendingDown,
  Zap,
  Check,
} from 'lucide-react';

interface AttentionOptimizerViewProps {
  initialDraftId?: string;
  onDraftUpdated?: () => void;
}

export const AttentionOptimizerView: React.FC<AttentionOptimizerViewProps> = ({
  initialDraftId,
  onDraftUpdated,
}) => {
  const [drafts, setDrafts] = useState<Draft[]>(() => storage.getDrafts());
  const [selectedDraftId, setSelectedDraftId] = useState<string>(
    initialDraftId || (drafts[0]?.id ?? '')
  );
  const [draftContent, setDraftContent] = useState<string>(
    drafts.find((d) => d.id === selectedDraftId)?.content || drafts[0]?.content || ''
  );
  const [notice, setNotice] = useState<string | null>(null);

  const analysis: AttentionAnalysisResult = attentionOptimizer.analyzeDraft(draftContent);

  const handleSelectDraft = (id: string) => {
    setSelectedDraftId(id);
    const d = drafts.find((item) => item.id === id);
    if (d) {
      setDraftContent(d.content);
    }
  };

  const handleApplyHook = () => {
    const lines = draftContent.split('\n');
    lines[0] = analysis.suggestedHook;
    const newContent = lines.join('\n');
    setDraftContent(newContent);

    if (selectedDraftId) {
      storage.updateDraft(selectedDraftId, newContent, undefined, 'Applied AI-optimized hook');
      setNotice('Hook applied and recorded as new revision in Draft Vault');
      setTimeout(() => setNotice(null), 3500);
      if (onDraftUpdated) onDraftUpdated();
    }
  };

  const handleApplyCta = () => {
    const newContent = `${draftContent.trim()}\n\n${analysis.suggestedCta}`;
    setDraftContent(newContent);

    if (selectedDraftId) {
      storage.updateDraft(selectedDraftId, newContent, undefined, 'Appended AI-optimized CTA');
      setNotice('Call-to-action applied and recorded as new revision in Draft Vault');
      setTimeout(() => setNotice(null), 3500);
      if (onDraftUpdated) onDraftUpdated();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Pillar 5: Retention Analysis</span>
            <span aria-hidden="true">·</span>
            <span>Attention Span Optimizer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Attention Span Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Detects predicted drop-off timestamps in draft copy and recommends higher-converting
            hooks and calls-to-action.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Editor & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Textarea */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select or Edit Draft
              </span>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {draftContent.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <select
              value={selectedDraftId}
              onChange={(e) => handleSelectDraft(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
            >
              {drafts.map((d) => (
                <option key={d.id} value={d.id}>
                  [{d.tag}] {d.content.slice(0, 40)}...
                </option>
              ))}
            </select>

            <textarea
              rows={10}
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Paste draft or script to analyze retention..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white resize-none leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Right: Metrics & Suggestions */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Metric Gauges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center space-y-1 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">Hook Strength</div>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {analysis.hookScore}/100
              </div>
              <div className="text-[10px] text-slate-400">First 3–5 seconds</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center space-y-1 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">Readability Score</div>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {analysis.readabilityScore}/100
              </div>
              <div className="text-[10px] text-slate-400">Rhythm & cadence</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center space-y-1 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">Pacing Index</div>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {analysis.pacingScore}/100
              </div>
              <div className="text-[10px] text-slate-400">Audience retention</div>
            </div>
          </div>

          {/* Predicted Drop-Off Point Warning */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold uppercase tracking-wider">
                <TrendingDown className="w-4 h-4 text-amber-600" />
                <span>Predicted Drop-Off Point: Second {analysis.dropOffPointSeconds}</span>
              </div>
              <span className="font-mono text-amber-800 font-semibold text-[11px]">
                Word #{analysis.dropOffWordIndex}
              </span>
            </div>

            <div className="p-2 rounded bg-white border border-amber-200 text-xs text-amber-950 font-mono">
              {analysis.dropOffPhrase}
            </div>

            <p className="text-xs text-amber-900/90 leading-relaxed">{analysis.dropOffReason}</p>
          </div>

          {/* Suggested Improvements */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Recommended Revisions
            </h3>

            {/* Hook Replacement */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Suggested Hook Replacement</span>
                <span className="text-slate-400">Curiosity gap</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                "{analysis.suggestedHook}"
              </p>
              <button
                type="button"
                onClick={handleApplyHook}
                className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Apply Hook to Draft (Saves New Revision)</span>
              </button>
            </div>

            {/* CTA Replacement */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Suggested Call-to-Action</span>
                <span className="text-slate-400">Saves & shares</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                "{analysis.suggestedCta}"
              </p>
              <button
                type="button"
                onClick={handleApplyCta}
                className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Apply CTA to Draft (Saves New Revision)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
