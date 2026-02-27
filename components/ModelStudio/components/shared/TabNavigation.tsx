import React from 'react';
import { Box, User, Sparkles, Layout, LucideIcon, Check } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export type TabId = 'product' | 'model' | 'style' | 'output';

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { id: 'product', label: 'Ürün', icon: Box },
  { id: 'model', label: 'Manken', icon: User },
  { id: 'style', label: 'Stil', icon: Sparkles },
  { id: 'output', label: 'Çıktı', icon: Layout }
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  completedTabs?: TabId[];
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, completedTabs = [] }) => {
  const activeIndex = TABS.findIndex(t => t.id === activeTab);

  return (
    <div className="bg-bg-elevated border-b border-white/10">
      {/* Progress Bar */}
      <div className="h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
          style={{ width: `${((activeIndex + 1) / TABS.length) * 100}%` }}
        />
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4" role="tablist" aria-label="Model Studio Tabs">
        {TABS.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isCompleted = completedTabs.includes(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              className={cn(
                'flex flex-col items-center justify-center py-2 transition-all relative',
                isActive
                  ? 'bg-white/5'
                  : 'hover:bg-white/5'
              )}
            >
              {/* Step Badge with Icon */}
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition-all',
                isActive
                  ? 'bg-primary text-white'
                  : isCompleted
                    ? 'bg-primary/20 text-primary'
                    : 'bg-white/10 text-gray-400'
              )}>
                {isCompleted && !isActive ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <Icon size={14} />
                )}
              </div>

              {/* Label */}
              <span className={cn(
                'text-[11px] font-medium',
                isActive ? 'text-white' : isCompleted ? 'text-primary' : 'text-gray-400'
              )}>
                {tab.label}
              </span>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
