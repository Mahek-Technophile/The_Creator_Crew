import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { schedulerService } from '../services/schedulerService';
import { Draft, PlatformType, ScheduledPost, PlatformConnection } from '../types';
import {
  CalendarClock,
  Clock,
  Camera,
  Video,
  PlaySquare,
  Radio,
  Sliders,
  Send,
  Bell,
  Check,
  ShieldCheck,
  Share2,
} from 'lucide-react';

interface SchedulerViewProps {
  initialDraftId?: string;
  onNavigateToInsights?: () => void;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({
  initialDraftId,
  onNavigateToInsights,
}) => {
  const { currentUser } = useAuth();
  const [drafts, setDrafts] = useState<Draft[]>(() => storage.getDrafts());
  const [selectedDraftId, setSelectedDraftId] = useState<string>(
    initialDraftId || (drafts[0]?.id ?? '')
  );
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('instagram');
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(() =>
    storage.getScheduledPosts()
  );
  const [connections, setConnections] = useState<PlatformConnection[]>(() =>
    storage.getPlatformConnections(currentUser.id)
  );
  const [customTime, setCustomTime] = useState<string>('');
  const [isOverridden, setIsOverridden] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialDraftId) {
      setSelectedDraftId(initialDraftId);
    }
  }, [initialDraftId]);

  const refreshState = () => {
    setDrafts(storage.getDrafts());
    setScheduledPosts(storage.getScheduledPosts());
    setConnections(storage.getPlatformConnections(currentUser.id));
  };

  const selectedDraft = drafts.find((d) => d.id === selectedDraftId) || drafts[0];

  const recommendation = schedulerService.getOptimalTimeRecommendation(selectedPlatform);

  const reformattedPreview = selectedDraft
    ? schedulerService.reformatForPlatform(selectedDraft.content, selectedPlatform)
    : '';

  const isPlatformConnected = Boolean(
    connections.find((c) => c.platform === selectedPlatform && c.isAuthorized)
  );

  const handleToggleConnection = (plat: PlatformType) => {
    storage.togglePlatformConnection(plat, currentUser.id);
    refreshState();
    setNotice(`Updated ${plat.toUpperCase()} connection status`);
    setTimeout(() => setNotice(null), 2500);
  };

  const handleConfirmSchedule = () => {
    if (!selectedDraft) return;

    const timeToSchedule = isOverridden && customTime ? customTime : recommendation.isoDateString;

    storage.schedulePost(
      selectedDraft.id,
      selectedPlatform,
      timeToSchedule,
      reformattedPreview,
      isPlatformConnected
    );

    setShowConfirmModal(false);
    refreshState();

    if (isPlatformConnected) {
      setNotice(`Post queued for Auto-Publish on ${selectedPlatform.toUpperCase()}`);
    } else {
      setNotice(
        `OAuth disconnected for ${selectedPlatform.toUpperCase()}. In-app reminder set for 15 minutes prior.`
      );
    }
    setTimeout(() => setNotice(null), 4000);
  };

  const handlePublishNow = (scheduledPostId: string) => {
    storage.publishPostNow(scheduledPostId);
    refreshState();
    setNotice('Post published. Engagement metrics recorded for feedback loop.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Pillar 4: Distribution</span>
            <span aria-hidden="true">·</span>
            <span>Smart Scheduler & Multi-Channel Publisher</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Smart Scheduler
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Calculates 30-day engagement windows, reformats copy limits per channel, and manages
            auto-publish vs. reminder dispatching.
          </p>
        </div>

        {/* Platform OAuth Quick Toggles */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5 shrink-0">
          <span className="text-[11px] font-semibold text-slate-700 block">
            OAuth Connections:
          </span>
          <div className="flex items-center gap-1.5">
            {(['instagram', 'tiktok', 'youtube'] as PlatformType[]).map((plat) => {
              const connected = connections.find((c) => c.platform === plat)?.isAuthorized;
              return (
                <button
                  key={plat}
                  onClick={() => handleToggleConnection(plat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition ${
                    connected
                      ? 'bg-white text-emerald-800 border-slate-300 shadow-2xs'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                  title={`Click to toggle ${plat} connection`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      connected ? 'bg-emerald-600' : 'bg-slate-400'
                    }`}
                  />
                  <span className="capitalize">{plat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Scheduling Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Draft & Platform Selection */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>1. Draft & Destination Setup</span>
            </h3>

            {/* Draft Selector */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Selected Draft</label>
              <select
                value={selectedDraftId}
                onChange={(e) => setSelectedDraftId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
              >
                {drafts.map((d) => (
                  <option key={d.id} value={d.id}>
                    [{d.tag}] {d.content.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Selector */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Destination Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['instagram', 'tiktok', 'youtube'] as PlatformType[]).map((p) => {
                  const isSelected = selectedPlatform === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPlatform(p)}
                      className={`p-3 rounded-lg border text-center transition ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold capitalize flex items-center justify-center gap-1.5">
                        {p === 'instagram' && <Camera className="w-3.5 h-3.5" />}
                        {p === 'tiktok' && <Video className="w-3.5 h-3.5" />}
                        {p === 'youtube' && <PlaySquare className="w-3.5 h-3.5" />}
                        <span>{p}</span>
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {p === 'instagram' ? 'Reels / Feed' : p === 'tiktok' ? 'Short-form' : 'Long & Shorts'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recommended Posting Time Card */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Optimal Posting Window</span>
                </span>
                <span className="text-xs font-mono font-semibold text-slate-600">
                  {recommendation.confidenceScore}% confidence
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">{recommendation.timeSlot}</span>
                <span className="text-xs text-slate-500">({recommendation.dayOfWeek})</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded border border-slate-200/80">
                {recommendation.historicalEngagementFactor}
              </p>

              {/* Accept or Override */}
              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOverridden}
                    onChange={(e) => setIsOverridden(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5 border-slate-300"
                  />
                  <span>Specify custom scheduled time</span>
                </label>
              </div>

              {isOverridden && (
                <div className="pt-2">
                  <input
                    type="datetime-local"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                  />
                </div>
              )}
            </div>

            {/* Execution Mode Notice */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {isPlatformConnected ? (
                  <Radio className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-slate-900">
                    {isPlatformConnected ? 'Direct Auto-Publish Ready' : 'Reminder Notification Fallback'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isPlatformConnected
                      ? `OAuth authorized for ${selectedPlatform}. Post will publish automatically at designated time.`
                      : `OAuth disconnected. You will receive an in-app reminder 15m prior to scheduled time.`}
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  isPlatformConnected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isPlatformConnected ? 'AUTO' : 'REMINDER'}
              </span>
            </div>

            {/* Schedule Trigger Button */}
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Review & Confirm Schedule</span>
            </button>
          </div>
        </div>

        {/* Right Column: Platform-Specific Reformatted Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Format Adaptation Preview</span>
              </span>
              <span className="text-xs font-mono font-medium text-slate-500 uppercase">
                {selectedPlatform} View
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 font-sans text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto">
              {reformattedPreview || (
                <span className="text-slate-400 italic">Select a draft to view reformatting.</span>
              )}
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <strong>Rules applied:</strong>
              {selectedPlatform === 'instagram' && (
                <span> Structured paragraph breaks, dot separators, and hashtags grouped at bottom.</span>
              )}
              {selectedPlatform === 'tiktok' && (
                <span> Compact length limit (&lt;150 chars), inline trend tags, and emoji accents.</span>
              )}
              {selectedPlatform === 'youtube' && (
                <span> Formatted description with timestamps template and channel links.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Queue Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Scheduled Publishing Queue ({scheduledPosts.length} Items)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Posts scheduled for automated delivery or reminder triggers.
          </p>
        </div>

        <div className="space-y-3">
          {scheduledPosts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-50/60 border border-slate-200 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-slate-800">
                    {post.platform}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span
                    className={`font-mono text-[11px] font-semibold uppercase ${
                      post.status === 'PUBLISHED'
                        ? 'text-emerald-700'
                        : post.status === 'PENDING'
                        ? 'text-indigo-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {post.status}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-500 font-mono tabular-nums">
                    {new Date(post.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-700 line-clamp-2">{post.formattedContent}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {post.status !== 'PUBLISHED' ? (
                  <button
                    onClick={() => handlePublishNow(post.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5"
                    title="Simulate immediate publication"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Published</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explicit Confirm Publish Safety Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-slate-900">
              <ShieldCheck className="w-5 h-5 text-slate-700" />
              <h3 className="text-sm font-bold">Safety Verification: Confirm Publish</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Confirm the destination platform and timing before this post enters the distribution queue.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Platform:</span>
                <span className="font-semibold text-slate-900 capitalize">{selectedPlatform}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Scheduled Time:</span>
                <span className="font-semibold text-slate-900">
                  {isOverridden && customTime ? customTime : recommendation.timeSlot}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Execution Mode:</span>
                <span className="font-semibold text-emerald-700">
                  {isPlatformConnected ? 'Direct Auto-Publish' : '15-min In-App Reminder'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSchedule}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Queue Post</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
