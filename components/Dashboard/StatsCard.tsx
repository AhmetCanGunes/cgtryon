import React from 'react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    color: 'red' | 'green' | 'yellow' | 'blue';
  };
  chart?: React.ReactNode;
  showProgress?: boolean;
  progressValue?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'text-primary',
  trend,
  badge,
  chart,
  showProgress,
  progressValue = 0,
}) => {
  const badgeColors = {
    red: 'bg-red-500/20 text-red-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    blue: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <div className="bg-card-dark rounded-xl border border-border-dark p-5 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <span className={cn('material-icons-round text-lg', iconColor)}>{icon}</span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{value}</span>
            {badge && (
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase', badgeColors[badge.color])}>
                {badge.text}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={cn('text-xs mt-1 flex items-center gap-1', trend.isPositive ? 'text-primary' : 'text-red-400')}>
              <span className="material-icons-round text-xs">{trend.isPositive ? 'trending_up' : 'trending_down'}</span>
              {trend.value}
            </p>
          )}
        </div>
        {chart && <div className="flex-shrink-0">{chart}</div>}
      </div>

      {showProgress && (
        <div className="mt-3 h-1 bg-border-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default StatsCard;
