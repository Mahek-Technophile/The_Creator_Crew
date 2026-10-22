import React, { useState } from 'react';
import {
  creatorData,
  CreatorState,
  bestCells,
  DAYS,
  MONTHS,
  hourLabel,
  iso,
  dayIdx,
  saveState,
} from '../services/creatorData';

interface CalendarViewProps {
  state: CreatorState;
  onUpdateState: (newState: CreatorState) => void;
  onOpenSchedule: (date?: string, hour?: number) => void;
  onShowToast: (msg: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  state,
  onUpdateState,
  onOpenSchedule,
  onShowToast,
}) => {
  const [removeId, setRemoveId] = useState<number | null>(null);

  const cells = bestCells();
  const topKeys = cells.slice(0, 3).map((c) => `${c.date}|${c.hour}`);
  const now = new Date();

  // Next 7 days
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(creatorData.today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const handleConfirmRemove = () => {
    if (removeId === null) return;
    const newSchedule = state.schedule.filter((x) => x.id !== removeId);
    const newState = { ...state, schedule: newSchedule };
    onUpdateState(newState);
    saveState(newState);
    setRemoveId(null);
    onShowToast('Removed from schedule');
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Calendar</h1>
          <p className="muted">
            The next seven days. Yellow slots are when your followers are most active. Select any open
            slot to schedule a draft.
          </p>
        </div>
        <button className="btn" id="ns" onClick={() => onOpenSchedule()}>
          Schedule a post
        </button>
      </div>

      <div className="tablewrap">
        <div className="cal" role="grid">
          {/* Top-left empty corner */}
          <div />

          {/* Day column headers */}
          {days.map((d) => {
            const isToday = iso(d) === iso(creatorData.today);
            return (
              <div key={iso(d)} className="colh">
                {isToday ? 'Today' : DAYS[dayIdx(d)]}
                <div className="muted small">
                  {d.getDate()} {MONTHS[d.getMonth()]}
                </div>
              </div>
            );
          })}

          {/* Time bands rows */}
          {creatorData.bands.map((b) => (
            <React.Fragment key={b}>
              <div className="lab">{hourLabel(b).replace(' ', '')}</div>

              {days.map((d, off) => {
                const key = `${iso(d)}|${b}`;
                const scheduledItem = state.schedule.find(
                  (x) => `${x.date}|${x.hour}` === key
                );
                const isPast = off === 0 && b <= now.getHours();
                const isBest = topKeys.indexOf(key) >= 0;

                if (scheduledItem) {
                  const draft = state.drafts.find(
                    (x) => x.id === scheduledItem.draftId
                  );
                  return (
                    <button
                      key={key}
                      className="cell set"
                      data-rm={scheduledItem.id}
                      aria-label={`Scheduled: remove ${draft ? draft.text.slice(0, 40) : 'post'}`}
                      onClick={() => setRemoveId(scheduledItem.id)}
                    >
                      {draft ? draft.text.slice(0, 26) : 'Post'}…
                      <br />
                      {scheduledItem.auto ? 'Auto' : 'Reminder'}
                    </button>
                  );
                }

                return (
                  <button
                    key={key}
                    className={`cell ${isBest ? 'best' : ''} ${isPast ? 'past' : ''}`}
                    data-k={key}
                    disabled={isPast}
                    onClick={() => {
                      if (!isPast) onOpenSchedule(iso(d), b);
                    }}
                  >
                    {isBest ? 'Best time' : ''}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {state.schedule.length === 0 && (
        <div className="empty" style={{ marginTop: '20px' }}>
          Nothing scheduled yet. Pick a yellow slot to start.
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {removeId !== null && (
        <dialog
          className="dlg"
          open
          onClick={(e) => {
            if (e.target === e.currentTarget) setRemoveId(null);
          }}
        >
          <h2>Remove from schedule?</h2>
          <p>The draft stays in your vault.</p>
          <div className="row" style={{ marginTop: '16px' }}>
            <button className="btn danger" id="y" onClick={handleConfirmRemove}>
              Remove from schedule
            </button>
            <button className="btn ghost" id="n" onClick={() => setRemoveId(null)}>
              Keep it
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
};
