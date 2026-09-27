import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  PenTool,
  Archive,
  BrainCircuit,
  CalendarClock,
  Gauge,
  BarChart3,
  Users,
  UserCheck,
} from 'lucide-react';

export type ActiveTab =
  | 'compose'
  | 'vault'
  | 'style'
  | 'scheduler'
  | 'optimizer'
  | 'insights'
  | 'team';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { currentUser } = useAuth();

  const navItems = [
    { id: 'compose', label: 'Compose', icon: PenTool },
    { id: 'vault', label: 'Draft Vault', icon: Archive },
    { id: 'style', label: 'Style Memory', icon: BrainCircuit },
    { id: 'scheduler', label: 'Scheduler', icon: CalendarClock },
    { id: 'optimizer', label: 'Optimizer', icon: Gauge },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              CC
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 block leading-tight">
                The Creator Crew
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:block">
                Content & Distribution Assistant
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Clean Segmented Tab Controls) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Account info & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right text-xs">
              <div className="flex items-center justify-end gap-1.5 text-slate-700">
                <span className="font-semibold text-slate-900 truncate max-w-[120px]">
                  {currentUser.email.split('@')[0]}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-600 font-medium">{currentUser.role || 'CREATOR'}</span>
              </div>
              <span className="text-[11px] text-slate-500">Tone: {currentUser.brandTone}</span>
            </div>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition shadow-2xs hover:border-slate-400"
              title="Switch demo account or view authentication"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Switch User</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 gap-1 border-t border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
