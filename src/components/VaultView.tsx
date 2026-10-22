import React, { useState } from 'react';
import { CreatorState, saveState, VaultDraft, DraftVersionItem } from '../services/creatorData';
import { History, RotateCcw, CheckCircle2, Clock } from 'lucide-react';

interface VaultViewProps {
  state: CreatorState;
  onUpdateState: (newState: CreatorState) => void;
  onNavigateToCreate: (promptText?: string, draftId?: number) => void;
  onOpenSchedule: (draftId: number) => void;
  onShowToast: (msg: string, undo?: () => void) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  state,
  onUpdateState,
  onNavigateToCreate,
  onOpenSchedule,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [historyDraft, setHistoryDraft] = useState<VaultDraft | null>(null);

  const q = searchQuery.toLowerCase().trim();
  const filteredDrafts = state.drafts.filter((d) => {
    if (!q) return true;
    return (d.text + ' ' + d.tags).toLowerCase().indexOf(q) >= 0;
  });

  const handleDelete = (id: number) => {
    const draftIndex = state.drafts.findIndex((x) => x.id === id);
    if (draftIndex < 0) return;

    const removedDraft = state.drafts[draftIndex];
    const removedScheduled = state.schedule.filter((s) => s.draftId === id);

    const newDrafts = state.drafts.filter((x) => x.id !== id);
    const newSchedule = state.schedule.filter((s) => s.draftId !== id);
    const newState = { ...state, drafts: newDrafts, schedule: newSchedule };

    onUpdateState(newState);
    saveState(newState);

    onShowToast('Draft deleted', () => {
      const restoredDrafts = [...state.drafts];
      restoredDrafts.splice(draftIndex, 0, removedDraft);
      const restoredSchedule = [...state.schedule, ...removedScheduled];
      const restoredState = {
        ...state,
        drafts: restoredDrafts,
        schedule: restoredSchedule,
      };
      onUpdateState(restoredState);
      saveState(restoredState);
    });
  };

  const handleRevertVersion = (draftId: number, version: DraftVersionItem) => {
    const draftIndex = state.drafts.findIndex((x) => x.id === draftId);
    if (draftIndex < 0) return;

    const draft = state.drafts[draftIndex];
    const newVersionNo = (draft.versionNo || 1) + 1;
    const newVersionEntry: DraftVersionItem = {
      versionNo: newVersionNo,
      text: version.text,
      note: `Reverted to version ${version.versionNo}`,
      date: new Date().toISOString().slice(0, 10),
    };

    const updatedDraft: VaultDraft = {
      ...draft,
      text: version.text,
      versionNo: newVersionNo,
      versions: [...(draft.versions || []), newVersionEntry],
      reviewStatus: 'PENDING', // Submits reverted draft for fresh review
    };

    const newDrafts = [...state.drafts];
    newDrafts[draftIndex] = updatedDraft;
    const newState = { ...state, drafts: newDrafts };

    onUpdateState(newState);
    saveState(newState);
    setHistoryDraft(null);
    onShowToast(`Reverted draft #${draftId} to version ${version.versionNo}`);
  };

  const handleSubmitForReview = (draftId: number) => {
    const draftIndex = state.drafts.findIndex((x) => x.id === draftId);
    if (draftIndex < 0) return;

    const updatedDraft: VaultDraft = {
      ...state.drafts[draftIndex],
      reviewStatus: 'PENDING',
    };

    const newDrafts = [...state.drafts];
    newDrafts[draftIndex] = updatedDraft;
    const newState = { ...state, drafts: newDrafts };

    onUpdateState(newState);
    saveState(newState);
    onShowToast(`Draft #${draftId} submitted to Editorial Review Queue`);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Draft vault</h1>
          <p className="muted">Every caption you saved, with full version history and review statuses.</p>
        </div>
        <button className="btn" id="nd" onClick={() => onNavigateToCreate()}>
          New draft
        </button>
      </div>

      <label htmlFor="vs" className="sr">
        Search drafts
      </label>
      <input
        type="search"
        id="vs"
        placeholder="Search your drafts by keyword or tag"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div id="vl" style={{ marginTop: '16px' }}>
        {filteredDrafts.length > 0 ? (
          filteredDrafts.map((d) => {
            const isScheduled = state.schedule.some((s) => s.draftId === d.id);
            const tagList = (d.tags || '').split(/\s+/).filter(Boolean);
            const status = d.reviewStatus || 'PENDING';
            const versionCount = (d.versions || []).length || 1;

            return (
              <div key={d.id} className="item" style={{ padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ flex: 1 }}>
                  {/* Status & Version Header */}
                  <div className="row" style={{ gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="hl" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                      {status === 'APPROVED' ? 'Approved' : status === 'REWORK' ? 'Rework Required' : 'In Review'}
                    </span>
                    <span className="muted small" style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>
                      v{d.versionNo || 1} ({versionCount} saved {versionCount === 1 ? 'version' : 'versions'})
                    </span>
                    {d.tone && (
                      <span className="chip" style={{ fontSize: '11px' }}>
                        {d.tone}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '15px', lineHeight: '1.45' }}>{d.text}</p>

                  <div style={{ marginTop: '6px' }}>
                    {tagList.map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Review feedback note banner */}
                  {d.reviewStatus === 'REWORK' && d.reviewFeedback && (
                    <div
                      style={{
                        marginTop: '8px',
                        background: '#fef3c7',
                        borderLeft: '3px solid #d97706',
                        padding: '6px 10px',
                        fontSize: '12px',
                        color: '#92400e',
                      }}
                    >
                      <b>Reviewer feedback:</b> {d.reviewFeedback}
                    </div>
                  )}
                </div>

                <div className="row" style={{ flexWrap: 'wrap', gap: '6px', alignItems: 'center', alignSelf: 'flex-start' }}>
                  <span className="chip">{isScheduled ? 'Scheduled' : 'Draft'}</span>

                  <button
                    className="btn ghost small"
                    data-h={d.id}
                    title="View version history and revert"
                    onClick={() => setHistoryDraft(d)}
                  >
                    <History style={{ width: '13px', height: '13px', marginRight: '4px' }} />
                    History
                  </button>

                  <button
                    className="btn ghost small"
                    data-e={d.id}
                    onClick={() => onNavigateToCreate(undefined, d.id)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn ghost small"
                    data-s={d.id}
                    onClick={() => onOpenSchedule(d.id)}
                  >
                    Schedule
                  </button>

                  <button
                    className="btn ghost small"
                    data-d={d.id}
                    onClick={() => handleDelete(d.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty" style={{ marginTop: '16px' }}>
            {searchQuery
              ? `No drafts match “${searchQuery}”. Clear the search to see all drafts.`
              : 'No drafts yet. Create one and it will show up here.'}
          </div>
        )}
      </div>

      {/* Version History & Revert Modal (Use Case: Search / Revert Draft Versions) */}
      {historyDraft && (
        <dialog
          className="dlg"
          open
          id="version-history-dlg"
          onClick={(e) => {
            if (e.target === e.currentTarget) setHistoryDraft(null);
          }}
        >
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2>Version History: Draft #{historyDraft.id}</h2>
            <button className="btn ghost small" onClick={() => setHistoryDraft(null)}>
              Close
            </button>
          </div>
          <p className="muted small" style={{ marginBottom: '16px' }}>
            Inspect previous iterations and revert back to any earlier draft state.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
            {(historyDraft.versions || [
              { versionNo: 1, text: historyDraft.text, note: 'Initial draft', date: '2026-10-20' },
            ]).map((v) => (
              <div
                key={v.versionNo}
                className="sheet"
                style={{
                  padding: '12px',
                  background: v.versionNo === historyDraft.versionNo ? 'var(--paper)' : '#fff',
                }}
              >
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div>
                    <b style={{ fontSize: '13px' }}>Version {v.versionNo}</b>
                    {v.versionNo === historyDraft.versionNo && (
                      <span className="hl" style={{ fontSize: '10px', marginLeft: '6px' }}>
                        CURRENT
                      </span>
                    )}
                  </div>
                  <span className="muted small" style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>
                    {v.date}
                  </span>
                </div>

                <p style={{ fontSize: '13px', lineHeight: '1.4', margin: '4px 0 8px 0' }}>{v.text}</p>
                <p className="muted small" style={{ fontStyle: 'italic', fontSize: '11px' }}>
                  Note: {v.note || 'Snapshot version'}
                </p>

                {v.versionNo !== historyDraft.versionNo && (
                  <div style={{ marginTop: '8px', textAlign: 'right' }}>
                    <button
                      className="btn small"
                      id={`revert-v-${v.versionNo}`}
                      onClick={() => handleRevertVersion(historyDraft.id, v)}
                    >
                      <RotateCcw style={{ width: '13px', height: '13px', marginRight: '4px' }} />
                      Revert to Version {v.versionNo}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </dialog>
      )}
    </div>
  );
};
