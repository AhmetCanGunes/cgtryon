import React from 'react';
import { cn } from '../../lib/utils';

type ViewState = 'home' | 'studio' | 'try-on' | 'ad-creative' | 'jewelry' | 'mens-fashion' | 'womens-fashion' | 'style-selector' | 'product-annotation' | 'prompt-architect' | 'personas';

interface DashboardSidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const NAV_ITEMS: { id: ViewState; icon: string; label: string }[] = [
  { id: 'home', icon: 'home', label: 'Ana Sayfa' },
  { id: 'studio', icon: 'dashboard', label: 'Studio' },
  { id: 'try-on', icon: 'checkroom', label: 'Kabin' },
  { id: 'jewelry', icon: 'diamond', label: 'Takı' },
  { id: 'ad-creative', icon: 'image', label: 'Reklam' },
  { id: 'style-selector', icon: 'settings', label: 'Ayarlar' },
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentView,
  onViewChange,
}) => {
  return (
    <div className="hidden xl:flex w-16 h-full bg-card-dark border-r border-border-dark flex-col items-center py-4 gap-2 shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-6 neon-glow">
        <span className="material-icons-round text-background-dark text-xl">auto_awesome</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center transition-all group relative',
              currentView === item.id
                ? 'bg-primary/20 text-primary'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
            title={item.label}
          >
            <span className="material-icons-round text-xl">{item.icon}</span>
            {currentView === item.id && (
              <div className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-1">
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">
          <span className="material-icons-round text-xl">settings</span>
        </button>
      </div>

      {/* User Avatar */}
      <div className="mt-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
          U
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
