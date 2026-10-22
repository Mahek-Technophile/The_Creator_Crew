import React, { useState } from 'react';
import {
  CreatorState,
  saveState,
  VaultDraft,
  TeamMember,
  AuditLogEntry,
  BrandGuardConfig,
} from '../services/creatorData';
import { Shield, Users, CheckCircle2, RotateCcw, XCircle, Bell, Send, Lock, Plus, Trash2 } from 'lucide-react';

interface AdminTeamViewProps {
  state: CreatorState;
  onUpdateState: (newState: CreatorState) => void;
  onShowToast: (msg: string, undo?: () => void) => void;
}

type AdminSubTab = 'queue' | 'team' | 'dispatch' | 'brand' | 'audit';

export const AdminTeamView: React.FC<AdminTeamViewProps> = ({
  state,
  onUpdateState,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<AdminSubTab>('queue');
  const [queueFilter, setQueueFilter] = useState<'ALL' | 'PENDING' | 'REWORK' | 'APPROVED' | 'DISCARDED'>('ALL');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'REVIEWER' | 'OWNER'>('REVIEWER');
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  const [newBannedWord, setNewBannedWord] = useState('');

  const currentRole = state.currentRole || 'OWNER';
  const teamMembers = state.teamMembers || [];
  const auditLog = state.auditLog || [];
  const brandGuard = state.brandGuard || {
    minStyleMatch: 75,
    requireApprovalToPublish: true,
    sendReminderInsteadOfPublish: false,
    bannedWords: ['revolutionary', 'game-changer', 'unprecedented'],
  };

  const handleSwitchRole = (role: 'OWNER' | 'REVIEWER') => {
    const newState = { ...state, currentRole: role };
    onUpdateState(newState);
    saveState(newState);
    onShowToast(`Switched active view to ${role === 'OWNER' ? 'Team Owner (Admin)' : 'Reviewer'}`);
  };

  // Review action (Approve / Rework / Discard)
  const handleReviewAction = (
    draftId: number,
    decision: 'APPROVED' | 'REWORK' | 'DISCARDED'
  ) => {
    const draftIndex = state.drafts.findIndex((d) => d.id === draftId);
    if (draftIndex < 0) return;

    const draft = state.drafts[draftIndex];
    const feedback = reviewNotes[draftId] || '';
    const reviewer = currentRole === 'OWNER' ? 'mira@makes.creator (Owner)' : 'reviewer@crew.com';
    const now = new Date();
    const timeStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const updatedDraft: VaultDraft = {
      ...draft,
      reviewStatus: decision,
      reviewFeedback: feedback || (decision === 'APPROVED' ? 'Approved for scheduling.' : undefined),
      reviewerEmail: reviewer,
      reviewedAt: now.toISOString(),
    };

    const newDrafts = [...state.drafts];
    newDrafts[draftIndex] = updatedDraft;

    const newLogEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      draftId,
      draftTitle: draft.text.slice(0, 48) + (draft.text.length > 48 ? '...' : ''),
      decision,
      feedback: feedback || undefined,
      by: reviewer,
      time: timeStr,
    };

    const newState: CreatorState = {
      ...state,
      drafts: newDrafts,
      auditLog: [newLogEntry, ...auditLog],
    };

    onUpdateState(newState);
    saveState(newState);

    setReviewNotes((prev) => ({ ...prev, [draftId]: '' }));
    onShowToast(`Draft #${draftId} marked as ${decision}`);
  };

  // Invite reviewer/member
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    if (teamMembers.some((m) => m.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      onShowToast('Member with this email is already on the team.');
      return;
    }

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      email: inviteEmail.trim(),
      role: inviteRole,
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    const newState: CreatorState = {
      ...state,
      teamMembers: [...teamMembers, newMember],
    };

    onUpdateState(newState);
    saveState(newState);
    setInviteEmail('');
    onShowToast(`Invited ${newMember.email} as ${newMember.role}`);
  };

  // Revoke member
  const handleRevokeMember = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return;
    if (member.email === 'mira@makes.creator') {
      onShowToast('Cannot revoke primary team owner.');
      return;
    }

    const newState: CreatorState = {
      ...state,
      teamMembers: teamMembers.filter((m) => m.id !== memberId),
    };
    onUpdateState(newState);
    saveState(newState);
    onShowToast(`Removed ${member.email} from team`);
  };

  // Update brand guard
  const handleUpdateBrandGuard = (updates: Partial<BrandGuardConfig>) => {
    const newGuard = { ...brandGuard, ...updates };
    const newState: CreatorState = { ...state, brandGuard: newGuard };
    onUpdateState(newState);
    saveState(newState);
    onShowToast('Brand governance settings saved');
  };

  const handleAddBannedWord = (e: React.FormEvent) => {
    e.preventDefault();
    const word = newBannedWord.trim().toLowerCase();
    if (!word) return;
    if (brandGuard.bannedWords.includes(word)) {
      onShowToast(`"${word}" is already on the banned list`);
      return;
    }
    handleUpdateBrandGuard({ bannedWords: [...brandGuard.bannedWords, word] });
    setNewBannedWord('');
  };

  const handleRemoveBannedWord = (word: string) => {
    handleUpdateBrandGuard({
      bannedWords: brandGuard.bannedWords.filter((w) => w !== word),
    });
  };

  // Filter drafts for review queue
  const pendingCount = state.drafts.filter((d) => !d.reviewStatus || d.reviewStatus === 'PENDING').length;
  const filteredDrafts = state.drafts.filter((d) => {
    const status = d.reviewStatus || 'PENDING';
    if (queueFilter === 'ALL') return true;
    return status === queueFilter;
  });

  return (
    <div id="admin-team-view">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="row" style={{ gap: '8px', marginBottom: '4px' }}>
            <span className="hl" style={{ fontSize: '12px' }}>TEAM OWNER & EDITORIAL</span>
            <span className="muted small">·</span>
            <span className="muted small">Governance & Review</span>
          </div>
          <h1>Admin & Team Workspace</h1>
          <p className="muted">
            Manage collaborators, review creator drafts, enforce brand tone rules, and configure platform dispatch.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="sheet" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="muted small" style={{ fontWeight: 600 }}>Active Role:</span>
          <button
            className={`btn small ${currentRole === 'OWNER' ? '' : 'ghost'}`}
            id="role-owner-btn"
            onClick={() => handleSwitchRole('OWNER')}
          >
            Team Owner
          </button>
          <button
            className={`btn small ${currentRole === 'REVIEWER' ? '' : 'ghost'}`}
            id="role-reviewer-btn"
            onClick={() => handleSwitchRole('REVIEWER')}
          >
            Reviewer
          </button>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="row" style={{ gap: '8px', marginTop: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          className={`chip ${subTab === 'queue' ? 'active' : ''}`}
          aria-pressed={subTab === 'queue'}
          id="tab-queue"
          onClick={() => setSubTab('queue')}
        >
          Review Queue ({pendingCount} pending)
        </button>
        <button
          className={`chip ${subTab === 'team' ? 'active' : ''}`}
          aria-pressed={subTab === 'team'}
          id="tab-team"
          onClick={() => setSubTab('team')}
        >
          Team Roster ({teamMembers.length})
        </button>
        <button
          className={`chip ${subTab === 'dispatch' ? 'active' : ''}`}
          aria-pressed={subTab === 'dispatch'}
          id="tab-dispatch"
          onClick={() => setSubTab('dispatch')}
        >
          Platform Dispatch Controls
        </button>
        <button
          className={`chip ${subTab === 'brand' ? 'active' : ''}`}
          aria-pressed={subTab === 'brand'}
          id="tab-brand"
          onClick={() => setSubTab('brand')}
        >
          Style Memory & Brand Guard
        </button>
        <button
          className={`chip ${subTab === 'audit' ? 'active' : ''}`}
          aria-pressed={subTab === 'audit'}
          id="tab-audit"
          onClick={() => setSubTab('audit')}
        >
          Decision Audit Log ({auditLog.length})
        </button>
      </div>

      {/* SUB-TAB 1: REVIEW QUEUE */}
      {subTab === 'queue' && (
        <div className="space-y-4">
          <div className="bar">
            <h2>Editorial Review Queue</h2>
            {/* Filter buttons */}
            <div className="row" style={{ gap: '6px' }}>
              {(['ALL', 'PENDING', 'REWORK', 'APPROVED', 'DISCARDED'] as const).map((f) => (
                <button
                  key={f}
                  className={`chip ${queueFilter === f ? 'active' : ''}`}
                  aria-pressed={queueFilter === f}
                  onClick={() => setQueueFilter(f)}
                  style={{ fontSize: '12px' }}
                >
                  {f === 'ALL' ? 'All' : f === 'PENDING' ? `Pending (${pendingCount})` : f}
                </button>
              ))}
            </div>
          </div>

          <p className="muted small" style={{ marginBottom: '14px' }}>
            Reviewers and Team Owners inspect creator drafts before scheduling. Approve drafts to unlock platform publishing, or request rework with editorial feedback.
          </p>

          <div id="review-drafts-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredDrafts.length > 0 ? (
              filteredDrafts.map((d) => {
                const status = d.reviewStatus || 'PENDING';
                const tagList = (d.tags || '').split(/\s+/).filter(Boolean);

                return (
                  <div key={d.id} className="sheet" data-draft-id={d.id} style={{ padding: '16px' }}>
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div className="row" style={{ gap: '8px', alignItems: 'center' }}>
                        <b style={{ fontFamily: 'var(--head)', fontSize: '15px' }}>Draft #{d.id}</b>
                        <span className="muted small">·</span>
                        <span className="muted small" style={{ fontFamily: 'var(--mono)' }}>v{d.versionNo || 1}</span>
                        <span className="muted small">·</span>
                        <span className="chip" style={{ fontSize: '11px' }}>{d.tone || 'General'}</span>
                      </div>

                      <span
                        className="hl"
                        style={{
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          background:
                            status === 'APPROVED'
                              ? '#d1fae5'
                              : status === 'REWORK'
                              ? '#fef3c7'
                              : status === 'DISCARDED'
                              ? '#fee2e2'
                              : 'var(--tape)',
                        }}
                      >
                        {status}
                      </span>
                    </div>

                    <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '8px 0 10px 0' }}>
                      {d.text}
                    </p>

                    <div className="row" style={{ gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {tagList.map((tag, idx) => (
                        <span key={idx} className="tag" style={{ fontSize: '11px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Previous feedback note if present */}
                    {d.reviewFeedback && (
                      <div
                        style={{
                          background: 'var(--paper)',
                          borderLeft: '3px solid var(--ink)',
                          padding: '8px 12px',
                          fontSize: '12px',
                          marginBottom: '12px',
                        }}
                      >
                        <b>Reviewer Note:</b> {d.reviewFeedback}
                        {d.reviewerEmail && <span className="muted small"> ({d.reviewerEmail})</span>}
                      </div>
                    )}

                    {/* Reviewer Note Input */}
                    <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        placeholder="Add editorial feedback or rework guidance..."
                        value={reviewNotes[d.id] || ''}
                        onChange={(e) => setReviewNotes({ ...reviewNotes, [d.id]: e.target.value })}
                        style={{ width: '100%', fontSize: '13px', padding: '8px 10px' }}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="row" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        className="btn danger small"
                        id={`review-discard-${d.id}`}
                        onClick={() => handleReviewAction(d.id, 'DISCARDED')}
                      >
                        <XCircle style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                        Discard
                      </button>

                      <button
                        className="btn ghost small"
                        id={`review-rework-${d.id}`}
                        onClick={() => handleReviewAction(d.id, 'REWORK')}
                      >
                        <RotateCcw style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                        Request Rework
                      </button>

                      <button
                        className="btn small"
                        id={`review-approve-${d.id}`}
                        onClick={() => handleReviewAction(d.id, 'APPROVED')}
                      >
                        <CheckCircle2 style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                        Approve
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="sheet" style={{ padding: '32px', textAlign: 'center' }}>
                <p className="muted">No drafts in review queue matching "{queueFilter}".</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TEAM ROSTER & INVITES */}
      {subTab === 'team' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Invite Member Card */}
          <div className="sheet" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '4px' }}>Invite Collaborator</h2>
            <p className="muted small" style={{ marginBottom: '16px' }}>
              Invite editorial reviewers or co-owners to review drafts, set brand guidelines, and schedule posts.
            </p>

            <form onSubmit={handleInviteMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="muted small" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Collaborator Email
                </label>
                <input
                  type="email"
                  id="invite-email"
                  required
                  placeholder="editor@agency.studio"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="muted small" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Role & Permissions
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'REVIEWER' | 'OWNER')}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-sm)',
                    background: '#fff',
                  }}
                >
                  <option value="REVIEWER">Reviewer (Approve / Rework / Discard drafts)</option>
                  <option value="OWNER">Team Owner (Full Administration & Dispatch)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn"
                id="invite-submit"
                style={{ marginTop: '8px' }}
                disabled={currentRole !== 'OWNER'}
                title={currentRole !== 'OWNER' ? 'Only Team Owners can invite collaborators' : ''}
              >
                <Send style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                Send Invitation
              </button>

              {currentRole !== 'OWNER' && (
                <p className="muted small" style={{ color: 'var(--rec)' }}>
                  * Switch to Team Owner in the top right to invite new team members.
                </p>
              )}
            </form>
          </div>

          {/* Active Roster List */}
          <div className="sheet" style={{ padding: '20px' }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '18px' }}>Active Roster ({teamMembers.length})</h2>
              <span className="hl" style={{ fontSize: '11px' }}>SYNCED</span>
            </div>

            <div id="roster-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="sheet"
                  style={{
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    background: 'var(--paper)',
                  }}
                >
                  <div>
                    <b style={{ fontSize: '13px', display: 'block' }}>{member.email}</b>
                    <span className="muted small" style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>
                      Joined {member.joinedAt}
                    </span>
                  </div>

                  <div className="row" style={{ gap: '8px', alignItems: 'center' }}>
                    <span
                      className="chip"
                      style={{
                        fontSize: '11px',
                        background: member.role === 'OWNER' ? 'var(--tape)' : '#e2e8f0',
                        fontWeight: 700,
                      }}
                    >
                      {member.role}
                    </span>

                    {currentRole === 'OWNER' && member.email !== 'mira@makes.creator' && (
                      <button
                        className="btn ghost small"
                        style={{ padding: '4px 6px', color: 'var(--rec)' }}
                        title="Revoke member"
                        onClick={() => handleRevokeMember(member.id)}
                      >
                        <Trash2 style={{ width: '13px', height: '13px' }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PLATFORM DISPATCH & NOTIFICATIONS */}
      {subTab === 'dispatch' && (
        <div className="space-y-4">
          <div className="bar">
            <h2>Social Media Platform & Dispatch Settings</h2>
          </div>
          <p className="muted small" style={{ marginBottom: '16px' }}>
            Configure how posts are scheduled and dispatched across connected platforms. Connected directly to the Social Media Platform external system actor.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Platform 1: Instagram */}
            <div className="sheet" style={{ padding: '16px' }}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
                <b>Instagram</b>
                <span className="hl" style={{ fontSize: '11px' }}>CONNECTED</span>
              </div>
              <p className="small muted">Account: @mira.makes</p>
              <p className="small muted">Capabilities: Reels (9:16), Carousels, Photos</p>
              <div style={{ marginTop: '12px' }}>
                <span className="tag">Direct API Ready</span>
              </div>
            </div>

            {/* Platform 2: TikTok */}
            <div className="sheet" style={{ padding: '16px' }}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
                <b>TikTok</b>
                <span className="hl" style={{ fontSize: '11px' }}>CONNECTED</span>
              </div>
              <p className="small muted">Account: @mira_makes_tok</p>
              <p className="small muted">Capabilities: Video Reels & Captions</p>
              <div style={{ marginTop: '12px' }}>
                <span className="tag">Direct API Ready</span>
              </div>
            </div>

            {/* Platform 3: YouTube */}
            <div className="sheet" style={{ padding: '16px' }}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
                <b>YouTube Shorts</b>
                <span className="muted small">PENDING SYNC</span>
              </div>
              <p className="small muted">Channel: Mira Makes Studio</p>
              <p className="small muted">Capabilities: Shorts, Community Posts</p>
              <div style={{ marginTop: '12px' }}>
                <span className="tag">Reminder Fallback Mode</span>
              </div>
            </div>
          </div>

          {/* Dispatch Policy Form */}
          <div className="sheet" style={{ padding: '20px', marginTop: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '14px' }}>Dispatch Governance Rules</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="row" style={{ gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="toggle-require-approval"
                  checked={brandGuard.requireApprovalToPublish}
                  onChange={(e) => handleUpdateBrandGuard({ requireApprovalToPublish: e.target.checked })}
                  style={{ marginTop: '4px', width: '18px', height: '18px' }}
                />
                <div>
                  <b style={{ fontSize: '14px', display: 'block' }}>Require Reviewer Approval before Scheduling or Publishing</b>
                  <p className="muted small">
                    When enabled, unapproved drafts cannot be pushed to the calendar or dispatched to social media platforms until an editorial reviewer approves them.
                  </p>
                </div>
              </label>

              <label className="row" style={{ gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="toggle-reminder-mode"
                  checked={brandGuard.sendReminderInsteadOfPublish}
                  onChange={(e) => handleUpdateBrandGuard({ sendReminderInsteadOfPublish: e.target.checked })}
                  style={{ marginTop: '4px', width: '18px', height: '18px' }}
                />
                <div>
                  <b style={{ fontSize: '14px', display: 'block' }}>Send Reminder Notification instead of Direct Auto-Publish</b>
                  <p className="muted small">
                    When enabled, the system will send an in-app and push reminder at the scheduled optimal time instead of firing direct platform publishing webhooks.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: STYLE MEMORY & BRAND GUARD */}
      {subTab === 'brand' && (
        <div className="space-y-4">
          <div className="bar">
            <h2>Style Memory & Brand Governance</h2>
          </div>
          <p className="muted small" style={{ marginBottom: '16px' }}>
            Enforce voice-match ranking criteria and compliance rules across all generated captions and drafts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Style Match Threshold */}
            <div className="sheet" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>Minimum Voice Match Threshold</h3>
              <p className="muted small" style={{ marginBottom: '14px' }}>
                Drafts scoring below this threshold are flagged for rework by the AI style-memory ranker.
              </p>

              <div className="row" style={{ gap: '16px', alignItems: 'center' }}>
                <input
                  type="range"
                  id="min-style-match-slider"
                  min="50"
                  max="95"
                  step="5"
                  value={brandGuard.minStyleMatch}
                  onChange={(e) => handleUpdateBrandGuard({ minStyleMatch: parseInt(e.target.value, 10) })}
                  style={{ flex: 1 }}
                />
                <span className="hl" id="min-style-match-val" style={{ fontSize: '18px', padding: '2px 8px' }}>
                  {brandGuard.minStyleMatch}%
                </span>
              </div>
            </div>

            {/* Banned Words / Compliance */}
            <div className="sheet" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>Banned Words & Cliches</h3>
              <p className="muted small" style={{ marginBottom: '12px' }}>
                Words prohibited by editorial guidelines (e.g. overhyped corporate jargon).
              </p>

              <form onSubmit={handleAddBannedWord} className="row" style={{ gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  id="banned-word-input"
                  placeholder="e.g. game-changer"
                  value={newBannedWord}
                  onChange={(e) => setNewBannedWord(e.target.value)}
                  style={{ flex: 1, fontSize: '13px' }}
                />
                <button type="submit" className="btn small" id="add-banned-word-btn">
                  Add
                </button>
              </form>

              <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
                {brandGuard.bannedWords.map((word) => (
                  <span
                    key={word}
                    className="tag"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#fee2e2',
                      borderColor: '#fca5a5',
                      color: '#991b1b',
                    }}
                  >
                    {word}
                    <button
                      type="button"
                      onClick={() => handleRemoveBannedWord(word)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: DECISION AUDIT LOG */}
      {subTab === 'audit' && (
        <div className="space-y-4">
          <div className="bar">
            <h2>Decision Audit Log</h2>
            <span className="muted small font-mono">Immutable audit history</span>
          </div>
          <p className="muted small" style={{ marginBottom: '16px' }}>
            Permanent record of all editorial decisions made across creator drafts.
          </p>

          <div className="sheet" style={{ padding: '0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
                  <th style={{ padding: '10px 14px' }}>Time</th>
                  <th style={{ padding: '10px 14px' }}>Draft Snippet</th>
                  <th style={{ padding: '10px 14px' }}>Decision</th>
                  <th style={{ padding: '10px 14px' }}>Reviewer</th>
                  <th style={{ padding: '10px 14px' }}>Notes</th>
                </tr>
              </thead>
              <tbody id="audit-log-tbody">
                {auditLog.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: '12px' }}>{log.time}</td>
                    <td style={{ padding: '10px 14px' }}>{log.draftTitle}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        className="hl"
                        style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          background:
                            log.decision === 'APPROVED'
                              ? '#d1fae5'
                              : log.decision === 'REWORK'
                              ? '#fef3c7'
                              : '#fee2e2',
                        }}
                      >
                        {log.decision}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--steel)' }}>{log.by}</td>
                    <td style={{ padding: '10px 14px', fontStyle: 'italic', color: 'var(--steel)' }}>
                      {log.feedback || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
