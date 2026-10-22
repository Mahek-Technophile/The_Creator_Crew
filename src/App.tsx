import React, { useState, useEffect } from 'react';
import {
  CreatorState,
  getInitialState,
  saveState,
  creatorData,
} from './services/creatorData';
import { aiProvider } from './services/aiGenerator';
import { Sidebar, NavTab, NAV_ITEMS } from './components/Sidebar';
import { ConnectView } from './components/ConnectView';
import { TodayView } from './components/TodayView';
import { IdeasView } from './components/IdeasView';
import { CreateView } from './components/CreateView';
import { CalendarView } from './components/CalendarView';
import { VaultView } from './components/VaultView';
import { ResultsView } from './components/ResultsView';
import { RetentionView } from './components/RetentionView';
import { AdminTeamView } from './components/AdminTeamView';
import { QaShowcaseView } from './components/QaShowcaseView';
import { ScheduleModal } from './components/ScheduleModal';
import { ApiKeyDialog } from './components/ApiKeyDialog';

export function App() {
  const [state, setState] = useState<CreatorState>(() => getInitialState());
  const [currentTab, setCurrentTab] = useState<NavTab>('today');
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(Boolean(aiProvider.getApiKey()));
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Scheduling modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDraftId, setScheduleDraftId] = useState<number | undefined>(undefined);
  const [scheduleDate, setScheduleDate] = useState<string | undefined>(undefined);
  const [scheduleHour, setScheduleHour] = useState<number | undefined>(undefined);

  // Create view preloaded parameters
  const [createPrompt, setCreatePrompt] = useState<string>('');
  const [createDraftId, setCreateDraftId] = useState<number | null>(null);

  // Toast state
  const [toastInfo, setToastInfo] = useState<{
    msg: string;
    undo?: () => void;
  } | null>(null);

  // Synchronize route hash with tab state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = location.hash.replace(/^#\/?/, '').split('?')[0];
      if (NAV_ITEMS.some((n) => n.id === hash)) {
        setCurrentTab(hash as NavTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update document title
  useEffect(() => {
    if (!state.connected) {
      document.title = 'Connect Instagram - The Creator Crew';
      return;
    }
    const item = NAV_ITEMS.find((n) => n.id === currentTab);
    const tabName = item ? item.label : 'Today';
    document.title = `${tabName} - The Creator Crew`;
  }, [state.connected, currentTab]);

  const showToast = (msg: string, undo?: () => void) => {
    setToastInfo({ msg, undo });
  };

  useEffect(() => {
    if (!toastInfo) return;
    const timer = setTimeout(() => {
      setToastInfo(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toastInfo]);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    location.hash = `#/${tab}`;
    window.scrollTo(0, 0);
  };

  const handleConnected = (allowPublish: boolean) => {
    const newState: CreatorState = {
      ...state,
      connected: true,
      allowPublish,
    };
    setState(newState);
    saveState(newState);
    handleSelectTab('today');
  };

  const handleDisconnect = () => {
    const newState: CreatorState = {
      ...state,
      connected: false,
    };
    setState(newState);
    saveState(newState);
    setShowDisconnectModal(false);
    location.hash = '#/connect';
  };

  const handleOpenSchedule = (param1?: string | number, param2?: number) => {
    if (typeof param1 === 'number') {
      setScheduleDraftId(param1);
      setScheduleDate(undefined);
      setScheduleHour(undefined);
    } else if (typeof param1 === 'string') {
      setScheduleDate(param1);
      setScheduleHour(param2);
      setScheduleDraftId(undefined);
    } else {
      setScheduleDraftId(undefined);
      setScheduleDate(undefined);
      setScheduleHour(undefined);
    }
    setScheduleModalOpen(true);
  };

  const handleNavigateToCreate = (promptText?: string, draftId?: number) => {
    setCreatePrompt(promptText || '');
    setCreateDraftId(draftId ?? null);
    handleSelectTab('create');
  };

  const handleNavigateToIdeasWithFilter = (_format: 'Reel' | 'Carousel' | 'Photo') => {
    handleSelectTab('ideas');
  };

  return (
    <div id="app">
      {/* Toast Host */}
      <div id="toast-host">
        {toastInfo && (
          <div className="toast" role="status">
            <span>{toastInfo.msg}</span>
            {toastInfo.undo && (
              <button
                id="undo"
                onClick={() => {
                  toastInfo.undo?.();
                  setToastInfo(null);
                }}
              >
                Undo
              </button>
            )}
          </div>
        )}
      </div>

      {!state.connected && currentTab !== 'qa' ? (
        <ConnectView onConnected={handleConnected} />
      ) : (
        <>
          <div className="shell">
            {/* Desktop Left Rail Navigation */}
            <Sidebar
              currentTab={currentTab}
              onSelectTab={handleSelectTab}
              onDisconnect={() => setShowDisconnectModal(true)}
              onOpenApiKey={() => setIsApiKeyOpen(true)}
              hasApiKey={hasApiKey}
            />

            {/* Main Content Area */}
            <main id="view" tabIndex={-1}>
              {/* Mobile Header Account Bar */}
              <div className="mobile-acct">
                <span>
                  <span className="rec" aria-hidden="true" />
                  <b>@{creatorData.handle}</b> · Synced
                </span>
                <button
                  className="btn ghost small"
                  id="disc2"
                  onClick={() => setShowDisconnectModal(true)}
                >
                  Disconnect
                </button>
              </div>

              {/* View Router */}
              <div id="page">
                {currentTab === 'today' && (
                  <TodayView
                    state={state}
                    onUpdateState={setState}
                    onNavigateToCreate={handleNavigateToCreate}
                    onNavigateToIdeas={() => handleSelectTab('ideas')}
                    onNavigateToResults={() => handleSelectTab('results')}
                    onShowToast={showToast}
                  />
                )}

                {currentTab === 'ideas' && (
                  <IdeasView
                    state={state}
                    onUpdateState={setState}
                    onNavigateToCreate={(prompt) => handleNavigateToCreate(prompt)}
                    onShowToast={showToast}
                  />
                )}

                {currentTab === 'create' && (
                  <CreateView
                    state={state}
                    onUpdateState={setState}
                    initialPrompt={createPrompt}
                    initialDraftId={createDraftId}
                    onShowToast={showToast}
                    onOpenSchedule={(draftId) => handleOpenSchedule(draftId)}
                    onOpenApiKey={() => setIsApiKeyOpen(true)}
                  />
                )}

                {currentTab === 'calendar' && (
                  <CalendarView
                    state={state}
                    onUpdateState={setState}
                    onOpenSchedule={(date, hour) => handleOpenSchedule(date, hour)}
                    onShowToast={showToast}
                  />
                )}

                {currentTab === 'vault' && (
                  <VaultView
                    state={state}
                    onUpdateState={setState}
                    onNavigateToCreate={handleNavigateToCreate}
                    onOpenSchedule={(draftId) => handleOpenSchedule(draftId)}
                    onShowToast={showToast}
                  />
                )}

                {currentTab === 'results' && (
                  <ResultsView
                    onNavigateToIdeasWithFilter={handleNavigateToIdeasWithFilter}
                  />
                )}

                {currentTab === 'retention' && <RetentionView />}

                {currentTab === 'team' && (
                  <AdminTeamView
                    state={state}
                    onUpdateState={setState}
                    onShowToast={showToast}
                  />
                )}

                {currentTab === 'qa' && <QaShowcaseView />}
              </div>
            </main>
          </div>

          {/* Mobile Bottom Tabbar */}
          <nav className="tabbar" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#/${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab(item.id);
                }}
                aria-current={currentTab === item.id ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </>
      )}

      {/* Disconnect Modal */}
      {showDisconnectModal && (
        <dialog
          className="dlg"
          open
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDisconnectModal(false);
          }}
        >
          <h2>Disconnect Instagram?</h2>
          <p>
            We will delete your synced posts, insights and learned style from The Creator Crew.
            Your Instagram account is not changed, and your drafts stay.
          </p>
          <div className="row" style={{ marginTop: '18px' }}>
            <button className="btn danger" id="yes" onClick={handleDisconnect}>
              Disconnect
            </button>
            <button
              className="btn ghost"
              id="no"
              onClick={() => setShowDisconnectModal(false)}
            >
              Keep connected
            </button>
          </div>
        </dialog>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        state={state}
        onUpdateState={setState}
        initialDraftId={scheduleDraftId}
        initialDate={scheduleDate}
        initialHour={scheduleHour}
        onSuccess={(date, hour) => {
          showToast(`Scheduled for ${date}, hour ${hour}`);
          handleSelectTab('calendar');
        }}
        onNavigateToCreate={() => handleNavigateToCreate()}
      />

      {/* API Key Modal */}
      <ApiKeyDialog
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        onKeyUpdated={() => setHasApiKey(Boolean(aiProvider.getApiKey()))}
      />
    </div>
  );
}
export default App;
