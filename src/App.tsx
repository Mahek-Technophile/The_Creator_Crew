import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { ComposeView } from './components/ComposeView';
import { DraftVaultView } from './components/DraftVaultView';
import { StyleMemoryView } from './components/StyleMemoryView';
import { SchedulerView } from './components/SchedulerView';
import { AttentionOptimizerView } from './components/AttentionOptimizerView';
import { InsightsView } from './components/InsightsView';
import { TeamView } from './components/TeamView';
import { AuthModal } from './components/AuthModal';
import { DevOtpConsole } from './components/DevOtpConsole';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('compose');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedDraftForSchedule, setSelectedDraftForSchedule] = useState<string | undefined>(
    undefined
  );
  const [selectedDraftForOptimizer, setSelectedDraftForOptimizer] = useState<string | undefined>(
    undefined
  );

  const handleDraftSaved = (draftId: string) => {
    setSelectedDraftForSchedule(draftId);
  };

  const handleScheduleFromVault = (draftId: string) => {
    setSelectedDraftForSchedule(draftId);
    setActiveTab('scheduler');
  };

  const handleAnalyzeFromVault = (draftId: string) => {
    setSelectedDraftForOptimizer(draftId);
    setActiveTab('optimizer');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'compose' && (
          <ComposeView
            onDraftSaved={handleDraftSaved}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'vault' && (
          <DraftVaultView
            onScheduleDraft={handleScheduleFromVault}
            onAnalyzeDraft={handleAnalyzeFromVault}
          />
        )}

        {activeTab === 'style' && <StyleMemoryView />}

        {activeTab === 'scheduler' && (
          <SchedulerView
            initialDraftId={selectedDraftForSchedule}
            onNavigateToInsights={() => setActiveTab('insights')}
          />
        )}

        {activeTab === 'optimizer' && (
          <AttentionOptimizerView initialDraftId={selectedDraftForOptimizer} />
        )}

        {activeTab === 'insights' && <InsightsView />}

        {activeTab === 'team' && <TeamView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>The Creator Crew — Content Creation & Distribution Assistant</span>
          <span className="font-mono text-[11px] text-slate-400 tabular-nums">
            Full-Stack Workspace • Python + FastAPI & React
          </span>
        </div>
      </footer>

      {/* Auth Modal (Register with 6-digit OTP / Login / Quick Switch) */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* FR-1 Dev OTP Floating Console */}
      <DevOtpConsole />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
