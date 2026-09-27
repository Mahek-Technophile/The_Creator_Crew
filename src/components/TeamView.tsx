import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Draft, DraftReview, TeamMembership } from '../types';
import {
  Users,
  UserPlus,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Shield,
  Check,
} from 'lucide-react';

export const TeamView: React.FC = () => {
  const { currentUser, switchUser } = useAuth();

  const [members, setMembers] = useState<TeamMembership[]>(() => storage.getTeamMemberships());
  const [reviews, setReviews] = useState<DraftReview[]>(() => storage.getDraftReviews());
  const [drafts, setDrafts] = useState<Draft[]>(() => storage.getDrafts());
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'REVIEWER' | 'OWNER'>('REVIEWER');
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const refreshTeam = () => {
    setMembers(storage.getTeamMemberships());
    setReviews(storage.getDraftReviews());
    setDrafts(storage.getDrafts());
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    storage.inviteTeamMember(inviteEmail.trim(), inviteRole);
    setInviteEmail('');
    setNotice(`Invited ${inviteEmail} as ${inviteRole}`);
    setTimeout(() => setNotice(null), 3000);
    refreshTeam();
  };

  const handleReviewAction = (
    draftId: string,
    decision: 'APPROVED' | 'REWORK' | 'DISCARDED'
  ) => {
    const notes = feedbackNotes[draftId] || '';
    storage.submitDraftReview(draftId, decision, notes);

    setFeedbackNotes((prev) => ({ ...prev, [draftId]: '' }));
    setNotice(`Recorded decision "${decision}" in team audit log`);
    setTimeout(() => setNotice(null), 3500);
    refreshTeam();
  };

  const pendingDrafts = drafts.filter(
    (d) => d.reviewStatus === 'PENDING' || !d.reviewStatus || d.reviewStatus === 'REWORK'
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Team Collaboration</span>
            <span aria-hidden="true">·</span>
            <span>Multi-Role Review Queue</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Team Workspace & Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Owners invite team reviewers. Reviewers approve, request rework on, or discard drafts
            with a permanent audit log visible to all team members.
          </p>
        </div>

        {/* Role toggle simulator */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500">Current Role:</span>
          <span className="text-xs font-bold text-slate-900 font-mono">
            {currentUser.role || 'OWNER'}
          </span>
          <button
            onClick={() => {
              if (currentUser.role === 'OWNER') {
                switchUser('user-reviewer-1');
              } else {
                switchUser('user-owner-1');
              }
            }}
            className="text-xs text-slate-900 hover:underline font-semibold ml-1"
          >
            Switch Role
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Grid: Invite Member & Active Team Members */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Invite Member */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserPlus className="w-3.5 h-3.5 text-slate-500" />
              <span>Invite Collaborator</span>
            </h3>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="editor@agency.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Team Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
                >
                  <option value="REVIEWER">Reviewer (Approve / Rework / Discard)</option>
                  <option value="OWNER">Owner (Full Administration)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition shadow-xs"
              >
                Send Invitation
              </button>
            </form>
          </div>

          {/* Members List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Team Roster ({members.length} Members)
              </span>
            </div>

            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                >
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-slate-900 truncate">{m.userEmail}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Joined {new Date(m.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-600">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Shared Review Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>Review Queue ({pendingDrafts.length} Awaiting)</span>
              </h3>
              <span className="text-xs text-slate-500">Shared visibility</span>
            </div>

            {pendingDrafts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
                All drafts are reviewed. No items currently in approval queue.
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        {draft.tag} · Version {draft.versionNo}
                      </span>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider ${
                          draft.reviewStatus === 'REWORK'
                            ? 'text-amber-800'
                            : 'text-slate-500'
                        }`}
                      >
                        {draft.reviewStatus || 'PENDING REVIEW'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      {draft.content}
                    </p>

                    <div>
                      <input
                        type="text"
                        value={feedbackNotes[draft.id] || ''}
                        onChange={(e) =>
                          setFeedbackNotes({ ...feedbackNotes, [draft.id]: e.target.value })
                        }
                        placeholder="Optional reviewer notes or revision guidance..."
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => handleReviewAction(draft.id, 'DISCARDED')}
                        className="px-2.5 py-1 text-rose-700 hover:bg-rose-50 rounded-md text-xs font-medium transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Discard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReviewAction(draft.id, 'REWORK')}
                        className="px-2.5 py-1 text-amber-800 hover:bg-amber-50 rounded-md text-xs font-medium transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Rework</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReviewAction(draft.id, 'APPROVED')}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition shadow-2xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Log Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Decision Audit Log</span>
            </h3>

            <div className="space-y-2">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider ${
                          rev.decision === 'APPROVED'
                            ? 'text-emerald-700'
                            : rev.decision === 'REWORK'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {rev.decision}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-semibold text-slate-900">
                        {rev.draftTitleSnippet}
                      </span>
                    </div>
                    {rev.feedback && (
                      <div className="text-[11px] text-slate-500 italic">
                        Note: "{rev.feedback}"
                      </div>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-500 shrink-0 font-mono tabular-nums">
                    <div>{rev.reviewerEmail}</div>
                    <div>{new Date(rev.decidedAt).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
