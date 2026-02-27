import React from 'react';
import { cn } from '../../lib/utils';

interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  iconBg: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  onActionClick?: (actionId: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const actions: QuickAction[] = [
    {
      id: 'generate-prompt',
      icon: 'bolt',
      title: 'Generate Prompt',
      description: 'AI-powered suggestions',
      iconBg: 'bg-yellow-500/20 text-yellow-400',
    },
    {
      id: 'batch-job',
      icon: 'layers',
      title: 'Run Batch Job',
      description: 'Process up to 50 assets',
      iconBg: 'bg-blue-500/20 text-blue-400',
    },
    {
      id: 'automation',
      icon: 'smart_toy',
      title: 'Automation Studio',
      description: 'Create new workflows',
      iconBg: 'bg-primary/20 text-secondary',
    },
  ];

  return (
    <div className="bg-card-dark rounded-xl border border-border-dark p-5">
      {/* Header */}
      <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>

      {/* Actions */}
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick?.(action.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-background-dark border border-border-dark hover:border-primary/30 transition-all group"
          >
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', action.iconBg)}>
              <span className="material-icons-round text-xl">{action.icon}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{action.title}</p>
              <p className="text-[10px] text-slate-500">{action.description}</p>
            </div>
            <span className="material-icons-round text-slate-500 group-hover:text-primary transition-colors">chevron_right</span>
          </button>
        ))}
      </div>

      {/* Pro Tip */}
      <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Pro Tip</span>
        </div>
        <p className="text-xs text-slate-400">
          Use the <code className="px-1.5 py-0.5 bg-background-dark rounded text-primary text-[10px]">/batch</code> command in the prompt editor to trigger multi-persona generations.
        </p>
      </div>
    </div>
  );
};

export default QuickActions;
