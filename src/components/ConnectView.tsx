import React, { useState } from 'react';
import { creatorData, CreatorState } from '../services/creatorData';

interface ConnectViewProps {
  onConnected: (allowPublish: boolean) => void;
}

export const ConnectView: React.FC<ConnectViewProps> = ({ onConnected }) => {
  const [showPermDialog, setShowPermDialog] = useState(false);
  const [showPersonalDialog, setShowPersonalDialog] = useState(false);
  const [allowPublish, setAllowPublish] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isClapped, setIsClapped] = useState(false);

  // Slate steps
  const slateState = {
    account: syncStep >= 1 ? `@${creatorData.handle}` : null,
    posts: syncStep >= 3 ? Math.round(creatorData.posts.length * 3.7) : syncStep >= 2 ? 0 : null,
    insights: syncStep >= 4 ? 'Reach, saves, shares' : null,
    style: syncStep >= 5 ? `Learned from ${creatorData.posts.length} captions` : null,
    take: syncStep >= 5 ? '1 · Done' : syncStep >= 1 ? '1' : 'Ready',
  };

  const handleStartConnect = () => {
    setShowPermDialog(true);
  };

  const handleAllowPermissions = () => {
    setShowPermDialog(false);
    setIsSyncing(true);
    setErrorMsg('');

    // Step animation sequence
    setTimeout(() => setSyncStep(1), 300);
    setTimeout(() => setSyncStep(2), 700);
    setTimeout(() => setSyncStep(3), 1200);
    setTimeout(() => setSyncStep(4), 1700);
    setTimeout(() => {
      setSyncStep(5);
      setIsClapped(true);
    }, 2200);
    setTimeout(() => {
      onConnected(allowPublish);
    }, 2900);
  };

  return (
    <div className="connect">
      {/* Left Column: Film Clapper Slate */}
      <div>
        <div className={`slate ${isClapped ? 'clap' : ''}`} id="slate">
          <div className={`arm ${isSyncing && !isClapped ? 'open' : ''}`} />
          <dl style={{ margin: 0 }}>
            <div className="srow">
              <dt>PRODUCTION</dt>
              <dd>The Creator Crew</dd>
            </div>
            <div className="srow">
              <dt>ACCOUNT</dt>
              <dd className={slateState.account ? '' : 'pending'}>
                {slateState.account || 'Waiting'}
              </dd>
            </div>
            <div className="srow">
              <dt>POSTS READ</dt>
              <dd className={slateState.posts !== null ? '' : 'pending'}>
                {slateState.posts !== null ? slateState.posts.toLocaleString() : 'Waiting'}
              </dd>
            </div>
            <div className="srow">
              <dt>INSIGHTS</dt>
              <dd className={slateState.insights ? '' : 'pending'}>
                {slateState.insights || 'Waiting'}
              </dd>
            </div>
            <div className="srow">
              <dt>YOUR STYLE</dt>
              <dd className={slateState.style ? '' : 'pending'}>
                {slateState.style || 'Waiting'}
              </dd>
            </div>
            <div className="srow">
              <dt>TAKE</dt>
              <dd>
                {slateState.take}{' '}
                {isClapped && <span className="ok">✓</span>}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Right Column: Information & Connection Action */}
      <div>
        <h1>See what works. Post what's next.</h1>
        <p style={{ marginTop: '12px', fontSize: '17px', lineHeight: '1.5' }}>
          Connect your Instagram and The Creator Crew reads how your posts perform, learns your
          voice, and tells you what to post and when.
        </p>

        <ul>
          <li>
            <b>We read:</b> your profile, posts, and insights like reach, saves and shares.
          </li>
          <li>
            <b>We can post for you:</b> only the drafts you schedule, and only if you allow it.
          </li>
          <li>
            <b>We never:</b> see your password, message your followers or post without your
            approval.
          </li>
        </ul>

        {isSyncing ? (
          <div className="p-4 bg-[var(--soft)] rounded-[var(--r-sm)] border-2 border-[var(--ink)] my-4">
            <p className="font-bold text-sm">
              {isClapped ? 'Connected. Opening your studio dashboard…' : 'Reading your account…'}
            </p>
          </div>
        ) : (
          <div className="row" style={{ marginTop: '18px' }}>
            <button className="btn" id="go" onClick={handleStartConnect}>
              Connect Instagram
            </button>
            <button
              className="btn ghost"
              id="personal"
              onClick={() => setShowPersonalDialog(true)}
            >
              I have a personal account
            </button>
          </div>
        )}

        {errorMsg && <p className="err">{errorMsg}</p>}

        <p className="muted small" style={{ marginTop: '16px' }}>
          Needs a Business or Creator account. Switching is free and keeps your followers.
        </p>

        <div className="pt-3 border-t border-[#D5D8D3]/60 mt-4">
          <a
            href="#/qa"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#D5D8D3] hover:border-black text-xs font-bold text-[#16202A] shadow-xs transition-all"
          >
            <span>🧪</span>
            <span>View Selenium QA Test Matrix & Live Simulator (16 Tests)</span>
            <span className="font-mono text-[10px] bg-[#FFD43B] px-1.5 py-0.5 rounded ml-1">NEW</span>
          </a>
        </div>
      </div>

      {/* Permissions Dialog */}
      {showPermDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPermDialog(false);
          }}
        >
          <div className="bg-[var(--panel)] border-2 border-[var(--ink)] rounded-[var(--r-md)] max-w-lg w-full p-6 shadow-2xl relative">
            <div className="fakehead">instagram.com — demo of the permission screen</div>
            <h2>Allow The Creator Crew to access @{creatorData.handle}?</h2>

            <div className="perm">
              <input type="checkbox" checked disabled id="p1" />
              <label htmlFor="p1" style={{ margin: 0 }}>
                <b>Read your profile and posts</b>
                <br />
                <span className="muted small">Required. Captions, formats, dates.</span>
              </label>
            </div>

            <div className="perm">
              <input type="checkbox" checked disabled id="p2" />
              <label htmlFor="p2" style={{ margin: 0 }}>
                <b>Read your insights</b>
                <br />
                <span className="muted small">
                  Required. Reach, saves, shares, when followers are active.
                </span>
              </label>
            </div>

            <div className="perm">
              <input
                type="checkbox"
                checked={allowPublish}
                onChange={(e) => setAllowPublish(e.target.checked)}
                id="p3"
              />
              <label htmlFor="p3" style={{ margin: 0 }}>
                <b>Publish posts you schedule</b>
                <br />
                <span className="muted small">
                  Optional. Without it we remind you to post instead.
                </span>
              </label>
            </div>

            <div className="row" style={{ marginTop: '20px' }}>
              <button className="btn" id="allow" onClick={handleAllowPermissions}>
                Allow
              </button>
              <button
                className="btn ghost"
                id="deny"
                onClick={() => {
                  setShowPermDialog(false);
                  setErrorMsg('Instagram access was not allowed. Connect again to continue.');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Account Help Dialog */}
      {showPersonalDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPersonalDialog(false);
          }}
        >
          <div className="bg-[var(--panel)] border-2 border-[var(--ink)] rounded-[var(--r-md)] max-w-md w-full p-6 shadow-2xl relative">
            <h2>Switch to a Creator account</h2>
            <ol style={{ paddingLeft: '20px', margin: '14px 0' }}>
              <li style={{ margin: '6px 0' }}>Open Instagram, then Settings and privacy.</li>
              <li style={{ margin: '6px 0' }}>Tap Account type and tools.</li>
              <li style={{ margin: '6px 0' }}>Choose Switch to professional account, then Creator.</li>
              <li style={{ margin: '6px 0' }}>Come back here and connect.</li>
            </ol>
            <p className="muted small">Instagram only shares insights for professional accounts.</p>
            <div className="row" style={{ marginTop: '18px' }}>
              <button className="btn small" onClick={() => setShowPersonalDialog(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
