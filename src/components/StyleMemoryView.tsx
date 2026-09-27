import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { PastPost, PlatformType } from '../types';
import {
  Brain,
  Plus,
  Check,
  Heart,
  MessageSquare,
  Share2,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const StyleMemoryView: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(() => storage.getStyleProfile(currentUser.id));
  const [pastPosts, setPastPosts] = useState<PastPost[]>(() => storage.getPastPosts(currentUser.id));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newPlatform, setNewPlatform] = useState<PlatformType>('instagram');
  const [newLikes, setNewLikes] = useState('3200');
  const [notice, setNotice] = useState<string | null>(null);

  const refreshProfile = () => {
    setProfile(storage.getStyleProfile(currentUser.id));
    setPastPosts(storage.getPastPosts(currentUser.id));
  };

  const handleAddPastPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const likesNum = parseInt(newLikes, 10) || 1000;
    const commentsNum = Math.floor(likesNum * 0.08);
    const sharesNum = Math.floor(likesNum * 0.2);

    storage.addPastPost({
      userId: currentUser.id,
      content: newContent,
      platform: newPlatform,
      likes: likesNum,
      comments: commentsNum,
      shares: sharesNum,
      engagementRate: parseFloat(((likesNum + commentsNum + sharesNum) / 250).toFixed(1)),
      postedAt: new Date().toISOString(),
      hashtags: ['#CreatorStudio', '#StyleMemory', '#UpdatedPost'],
    });

    setNewContent('');
    setShowAddModal(false);
    setNotice('Added past post. Style profile automatically recalibrated.');
    setTimeout(() => setNotice(null), 3500);
    refreshProfile();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Pillar 3: Personalization</span>
            <span aria-hidden="true">·</span>
            <span>Style Memory Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Style Memory Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Learns your unique tone, vocabulary, and hook structures from past content to automatically
            re-rank AI suggestions before display.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ingest Past Post</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Style Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Voice Calibration Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Voice Profile</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold font-mono">
              Active (≥10 Posts Met)
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xl font-bold text-slate-900">{profile.dominantTone} Tone</div>
            <p className="text-xs text-slate-600 leading-relaxed">{profile.voiceSummary}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-medium">Training Samples</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 tabular-nums">
                {profile.sampleCount} Posts
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-medium">Average Length</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 tabular-nums">
                ~{profile.avgWordCount} Words
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Tone Vector Analysis */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-slate-500" />
              <span>Tone Vector</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">0.0 – 1.0</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Aesthetic & Intentional</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {(profile.toneVector.aesthetic * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-900 h-full rounded-full transition-all"
                  style={{ width: `${profile.toneVector.aesthetic * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Professional & Structured</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {(profile.toneVector.professional * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-700 h-full rounded-full transition-all"
                  style={{ width: `${profile.toneVector.professional * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Curiosity & Hook Tension</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {(profile.toneVector.hookIntensity * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all"
                  style={{ width: `${profile.toneVector.hookIntensity * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Humor & Relatability</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {(profile.toneVector.funny * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-600 h-full rounded-full transition-all"
                  style={{ width: `${profile.toneVector.funny * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Signature Vocabulary Keywords */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Extracted Vocabulary
            </span>
            <span className="text-[11px] text-slate-400">High Affinity</span>
          </div>

          <p className="text-xs text-slate-600">
            Phrases frequently appearing in your top 10% highest performing posts:
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.topKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md"
              >
                "{kw}"
              </span>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 mt-2">
            <strong>Active Re-ranking:</strong> AI suggestions matching these terminology clusters receive an adaptive score boost in the Compose module.
          </div>
        </div>
      </div>

      {/* Historical Posts Archive */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Training Corpus ({pastPosts.length} Historical Posts)
            </h3>
            <p className="text-xs text-slate-500">
              Past published posts used to continuously refine creator voice weighting.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            Requirement: Met ({pastPosts.length}/10)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {pastPosts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-50/50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold uppercase tracking-wider text-slate-700">
                    {post.platform}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-emerald-700">
                    {post.engagementRate}% rate
                  </span>
                </div>
                <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                  {post.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-slate-400" />
                  <span>{post.likes.toLocaleString()}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-slate-400" />
                  <span>{post.comments}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="w-3 h-3 text-slate-400" />
                  <span>{post.shares}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingest Past Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Ingest Past Content</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-mono text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPastPost} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Platform Source
                </label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as PlatformType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Published Caption Copy
                </label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste historical copy to extract vocabulary patterns..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white resize-none leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Likes Received
                </label>
                <input
                  type="number"
                  value={newLikes}
                  onChange={(e) => setNewLikes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition shadow-xs"
                >
                  Recalibrate Voice Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
