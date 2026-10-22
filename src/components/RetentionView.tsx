import React, { useState, useRef } from 'react';
import { creatorData, fmtDate } from '../services/creatorData';

export const RetentionView: React.FC = () => {
  const reels = creatorData.posts.filter((p) => p.format === 'Reel');
  const [selectedReelId, setSelectedReelId] = useState<number>(reels[0]?.id || 1);

  const activeReel = reels.find((r) => r.id === selectedReelId) || reels[0];
  const curve = activeReel?.curve || [100, 85, 75, 65, 55, 45, 40, 35, 30, 25, 20];

  const svgRef = useRef<SVGSVGElement>(null);
  const [scrubData, setScrubData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    left: number;
    top: number;
    text: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    text: '',
  });

  const W = 640;
  const H = 260;
  const pad = { l: 40, r: 10, t: 14, b: 28 };

  // Find biggest drop
  let worstIndex = 1;
  let worstDrop = 0;
  for (let i = 1; i < curve.length; i++) {
    const diff = curve[i - 1] - curve[i];
    if (diff > worstDrop) {
      worstDrop = diff;
      worstIndex = i;
    }
  }

  const duration = activeReel?.duration || 30;
  const ts = Math.round((duration * worstIndex) / 10);
  const formatTimecode = (s: number) => `0:${String(s).padStart(2, '0')}`;

  const getX = (i: number) => pad.l + ((W - pad.l - pad.r) * i) / 10;
  const getY = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / 100);

  // SVG Area path
  const areaPath =
    `M${getX(0)},${getY(curve[0])}` +
    curve
      .slice(1)
      .map((v, i) => ` L${getX(i + 1)},${getY(v)}`)
      .join('') +
    ` L${getX(10)},${getY(0)} L${getX(0)},${getY(0)} Z`;

  const polylinePoints = curve.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');

  const tips = [
    `Cut or tighten the section just before ${formatTimecode(ts)}. That is where ${worstDrop} points of viewers left.`,
    `Add a visual change (text on screen or a new angle) around ${formatTimecode(Math.max(0, ts - 2))}.`,
  ];
  if (worstDrop >= 25) {
    tips.push(
      'Move your payoff earlier. A drop this sharp usually means viewers lost the promise from your hook.'
    );
  }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const b = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - b.left) / b.width) * W;
    const i = Math.max(
      0,
      Math.min(10, Math.round(((px - pad.l) / (W - pad.l - pad.r)) * 10))
    );
    const xPos = getX(i);
    const yPos = getY(curve[i]);
    const timeAtStep = Math.round((duration * i) / 10);

    setScrubData({
      visible: true,
      x: xPos,
      y: yPos,
      left: (xPos / W) * b.width,
      top: (yPos / H) * b.height,
      text: `${formatTimecode(timeAtStep)}  ${curve[i]}% watching`,
    });
  };

  const handlePointerLeave = () => {
    setScrubData((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Retention check</h1>
          <p className="muted">
            Pick a Reel to see where viewers stop watching, and what to change in your next one.
          </p>
        </div>
      </div>

      <label htmlFor="rs">Reel</label>
      <select
        id="rs"
        style={{ maxWidth: '420px' }}
        value={selectedReelId}
        onChange={(e) => setSelectedReelId(Number(e.target.value))}
      >
        {reels.map((r) => (
          <option key={r.id} value={r.id}>
            {fmtDate(r.date)}: {r.caption} ({r.duration}s)
          </option>
        ))}
      </select>

      <div className="grid g2" style={{ marginTop: '24px' }}>
        {/* Left: SVG Retention Curve */}
        <div className="rel">
          <svg
            ref={svgRef}
            className="chart"
            id="rsv"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Audience retention across the Reel. Biggest drop at ${formatTimecode(ts)}`}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            {/* Horizontal Grid lines */}
            {[0, 50, 100].map((v) => (
              <React.Fragment key={v}>
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
                  fontSize="11"
                  textAnchor="end"
                  fill="var(--steel)"
                >
                  {v}%
                </text>
              </React.Fragment>
            ))}

            {/* Area and Curve */}
            <path d={areaPath} fill="var(--tape)" opacity="0.55" />
            <polyline
              fill="none"
              stroke="var(--ink)"
              strokeWidth="2.5"
              points={polylinePoints}
            />

            {/* Worst Drop indicator */}
            <line
              x1={getX(worstIndex)}
              x2={getX(worstIndex)}
              y1={pad.t}
              y2={H - pad.b}
              stroke="var(--rec)"
              strokeWidth="2.5"
            />
            <circle
              cx={getX(worstIndex)}
              cy={getY(curve[worstIndex])}
              r="6"
              fill="var(--rec)"
            />
            <text
              x={Math.min(W - 140, getX(worstIndex) + 10)}
              y={pad.t + 14}
              fontSize="13"
              fontWeight="700"
              fill="var(--rec)"
            >
              Biggest drop {formatTimecode(ts)}
            </text>

            {/* Interactive scrub cursor */}
            {scrubData.visible && (
              <line
                id="rcur"
                x1={scrubData.x}
                x2={scrubData.x}
                y1={pad.t}
                y2={H - pad.b}
                stroke="var(--ink)"
                strokeDasharray="3 3"
              />
            )}

            {/* Time labels at bottom */}
            <text x={pad.l} y={H - 6} fontSize="11" fill="var(--steel)">
              0:00
            </text>
            <text x={W - pad.r} y={H - 6} fontSize="11" textAnchor="end" fill="var(--steel)">
              {formatTimecode(duration)}
            </text>
          </svg>

          {/* Interactive Scrub Tooltip */}
          {scrubData.visible && (
            <div
              className="tip tc"
              id="rtip"
              style={{
                left: `${scrubData.left}px`,
                top: `${scrubData.top}px`,
                display: 'block',
              }}
            >
              {scrubData.text}
            </div>
          )}
        </div>

        {/* Right: What to change insights */}
        <div className="block">
          <h2>What to change</h2>
          <ul className="stack" style={{ paddingLeft: '20px', margin: 0 }}>
            {tips.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>
          <p className="muted small" style={{ marginTop: '14px' }}>
            Demo note: Instagram shares average watch time for Reels, not a second-by-second curve.
            The live version estimates this curve.
          </p>
          <p className="muted small" style={{ marginTop: '10px' }}>
            Drop-off point: <span className="tc">{formatTimecode(ts)}</span> of{' '}
            <span className="tc">{formatTimecode(duration)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
