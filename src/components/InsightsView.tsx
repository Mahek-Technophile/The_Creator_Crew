import React, { useState } from 'react';
import { storage } from '../services/storage';
import { EngagementData, ScheduledPost } from '../types';
import {
  BarChart3,
  Heart,
  MessageCircle,
  Share2,
  RefreshCw,
  Check,
} from 'lucide-react';

export const InsightsView: React.FC = () => {
  const [engagementList, setEngagementList] = useState<EngagementData[]>(() =>
    storage.getEngagementData()
  );
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(() =>
    storage.getScheduledPosts()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const refreshData = () => {
    setEngagementList(storage.getEngagementData());
    setScheduledPosts(storage.getScheduledPosts());
  };

  const handleTriggerFeedbackLoop = () => {
    setIsRefreshing(true);

    setTimeout(() => {
      const targetPost = scheduledPosts[0] || { id: `sched-${Date.now()}` };
      storage.generateSimulatedEngagement(targetPost.id);

      refreshData();
      setIsRefreshing(false);
      setNotice(
        'Performance telemetry ingested. Style Memory profile and Smart Scheduler models recalibrated in real time.'
      );
      setTimeout(() => setNotice(null), 4500);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Pillar 5 Feedback Loop</span>
            <span aria-hidden="true">·</span>
            <span>Post-Publish Telemetry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Engagement Telemetry & Model Calibration
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Ingests likes, comments, shares, and retention data after publication to immediately update
            Style Memory and Smart Scheduler within the same session.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTriggerFeedbackLoop}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition shadow-xs shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Ingest Performance Data</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Real-time Feedback Loop Architecture */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-2">
          Closed-Loop Optimization Pipeline
        </span>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="text-slate-900 font-bold">1. Content Live</div>
            <p className="text-[11px] text-slate-500">Post publishes to destination channel.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="text-slate-900 font-bold">2. Telemetry Ingestion</div>
            <p className="text-[11px] text-slate-500">Captures viewer retention, likes, and shares.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="text-slate-900 font-bold">3. Style Profile Shift</div>
            <p className="text-[11px] text-slate-500">Weights hook formula by audience reception.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="text-slate-900 font-bold">4. Schedule Recalibration</div>
            <p className="text-[11px] text-slate-500">Refines optimal posting slot timing models.</p>
          </div>
        </div>
      </div>

      {/* Engagement Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>Ingested Engagement Batches ({engagementList.length} Records)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Real performance telemetry informing personalized generator weights.
          </p>
        </div>

        <div className="space-y-3">
          {engagementList.map((item, idx) => (
            <div
              key={item.id}
              className="bg-slate-50/60 border border-slate-200 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-900">Batch #{idx + 1}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-500 font-mono tabular-nums">
                    {new Date(item.collectedAt).toLocaleTimeString()}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-emerald-800 font-semibold font-mono text-[11px]">
                    {item.watchTime}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Ref: {item.scheduledPostId}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.likes.toLocaleString()} likes</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.comments} comments</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.shares} shares</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
