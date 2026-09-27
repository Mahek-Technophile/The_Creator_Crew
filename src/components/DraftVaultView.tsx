import React, { useState, useMemo } from 'react';
import { storage } from '../services/storage';
import { Draft, DraftVersion } from '../types';
import {
  Search,
  History,
  Edit3,
  Trash2,
  Clock,
  RotateCcw,
  Send,
  FileText,
  Sparkles,
  Users,
  Check,
} from 'lucide-react';

interface DraftVaultViewProps {
  onScheduleDraft?: (draftId: string) => void;
  onAnalyzeDraft?: (draftId: string) => void;
}

export const DraftVaultView: React.FC<DraftVaultViewProps> = ({
  onScheduleDraft,
  onAnalyzeDraft,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [drafts, setDrafts] = useState<Draft[]>(() => storage.getDrafts());
  const [activeHistoryDraft, setActiveHistoryDraft] = useState<Draft | null>(null);
  const [versions, setVersions] = useState<DraftVersion[]>([]);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTag, setEditTag] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [selectedVersionPreview, setSelectedVersionPreview] = useState<DraftVersion | null>(null);

  const refreshDrafts = () => {
    setDrafts(storage.getDrafts());
  };

  const tags = useMemo(() => {
    const set = new Set<string>();
    drafts.forEach((d) => set.add(d.tag));
    return ['All', ...Array.from(set)];
  }, [drafts]);

  const filteredDrafts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return drafts.filter((d) => {
      const matchQuery =
        !q || d.content.toLowerCase().includes(q) || d.tag.toLowerCase().includes(q);
      const matchTag = selectedTag === 'All' || d.tag === selectedTag;
      return matchQuery && matchTag;
    });
  }, [drafts, searchQuery, selectedTag]);

  const handleOpenHistory = (draft: Draft) => {
    const vList = storage.getDraftVersions(draft.id);
    setActiveHistoryDraft(draft);
    setVersions(vList);
    setSelectedVersionPreview(vList[0] || null);
  };

  const handleRevert = (versionNo: number) => {
    if (!activeHistoryDraft) return;
    const updated = storage.revertDraftToVersion(activeHistoryDraft.id, versionNo);
    setActionNotice(`Successfully reverted to Version ${versionNo}`);
    setTimeout(() => setActionNotice(null), 3000);
    refreshDrafts();
    setActiveHistoryDraft(updated);
    setVersions(storage.getDraftVersions(updated.id));
  };

  const handleStartEdit = (draft: Draft) => {
    setEditingDraft(draft);
    setEditContent(draft.content);
    setEditTag(draft.tag);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDraft) return;

    storage.updateDraft(editingDraft.id, editContent, editTag, 'Updated in Draft Vault');
    setEditingDraft(null);
    setActionNotice('Draft changes saved as new version');
    setTimeout(() => setActionNotice(null), 3000);
    refreshDrafts();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      storage.deleteDraft(id);
      refreshDrafts();
    }
  };

  const handleSendToReview = (draft: Draft) => {
    storage.submitDraftReview(draft.id, 'PENDING', 'Submitted for peer review');
    setActionNotice('Submitted to Team Review queue');
    setTimeout(() => setActionNotice(null), 3000);
    refreshDrafts();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Pillar 2: Central Vault</span>
            <span aria-hidden="true">·</span>
            <span>Content Repository & Revisions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Draft Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Auto-categorized drafts, full-text search, and one-click rollback across the last 5 revisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-right">
            <div className="text-[11px] text-slate-500 font-medium">Stored Drafts</div>
            <div className="text-sm font-bold text-slate-900 tabular-nums">{drafts.length} Active</div>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Search & Tag Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drafts by content, topic, keyword, or hashtag..."
            className="w-full bg-slate-50/50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white transition"
          />
        </div>

        {/* Filter Tabs (Interactive Segmented Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-medium shrink-0 mr-1">Category:</span>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                selectedTag === tag
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Drafts Grid */}
      {filteredDrafts.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-xl space-y-2">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-sm font-semibold text-slate-900">No drafts found</div>
          <p className="text-xs text-slate-500">Try adjusting your search query or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition flex flex-col justify-between shadow-xs space-y-4"
            >
              <div className="space-y-3">
                {/* Zero-Pill Unboxed Metadata */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{draft.tag}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-slate-500">v{draft.versionNo}</span>
                  </div>

                  {draft.reviewStatus && (
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider ${
                        draft.reviewStatus === 'APPROVED'
                          ? 'text-emerald-700'
                          : draft.reviewStatus === 'REWORK'
                          ? 'text-amber-700'
                          : draft.reviewStatus === 'DISCARDED'
                          ? 'text-rose-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {draft.reviewStatus}
                    </span>
                  )}
                </div>

                {/* Content */}
                <p className="text-xs text-slate-700 line-clamp-4 leading-relaxed font-sans">
                  {draft.content}
                </p>
              </div>

              {/* Card Footer: Metadata & Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenHistory(draft)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
                    title="View revision history"
                  >
                    <History className="w-3 h-3 text-slate-500" />
                    <span>Revisions ({draft.versionNo})</span>
                  </button>

                  <button
                    onClick={() => handleStartEdit(draft)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    title="Edit draft"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {onAnalyzeDraft && (
                    <button
                      onClick={() => onAnalyzeDraft(draft.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Analyze in Attention Optimizer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </button>
                  )}

                  {onScheduleDraft && (
                    <button
                      onClick={() => onScheduleDraft(draft.id)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition shadow-2xs"
                      title="Schedule post"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleSendToReview(draft)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    title="Submit to Team Review"
                  >
                    <Users className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                    title="Delete draft"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Version History Drawer / Modal */}
      {activeHistoryDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Version History (Last 5 Revisions Retained)
                </h3>
                <p className="text-xs text-slate-500">
                  Review historical iterations and restore prior drafts with one click.
                </p>
              </div>
              <button
                onClick={() => setActiveHistoryDraft(null)}
                className="text-slate-400 hover:text-slate-700 text-base font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 flex-1 overflow-hidden">
              {/* Left Column: Versions List */}
              <div className="md:col-span-2 border-r border-slate-200 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                  Versions
                </span>
                {versions.map((ver) => (
                  <button
                    key={ver.id}
                    onClick={() => setSelectedVersionPreview(ver)}
                    className={`w-full p-2.5 rounded-lg border text-left transition ${
                      selectedVersionPreview?.id === ver.id
                        ? 'bg-white border-slate-900 text-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold font-mono tabular-nums">Version {ver.versionNo}</span>
                      {ver.versionNo === activeHistoryDraft.versionNo && (
                        <span className="text-[10px] text-emerald-700 font-semibold">Active</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                      {ver.note || 'Saved revision'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {new Date(ver.createdAt).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>

              {/* Right Column: Version Preview & Rollback */}
              <div className="md:col-span-3 p-5 flex flex-col justify-between overflow-y-auto space-y-4">
                {selectedVersionPreview ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        Previewing Version {selectedVersionPreview.versionNo}
                      </span>
                      <span className="text-slate-500 font-medium">
                        Category: {selectedVersionPreview.tag}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto font-sans">
                      {selectedVersionPreview.content}
                    </div>

                    <div className="text-xs text-slate-500">
                      <strong className="text-slate-700">Note:</strong> {selectedVersionPreview.note || 'No notes logged.'}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">Select a version to preview</div>
                )}

                {selectedVersionPreview && (
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveHistoryDraft(null)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevert(selectedVersionPreview.versionNo)}
                      disabled={selectedVersionPreview.versionNo === activeHistoryDraft.versionNo}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Revert to Version {selectedVersionPreview.versionNo}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit In Place Modal */}
      {editingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl overflow-hidden shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Edit Draft (Records New Version)</h3>
              <button
                onClick={() => setEditingDraft(null)}
                className="text-slate-400 hover:text-slate-700 font-mono text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Category / Tag
                </label>
                <input
                  type="text"
                  value={editTag}
                  onChange={(e) => setEditTag(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Draft Content
                </label>
                <textarea
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white leading-relaxed resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDraft(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition shadow-xs"
                >
                  Save as Version {editingDraft.versionNo + 1}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
