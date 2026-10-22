import React, { useState } from 'react';
import {
  CreatorState,
  bestCells,
  slotText,
  fmtDate,
  hourLabel,
  saveState,
} from '../services/creatorData';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: CreatorState;
  onUpdateState: (newState: CreatorState) => void;
  initialDraftId?: number;
  initialDate?: string;
  initialHour?: number;
  onSuccess: (date: string, hour: number) => void;
  onNavigateToCreate: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  initialDraftId,
  initialDate,
  initialHour,
  onSuccess,
  onNavigateToCreate,
}) => {
  if (!isOpen) return null;

  const cells = bestCells();
  const top = cells.slice(0, 3).map((c) => `${c.date}|${c.hour}`);
  const byTime = cells.slice().sort((a, b) => a.off - b.off || a.hour - b.hour);
  const taken = state.schedule.map((s) => `${s.date}|${s.hour}`);

  // Draft options
  const defaultDraftId =
    initialDraftId ?? (state.drafts.length > 0 ? state.drafts[0].id : 0);
  const [selectedDraftId, setSelectedDraftId] = useState<number>(defaultDraftId);

  // Time slot options
  const defaultSlot =
    initialDate && initialHour !== undefined
      ? `${initialDate}|${initialHour}`
      : top[0] || (byTime[0] ? `${byTime[0].date}|${byTime[0].hour}` : '');
  const [selectedSlot, setSelectedSlot] = useState<string>(defaultSlot);
  const [autoPublish, setAutoPublish] = useState<boolean>(state.allowPublish);

  if (state.drafts.length === 0) {
    return (
      <dialog className="dlg" open>
        <h2>No drafts yet</h2>
        <p>Create and save a draft first, then schedule it.</p>
        <div className="row" style={{ marginTop: '16px' }}>
          <button
            className="btn"
            id="mk"
            onClick={() => {
              onClose();
              onNavigateToCreate();
            }}
          >
            Create a draft
          </button>
          <button className="btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </dialog>
    );
  }

  const availableSlots = byTime.filter(
    (c) =>
      taken.indexOf(`${c.date}|${c.hour}`) < 0 ||
      (initialDate === c.date && initialHour === c.hour)
  );

  const handleSchedule = () => {
    const [date, hourStr] = selectedSlot.split('|');
    if (!date || !hourStr) return;
    const hour = parseInt(hourStr, 10);

    const newItem = {
      id: Date.now(),
      draftId: selectedDraftId,
      date,
      hour,
      auto: state.allowPublish && autoPublish,
    };

    const newSchedule = [...state.schedule, newItem];
    const newState = { ...state, schedule: newSchedule };
    onUpdateState(newState);
    saveState(newState);
    onSuccess(date, hour);
    onClose();
  };

  return (
    <dialog
      className="dlg"
      open
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <h2>Schedule a post</h2>

      <label htmlFor="sdr">Draft</label>
      <select
        id="sdr"
        value={selectedDraftId}
        onChange={(e) => setSelectedDraftId(Number(e.target.value))}
      >
        {state.drafts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.text.slice(0, 60)}
          </option>
        ))}
      </select>

      <label htmlFor="ssl">Time</label>
      <select
        id="ssl"
        value={selectedSlot}
        onChange={(e) => setSelectedSlot(e.target.value)}
      >
        {availableSlots.map((c) => {
          const key = `${c.date}|${c.hour}`;
          const isRec = top.indexOf(key) >= 0;
          return (
            <option key={key} value={key}>
              {slotText(c)} {isRec ? '(recommended)' : ''}
            </option>
          );
        })}
      </select>

      <label
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          fontWeight: 500,
          marginTop: '16px',
        }}
      >
        <input
          type="checkbox"
          id="sap"
          checked={state.allowPublish ? autoPublish : false}
          disabled={!state.allowPublish}
          onChange={(e) => setAutoPublish(e.target.checked)}
          style={{ width: '18px', height: '18px' }}
        />
        {state.allowPublish
          ? 'Publish automatically at that time'
          : 'Auto-publishing is off. We will remind you instead.'}
      </label>

      <div className="row" style={{ marginTop: '18px' }}>
        <button className="btn" id="sok" onClick={handleSchedule}>
          Schedule post
        </button>
        <button className="btn ghost" id="scn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </dialog>
  );
};
