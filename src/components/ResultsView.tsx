import React, { useState } from 'react';
import {
  creatorData,
  CreatorPost,
  fmtDate,
  fmtNumber,
  hourLabel,
  avgOf,
} from '../services/creatorData';

interface ResultsViewProps {
  onNavigateToIdeasWithFilter: (format: 'Reel' | 'Carousel' | 'Photo') => void;
}

type SortColumn = 'date' | 'format' | 'topic' | 'reach' | 'saves' | 'shares' | 'vsAvg';

export const ResultsView: React.FC<ResultsViewProps> = ({
  onNavigateToIdeasWithFilter,
}) => {
  const [filter, setFilter] = useState<'All' | 'Reel' | 'Carousel' | 'Photo'>('All');
  const [sortKey, setSortKey] = useState<SortColumn>('vsAvg');
  const [sortDir, setSortDir] = useState<number>(-1); // -1: descending, 1: ascending
  const [selectedPost, setSelectedPost] = useState<CreatorPost | null>(null);

  const columns: [SortColumn, string][] = [
    ['date', 'Posted'],
    ['format', 'Format'],
    ['topic', 'Topic'],
    ['reach', 'Reach'],
    ['saves', 'Saves'],
    ['shares', 'Shares'],
    ['vsAvg', 'Vs your average'],
  ];

  const handleHeaderClick = (col: SortColumn) => {
    if (sortKey === col) {
      setSortDir((prev) => prev * -1);
    } else {
      setSortKey(col);
      setSortDir(-1);
    }
  };

  const filteredPosts = creatorData.posts
    .filter((p) => filter === 'All' || p.format === filter)
    .sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      const res = x < y ? -1 : x > y ? 1 : 0;
      return res * sortDir;
    });

  const getMetricAnalysis = (post: CreatorPost) => {
    const avg = (k: keyof CreatorPost) => avgOf(creatorData.posts, k);
    const metrics = [
      { name: 'Reach', key: 'reach' as const, val: post.reach },
      { name: 'Likes', key: 'likes' as const, val: post.likes },
      { name: 'Comments', key: 'comments' as const, val: post.comments },
      { name: 'Saves', key: 'saves' as const, val: post.saves },
      { name: 'Shares', key: 'shares' as const, val: post.shares },
    ].map((m) => {
      const avgVal = avg(m.key);
      const ratio = avgVal > 0 ? m.val / avgVal : 1;
      return { ...m, ratio };
    });

    const bestMetric = [...metrics].sort((a, b) => b.ratio - a.ratio)[0];
    return { metrics, bestMetric };
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Results</h1>
          <p className="muted">
            How every post performed. “Vs your average” compares engagement (likes, comments, saves
            and shares per person reached) with your own typical post.
          </p>
        </div>
      </div>

      {/* Format Filter Chips */}
      <div
        className="row"
        role="group"
        aria-label="Filter by format"
        style={{ marginBottom: '14px' }}
      >
        {(['All', 'Reel', 'Carousel', 'Photo'] as const).map((f) => (
          <button
            key={f}
            className="chip"
            data-f={f}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === 'All' ? 'All formats' : `${f}s`}
          </button>
        ))}
      </div>

      {/* Sortable Table */}
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              {columns.map(([key, label]) => {
                const isCurrent = sortKey === key;
                return (
                  <th
                    key={key}
                    aria-sort={
                      isCurrent
                        ? sortDir > 0
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <button data-s={key} onClick={() => handleHeaderClick(key)}>
                      {label}
                      {isCurrent ? (sortDir > 0 ? ' ↑' : ' ↓') : ''}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((p) => {
              const isUp = p.vsAvg >= 1;
              return (
                <tr
                  key={p.id}
                  tabIndex={0}
                  data-p={p.id}
                  onClick={() => setSelectedPost(p)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPost(p);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{fmtDate(p.date)}</td>
                  <td>{p.format}</td>
                  <td>{p.topic}</td>
                  <td>{fmtNumber(p.reach)}</td>
                  <td>{fmtNumber(p.saves)}</td>
                  <td>{fmtNumber(p.shares)}</td>
                  <td className={isUp ? 'up' : 'down'}>
                    {isUp ? '▲ ' : '▼ '}
                    {p.vsAvg.toFixed(1)}×
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Post Detail Dialog */}
      {selectedPost && (() => {
        const { metrics, bestMetric } = getMetricAnalysis(selectedPost);
        return (
          <dialog
            className="dlg"
            open
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedPost(null);
            }}
          >
            <h2>{selectedPost.caption}</h2>
            <p className="muted">
              {selectedPost.format} · {selectedPost.topic} · {fmtDate(selectedPost.date)},{' '}
              {hourLabel(selectedPost.hour)}
            </p>

            <table style={{ marginTop: '12px' }}>
              <tbody>
                {metrics.map((m) => {
                  const isUp = m.ratio >= 1;
                  return (
                    <tr key={m.name}>
                      <td>{m.name}</td>
                      <td>
                        <b>{fmtNumber(m.val)}</b>
                      </td>
                      <td className={isUp ? 'up' : 'down'}>
                        {isUp ? '▲ ' : '▼ '}
                        {m.ratio.toFixed(1)}× your average
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <p style={{ marginTop: '14px' }}>
              <b>What stood out:</b> {bestMetric.name.toLowerCase()} were {bestMetric.ratio.toFixed(1)}×
              your average.{' '}
              {selectedPost.vsAvg >= 1
                ? 'This is a pattern worth repeating.'
                : 'Try a different hook or posting window next time.'}
            </p>

            <div className="row" style={{ marginTop: '18px' }}>
              <button
                className="btn"
                id="mm"
                onClick={() => {
                  const format = selectedPost.format;
                  setSelectedPost(null);
                  onNavigateToIdeasWithFilter(format);
                }}
              >
                Make more like this
              </button>
              <button
                className="btn ghost"
                id="cl"
                onClick={() => setSelectedPost(null)}
              >
                Close
              </button>
            </div>
          </dialog>
        );
      })()}
    </div>
  );
};
