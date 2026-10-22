import React, { useState, useRef } from 'react';
import {
  creatorData,
  CreatorState,
  postsThisWeek,
  reach28,
  bestCells,
  slotText,
  getIdeas,
  avgOfHeat,
  fmtNumber,
  fmtDate,
  DAYS,
  hourLabel,
  saveState,
} from '../services/creatorData';

interface TodayViewProps {
  state: CreatorState;
  onUpdateState: (newState: CreatorState) => void;
  onNavigateToCreate: (promptText?: string) => void;
  onNavigateToIdeas: () => void;
  onNavigateToResults: () => void;
  onShowToast: (msg: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  state,
  onUpdateState,
  onNavigateToCreate,
  onNavigateToIdeas,
  onNavigateToResults,
  onShowToast,
}) => {
  const [range, setRange] = useState<number>(28);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [goalWeeklyInput, setGoalWeeklyInput] = useState(state.goals.weekly);
  const [goalReachInput, setGoalReachInput] = useState(state.goals.reach);
  const [goalError, setGoalError] = useState('');

  // SVG Chart hover state
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverData, setHoverData] = useState<{
    visible: boolean;
    cx: number;
    cy: number;
    left: number;
    top: number;
    text: string;
  }>({
    visible: false,
    cx: 0,
    cy: 0,
    left: 0,
    top: 0,
    text: '',
  });

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const wk = postsThisWeek();
  const g = state.goals;
  const best = bestCells()[0];
  const ideasList = getIdeas(state.dismissed);
  const idea = ideasList[0];
  const r28 = reach28();
  const series = creatorData.daily.slice(-range);

  // SVG Line chart calculations
  const W = 640;
  const H = 240;
  const pad = { l: 38, r: 8, t: 10, b: 22 };
  const maxReach = Math.max(...series.map((s) => s.reach)) * 1.1;

  const getX = (i: number) => pad.l + ((W - pad.l - pad.r) * i) / (series.length - 1);
  const getY = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / maxReach);

  const pointsStr = series
    .map((s, i) => `${getX(i).toFixed(1)},${getY(s.reach).toFixed(1)}`)
    .join(' ');

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const b = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - b.left) / b.width) * W;
    const i = Math.max(
      0,
      Math.min(
        series.length - 1,
        Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (series.length - 1))
      )
    );
    const cx = getX(i);
    const cy = getY(series[i].reach);
    setHoverData({
      visible: true,
      cx,
      cy,
      left: (cx / W) * b.width,
      top: (cy / H) * b.height,
      text: `${fmtDate(series[i].date)}: ${fmtNumber(series[i].reach)} reached`,
    });
  };

  const handlePointerLeave = () => {
    setHoverData((prev) => ({ ...prev, visible: false }));
  };

  // Heatmap top 3 slots
  const topBestKeys = bestCells()
    .slice(0, 3)
    .map((c) => `${c.dow}-${c.hour}`);

  const handleSaveGoals = () => {
    const w = Number(goalWeeklyInput);
    const r = Number(goalReachInput);
    if (!(w >= 1 && w <= 21)) {
      setGoalError('Posts per week must be between 1 and 21.');
      return;
    }
    if (!(r >= 1000)) {
      setGoalError('Reach goal must be at least 1,000.');
      return;
    }
    const newState = { ...state, goals: { weekly: w, reach: r } };
    onUpdateState(newState);
    saveState(newState);
    setShowGoalsDialog(false);
    onShowToast('Goals saved');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-head">
        <div>
          <h1>
            {greeting}, {creatorData.name}.
          </h1>
          <p className="muted">
            You posted {wk} of {g.weekly} this week. Your reach over the last 28 days is{' '}
            {fmtNumber(r28)}.
          </p>
        </div>
      </div>

      {/* Top 2 Blocks: Post Next & Goals */}
      <div className="grid g2">
        <div className="next stack">
          <h2>Post next: {best ? slotText(best) : 'Ready to post'}</h2>
          <p className="muted">
            {best && best.score >= 85
              ? 'Your followers are most active then.'
              : 'One of your three most active windows this week.'}{' '}
            Posting here beats a random slot by about{' '}
            {best ? Math.round((best.score / avgOfHeat() - 1) * 100) : 0}%.
          </p>

          {idea && (
            <>
              <p>
                <span className="hl">{idea.title}</span>
              </p>
              <p className="muted small">{idea.why}</p>
            </>
          )}

          <div className="row">
            <button
              className="btn"
              id="wr"
              onClick={() => onNavigateToCreate(idea ? idea.title : undefined)}
            >
              Write the caption
            </button>
            <button className="btn ghost" id="mi" onClick={onNavigateToIdeas}>
              More ideas
            </button>
          </div>
        </div>

        <div className="block">
          <h3>Goals</h3>
          <div>
            Posts this week{' '}
            <b>
              {wk} / {g.weekly}
            </b>
            <div className="bar">
              <i style={{ width: `${Math.min(100, (wk / g.weekly) * 100)}%` }} />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            Reach in 28 days{' '}
            <b>
              {fmtNumber(r28)} / {fmtNumber(g.reach)}
            </b>
            <div className="bar">
              <i style={{ width: `${Math.min(100, (r28 / g.reach) * 100)}%` }} />
            </div>
          </div>

          <button
            className="btn ghost small"
            id="eg"
            style={{ marginTop: '14px' }}
            onClick={() => {
              setGoalWeeklyInput(state.goals.weekly);
              setGoalReachInput(state.goals.reach);
              setGoalError('');
              setShowGoalsDialog(true);
            }}
          >
            Change goals
          </button>
        </div>
      </div>

      {/* Middle Grid: Reach Chart & Heatmap */}
      <div className="grid g2" style={{ marginTop: '34px' }}>
        {/* Reach per day */}
        <div className="block">
          <div className="row spread">
            <h2>Reach per day</h2>
            <div className="row">
              <button
                className="chip"
                data-r="28"
                aria-pressed={range === 28}
                onClick={() => setRange(28)}
              >
                28 days
              </button>
              <button
                className="chip"
                data-r="56"
                aria-pressed={range === 56}
                onClick={() => setRange(56)}
              >
                56 days
              </button>
            </div>
          </div>

          <div className="rel" id="chartwrap">
            <svg
              ref={svgRef}
              className="chart"
              id="line"
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={`Daily reach over the last ${range} days`}
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              {/* Horizontal Grid lines */}
              {[0, 0.5, 1].map((f) => {
                const v = maxReach * f;
                return (
                  <React.Fragment key={f}>
                    <line
                      x1={pad.l}
                      x2={W - pad.r}
                      y1={getY(v)}
                      y2={getY(v)}
                      stroke="var(--line)"
                    />
                    <text
                      x={pad.l - 6}
                      y={getY(v) + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="var(--steel)"
                    >
                      {v >= 1000 ? Math.round(v / 1000) + 'k' : Math.round(v)}
                    </text>
                  </React.Fragment>
                );
              })}

              {/* Reach polyline */}
              <polyline
                fill="none"
                stroke="var(--ink)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                points={pointsStr}
              />

              {/* Cursor and dot on hover */}
              {hoverData.visible && (
                <>
                  <line
                    id="cur"
                    x1={hoverData.cx}
                    x2={hoverData.cx}
                    y1={pad.t}
                    y2={H - pad.b}
                    stroke="var(--ink)"
                    strokeDasharray="3 3"
                  />
                  <circle
                    id="dot"
                    cx={hoverData.cx}
                    cy={hoverData.cy}
                    r="5"
                    fill="var(--tape)"
                    stroke="var(--ink)"
                    strokeWidth="2"
                  />
                </>
              )}

              {/* Start & End Dates */}
              <text x={pad.l} y={H - 5} fontSize="11" fill="var(--steel)">
                {fmtDate(series[0].date)}
              </text>
              <text x={W - pad.r} y={H - 5} textAnchor="end" fontSize="11" fill="var(--steel)">
                {fmtDate(series[series.length - 1].date)}
              </text>
            </svg>

            {hoverData.visible && (
              <div
                className="tip"
                id="tip"
                style={{
                  left: `${hoverData.left}px`,
                  top: `${hoverData.top}px`,
                  display: 'block',
                }}
              >
                {hoverData.text}
              </div>
            )}
          </div>
        </div>

        {/* Follower Activity Heatmap */}
        <div className="block">
          <h2>When your followers are active</h2>
          <p className="muted small" style={{ marginBottom: '10px' }}>
            Highlighted: your best three windows from now.
          </p>

          <div
            className="heat"
            role="img"
            aria-label="When your followers are most active, by weekday and time"
          >
            <div />
            {creatorData.bands.map((b) => (
              <div key={b} className="colh">
                {hourLabel(b).replace(' ', '')}
              </div>
            ))}

            {DAYS.map((d, dayIndex) => (
              <React.Fragment key={d}>
                <div className="lab">{d}</div>
                {creatorData.heat[dayIndex].map((v, bandIndex) => {
                  const hour = creatorData.bands[bandIndex];
                  const isBest = topBestKeys.indexOf(`${dayIndex}-${hour}`) >= 0;
                  return (
                    <div
                      key={bandIndex}
                      className="h"
                      title={`${d} ${hourLabel(hour)}: ${v}% as active as your peak`}
                      style={{
                        opacity: isBest ? 1 : 0.12 + (v / 100) * 0.88,
                        background: isBest ? 'var(--tape)' : undefined,
                        outline: isBest ? '2px solid var(--ink)' : undefined,
                      }}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Top Posts Section */}
      <div className="block" style={{ marginTop: '34px' }}>
        <div className="row spread">
          <h2>Your top posts</h2>
          <button className="btn ghost small" onClick={onNavigateToResults}>
            See all results
          </button>
        </div>

        <div className="grid g3" style={{ marginTop: '8px' }}>
          {creatorData.posts
            .slice()
            .sort((a, b) => b.vsAvg - a.vsAvg)
            .slice(0, 3)
            .map((p) => (
              <div key={p.id} className="sheet">
                <span className="chip">{p.format}</span>
                <h3 style={{ margin: '10px 0 6px' }}>{p.caption}</h3>
                <div className="num">{p.vsAvg.toFixed(1)}×</div>
                <div className="muted small">
                  your average engagement · {fmtNumber(p.reach)} reached
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Change Goals Dialog */}
      {showGoalsDialog && (
        <dialog
          className="dlg"
          open
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGoalsDialog(false);
          }}
        >
          <h2>Your goals</h2>
          <label htmlFor="gw">Posts per week</label>
          <input
            id="gw"
            type="number"
            min="1"
            max="21"
            value={goalWeeklyInput}
            onChange={(e) => setGoalWeeklyInput(Number(e.target.value))}
          />

          <label htmlFor="gr">Reach in 28 days</label>
          <input
            id="gr"
            type="number"
            min="1000"
            step="1000"
            value={goalReachInput}
            onChange={(e) => setGoalReachInput(Number(e.target.value))}
          />

          {goalError && (
            <div id="ge">
              <p className="err">{goalError}</p>
            </div>
          )}

          <div className="row" style={{ marginTop: '18px' }}>
            <button className="btn" id="gs" onClick={handleSaveGoals}>
              Save goals
            </button>
            <button className="btn ghost" id="gc" onClick={() => setShowGoalsDialog(false)}>
              Cancel
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
};
