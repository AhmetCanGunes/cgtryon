import React from 'react';
import {
  UserPlus,
  Download,
  Mail,
  RefreshCw,
  Settings,
  Zap,
  Database,
  Bell
} from 'lucide-react';
import GlowCard from '../ui/GlowCard';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: 'primary' | 'emerald' | 'amber' | 'blue';
  description?: string;
}

interface QuickActionsProps {
  onExportUsers?: () => void;
  onExportSubscribers?: () => void;
  onRefreshData?: () => void;
  onSendNotification?: () => void;
  loading?: boolean;
}

const colorClasses = {
  violet: 'bg-primary/10 text-secondary hover:bg-primary/20 border-primary/20 hover:border-primary/40',
  emerald: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 hover:border-emerald-500/40',
  amber: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20 hover:border-amber-500/40',
  blue: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20 hover:border-blue-500/40'
};

const QuickActions: React.FC<QuickActionsProps> = ({
  onExportUsers,
  onExportSubscribers,
  onRefreshData,
  onSendNotification,
  loading = false
}) => {
  const actions: QuickAction[] = [
    {
      id: 'export-users',
      label: 'Kullanıcıları Dışa Aktar',
      icon: <Download size={18} />,
      onClick: onExportUsers || (() => {}),
      color: 'primary',
      description: 'CSV formatında indir'
    },
    {
      id: 'export-subs',
      label: 'Aboneleri Dışa Aktar',
      icon: <Mail size={18} />,
      onClick: onExportSubscribers || (() => {}),
      color: 'emerald',
      description: 'Email listesini indir'
    },
    {
      id: 'refresh',
      label: 'Verileri Yenile',
      icon: <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />,
      onClick: onRefreshData || (() => {}),
      color: 'blue',
      description: 'Anlık güncelle'
    },
    {
      id: 'notify',
      label: 'Bildirim Gönder',
      icon: <Bell size={18} />,
      onClick: onSendNotification || (() => {}),
      color: 'amber',
      description: 'Toplu bildirim'
    }
  ];

  if (loading) {
    return (
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 skeleton-shimmer" />
          <div className="h-5 w-32 rounded bg-[#2d2d3d] skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-[#2d2d3d] rounded-xl skeleton-shimmer" />
          ))}
        </div>
      </GlowCard>
    );
  }

  return (
    <GlowCard color="amber" className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Zap size={16} className="text-amber-400" />
        </div>
        <h3 className="text-gray-100 font-semibold">Hızlı İşlemler</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`
              p-4 rounded-xl border transition-all duration-200
              ${colorClasses[action.color]}
              animate-fade-in-up opacity-0
              hover:scale-[1.02] active:scale-[0.98]
            `}
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <div className="flex flex-col items-start gap-2">
              {action.icon}
              <div>
                <p className="text-sm font-medium text-gray-100">{action.label}</p>
                {action.description && (
                  <p className="text-[10px] text-gray-500 mt-0.5">{action.description}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </GlowCard>
  );
};

export default QuickActions;
