import React, { useState } from 'react';
import { CreatorState, getIdeas, saveState, ContentIdea } from '../services/creatorData';

interface IdeasViewProps {
  state: CreatorState;
  onUpdateState: (newState: CreatorState) => void;
  onNavigateToCreate: (promptText: string) => void;
  onShowToast: (msg: string, undo?: () => void) => void;
}

export const IdeasView: React.FC<IdeasViewProps> = ({
  state,
  onUpdateState,
  onNavigateToCreate,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<'All' | 'Reel' | 'Carousel' | 'Photo'>('All');

  const allIdeas = getIdeas(state.dismissed);
  const filteredIdeas = allIdeas.filter(
    (i) => filter === 'All' || i.format === filter
  );

  const handleDismiss = (id: string) => {
    const newDismissed = [...state.dismissed, id];
    const newState = { ...state, dismissed: newDismissed };
    onUpdateState(newState);
    saveState(newState);

    onShowToast('Idea removed', () => {
      const restoredDismissed = state.dismissed.filter((x) => x !== id);
      const restoredState = { ...state, dismissed: restoredDismissed };
      onUpdateState(restoredState);
      saveState(restoredState);
    });
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Ideas from your results</h1>
          <p className="muted">
            Built from what already worked on your account, ranked by how much more engagement it
            earned than your average.
          </p>
        </div>
      </div>

      {/* Format Filter Chips */}
      <div
        className="row"
        role="group"
        aria-label="Filter by format"
        style={{ marginBottom: '10px' }}
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

      {/* Ideas List */}
      {filteredIdeas.length > 0 ? (
        filteredIdeas.map((idea) => (
          <div key={idea.id} className="item">
            <div>
              <span className="chip">{idea.format}</span>
              <h3 style={{ display: 'inline', marginLeft: '6px' }}>{idea.title}</h3>
              <p className="muted" style={{ marginTop: '6px' }}>
                {idea.why}
              </p>
            </div>
            <div className="row">
              <button
                className="btn small"
                data-use={idea.id}
                onClick={() => onNavigateToCreate(idea.title)}
              >
                Write it
              </button>
              <button
                className="btn ghost small"
                data-no={idea.id}
                onClick={() => handleDismiss(idea.id)}
              >
                Not for me
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="empty">
          No ideas for this format yet. Try All formats, or post a few more and check back.
        </div>
      )}
    </div>
  );
};
