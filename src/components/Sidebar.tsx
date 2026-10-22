import React from 'react';
import { creatorData } from '../services/creatorData';
import { Key } from 'lucide-react';

export type NavTab = 'today' | 'ideas' | 'create' | 'calendar' | 'vault' | 'results' | 'retention' | 'team';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onDisconnect: () => void;
  onOpenApiKey: () => void;
  hasApiKey: boolean;
}

export const NAV_ITEMS: { id: NavTab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'ideas', label: 'Ideas' },
  { id: 'create', label: 'Create' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'vault', label: 'Draft vault' },
  { id: 'results', label: 'Results' },
  { id: 'retention', label: 'Retention check' },
  { id: 'team', label: 'Admin & Team' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onDisconnect,
  onOpenApiKey,
  hasApiKey,
}) => {
  return (
    <aside className="rail">
      <div className="brand">
        THE CREATOR
        <br />
        CREW
        <small>Content assistant</small>
      </div>

      <nav className="nav" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#/${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectTab(item.id);
            }}
            aria-current={currentTab === item.id ? 'page' : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Account Info at bottom */}
      <div className="acct">
        <div>
          <span className="rec" aria-hidden="true" />
          <b>@{creatorData.handle}</b>
        </div>
        <div className="muted small">Synced just now</div>
        <div className="muted small">Demo: sample data</div>

        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="btn ghost small"
            onClick={onOpenApiKey}
            title="Configure Gemini API key"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasApiKey ? 'Gemini: Active' : 'API Key: Set'}</span>
          </button>

          <button className="btn ghost small" id="disc" onClick={onDisconnect}>
            Disconnect
          </button>
        </div>
      </div>
    </aside>
  );
};
